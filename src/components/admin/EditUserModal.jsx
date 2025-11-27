import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SubAccount } from '@/entities/SubAccount';

export default function EditUserModal({ user, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({});
    const [subAccounts, setSubAccounts] = useState([]);

    useEffect(() => {
        loadSubAccounts();
    }, []);

    const loadSubAccounts = async () => {
        try {
            const accounts = await SubAccount.list();
            setSubAccounts(accounts);
        } catch (error) {
            console.error('שגיאה בטעינת חשבונות:', error);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                law_firm_name: user.law_firm_name || '',
                sub_account_id: user.sub_account_id || '',
                user_role: user.user_role || 'lawyer',
                subscription_plan: user.subscription_plan || 'basic',
                is_active: user.is_active === undefined ? true : user.is_active,
                credit_profit_margin: user.credit_profit_margin || 0,
            });
        }
    }, [user]);
    
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    if (!isOpen || !user) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>עריכת פרטי משתמש: {user.full_name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">שם מלא</Label>
                        <Input id="full_name" value={formData.full_name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sub_account_id">משרד (חשבון)</Label>
                        <Select 
                            value={formData.sub_account_id || ''}
                            onValueChange={(value) => setFormData(prev => ({...prev, sub_account_id: value}))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="בחר משרד" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>ללא משרד</SelectItem>
                                {subAccounts.map(account => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="user_role">תפקיד</Label>
                        <Select 
                            value={formData.user_role || 'lawyer'}
                            onValueChange={(value) => setFormData(prev => ({...prev, user_role: value}))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="בחר תפקיד" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">מנהל מערכת (Admin)</SelectItem>
                                <SelectItem value="owner">בעל משרד</SelectItem>
                                <SelectItem value="department_head">ראש מחלקה</SelectItem>
                                <SelectItem value="lawyer">עורך דין</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subscription_plan">תוכנית</Label>
                            <Select 
                                value={formData.subscription_plan}
                                onValueChange={(value) => setFormData(prev => ({...prev, subscription_plan: value}))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="בחר תוכנית" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basic">בסיסי</SelectItem>
                                    <SelectItem value="premium">פרימיום</SelectItem>
                                    <SelectItem value="enterprise">ארגוני</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="credit_profit_margin">מרווח רווח על קרדיטים (%)</Label>
                            <Input 
                                id="credit_profit_margin"
                                type="number"
                                value={formData.credit_profit_margin}
                                onChange={handleChange}
                                placeholder="למשל: 20"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id="is_active" 
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="is_active">חשבון פעיל</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>ביטול</Button>
                    <Button 
                        onClick={() => onSave(formData)} 
                        className="bg-[#67BF91] hover:bg-[#5AA880]"
                    >
                        שמור שינויים
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}