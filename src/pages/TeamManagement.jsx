import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Task } from '@/entities/Task';
import { SubAccount } from '@/entities/SubAccount';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Users, Search, Plus, UserCheck, CheckSquare, Clock, 
    BarChart3, Filter, MoreVertical, Edit, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';

export default function TeamManagement() {
    const [currentUser, setCurrentUser] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [subAccount, setSubAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await base44.auth.me();
            setCurrentUser(user);

            if (user.sub_account_id) {
                const [allUsers, allTasks, account] = await Promise.all([
                    User.list(),
                    Task.list('-created_date'),
                    SubAccount.filter({ id: user.sub_account_id })
                ]);

                // Filter team members based on role
                let members = [];
                if (user.user_role === 'owner' || user.role === 'admin') {
                    // Owner sees all users in their sub_account
                    members = allUsers.filter(u => u.sub_account_id === user.sub_account_id);
                } else if (user.user_role === 'department_head') {
                    // Department head sees lawyers who report to them
                    members = allUsers.filter(u => 
                        u.sub_account_id === user.sub_account_id && 
                        (u.manager_id === user.id || u.user_role === 'lawyer')
                    );
                }

                setTeamMembers(members);
                setTasks(allTasks.filter(t => t.sub_account_id === user.sub_account_id));
                setSubAccount(account[0]);
            }
        } catch (error) {
            console.error('שגיאה בטעינת נתונים:', error);
        } finally {
            setLoading(false);
        }
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

    const getRoleColor = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800',
            owner: 'bg-blue-100 text-blue-800',
            department_head: 'bg-orange-100 text-orange-800',
            lawyer: 'bg-gray-100 text-gray-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getMemberTasks = (memberId) => {
        return tasks.filter(t => t.assigned_to === memberId);
    };

    const getMemberStats = (memberId) => {
        const memberTasks = getMemberTasks(memberId);
        return {
            total: memberTasks.length,
            open: memberTasks.filter(t => t.status === 'פתוח').length,
            inProgress: memberTasks.filter(t => t.status === 'בטיפול').length,
            completed: memberTasks.filter(t => t.status === 'הושלם').length
        };
    };

    const filteredMembers = teamMembers.filter(member =>
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex justify-center items-center" style={{ background: '#F5F5F5' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE]"></div>
            </div>
        );
    }

    const isManager = currentUser?.user_role === 'owner' || 
                      currentUser?.user_role === 'department_head' || 
                      currentUser?.role === 'admin';

    if (!isManager) {
        return (
            <div className="min-h-screen p-8 flex justify-center items-center" style={{ background: '#F5F5F5' }}>
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">אין לך הרשאה לצפות בעמוד זה</h2>
                        <p className="text-gray-500">רק בעלי משרדים וראשי מחלקות יכולים לנהל צוותים</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#3568AE]" />
                        <div>
                            <h1 className="text-2xl md:text-[32px] font-bold" style={{ color: '#3568AE', fontFamily: 'Heebo' }}>
                                ניהול צוות
                            </h1>
                            {subAccount && (
                                <p className="text-gray-500 text-sm">{subAccount.name}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Input
                                placeholder="חיפוש עובד..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-[#3568AE]" />
                                <div>
                                    <div className="text-2xl font-bold">{teamMembers.length}</div>
                                    <div className="text-sm text-gray-500">עובדים בצוות</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <CheckSquare className="w-8 h-8 text-green-600" />
                                <div>
                                    <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'הושלם').length}</div>
                                    <div className="text-sm text-gray-500">משימות הושלמו</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-8 h-8 text-orange-500" />
                                <div>
                                    <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'בטיפול').length}</div>
                                    <div className="text-sm text-gray-500">משימות בטיפול</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-8 h-8 text-purple-600" />
                                <div>
                                    <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'פתוח').length}</div>
                                    <div className="text-sm text-gray-500">משימות פתוחות</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="members" className="w-full">
                    <TabsList className="bg-white rounded-[15px] p-1 mb-6">
                        <TabsTrigger value="members" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            עובדים
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" />
                            משימות הצוות
                        </TabsTrigger>
                    </TabsList>

                    {/* Team Members Tab */}
                    <TabsContent value="members">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMembers.map(member => {
                                const stats = getMemberStats(member.id);
                                return (
                                    <Card key={member.id} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-[#3568AE] flex items-center justify-center text-white font-bold text-lg">
                                                        {member.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold">{member.full_name}</h3>
                                                        <p className="text-sm text-gray-500">{member.email}</p>
                                                    </div>
                                                </div>
                                                <Badge className={getRoleColor(member.user_role)}>
                                                    {getRoleLabel(member.user_role)}
                                                </Badge>
                                            </div>

                                            {/* Task Stats */}
                                            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <div className="text-lg font-bold text-orange-500">{stats.open}</div>
                                                    <div className="text-xs text-gray-500">פתוחות</div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <div className="text-lg font-bold text-blue-500">{stats.inProgress}</div>
                                                    <div className="text-xs text-gray-500">בטיפול</div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <div className="text-lg font-bold text-green-500">{stats.completed}</div>
                                                    <div className="text-xs text-gray-500">הושלמו</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1"
                                                    onClick={() => setSelectedMember(member)}
                                                >
                                                    <Eye className="w-4 h-4 ml-1" />
                                                    צפה במשימות
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button 
                                                            size="sm" 
                                                            className="flex-1 bg-[#67BF91] hover:bg-[#5AA880]"
                                                        >
                                                            <Plus className="w-4 h-4 ml-1" />
                                                            הקצה משימה
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>הקצאת משימה ל{member.full_name}</DialogTitle>
                                                        </DialogHeader>
                                                        <AssignTaskForm 
                                                            member={member} 
                                                            currentUser={currentUser}
                                                            onTaskAssigned={loadData}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {filteredMembers.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">לא נמצאו עובדים בצוות</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Team Tasks Tab */}
                    <TabsContent value="tasks">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>משימות הצוות</CardTitle>
                                    <CreateTaskModal onTaskCreated={loadData} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-3 font-medium">משימה</th>
                                                <th className="p-3 font-medium">מוקצה ל</th>
                                                <th className="p-3 font-medium">סטטוס</th>
                                                <th className="p-3 font-medium">עדיפות</th>
                                                <th className="p-3 font-medium">דדליין</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.slice(0, 20).map(task => (
                                                <tr key={task.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3">
                                                        <div className="font-medium">{task.title}</div>
                                                        {task.client_name && (
                                                            <div className="text-sm text-gray-500">{task.client_name}</div>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {task.assigned_to_name || 'לא מוקצה'}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge className={
                                                            task.status === 'הושלם' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'בטיפול' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }>
                                                            {task.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge className={
                                                            task.priority === 'גבוהה' ? 'bg-red-100 text-red-800' :
                                                            task.priority === 'בינונית' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }>
                                                            {task.priority}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-sm">
                                                        {task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Member Tasks Modal */}
                {selectedMember && (
                    <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>משימות של {selectedMember.full_name}</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-96 overflow-y-auto">
                                {getMemberTasks(selectedMember.id).length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">אין משימות מוקצות</p>
                                ) : (
                                    <div className="space-y-3">
                                        {getMemberTasks(selectedMember.id).map(task => (
                                            <div key={task.id} className="border rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{task.title}</div>
                                                        <div className="text-sm text-gray-500">{task.description}</div>
                                                    </div>
                                                    <Badge className={
                                                        task.status === 'הושלם' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'בטיפול' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }>
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}

// Component for assigning tasks
function AssignTaskForm({ member, currentUser, onTaskAssigned }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'בינונית',
        task_type: 'אחר',
        due_date: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await Task.create({
                ...formData,
                assigned_to: member.id,
                assigned_to_name: member.full_name,
                assigned_by: currentUser.id,
                sub_account_id: currentUser.sub_account_id,
                status: 'פתוח'
            });
            onTaskAssigned();
        } catch (error) {
            console.error('שגיאה ביצירת משימה:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
                <label className="block text-sm font-medium mb-1">כותרת המשימה *</label>
                <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">תיאור</label>
                <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">עדיפות</label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="נמוכה">נמוכה</SelectItem>
                            <SelectItem value="בינונית">בינונית</SelectItem>
                            <SelectItem value="גבוהה">גבוהה</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">דדליין</label>
                    <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                </div>
            </div>
            <Button type="submit" className="w-full bg-[#67BF91] hover:bg-[#5AA880]" disabled={submitting}>
                {submitting ? 'שומר...' : 'הקצה משימה'}
            </Button>
        </form>
    );
}