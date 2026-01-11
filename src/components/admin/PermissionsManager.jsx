import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
    Shield, Users, CheckSquare, UserCheck, Briefcase, 
    DollarSign, BarChart3, Settings, Info, Save, Layers
} from 'lucide-react';
import { PERMISSION_LABELS } from '@/components/permissions/PermissionsContext';

const ROLES = [
    { key: 'admin', label: 'מנהל מערכת', color: 'bg-purple-100 text-purple-800', description: 'גישה מלאה לכל המערכת' },
    { key: 'owner', label: 'בעל משרד', color: 'bg-blue-100 text-blue-800', description: 'גישה מלאה לחשבון המשרד' },
    { key: 'department_head', label: 'ראש מחלקה', color: 'bg-orange-100 text-orange-800', description: 'ניהול עובדי המחלקה' },
    { key: 'lawyer', label: 'עורך דין', color: 'bg-gray-100 text-gray-800', description: 'גישה למשימות ותיקים אישיים' }
];

const PERMISSION_GROUPS = {
    admin: {
        users: {
            label: 'ניהול משתמשים',
            icon: Users,
            permissions: [
                'view_all_users', 'edit_all_users', 'delete_users',
                'view_all_sub_accounts', 'edit_sub_accounts'
            ]
        },
        tasks: {
            label: 'משימות',
            icon: CheckSquare,
            permissions: [
                'view_all_tasks', 'assign_tasks_anyone'
            ]
        },
        clients: {
            label: 'לקוחות',
            icon: UserCheck,
            permissions: [
                'view_all_clients', 'edit_all_clients'
            ]
        },
        cases: {
            label: 'תיקים',
            icon: Briefcase,
            permissions: [
                'view_all_cases', 'edit_all_cases'
            ]
        },
        finances: {
            label: 'כספים',
            icon: DollarSign,
            permissions: ['view_all_finances', 'edit_finances']
        },
        reports: {
            label: 'דוחות והגדרות',
            icon: BarChart3,
            permissions: [
                'view_reports', 'edit_system_settings', 'manage_permissions',
                'manage_custom_fields'
            ]
        },
        studio: {
            label: 'סטודיו דפים',
            icon: Layers,
            permissions: [
                'manage_custom_objects', 'create_custom_pages'
            ]
        }
    },
    owner: {
        users: {
            label: 'ניהול צוות המשרד',
            icon: Users,
            permissions: [
                'view_sub_account_users', 'edit_sub_account_users',
                'invite_users', 'remove_users'
            ]
        },
        tasks: {
            label: 'משימות',
            icon: CheckSquare,
            permissions: [
                'view_office_tasks', 'assign_tasks_to_office_staff'
            ]
        },
        clients: {
            label: 'לקוחות',
            icon: UserCheck,
            permissions: [
                'view_office_clients', 'edit_office_clients'
            ]
        },
        cases: {
            label: 'תיקים',
            icon: Briefcase,
            permissions: [
                'view_office_cases', 'edit_office_cases'
            ]
        },
        finances: {
            label: 'כספים',
            icon: DollarSign,
            permissions: ['view_office_finances', 'edit_office_finances']
        },
        reports: {
            label: 'דוחות והגדרות',
            icon: BarChart3,
            permissions: [
                'view_office_reports', 'edit_sub_account_settings', 'manage_custom_fields'
            ]
        }
    },
    department_head: {
        users: {
            label: 'ניהול צוות המחלקה',
            icon: Users,
            permissions: [
                'view_department_users'
            ]
        },
        tasks: {
            label: 'משימות',
            icon: CheckSquare,
            permissions: [
                'view_team_tasks', 'edit_team_tasks', 'assign_tasks_to_team'
            ]
        },
        clients: {
            label: 'לקוחות',
            icon: UserCheck,
            permissions: [
                'view_department_clients', 'edit_department_clients'
            ]
        },
        cases: {
            label: 'תיקים',
            icon: Briefcase,
            permissions: [
                'view_department_cases', 'edit_department_cases'
            ]
        },
        finances: {
            label: 'כספים',
            icon: DollarSign,
            permissions: ['view_department_finances']
        },
        reports: {
            label: 'דוחות',
            icon: BarChart3,
            permissions: [
                'view_department_reports'
            ]
        }
    },
    lawyer: {
        tasks: {
            label: 'המשימות שלי',
            icon: CheckSquare,
            permissions: [
                'view_own_tasks', 'edit_own_tasks'
            ]
        },
        clients: {
            label: 'הלקוחות שלי',
            icon: UserCheck,
            permissions: [
                'view_assigned_clients', 'edit_assigned_clients'
            ]
        },
        cases: {
            label: 'התיקים שלי',
            icon: Briefcase,
            permissions: [
                'view_assigned_cases', 'edit_assigned_cases'
            ]
        }
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
        manage_custom_fields: true, manage_custom_objects: true, create_custom_pages: true
    },
    owner: {
        view_sub_account_users: true, edit_sub_account_users: true,
        invite_users: true, remove_users: true,
        view_office_tasks: true, assign_tasks_to_office_staff: true,
        view_office_clients: true, edit_office_clients: true,
        view_office_cases: true, edit_office_cases: true,
        view_office_finances: true, edit_office_finances: true,
        view_office_reports: true, edit_sub_account_settings: true,
        manage_custom_fields: true
    },
    department_head: {
        view_department_users: true,
        view_team_tasks: true, edit_team_tasks: true, assign_tasks_to_team: true,
        view_department_clients: true, edit_department_clients: true,
        view_department_cases: true, edit_department_cases: true,
        view_department_finances: true,
        view_department_reports: true
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
                        {Object.entries(PERMISSION_GROUPS[selectedRole] || {}).map(([groupKey, group]) => {
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
                                גישה מלאה לחשבון המשרד שלו בלבד. יכול להזמין ולנהל עובדים במשרד, 
                                לראות את כל הנתונים של המשרד (לקוחות, משימות, כספים) ולהקצות משימות לעובדי המשרד בלבד.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <Badge className="bg-orange-100 text-orange-800 mb-2">ראש מחלקה (Department Head)</Badge>
                            <p className="text-sm text-gray-600">
                                מנהל את עורכי הדין במחלקה שלו בלבד. יכול להקצות משימות לצוות המחלקה, 
                                לעקוב אחר התקדמות ולראות דוחות על ביצועי עובדי המחלקה בלבד.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <Badge className="bg-gray-100 text-gray-800 mb-2">עורך דין (Lawyer)</Badge>
                            <p className="text-sm text-gray-600">
                                גישה למשימות, לקוחות ותיקים המשויכים אליו אישית בלבד. 
                                אין גישה לנתוני משתמשים אחרים, הגדרות מערכת או דוחות כלליים.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}