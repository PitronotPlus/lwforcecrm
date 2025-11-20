import React, { useState, useEffect } from "react";
import { Task } from "@/entities/Task";
import { TaskHistory } from "@/entities/TaskHistory";
import { TaskReminder } from "@/entities/TaskReminder";
import { User } from "@/entities/User";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Save, X, Clock, Bell, History } from "lucide-react";

export default function TaskDetailModal({ task, open, onClose, onUpdate, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [history, setHistory] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isOverdue, setIsOverdue] = useState(false);
    const [newReminder, setNewReminder] = useState({ date: '', time: '' });

    useEffect(() => {
        if (task) {
            setEditForm(task);
            loadHistory();
            loadReminders();
            loadUser();
            calculateTimeRemaining();
        }
    }, [task]);

    useEffect(() => {
        const interval = setInterval(() => {
            calculateTimeRemaining();
        }, 1000);
        return () => clearInterval(interval);
    }, [task?.due_date]);

    const calculateTimeRemaining = () => {
        if (!task?.due_date) {
            setTimeRemaining(null);
            return;
        }

        const now = new Date();
        const dueDate = new Date(task.due_date);
        const diff = dueDate - now;

        if (diff < 0) {
            setIsOverdue(true);
            setTimeRemaining(Math.abs(diff));
        } else {
            setIsOverdue(false);
            setTimeRemaining(diff);
        }
    };

    const loadUser = async () => {
        try {
            const user = await User.me();
            setCurrentUser(user);
        } catch (error) {
            console.error("Error loading user:", error);
        }
    };

    const loadHistory = async () => {
        try {
            const data = await TaskHistory.filter({ task_id: task.id });
            setHistory(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error("Error loading history:", error);
        }
    };

    const loadReminders = async () => {
        try {
            const data = await TaskReminder.filter({ task_id: task.id });
            setReminders(data.sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date)));
        } catch (error) {
            console.error("Error loading reminders:", error);
        }
    };

    const handleSave = async () => {
        try {
            await Task.update(task.id, editForm);
            
            await TaskHistory.create({
                task_id: task.id,
                action: 'עודכנה',
                performed_by: currentUser?.full_name || currentUser?.email,
                notes: 'עריכת פרטי משימה'
            });

            setEditing(false);
            onUpdate();
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
            try {
                await TaskHistory.create({
                    task_id: task.id,
                    action: 'נמחקה',
                    performed_by: currentUser?.full_name || currentUser?.email
                });
                
                await Task.delete(task.id);
                onDelete();
                onClose();
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    const addReminder = async () => {
        if (!newReminder.date || !newReminder.time) {
            alert('יש למלא תאריך ושעה');
            return;
        }

        try {
            const reminderDate = new Date(`${newReminder.date}T${newReminder.time}`);
            
            await TaskReminder.create({
                task_id: task.id,
                reminder_date: reminderDate.toISOString(),
                user_email: currentUser?.email,
                reminder_type: 'notification'
            });

            setNewReminder({ date: '', time: '' });
            loadReminders();
        } catch (error) {
            console.error("Error adding reminder:", error);
        }
    };

    const deleteReminder = async (reminderId) => {
        try {
            await TaskReminder.delete(reminderId);
            loadReminders();
        } catch (error) {
            console.error("Error deleting reminder:", error);
        }
    };

    const formatTimeRemaining = (milliseconds) => {
        if (!milliseconds) return '00:00:00:00';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'נמוכה': 'bg-blue-100 text-blue-800',
            'בינונית': 'bg-yellow-100 text-yellow-800',
            'גבוהה': 'bg-red-100 text-red-800'
        };
        return colors[priority] || colors['בינונית'];
    };

    const getStatusColor = (status) => {
        const colors = {
            'פתוח': 'bg-gray-100 text-gray-800',
            'בטיפול': 'bg-blue-100 text-blue-800',
            'הושלם': 'bg-green-100 text-green-800'
        };
        return colors[status] || colors['פתוח'];
    };

    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">{task.title}</DialogTitle>
                        <div className="flex gap-2">
                            {!editing ? (
                                <>
                                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                                        <Edit className="w-4 h-4 ml-1" />
                                        ערוך
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleDelete} className="text-red-500">
                                        <Trash2 className="w-4 h-4 ml-1" />
                                        מחק
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button size="sm" onClick={handleSave} className="bg-[#67BF91]">
                                        <Save className="w-4 h-4 ml-1" />
                                        שמור
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                                        <X className="w-4 h-4 ml-1" />
                                        ביטול
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="details">פרטים</TabsTrigger>
                        <TabsTrigger value="timer">טיימר</TabsTrigger>
                        <TabsTrigger value="reminders">תזכורות</TabsTrigger>
                        <TabsTrigger value="history">היסטוריה</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">כותרת</label>
                                {editing ? (
                                    <Input
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    />
                                ) : (
                                    <p>{task.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">סטטוס</label>
                                {editing ? (
                                    <Select
                                        value={editForm.status}
                                        onValueChange={(value) => setEditForm({...editForm, status: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="פתוח">פתוח</SelectItem>
                                            <SelectItem value="בטיפול">בטיפול</SelectItem>
                                            <SelectItem value="הושלם">הושלם</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">עדיפות</label>
                                {editing ? (
                                    <Select
                                        value={editForm.priority}
                                        onValueChange={(value) => setEditForm({...editForm, priority: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="נמוכה">נמוכה</SelectItem>
                                            <SelectItem value="בינונית">בינונית</SelectItem>
                                            <SelectItem value="גבוהה">גבוהה</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">דדליין</label>
                                {editing ? (
                                    <Input
                                        type="date"
                                        value={editForm.due_date?.split('T')[0] || ''}
                                        onChange={(e) => setEditForm({...editForm, due_date: e.target.value})}
                                    />
                                ) : (
                                    <p>{task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : 'אין'}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">תיאור</label>
                            {editing ? (
                                <Textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    rows={4}
                                />
                            ) : (
                                <p className="text-gray-600">{task.description || 'אין תיאור'}</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="timer" className="space-y-4">
                        <div className="text-center py-8">
                            {!task.due_date ? (
                                <div className="text-gray-500">
                                    <Clock className="w-16 h-16 mx-auto mb-4" />
                                    <p className="text-lg">לא הוגדר דדליין למשימה</p>
                                    <p className="text-sm mt-2">הוסף תאריך יעד בכרטיסיה "פרטים"</p>
                                </div>
                            ) : (
                                <div>
                                    <Clock className={`w-16 h-16 mx-auto mb-4 ${isOverdue ? 'text-red-500' : 'text-[#3568AE]'}`} />
                                    <div className={`text-5xl font-bold mb-4 ${isOverdue ? 'text-red-500' : ''}`}>
                                        {formatTimeRemaining(timeRemaining)}
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2">
                                        ימים : שעות : דקות : שניות
                                    </div>
                                    {isOverdue ? (
                                        <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
                                            באיחור ⏰
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                                            זמן נותר
                                        </Badge>
                                    )}
                                    <div className="mt-6 text-gray-600">
                                        <p className="text-sm">דדליין: {new Date(task.due_date).toLocaleString('he-IL')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="reminders" className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                הוסף תזכורת
                            </h4>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={newReminder.date}
                                    onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                                />
                                <Input
                                    type="time"
                                    value={newReminder.time}
                                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                                />
                                <Button onClick={addReminder} className="bg-[#67BF91]">הוסף</Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {reminders.map(reminder => (
                                <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        <span>
                                            {new Date(reminder.reminder_date).toLocaleString('he-IL')}
                                        </span>
                                        {reminder.status === 'sent' && (
                                            <Badge className="bg-green-100 text-green-800">נשלחה</Badge>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteReminder(reminder.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            {reminders.length === 0 && (
                                <p className="text-center text-gray-500 py-4">אין תזכורות</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-2">
                        {history.map(entry => (
                            <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{entry.action}</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(entry.created_date).toLocaleString('he-IL')}
                                    </span>
                                </div>
                                {entry.notes && <p className="text-sm text-gray-600">{entry.notes}</p>}
                                <p className="text-xs text-gray-500 mt-1">על ידי: {entry.performed_by}</p>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <p className="text-center text-gray-500 py-4">אין היסטוריה</p>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}