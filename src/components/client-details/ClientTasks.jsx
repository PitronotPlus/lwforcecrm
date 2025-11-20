import React, { useState, useEffect } from "react";
import { Task } from "@/entities/Task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import CreateTaskModal from "../tasks/CreateTaskModal";

export default function ClientTasks({ client }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, [client.id]);

    const loadTasks = async () => {
        try {
            const data = await Task.filter({ client_id: client.id });
            setTasks(data);
        } catch (error) {
            console.error("שגיאה בטעינת משימות:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskUpdate = async (taskId, updates) => {
        try {
            await Task.update(taskId, updates);
            loadTasks();
        } catch (error) {
            console.error("שגיאה בעדכון משימה:", error);
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ fontFamily: 'Heebo' }}>משימות ({tasks.length})</CardTitle>
                <CreateTaskModal client={client} onTaskCreated={loadTasks}>
                    <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                        <Plus className="ml-2 w-4 h-4" />
                        הוסף משימה
                    </Button>
                </CreateTaskModal>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>טוען משימות...</p>
                ) : tasks.length > 0 ? (
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <div key={task.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <button
                                    onClick={() => handleTaskUpdate(task.id, { 
                                        completed: !task.completed,
                                        status: task.completed ? 'פתוח' : 'הושלם'
                                    })}
                                    className="mt-1"
                                >
                                    {task.completed || task.status === 'הושלם' ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                                <div className="flex-1">
                                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                        {task.title}
                                    </p>
                                    {task.description && (
                                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                        {task.due_date && (
                                            <span className="text-sm text-gray-500">
                                                דדליין: {new Date(task.due_date).toLocaleDateString('he-IL')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">אין משימות עבור לקוח זה</p>
                        <CreateTaskModal client={client} onTaskCreated={loadTasks}>
                            <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                <Plus className="ml-2 w-4 h-4" />
                                צור משימה ראשונה
                            </Button>
                        </CreateTaskModal>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}