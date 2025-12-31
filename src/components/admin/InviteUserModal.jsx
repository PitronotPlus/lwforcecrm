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
    const [selectedRole, setSelectedRole] = useState('lawyer');
    const [selectedSubAccount, setSelectedSubAccount] = useState('');
    const [subAccounts, setSubAccounts] = useState([]);
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
        if (isOpen) {
            generateInviteLink();
        }
    }, [isOpen, isAdmin, isOwner, selectedRole, selectedSubAccount]);

    const loadSubAccounts = async () => {
        try {
            const accounts = await SubAccount.list();
            setSubAccounts(accounts);
        } catch (error) {
            console.error('שגיאה בטעינת חשבונות:', error);
        }
    };

    const generateInviteLink = () => {
        if (!currentUser) return;
        
        const subAccountToUse = isAdmin ? selectedSubAccount : currentUser.sub_account_id;
        
        if (isAdmin && !subAccountToUse) return;

        const inviteParams = new URLSearchParams({
            inviter_id: currentUser.id,
            inviter_email: currentUser.email,
            sub_account_id: subAccountToUse,
            assigned_role: selectedRole
        });

        const baseUrl = window.location.origin;
        const inviteLinkGenerated = `${baseUrl}?${inviteParams.toString()}`;
        
        setInviteLink(inviteLinkGenerated);
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetAndClose = () => {
        setIsOpen(false);
        setSelectedRole('lawyer');
        if (!isOwner) {
            setSelectedSubAccount('');
        }
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

            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>קישור הזמנה ייחודי למערכת</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
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

                    {inviteLink && (
                        <>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">🔗 קישור ייחודי שלך</h3>
                                <p className="text-sm text-blue-800">
                                    כל מי שנרשם דרך הקישור הזה יהיה משוייך אליך אוטומטית {isOwner && 'ולמשרד שלך'}!
                                </p>
                            </div>

                            <div>
                                <Label>העתק ושלח את הקישור הזה</Label>
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
                                    💡 שלח את הקישור לכל מי שתרצה להזמין - בוואטסאפ, מייל או SMS
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-900">
                                    ✅ המשתמש שייכנס דרך הקישור יוגדר כ<strong>{selectedRole === 'lawyer' ? 'עורך דין' : selectedRole === 'owner' ? 'בעל משרד' : 'ראש מחלקה'}</strong> ויהיה תחתיך במערכת
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button onClick={resetAndClose}>
                            סגור
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}