
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreVertical, Shield, ShieldOff } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditUserModal from './EditUserModal';

export default function UserManagementTable({ users, onUserAction, searchQuery }) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    const filteredUsers = users.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.law_firm_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSubscriptionBadge = (plan) => {
        const colors = {
            basic: 'bg-gray-100 text-gray-800',
            premium: 'bg-yellow-100 text-yellow-800',
            enterprise: 'bg-purple-100 text-purple-800'
        };
        
        const labels = {
            basic: 'בסיסי',
            premium: 'פרימיום',
            enterprise: 'ארגוני'
        };

        return (
            <Badge className={colors[plan] || colors.basic}>
                {labels[plan] || 'בסיסי'}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'אף פעם';
        return new Date(dateString).toLocaleDateString('he-IL');
    };

    const handleSaveUser = (updatedData) => {
        if (editingUser) {
            onUserAction('update', editingUser.id, updatedData);
            setEditingUser(null); // Close the modal after saving
        }
    };

    return (
        <div className="bg-white rounded-[20px] p-6">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th 
                                className="text-right py-4 px-4 text-[16px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                <input 
                                    type="checkbox" 
                                    className="rounded"
                                />
                            </th>
                            <th 
                                className="text-right py-4 px-4 text-[16px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                שם מלא
                            </th>
                            <th 
                                className="text-right py-4 px-4 text-[16px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                אימייל
                            </th>
                            <th 
                                className="text-right py-4 px-4 text-[16px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                משרד
                            </th>
                            <th 
                                className="text-right py-4 px-4 text-[16px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                תוכנית
                            </th>
                            <th 
                                className="text-right py-4 px-4 text-[16px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                סטטוס
                            </th>
                            <th 
                                className="text-right py-4 px-4 text-[16px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                התחברות אחרונה
                            </th>
                            <th 
                                className="text-right py-4 px-4 text-[16px] font-medium"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                פעולות
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-4 px-4">
                                    <input 
                                        type="checkbox" 
                                        className="rounded"
                                    />
                                </td>
                                <td 
                                    className="py-4 px-4 text-right"
                                    style={{ 
                                        color: '#484848',
                                        fontFamily: 'Heebo'
                                    }}
                                >
                                    {user.full_name || 'לא צוין'}
                                </td>
                                <td 
                                    className="py-4 px-4 text-right"
                                    style={{ 
                                        color: '#484848',
                                        fontFamily: 'Heebo'
                                    }}
                                >
                                    {user.email}
                                </td>
                                <td 
                                    className="py-4 px-4 text-right"
                                    style={{ 
                                        color: '#484848',
                                        fontFamily: 'Heebo'
                                    }}
                                >
                                    {user.law_firm_name || 'עצמאי'}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    {getSubscriptionBadge(user.subscription_plan)}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <Badge 
                                        className={user.is_active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                        }
                                    >
                                        {user.is_active ? 'פעיל' : 'לא פעיל'}
                                    </Badge>
                                </td>
                                <td 
                                    className="py-4 px-4 text-right text-sm"
                                    style={{ 
                                        color: '#858C94',
                                        fontFamily: 'Heebo'
                                    }}
                                >
                                    {formatDate(user.last_login)}
                                </td>
                                <td className="py-4 px-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                ערוך
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => onUserAction(
                                                    user.is_active ? 'deactivate' : 'activate', 
                                                    user.id
                                                )}
                                            >
                                                {user.is_active ? (
                                                    <>
                                                        <ShieldOff className="w-4 h-4 mr-2" />
                                                        השבת
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        הפעל
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => onUserAction('delete', user.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                מחק
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <EditUserModal 
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleSaveUser}
            />
        </div>
    );
}
