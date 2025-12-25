import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PermissionsContext = createContext();

// הגדרת הרשאות ברירת מחדל לכל תפקיד
const DEFAULT_PERMISSIONS = {
    admin: {
        // מנהל מערכת - גישה מלאה לכל המערכת
        view_all_users: true,
        edit_all_users: true,
        delete_users: true,
        view_all_sub_accounts: true,
        edit_sub_accounts: true,
        view_all_tasks: true,
        assign_tasks_anyone: true,
        view_all_clients: true,
        edit_all_clients: true,
        view_all_cases: true,
        edit_all_cases: true,
        view_all_finances: true,
        edit_finances: true,
        view_reports: true,
        edit_system_settings: true,
        manage_permissions: true
    },
    owner: {
        // בעל משרד - גישה מלאה לחשבון שלו
        view_sub_account_users: true,
        edit_sub_account_users: true,
        invite_users: true,
        remove_users: true,
        view_all_tasks: true,
        assign_tasks_anyone: true,
        view_all_clients: true,
        edit_all_clients: true,
        view_all_cases: true,
        edit_all_cases: true,
        view_all_finances: true,
        edit_finances: true,
        view_reports: true,
        edit_sub_account_settings: true
    },
    department_head: {
        // ראש מחלקה - מנהל את העובדים במחלקה שלו
        view_department_users: true,
        assign_tasks_to_team: true,
        view_team_tasks: true,
        edit_team_tasks: true,
        view_department_clients: true,
        edit_department_clients: true,
        view_department_cases: true,
        edit_department_cases: true,
        view_department_reports: true,
        view_own_finances: true
    },
    lawyer: {
        // עורך דין - גישה רק למשימות והתיקים שלו
        view_own_tasks: true,
        edit_own_tasks: true,
        view_assigned_clients: true,
        edit_assigned_clients: true,
        view_assigned_cases: true,
        edit_assigned_cases: true,
        view_own_finances: false
    }
};

// תיאורי הרשאות בעברית
export const PERMISSION_LABELS = {
    // משתמשים
    view_all_users: 'צפייה בכל המשתמשים במערכת',
    edit_all_users: 'עריכת כל המשתמשים',
    delete_users: 'מחיקת משתמשים',
    view_sub_account_users: 'צפייה במשתמשי המשרד',
    edit_sub_account_users: 'עריכת משתמשי המשרד',
    invite_users: 'הזמנת משתמשים חדשים',
    remove_users: 'הסרת משתמשים מהמשרד',
    view_department_users: 'צפייה בעובדי המחלקה',
    
    // חשבונות
    view_all_sub_accounts: 'צפייה בכל החשבונות/משרדים',
    edit_sub_accounts: 'עריכת חשבונות/משרדים',
    edit_sub_account_settings: 'עריכת הגדרות המשרד',
    
    // משימות
    view_all_tasks: 'צפייה בכל המשימות',
    view_team_tasks: 'צפייה במשימות הצוות',
    view_own_tasks: 'צפייה במשימות שלי',
    edit_team_tasks: 'עריכת משימות הצוות',
    edit_own_tasks: 'עריכת המשימות שלי',
    assign_tasks_anyone: 'הקצאת משימות לכל עובד',
    assign_tasks_to_team: 'הקצאת משימות לצוות שלי',
    
    // לקוחות
    view_all_clients: 'צפייה בכל הלקוחות',
    edit_all_clients: 'עריכת כל הלקוחות',
    view_department_clients: 'צפייה בלקוחות המחלקה',
    edit_department_clients: 'עריכת לקוחות המחלקה',
    view_assigned_clients: 'צפייה בלקוחות המשויכים',
    edit_assigned_clients: 'עריכת לקוחות משויכים',
    
    // תיקים
    view_all_cases: 'צפייה בכל התיקים',
    edit_all_cases: 'עריכת כל התיקים',
    view_department_cases: 'צפייה בתיקי המחלקה',
    edit_department_cases: 'עריכת תיקי המחלקה',
    view_assigned_cases: 'צפייה בתיקים משויכים',
    edit_assigned_cases: 'עריכת תיקים משויכים',
    
    // כספים
    view_all_finances: 'צפייה בכל הנתונים הכספיים',
    edit_finances: 'עריכת נתונים כספיים',
    view_own_finances: 'צפייה בנתונים כספיים אישיים',
    
    // דוחות והגדרות
    view_reports: 'צפייה בדוחות',
    view_department_reports: 'צפייה בדוחות המחלקה',
    edit_system_settings: 'עריכת הגדרות מערכת',
    manage_permissions: 'ניהול הרשאות',
    manage_custom_fields: 'ניהול שדות מותאמים אישית'
};

// קטגוריות הרשאות
export const PERMISSION_CATEGORIES = {
    users: { label: 'משתמשים', icon: 'Users' },
    tasks: { label: 'משימות', icon: 'CheckSquare' },
    clients: { label: 'לקוחות', icon: 'UserCheck' },
    cases: { label: 'תיקים', icon: 'Briefcase' },
    finances: { label: 'כספים', icon: 'DollarSign' },
    reports: { label: 'דוחות', icon: 'BarChart' },
    settings: { label: 'הגדרות', icon: 'Settings' }
};

export function PermissionsProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserPermissions();
    }, []);

    const loadUserPermissions = async () => {
        try {
            const user = await base44.auth.me();
            setCurrentUser(user);
            
            const role = user.user_role || user.role || 'lawyer';
            const userPermissions = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.lawyer;
            setPermissions(userPermissions);
        } catch (error) {
            console.error('שגיאה בטעינת הרשאות:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (permissionKey) => {
        return permissions[permissionKey] === true;
    };

    const getUserRole = () => {
        return currentUser?.user_role || currentUser?.role || 'lawyer';
    };

    const getRoleLabel = (role) => {
        const labels = {
            admin: 'מנהל מערכת',
            owner: 'בעל משרד',
            department_head: 'ראש מחלקה',
            lawyer: 'עורך דין'
        };
        return labels[role] || 'עורך דין';
    };

    return (
        <PermissionsContext.Provider value={{
            currentUser,
            permissions,
            hasPermission,
            getUserRole,
            getRoleLabel,
            loading,
            DEFAULT_PERMISSIONS,
            PERMISSION_LABELS
        }}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionsProvider');
    }
    return context;
}