import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { SubAccount } from '@/entities/SubAccount';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Building2, Users, Search, Eye, UserCircle } from 'lucide-react';

export default function SubAccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [viewingAccountUsers, setViewingAccountUsers] = useState(null);
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        owner_email: '',
        phone: '',
        address: '',
        license_number: '',
        status: 'active',
        subscription_type: 'trial',
        max_users: 5,
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [accountsData, usersData] = await Promise.all([
                SubAccount.list('-created_date'),
                User.list()
            ]);
            setAccounts(accountsData);
            setUsers(usersData);
        } catch (error) {
            console.error('שגיאה בטעינת חשבונות:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAccount) {
                await SubAccount.update(editingAccount.id, formData);
            } else {
                await SubAccount.create(formData);
            }
            setIsModalOpen(false);
            setEditingAccount(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('שגיאה בשמירת חשבון:', error);
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setFormData({
            name: account.name || '',
            owner_email: account.owner_email || '',
            phone: account.phone || '',
            address: account.address || '',
            license_number: account.license_number || '',
            status: account.status || 'active',
            subscription_type: account.subscription_type || 'trial',
            max_users: account.max_users || 5,
            notes: account.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (accountId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק חשבון זה?')) {
            await SubAccount.delete(accountId);
            loadData();
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            owner_email: '',
            phone: '',
            address: '',
            license_number: '',
            status: 'active',
            subscription_type: 'trial',
            max_users: 5,
            notes: ''
        });
    };

    const getUsersCount = (accountId) => {
        return users.filter(u => u.sub_account_id === accountId).length;
    };

    const getAccountUsers = (accountId) => {
        return users.filter(u => u.sub_account_id === accountId);
    };

    const handleViewUsers = (account) => {
        setViewingAccountUsers(account);
        setShowUsersModal(true);
    };

    const handleImpersonate = async (account) => {
        if (!confirm(`האם אתה בטוח שברצונך להתחזות כבעל המשרד ${account.name}?`)) return;
        
        try {
            // כאן נוסיף לוגיקה להתחזות - נצטרך ליצור את זה בהמשך
            alert(`התחזות כ-${account.owner_email} (פונקציה תופעל בהמשך)`);
        } catch (error) {
            console.error('שגיאה בהתחזות:', error);
            alert('אירעה שגיאה בהתחזות');
        }
    };

    const getUserRoleLabel = (role) => {
        const labels = {
            'admin': 'מנהל מערכת',
            'owner': 'בעל משרד',
            'department_head': 'ראש מחלקה',
            'lawyer': 'עורך דין'
        };
        return labels[role] || 'עורך דין';
    };

    const getUserRoleColor = (role) => {
        const colors = {
            'admin': 'bg-purple-100 text-purple-800',
            'owner': 'bg-blue-100 text-blue-800',
            'department_head': 'bg-orange-100 text-orange-800',
            'lawyer': 'bg-gray-100 text-gray-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'suspended': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'active': 'פעיל',
            'inactive': 'לא פעיל',
            'suspended': 'מושעה'
        };
        return labels[status] || status;
    };

    const getSubscriptionLabel = (type) => {
        const labels = {
            'trial': 'ניסיון',
            'basic': 'בסיסי',
            'premium': 'פרימיום',
            'enterprise': 'ארגוני'
        };
        return labels[type] || type;
    };

    const filteredAccounts = accounts.filter(account =>
        account.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.owner_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3568AE]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-[#3568AE]" />
                    <h2 className="text-xl font-bold" style={{ fontFamily: 'Heebo' }}>ניהול חשבונות (משרדים)</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Input
                            placeholder="חיפוש חשבון..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={(open) => {
                        setIsModalOpen(open);
                        if (!open) {
                            setEditingAccount(null);
                            resetForm();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                <Plus className="w-4 h-4 ml-2" />
                                חשבון חדש
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle style={{ fontFamily: 'Heebo' }}>
                                    {editingAccount ? 'עריכת חשבון' : 'יצירת חשבון חדש'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">שם המשרד *</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">אימייל בעל החשבון *</label>
                                    <Input
                                        required
                                        type="email"
                                        value={formData.owner_email}
                                        onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">טלפון</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">מספר רישיון</label>
                                        <Input
                                            value={formData.license_number}
                                            onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">כתובת</label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">סטטוס</label>
                                        <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">פעיל</SelectItem>
                                                <SelectItem value="inactive">לא פעיל</SelectItem>
                                                <SelectItem value="suspended">מושעה</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">סוג מנוי</label>
                                        <Select value={formData.subscription_type} onValueChange={(val) => setFormData({...formData, subscription_type: val})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="trial">ניסיון</SelectItem>
                                                <SelectItem value="basic">בסיסי</SelectItem>
                                                <SelectItem value="premium">פרימיום</SelectItem>
                                                <SelectItem value="enterprise">ארגוני</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">מקס' משתמשים</label>
                                        <Input
                                            type="number"
                                            value={formData.max_users}
                                            onChange={(e) => setFormData({...formData, max_users: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">הערות</label>
                                    <Input
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>ביטול</Button>
                                    <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880]">
                                        {editingAccount ? 'עדכן' : 'צור חשבון'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-[#3568AE]">{accounts.length}</div>
                        <div className="text-sm text-gray-500">סה"כ חשבונות</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                            {accounts.filter(a => a.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-500">חשבונות פעילים</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-purple-600">{users.length}</div>
                        <div className="text-sm text-gray-500">סה"כ משתמשים</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-orange-600">
                            {accounts.filter(a => a.subscription_type === 'premium' || a.subscription_type === 'enterprise').length}
                        </div>
                        <div className="text-sm text-gray-500">מנויים בתשלום</div>
                    </CardContent>
                </Card>
            </div>

            {/* Accounts Table */}
            <Card>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-3 font-medium">שם המשרד</th>
                                    <th className="p-3 font-medium">בעל החשבון</th>
                                    <th className="p-3 font-medium">משתמשים</th>
                                    <th className="p-3 font-medium">מנוי</th>
                                    <th className="p-3 font-medium">סטטוס</th>
                                    <th className="p-3 font-medium">פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAccounts.map(account => (
                                    <tr key={account.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{account.name}</td>
                                        <td className="p-3">{account.owner_email}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                {getUsersCount(account.id)} / {account.max_users}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="outline">{getSubscriptionLabel(account.subscription_type)}</Badge>
                                        </td>
                                        <td className="p-3">
                                            <Badge className={getStatusColor(account.status)}>
                                                {getStatusLabel(account.status)}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleViewUsers(account)}
                                                    title="צפה במשתמשים"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleImpersonate(account)}
                                                    title="התחזה כבעל משרד"
                                                >
                                                    <UserCircle className="w-4 h-4 text-purple-500" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredAccounts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            לא נמצאו חשבונות
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Users Modal */}
            <Dialog open={showUsersModal} onOpenChange={setShowUsersModal}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: 'Heebo' }}>
                            משתמשים במשרד: {viewingAccountUsers?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {viewingAccountUsers && (
                        <div className="pt-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 font-medium">שם מלא</th>
                                            <th className="p-3 font-medium">אימייל</th>
                                            <th className="p-3 font-medium">תפקיד</th>
                                            <th className="p-3 font-medium">סטטוס</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getAccountUsers(viewingAccountUsers.id).map(user => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{user.full_name || 'לא צוין'}</td>
                                                <td className="p-3">{user.email}</td>
                                                <td className="p-3">
                                                    <Badge className={getUserRoleColor(user.user_role)}>
                                                        {getUserRoleLabel(user.user_role)}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                        {user.is_active ? 'פעיל' : 'לא פעיל'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {getAccountUsers(viewingAccountUsers.id).length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        אין משתמשים במשרד זה
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}