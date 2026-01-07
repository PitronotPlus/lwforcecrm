import React, { useState, useEffect } from "react";
import { Task } from "@/entities/Task";
import { Client } from "@/entities/Client";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function CreateTaskModal({ 
    client = null, 
    onTaskCreated, 
    triggerText = "משימה חדשה",
    triggerStyle = "button" 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [allClients, setAllClients] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    
    const getInitialFormData = () => ({
        title: '',
        description: '',
        client_id: client ? client.id : '',
        client_name: client ? client.full_name : '',
        assigned_to: '',
        assigned_to_name: '',
        status: 'פתוח',
        priority: 'בינונית',
        task_type: 'אחר',
        due_date: null,
        planned_date: null
    });

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            const user = await base44.auth.me();
            setCurrentUser(user);
            
            if (!client) {
                // טען רק לקוחות מהמשרד של המשתמש
                let clientsData;
                if (user.role === 'admin') {
                    clientsData = await Client.list();
                } else if (user.sub_account_id) {
                    clientsData = await Client.filter({ sub_account_id: user.sub_account_id });
                } else {
                    clientsData = await Client.filter({ created_by: user.email });
                }
                setAllClients(clientsData);
            }
            
            // Load team members from same sub_account
            if (user.sub_account_id) {
                const allUsers = await User.list();
                const sameAccountUsers = allUsers.filter(u => 
                    u.sub_account_id === user.sub_account_id && u.id !== user.id
                );
                setTeamMembers(sameAccountUsers);
            }
        } catch (error) {
            console.error('שגיאה בטעינת נתונים:', error);
        }
    };

    const loadClients = async () => {
        try {
            const data = await Client.list();
            setAllClients(data);
        } catch (error) {
            console.error('שגיאה בטעינת לקוחות:', error);
        }
    };

    const handleClientChange = (selectedClientId) => {
        const selectedClient = allClients.find(c => c.id === selectedClientId);
        setFormData(prev => ({
            ...prev,
            client_id: selectedClientId,
            client_name: selectedClient ? selectedClient.full_name : ''
        }));
    };

    const handleAssigneeChange = (selectedUserId) => {
        const selectedUser = teamMembers.find(u => u.id === selectedUserId);
        setFormData(prev => ({
            ...prev,
            assigned_to: selectedUserId,
            assigned_to_name: selectedUser ? selectedUser.full_name : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const taskData = {
                ...formData,
                sub_account_id: currentUser?.sub_account_id,
                assigned_by: currentUser?.id
            };
            const newTask = await Task.create(taskData);
            onTaskCreated && onTaskCreated(newTask);
            setIsOpen(false);
            setFormData(getInitialFormData()); // Reset form
        } catch (error) {
            console.error('שגיאה ביצירת משימה:', error);
        }
    };

    const renderTrigger = () => {
        if (triggerStyle === "icon") {
            return (
                <div className="w-[55px] h-[55px] rounded-full flex items-center justify-center cursor-pointer" style={{ background: '#67BF91' }}>
                    <Plus className="w-7 h-7 text-white" strokeWidth={3} />
                </div>
            );
        }
        
        return (
            <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white py-2 h-12 px-6 rounded-[15px] text-[18px] font-bold" style={{ background: '#67BF91' }}>
                <Plus className="w-5 h-5 mr-2" />
                {triggerText}
            </Button>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {renderTrigger()}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        {client ? `יצירת משימה חדשה עבור ${client.full_name}` : 'יצירת משימה חדשה'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">כותרת המשימה *</label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="text-right"
                            placeholder="לדוגמה: פולואפ עם לקוח"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">תיאור</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="text-right h-20"
                            placeholder="תיאור המשימה..."
                        />
                    </div>

                    {!client && (
                        <div>
                            <label className="block text-sm font-medium mb-1">שייך ללקוח</label>
                            <Select
                                value={formData.client_id}
                                onValueChange={handleClientChange}
                            >
                                <SelectTrigger><SelectValue placeholder="בחר לקוח (אופציונאלי)" /></SelectTrigger>
                                <SelectContent>
                                    {allClients.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {teamMembers.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-1">הקצה לעובד</label>
                            <Select
                                value={formData.assigned_to}
                                onValueChange={handleAssigneeChange}
                            >
                                <SelectTrigger><SelectValue placeholder="בחר עובד אחראי (אופציונאלי)" /></SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.full_name} {member.user_role === 'department_head' ? '(ראש מחלקה)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">עדיפות</label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({...formData, priority: value})}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="נמוכה">נמוכה</SelectItem>
                                    <SelectItem value="בינונית">בינונית</SelectItem>
                                    <SelectItem value="גבוהה">גבוהה</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">סוג משימה</label>
                            <Select
                                value={formData.task_type}
                                onValueChange={(value) => setFormData({...formData, task_type: value})}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="פולואפ">פולואפ</SelectItem>
                                    <SelectItem value="פגישה">פגישה</SelectItem>
                                    <SelectItem value="מסמכים">מסמכים</SelectItem>
                                    <SelectItem value="מתן הערות">מתן הערות</SelectItem>
                                    <SelectItem value="כתיבת מסמך">כתיבת מסמך</SelectItem>
                                    <SelectItem value="חיפוש משפטי">חיפוש משפטי</SelectItem>
                                    <SelectItem value="אחר">אחר</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">דדליין</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.due_date ? format(new Date(formData.due_date), 'PPP') : 'בחר תאריך'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                                    onSelect={(date) => setFormData({...formData, due_date: date ? format(date, 'yyyy-MM-dd') : null})}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            צור משימה
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}