import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { SubAccount } from "@/entities/SubAccount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, BarChart3, SlidersHorizontal, Building2, Webhook } from "lucide-react";
import AdminStatsCards from "../components/admin/AdminStatsCards";
import UserManagementTable from "../components/admin/UserManagementTable";
import FinancialOverviewChart from "../components/admin/FinancialOverviewChart";
import UserCharts from "../components/admin/UserCharts";
import CustomFieldsManager from "../components/admin/CustomFieldsManager";
import IntegrationManager from "../components/admin/IntegrationManager";
import InviteUserModal from "../components/admin/InviteUserModal";

export default function OwnerDashboard() {
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [subAccount, setSubAccount] = useState(null);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser?.sub_account_id) {
            loadUsers();
            loadSubAccount();
        }
    }, [currentUser]);

    useEffect(() => {
        if (activeTab === 'users' && currentUser?.sub_account_id) {
            loadUsers();
        }
    }, [activeTab]);

    const loadCurrentUser = async () => {
        try {
            const { base44 } = await import('@/api/base44Client');
            const user = await base44.auth.me();
            setCurrentUser(user);
        } catch (error) {
            console.error('שגיאה בטעינת משתמש נוכחי:', error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await User.list();
            // סנן רק משתמשים של החשבון הזה
            const accountUsers = data.filter(u => u.sub_account_id === currentUser.sub_account_id);
            setUsers(accountUsers);
        } catch (error) {
            console.error('שגיאה בטעינת משתמשים:', error);
        }
    };

    const loadSubAccount = async () => {
        try {
            const accounts = await SubAccount.list();
            const account = accounts.find(a => a.id === currentUser.sub_account_id);
            setSubAccount(account);
        } catch (error) {
            console.error('שגיאה בטעינת חשבון:', error);
        }
    };

    const handleUserAction = async (action, userId, userData = null) => {
        try {
            switch (action) {
                case 'activate':
                    await User.update(userId, { is_active: true });
                    break;
                case 'deactivate':
                    await User.update(userId, { is_active: false });
                    break;
                case 'delete':
                    await User.delete(userId);
                    break;
                case 'update':
                    await User.update(userId, userData);
                    break;
            }
            loadUsers();
        } catch (error) {
            console.error('שגיאה בביצוע פעולה:', error);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-8">
                        <AdminStatsCards users={users} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <FinancialOverviewChart />
                           <UserCharts users={users} />
                        </div>
                    </div>
                );
            case 'account':
                return (
                    <div className="bg-white rounded-[20px] p-6">
                        <h3 className="text-[24px] font-bold mb-6" style={{ fontFamily: 'Heebo', color: '#3568AE' }}>
                            פרטי החשבון
                        </h3>
                        {subAccount ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">שם המשרד</label>
                                    <Input value={subAccount.name} readOnly />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">סוג חשבון</label>
                                    <Input value={subAccount.subscription_plan || 'רגיל'} readOnly />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">מספר משתמשים</label>
                                    <Input value={users.length} readOnly />
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                    <p className="text-sm text-blue-900">
                                        💡 לשינוי פרטי חשבון, פנה למנהל המערכת
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p>טוען פרטי חשבון...</p>
                        )}
                    </div>
                );
            case 'users':
                return (
                    <UserManagementTable 
                        users={users}
                        onUserAction={handleUserAction}
                        searchQuery={searchQuery}
                    />
                );
            case 'customFields':
                return <CustomFieldsManager subAccountId={currentUser?.sub_account_id} />;
            case 'integrations':
                return (
                    <div className="bg-white rounded-[20px] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Webhook className="w-6 h-6 text-[#3568AE]" />
                            <h3 
                                className="text-[20px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                אינטגרציות חיצוניות
                            </h3>
                        </div>
                        <IntegrationManager subAccountId={currentUser?.sub_account_id} />
                    </div>
                );
            default:
                return <AdminStatsCards users={users} />;
        }
    };

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-[1400px] mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Building2 className="w-8 h-8 text-[#3568AE]" />
                        <h1 
                            className="text-[32px] font-bold text-right"
                            style={{ 
                                color: '#3568AE',
                                fontFamily: 'Heebo'
                            }}
                        >
                            ניהול המשרד - {subAccount?.name || ''}
                        </h1>
                    </div>
                    
                    {activeTab === 'users' && (
                        <div className="flex items-center gap-4">
                            <div className="relative max-w-[300px]">
                                <Input
                                    placeholder="חיפוש עורכי דין..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-10"
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            <InviteUserModal 
                                currentUser={currentUser}
                                onInviteSuccess={loadUsers}
                            />
                        </div>
                    )}
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-[20px] p-6 mb-8">
                    <div className="flex gap-4 flex-wrap">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'dashboard' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <BarChart3 className="w-5 h-5" />
                            דשבורד
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'account' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <Building2 className="w-5 h-5" />
                            ניהול חשבון
                        </button>

                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'users' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <Users className="w-5 h-5" />
                            ניהול משתמשים
                        </button>

                        <button
                            onClick={() => setActiveTab('customFields')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'customFields' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            שדות מותאמים
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('integrations')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'integrations' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <Webhook className="w-5 h-5" />
                            אינטגרציות חיצוניות
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </div>
    );
}