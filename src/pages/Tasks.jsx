import { useState, useEffect } from "react";
import { Task } from "@/entities/Task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState('רשימה');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        const data = await Task.list('-created_date');
        setTasks(data);
    };

    const handleTaskUpdate = async (taskId, updates) => {
        try {
            await Task.update(taskId, updates);
            loadTasks();
        } catch (error) {
            console.error('שגיאה בעדכון משימה:', error);
        }
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

    const filteredTasks = tasks.filter(task => 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            
            <div className="text-right">
                <div className="font-medium mb-2">{task.title}</div>
                {task.description && (
                    <div className="text-sm text-gray-500 mb-2">{task.description}</div>
                )}
                <div className="text-sm text-gray-600">
                    {task.due_date && (
                        <span>דדליין: {new Date(task.due_date).toLocaleDateString('he-IL')}</span>
                    )}
                </div>
                {task.client_id && (
                    <div className="mt-2">
                        <Link 
                            to={`${createPageUrl('ClientDetails')}?id=${task.client_id}`}
                            className="text-[#3B7CDF] cursor-pointer hover:underline flex items-center gap-1 justify-end"
                        >
                            {task.client_name}
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-[1344px] mx-auto">
                
                {/* Top Controls */}
                <div className="flex items-center justify-between mb-8">
                    {/* Right side - View Options */}
                    <div className="flex items-center gap-4">
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

                {/* Pagination Controls */}
                <div className="flex items-center justify-start mb-6">
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
                        /* Board View */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedTasks.map(task => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    ) : (
                        /* List View (Table) */
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="bg-white rounded-[15px] p-6 mb-2">
                                <div className="grid grid-cols-7 gap-4 items-center text-[16px] font-bold text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                                    <div className="text-right">בוצע</div>
                                    <div className="text-right col-span-2">נושא</div>
                                    <div className="text-right">סטטוס</div>
                                    <div className="text-right">עדיפות</div>
                                    <div className="text-right">דדליין</div>
                                    <div className="text-right">שיוך ל</div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-[#D9D9D9] mb-4"></div>

                            {/* Task Rows */}
                            {paginatedTasks.map((task) => (
                                <div key={task.id} className="bg-white rounded-[15px] p-6">
                                    <div className="grid grid-cols-7 gap-4 items-center text-[16px] text-[#484848]" style={{ fontFamily: 'Heebo' }}>
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
            </div>
        </div>
    );
}