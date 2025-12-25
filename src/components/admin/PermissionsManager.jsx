import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
    Shield, Users, CheckSquare, UserCheck, Briefcase, 
    DollarSign, BarChart3, Settings, Info, Save
} from 'lucide-react';
import { PERMISSION_LABELS } from '@/components/permissions/PermissionsContext';

const ROLES = [
    { key: 'admin', label: 'מנהל מערכת', color: 'bg-purple-100 text-purple-800', description: 'גישה מלאה לכל המערכת' },
    { key: 'owner', label: 'בעל משרד', color: 'bg-blue-100 text-blue-800', description: 'גישה מלאה לחשבון המשרד' },
    { key: 'department_head', label: 'ראש מחלקה', color: 'bg-orange-100 text-orange-800', description: 'ניהול עובדי המחלקה' },
    { key: 'lawyer', label: 'עורך דין', color: 'bg-gray-100 text-gray-800', description: 'גישה למשימות ותיקים אישיים' }
];

const PERMISSION_GROUPS = {
    users: {
        label: 'ניהול משתמשים',
        icon: Users,
        permissions: [
            'view_all_users', 'edit_all_users', 'delete_users',
            'view_sub_account_users', 'edit_sub_account_users', 
            'invite_users', 'remove_users', 'view_department_users'
        ]
    },
    tasks: {
        label: 'משימות',
        icon: CheckSquare,
        permissions: [
            'view_all_tasks', 'view_team_tasks', 'view_own_tasks',
            'edit_team_tasks', 'edit_own_tasks',
            'assign_tasks_anyone', 'assign_tasks_to_team'
        ]
    },
    clients: {
        label: 'לקוחות',
        icon: UserCheck,
        permissions: [
            'view_all_clients', 'edit_all_clients',
            'view_department_clients', 'edit_department_clients',
            'view_assigned_clients', 'edit_assigned_clients'
        ]
    },
    cases: {
        label: 'תיקים',
        icon: Briefcase,
        permissions: [
            'view_all_cases', 'edit_all_cases',
            'view_department_cases', 'edit_department_cases',
            'view_assigned_cases', 'edit_assigned_cases'
        ]
    },
    finances: {
        label: 'כספים',
        icon: DollarSign,
        permissions: ['view_all_finances', 'edit_finances', 'view_own_finances']
    },
    reports: {
        label: 'דוחות והגדרות',
        icon: BarChart3,
        permissions: [
            'view_reports', 'view_department_reports',
            'edit_system_settings', 'edit_sub_account_settings', 'manage_permissions',
            'manage_custom_fields'
        ]
    }
};

// Default permissions for each role
const DEFAULT_PERMISSIONS = {
    admin: {
        view_all_users: true, edit_all_users: true, delete_users: true,
        view_all_sub_accounts: true, edit_sub_accounts: true,
        view_all_tasks: true, assign_tasks_anyone: true,
        view_all_clients: true, edit_all_clients: true,
        view_all_cases: true, edit_all_cases: true,
        view_all_finances: true, edit_finances: true,
        view_reports: true, edit_system_settings: true, manage_permissions: true,
        manage_custom_fields: true
    },
    owner: {
        view_sub_account_users: true, edit_sub_account_users: true,
        invite_users: true, remove_users: true,
        view_all_tasks: true, assign_tasks_anyone: true,
        view_all_clients: true, edit_all_clients: true,
        view_all_cases: true, edit_all_cases: true,
        view_all_finances: true, edit_finances: true,
        view_reports: true, edit_sub_account_settings: true,
        manage_custom_fields: true
    },
    department_head: {
        view_department_users: true,
        assign_tasks_to_team: true, view_team_tasks: true, edit_team_tasks: true,
        view_department_clients: true, edit_department_clients: true,
        view_department_cases: true, edit_department_cases: true,
        view_department_reports: true, view_own_finances: true
    },
    lawyer: {
        view_own_tasks: true, edit_own_tasks: true,
        view_assigned_clients: true, edit_assigned_clients: true,
        view_assigned_cases: true, edit_assigned_cases: true
    }
};

export default function PermissionsManager() {
    const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
    const [selectedRole, setSelectedRole] = useState('admin');
    const [hasChanges, setHasChanges] = useState(false);

    const togglePermission = (role, permKey) => {
        setPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [permKey]: !prev[role]?.[permKey]
            }
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        // In a real implementation, save to database
        alert('ההרשאות נשמרו בהצלחה!');
        setHasChanges(false);
    };

    const currentRole = ROLES.find(r => r.key === selectedRole);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-[#3568AE]" />
                    <h2 className="text-xl font-bold" style={{ fontFamily: 'Heebo' }}>ניהול הרשאות</h2>
                </div>
                {hasChanges && (
                    <Button onClick={handleSave} className="bg-[#67BF91] hover:bg-[#5AA880]">
                        <Save className="w-4 h-4 ml-2" />
                        שמור שינויים
                    </Button>
                )}
            </div>

            {/* Role Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ROLES.map(role => (
                    <Card 
                        key={role.key} 
                        className={`cursor-pointer transition-all ${selectedRole === role.key ? 'ring-2 ring-[#3568AE]' : ''}`}
                        onClick={() => setSelectedRole(role.key)}
                    >
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <Badge className={role.color}>{role.label}</Badge>
                                {selectedRole === role.key && (
                                    <div className="w-2 h-2 rounded-full bg-[#3568AE]"></div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{role.description}</p>
                            <div className="mt-2 text-xs text-gray-400">
                                {Object.values(permissions[role.key] || {}).filter(Boolean).length} הרשאות פעילות
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Selected Role Permissions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Badge className={currentRole?.color}>{currentRole?.label}</Badge>
                        <span className="text-gray-500">- הרשאות מפורטות</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                            const Icon = group.icon;
                            return (
                                <div key={groupKey} className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Icon className="w-5 h-5 text-[#3568AE]" />
                                        <h3 className="font-bold">{group.label}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {group.permissions.map(permKey => (
                                            <div 
                                                key={permKey} 
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                            >
                                                <span className="text-sm">
                                                    {PERMISSION_LABELS[permKey] || permKey}
                                                </span>
                                                <Switch
                                                    checked={permissions[selectedRole]?.[permKey] || false}
                                                    onCheckedChange={() => togglePermission(selectedRole, permKey)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Permission Legend */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-[#3568AE]" />
                        <CardTitle className="text-base">מידע על סוגי המשתמשים</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <Badge className="bg-purple-100 text-purple-800 mb-2">מנהל מערכת (Admin)</Badge>
                            <p className="text-sm text-gray-600">
                                גישה מלאה לכל המערכת. יכול לנהל את כל החשבונות, המשתמשים וההגדרות. 
                                מיועד למפתחים ומנהלי המערכת בלבד.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <Badge className="bg-blue-100 text-blue-800 mb-2">בעל משרד (Owner)</Badge>
                            <p className="text-sm text-gray-600">
                                גישה מלאה לחשבון המשרד שלו. יכול להזמין ולנהל עובדים, לראות את כל הנתונים 
                                של המשרד ולהקצות משימות לכל העובדים.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <Badge className="bg-orange-100 text-orange-800 mb-2">ראש מחלקה (Department Head)</Badge>
                            <p className="text-sm text-gray-600">
                                מנהל את עורכי הדין במחלקה שלו. יכול להקצות משימות, לעקוב אחר התקדמות 
                                ולראות דוחות על ביצועי הצוות.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <Badge className="bg-gray-100 text-gray-800 mb-2">עורך דין (Lawyer)</Badge>
                            <p className="text-sm text-gray-600">
                                גישה למשימות, לקוחות ותיקים המשויכים אליו בלבד. 
                                מדווח לראש המחלקה ומקבל ממנו משימות.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}