import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Shield, Users, Settings, BarChart3, SlidersHorizontal, Bot, LifeBuoy, Building2, Lock } from "lucide-react";
import AdminStatsCards from "../components/admin/AdminStatsCards";
import UserManagementTable from "../components/admin/UserManagementTable";
import SystemSettings from "../components/admin/SystemSettings";
import ClientSettingsManager from "../components/admin/ClientSettingsManager";
import AiPromptManager from "../components/admin/AiPromptManager";
import FinancialOverviewChart from "../components/admin/FinancialOverviewChart";
import UserCharts from "../components/admin/UserCharts";
import SupportTicketManagement from "../components/admin/SupportTicketManagement";
import SubAccountManager from "../components/admin/SubAccountManager";
import PermissionsManager from "../components/admin/PermissionsManager";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers(); // Load users for stats regardless of tab
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab]);

    const loadUsers = async () => {
        try {
            const data = await User.list();
            setUsers(data);
        } catch (error) {
            console.error('שגיאה בטעינת משתמשים:', error);
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
            case 'users':
                return (
                    <UserManagementTable 
                        users={users}
                        onUserAction={handleUserAction}
                        searchQuery={searchQuery}
                    />
                );
            case 'subAccounts':
                return <SubAccountManager />;
            case 'clientSettings':
                return <ClientSettingsManager />;
            case 'aiPrompts':
                return <AiPromptManager />;
            case 'permissions':
                return <PermissionsManager />;
            case 'support':
                return <SupportTicketManagement />;
            case 'settings':
                return <SystemSettings />;
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
                        <Shield className="w-8 h-8 text-[#3568AE]" />
                        <h1 
                            className="text-[32px] font-bold text-right"
                            style={{ 
                                color: '#3568AE',
                                fontFamily: 'Heebo'
                            }}
                        >
                            ניהול מערכת LawForce
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
                            <Button 
                                className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                הוסף עורך דין
                            </Button>
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
                            onClick={() => setActiveTab('subAccounts')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'subAccounts' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <Building2 className="w-5 h-5" />
                            ניהול חשבונות
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
                            onClick={() => setActiveTab('clientSettings')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'clientSettings' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            הגדרות לקוח
                        </button>

                        <button
                            onClick={() => setActiveTab('aiPrompts')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'aiPrompts' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <Bot className="w-5 h-5" />
                            הגדרות AI
                        </button>

                        <button
                            onClick={() => setActiveTab('permissions')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'permissions' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <Lock className="w-5 h-5" />
                            הרשאות
                        </button>

                        <button
                            onClick={() => setActiveTab('support')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'support' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <LifeBuoy className="w-5 h-5" />
                            פניות תמיכה
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[15px] transition-all ${
                                activeTab === 'settings' 
                                    ? 'bg-[#3568AE] text-white' 
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <Settings className="w-5 h-5" />
                            הגדרות מערכת
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </div>
    );
}