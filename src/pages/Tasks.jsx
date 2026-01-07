import React, { useState, useEffect } from "react";
import { Task } from "@/entities/Task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, List, LayoutGrid, Filter, ChevronLeft, ChevronRight, ChevronDown, ExternalLink, Eye, Edit, Trash2 } from 'lucide-react';
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import TaskTimeRemaining from "../components/tasks/TaskTimeRemaining";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState('רשימה');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('created');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const { base44 } = await import('@/api/base44Client');
            const user = await base44.auth.me();
            
            // Admin רואה הכל, אחרים רואים רק מהמשרד שלהם
            let data;
            if (user.role === 'admin') {
                data = await Task.list('-created_date');
            } else if (user.sub_account_id) {
                data = await Task.filter({ sub_account_id: user.sub_account_id }, '-created_date');
            } else {
                // עצמאי - רואה רק משימות שיוצרו על ידו
                data = await Task.filter({ created_by: user.email }, '-created_date');
            }
            
            setTasks(data);
        } catch (error) {
            console.error('שגיאה בטעינת משימות:', error);
        }
    };

    const handleTaskUpdate = async (taskId, updates) => {
        try {
            await Task.update(taskId, updates);
            loadTasks();
        } catch (error) {
            console.error('שגיאה בעדכון משימה:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
            try {
                await Task.delete(taskId);
                loadTasks();
            } catch (error) {
                console.error('שגיאה במחיקת משימה:', error);
            }
        }
    };

    const openTaskDetail = (task) => {
        setSelectedTask(task);
        setShowDetailModal(true);
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

    let filteredTasks = tasks.filter(task => 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterStatus !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
    }

    // Sort tasks
    filteredTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'priority_high':
                const priorityOrder = { 'גבוהה': 3, 'בינונית': 2, 'נמוכה': 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            case 'priority_low':
                const priorityOrderLow = { 'גבוהה': 3, 'בינונית': 2, 'נמוכה': 1 };
                return (priorityOrderLow[a.priority] || 0) - (priorityOrderLow[b.priority] || 0);
            case 'time_urgent':
                // Tasks without due date go to the end
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            case 'time_later':
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(b.due_date) - new Date(a.due_date);
            case 'created':
            default:
                return new Date(b.created_date) - new Date(a.created_date);
        }
    });

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    const TaskCard = ({ task }) => (
        <div className="bg-white border border-[#D9D9D9] rounded-[15px] p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                    <input 
                        type="checkbox" 
                        className="w-[18px] h-[18px] border border-[#858C94] rounded bg-white"
                        checked={task.completed || task.status === 'הושלם'}
                        onChange={(e) => handleTaskUpdate(task.id, { 
                            completed: e.target.checked,
                            status: e.target.checked ? 'הושלם' : 'פתוח'
                        })}
                    />
                </div>
                <div className="flex gap-2">
                    <Badge className={getStatusColor(task.status)}>
                        {task.status}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                    </Badge>
                </div>
            </div>
            
            <div className="text-right cursor-pointer" onClick={() => openTaskDetail(task)}>
                <div className="font-medium mb-2">{task.title}</div>
                {task.description && (
                    <div className="text-sm text-gray-500 mb-2">{task.description}</div>
                )}
                {task.due_date && (
                    <div className="mt-2">
                        <TaskTimeRemaining dueDate={task.due_date} compact />
                    </div>
                )}
                {task.client_id && (
                    <div className="mt-2">
                        <Link 
                            to={`${createPageUrl('ClientDetails')}?id=${task.client_id}`}
                            className="text-[#3B7CDF] cursor-pointer hover:underline flex items-center gap-1 justify-end"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {task.client_name}
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                )}
            </div>
            
            <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openTaskDetail(task); }}>
                    <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-full md:max-w-[1344px] mx-auto">
                
                {/* Desktop Top Controls */}
                <div className="hidden md:flex items-center justify-between mb-8">
                    {/* Right side - View Options */}
                    <div className="flex items-center gap-4">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="סנן לפי סטטוס" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">כל המשימות</SelectItem>
                                <SelectItem value="פתוח">פתוח</SelectItem>
                                <SelectItem value="בטיפול">בטיפול</SelectItem>
                                <SelectItem value="הושלם">הושלם</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="מיין לפי" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created">תאריך יצירה</SelectItem>
                                <SelectItem value="priority_high">עדיפות: גבוהה לנמוכה</SelectItem>
                                <SelectItem value="priority_low">עדיפות: נמוכה לגבוהה</SelectItem>
                                <SelectItem value="time_urgent">הכי דחוף (זמן נותר)</SelectItem>
                                <SelectItem value="time_later">פחות דחוף (זמן נותר)</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="bg-white rounded-[15px] px-6 py-4 flex items-center gap-6">
                            <button 
                                className={`text-[16px] cursor-pointer ${currentView === 'רשימה' ? 'font-bold text-[#3568AE]' : 'text-[#858C94]'}`}
                                style={{ fontFamily: 'Heebo' }}
                                onClick={() => setCurrentView('רשימה')}
                            >
                                רשימה
                            </button>
                            <button 
                                className={`text-[16px] cursor-pointer ${currentView === 'לוח' ? 'font-bold text-[#3568AE]' : 'text-[#858C94]'}`}
                                style={{ fontFamily: 'Heebo' }}
                                onClick={() => setCurrentView('לוח')}
                            >
                                לוח
                            </button>
                            <button 
                                className={`text-[16px] cursor-pointer ${currentView === 'כרטיסיה' ? 'font-bold text-[#3568AE]' : 'text-[#858C94]'}`}
                                style={{ fontFamily: 'Heebo' }}
                                onClick={() => setCurrentView('כרטיסיה')}
                            >
                                כרטיסיה
                            </button>
                        </div>
                    </div>

                    {/* Center - Search */}
                    <div className="flex-1 max-w-[470px] mx-8">
                        <div className="relative">
                            <Input
                                placeholder="חיפוש לפי שם/ נושא/ סטטוס"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-[43px] pr-12 pl-4 border border-[#484848] rounded-[15px] text-right text-[16px]"
                                style={{ fontFamily: 'Heebo', color: '#858C94' }}
                            />
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#3568AE]" />
                        </div>
                    </div>

                    {/* Left side - Controls */}
                    <div className="flex items-center gap-4">
                        <CreateTaskModal onTaskCreated={() => loadTasks()} />
                    </div>
                </div>

                {/* Mobile Top Controls */}
                <div className="md:hidden space-y-3 mb-4">
                    <div className="flex items-center justify-between gap-2">
                        <CreateTaskModal onTaskCreated={() => loadTasks()} />
                        <div className="flex items-center gap-2 flex-1">
                            <Select value={currentView} onValueChange={setCurrentView}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="רשימה">רשימה</SelectItem>
                                    <SelectItem value="כרטיסיה">כרטיסיה</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <Input
                            placeholder="חיפוש משימה..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="סטטוס" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">הכל</SelectItem>
                                <SelectItem value="פתוח">פתוח</SelectItem>
                                <SelectItem value="בטיפול">בטיפול</SelectItem>
                                <SelectItem value="הושלם">הושלם</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="מיין" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created">תאריך</SelectItem>
                                <SelectItem value="priority_high">עדיפות ↓</SelectItem>
                                <SelectItem value="priority_low">עדיפות ↑</SelectItem>
                                <SelectItem value="time_urgent">דחוף</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="hidden md:flex items-center justify-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronRight className="w-6 h-6 text-[#484848] cursor-pointer" />
                            </Button>
                             <Select onValueChange={(value) => setItemsPerPage(Number(value))} defaultValue={String(itemsPerPage)}>
                                <SelectTrigger className="w-[80px] text-right border-[#484848] rounded-[15px] h-10">
                                    <SelectValue placeholder={itemsPerPage} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                <ChevronLeft className="w-6 h-6 text-[#484848] cursor-pointer" />
                            </Button>
                        </div>
                        <span className="text-[18px] text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                           מציג {paginatedTasks.length} מתוך {filteredTasks.length}
                        </span>
                         <span className="text-[18px] text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                            עמוד {currentPage} מתוך {totalPages}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mt-6">
                    {currentView === 'לוח' ? (
                        /* Board View - Hidden on mobile */
                        <div className="hidden md:grid grid-cols-3 gap-6">
                            {['פתוח', 'בטיפול', 'הושלם'].map(status => {
                                const statusTasks = paginatedTasks.filter(task => task.status === status);
                                return (
                                    <div key={status} className="bg-white/50 rounded-[15px] p-4">
                                        <h3 className="text-lg font-medium mb-4 text-right" style={{ fontFamily: 'Heebo' }}>
                                            {status} ({filteredTasks.filter(t => t.status === status).length})
                                        </h3>
                                        <div className="space-y-3">
                                            {statusTasks.map(task => (
                                                <TaskCard key={task.id} task={task} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : currentView === 'כרטיסיה' ? (
                        /* Card View */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {paginatedTasks.map(task => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    ) : (
                        /* List View (Table) */
                        <div className="space-y-2">
                            {/* Table Header - Desktop only */}
                            <div className="hidden md:block bg-white rounded-[15px] p-6 mb-2">
                                <div className="grid grid-cols-9 gap-4 items-center text-[16px] font-bold text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                                    <div className="text-right">בוצע</div>
                                    <div className="text-right col-span-2">נושא</div>
                                    <div className="text-right">סטטוס</div>
                                    <div className="text-right">עדיפות</div>
                                    <div className="text-right">דדליין</div>
                                    <div className="text-right">זמן נותר</div>
                                    <div className="text-right">שיוך ל</div>
                                    <div className="text-right">פעולות</div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-[#D9D9D9] mb-4"></div>

                            {/* Task Rows */}
                            {paginatedTasks.map((task) => (
                                <div key={task.id} className="bg-white rounded-[15px] p-3 md:p-6 hover:shadow-md transition-shadow">
                                    {/* Desktop Table Row */}
                                    <div className="hidden md:grid grid-cols-9 gap-4 items-center text-[16px] text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                                        {/* Checkbox */}
                                        <div className="text-right">
                                            <input 
                                                type="checkbox" 
                                                className="w-[18px] h-[18px] border border-[#858C94] rounded bg-white"
                                                checked={task.completed || task.status === 'הושלם'}
                                                onChange={(e) => handleTaskUpdate(task.id, { 
                                                    completed: e.target.checked,
                                                    status: e.target.checked ? 'הושלם' : 'פתוח'
                                                })}
                                            />
                                        </div>
                                        
                                        {/* Subject */}
                                        <div className="text-right col-span-2">
                                            <div className="font-medium">{task.title}</div>
                                            {task.description && (
                                                <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                                            )}
                                        </div>
                                        
                                        {/* Status */}
                                        <div className="text-right">
                                            <Badge className={getStatusColor(task.status)}>
                                                {task.status}
                                            </Badge>
                                        </div>
                                        
                                        {/* Priority */}
                                        <div className="text-right">
                                            <Badge className={getPriorityColor(task.priority)}>
                                                {task.priority}
                                            </Badge>
                                        </div>
                                        
                                        {/* Due Date */}
                                        <div className="text-right">
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : '-'}
                                        </div>
                                        
                                        {/* Time Remaining */}
                                        <div className="text-right">
                                            {task.due_date ? (
                                                <TaskTimeRemaining dueDate={task.due_date} compact />
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                        
                                        {/* Assigned To */}
                                        <div className="text-right">
                                            {task.client_id ? (
                                                <Link 
                                                    to={`${createPageUrl('ClientDetails')}?id=${task.client_id}`}
                                                    className="text-[#3B7CDF] cursor-pointer hover:underline flex items-center gap-1"
                                                >
                                                    {task.client_name}
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            ) : (
                                                <span className="text-gray-500">משימה עצמאית</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="text-right">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => openTaskDetail(task)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Card Layout */}
                                    <div className="md:hidden">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5"
                                                    checked={task.completed || task.status === 'הושלם'}
                                                    onChange={(e) => handleTaskUpdate(task.id, { 
                                                        completed: e.target.checked,
                                                        status: e.target.checked ? 'הושלם' : 'פתוח'
                                                    })}
                                                />
                                                <div onClick={() => openTaskDetail(task)} className="flex-1">
                                                    <div className="font-medium text-base">{task.title}</div>
                                                    {task.description && (
                                                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                        </div>
                                        
                                        {task.due_date && (
                                            <div className="mb-2">
                                                <TaskTimeRemaining dueDate={task.due_date} compact />
                                            </div>
                                        )}
                                        
                                        {task.client_id && (
                                            <Link 
                                                to={`${createPageUrl('ClientDetails')}?id=${task.client_id}`}
                                                className="text-sm text-[#3B7CDF] flex items-center gap-1"
                                            >
                                                {task.client_name}
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredTasks.length === 0 && (
                        <div className="text-center py-12">
                            <p 
                                className="text-[18px] mb-4"
                                style={{ 
                                    color: '#858C94',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                אין משימות להצגה
                            </p>
                            <CreateTaskModal 
                                onTaskCreated={() => loadTasks()} 
                                triggerText="צור משימה ראשונה"
                            />
                        </div>
                    )}
                </div>

                <TaskDetailModal
                    task={selectedTask}
                    open={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedTask(null);
                    }}
                    onUpdate={loadTasks}
                    onDelete={loadTasks}
                />
            </div>
        </div>
    );
}