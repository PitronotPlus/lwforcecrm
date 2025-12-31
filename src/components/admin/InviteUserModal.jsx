import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Copy, Check, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { SubAccount } from '@/entities/SubAccount';

export default function InviteUserModal({ currentUser, onInviteSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('lawyer');
    const [selectedSubAccount, setSelectedSubAccount] = useState('');
    const [subAccounts, setSubAccounts] = useState([]);
    const [inviting, setInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    const isAdmin = currentUser?.role === 'admin' || currentUser?.user_role === 'admin';
    const isOwner = currentUser?.user_role === 'owner' || currentUser?.user_role === 'department_head';

    useEffect(() => {
        if (isOpen && isAdmin) {
            loadSubAccounts();
        }
        if (isOpen && isOwner) {
            setSelectedSubAccount(currentUser.sub_account_id || '');
        }
    }, [isOpen, isAdmin, isOwner]);

    const loadSubAccounts = async () => {
        try {
            const accounts = await SubAccount.list();
            setSubAccounts(accounts);
        } catch (error) {
            console.error('שגיאה בטעינת חשבונות:', error);
        }
    };

    const handleInvite = async () => {
        if (!email || !email.includes('@')) {
            alert('יש להזין כתובת אימייל תקינה');
            return;
        }

        if (isAdmin && !selectedSubAccount) {
            alert('יש לבחור חשבון/משרד');
            return;
        }

        setInviting(true);

        try {
            // הזמנת המשתמש דרך Base44
            await base44.users.inviteUser(email, 'user');

            // יצירת קישור הזמנה עם פרמטרים
            const inviteParams = new URLSearchParams({
                inviter_id: currentUser.id,
                inviter_email: currentUser.email,
                sub_account_id: selectedSubAccount,
                assigned_role: selectedRole
            });

            const baseUrl = window.location.origin;
            const inviteLinkGenerated = `${baseUrl}?${inviteParams.toString()}`;
            
            setInviteLink(inviteLinkGenerated);

            // שליחת אימייל עם הקישור
            await base44.integrations.Core.SendEmail({
                to: email,
                subject: 'הזמנה להצטרף למערכת LawForce',
                body: `
                    <div dir="rtl" style="font-family: Arial, sans-serif;">
                        <h2>שלום,</h2>
                        <p>הוזמנת להצטרף למערכת LawForce על ידי ${currentUser.full_name}.</p>
                        <p>לחץ על הקישור הבא להשלמת הרישום:</p>
                        <a href="${inviteLinkGenerated}" style="display: inline-block; padding: 12px 24px; background-color: #3568AE; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                            הצטרף למערכת
                        </a>
                        <p style="color: #666; font-size: 14px;">
                            או העתק את הקישור הבא לדפדפן:<br/>
                            ${inviteLinkGenerated}
                        </p>
                    </div>
                `
            });

            if (onInviteSuccess) {
                onInviteSuccess();
            }
        } catch (error) {
            console.error('שגיאה בהזמנת משתמש:', error);
            alert('שגיאה בהזמנת המשתמש. אנא נסה שנית.');
        } finally {
            setInviting(false);
        }
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetAndClose = () => {
        setIsOpen(false);
        setEmail('');
        setSelectedRole('lawyer');
        setSelectedSubAccount('');
        setInviteLink('');
        setCopied(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetAndClose();
        }}>
            <DialogTrigger asChild>
                <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    הוסף עורך דין
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>הזמן משתמש חדש למערכת</DialogTitle>
                </DialogHeader>

                {!inviteLink ? (
                    <div className="space-y-4 pt-4">
                        <div>
                            <Label htmlFor="email">אימייל המוזמן *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                                dir="ltr"
                            />
                        </div>

                        {isAdmin && (
                            <div>
                                <Label htmlFor="subaccount">חשבון/משרד *</Label>
                                <Select value={selectedSubAccount} onValueChange={setSelectedSubAccount}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="בחר חשבון" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subAccounts.map(account => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="role">תפקיד במערכת *</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {isAdmin && (
                                        <>
                                            <SelectItem value="owner">בעל משרד</SelectItem>
                                            <SelectItem value="department_head">ראש מחלקה</SelectItem>
                                        </>
                                    )}
                                    {(isAdmin || isOwner) && (
                                        <SelectItem value="department_head">ראש מחלקה</SelectItem>
                                    )}
                                    <SelectItem value="lawyer">עורך דין</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">
                                <Mail className="w-4 h-4 inline ml-1" />
                                המשתמש יקבל אימייל עם קישור להצטרפות למערכת
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={resetAndClose}>
                                ביטול
                            </Button>
                            <Button
                                onClick={handleInvite}
                                disabled={inviting || !email}
                                className="bg-[#67BF91] hover:bg-[#5AA880]"
                            >
                                {inviting ? 'שולח הזמנה...' : 'שלח הזמנה'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-green-900">ההזמנה נשלחה בהצלחה!</h3>
                            </div>
                            <p className="text-sm text-green-800">
                                נשלח אימייל ל-{email} עם קישור להצטרפות למערכת
                            </p>
                        </div>

                        <div>
                            <Label>קישור הזמנה</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={inviteLink}
                                    readOnly
                                    className="font-mono text-xs"
                                    dir="ltr"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={copyInviteLink}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                ניתן להעתיק ולשלוח את הקישור ישירות למוזמן
                            </p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={resetAndClose}>
                                סגור
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}