
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Task } from '@/entities/Task';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function StatsCards({ tasks = [], cases = [], onTaskUpdate }) {
    // Applying the (variable || []) pattern as requested in the outline,
    // though the default prop values already ensure they are arrays.
    const openTasks = (tasks || []).filter(task => task.status !== 'הושלם');
    const activeCases = (cases || []).filter(caseItem => caseItem.status === 'פעיל');

    const handleTaskComplete = async (taskId, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await Task.update(taskId, { status: 'הושלם', completed: true });
            onTaskUpdate && onTaskUpdate();
        } catch (error) {
            console.error('שגיאה בעדכון משימה:', error);
        }
    };

    const statsData = [
        { name: 'משימות פתוחות', value: openTasks.length },
        { name: 'תיקים פעילים', value: activeCases.length },
    ];
    const COLORS = ['#3568AE', '#67BF91'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Tasks and Cases Section */}
            <div className="dashboard-card p-8">
                <div className="grid grid-cols-2 gap-8 h-full relative">
                    {/* Open Tasks */}
                    <div>
                        <div className="flex justify-center items-center gap-4 mb-6">
                            <Link 
                                to={createPageUrl('Tasks')}
                                className="text-[22px] font-medium leading-[32px] text-center hover:text-[#3568AE] cursor-pointer transition-colors"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                משימות פתוחות
                            </Link>
                            <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">
                                {openTasks.length}
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {openTasks.slice(0, 6).map((task) => (
                                <div key={task.id} className="flex items-start gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <button
                                        onClick={(e) => handleTaskComplete(task.id, e)}
                                        className="w-[18px] h-[18px] border border-[#B8B5B5] rounded bg-white mt-1 flex-shrink-0 hover:border-green-500 hover:bg-green-50 transition-colors"
                                        title="סמן כהושלם"
                                    />
                                    <Link 
                                        to={createPageUrl('Tasks')}
                                        className="text-[16px] leading-[24px] text-right hover:text-[#3568AE] cursor-pointer transition-colors flex-1"
                                        style={{ 
                                            color: '#484848',
                                            fontFamily: 'Heebo'
                                        }}
                                    >
                                        {task.title}
                                        {task.client_name && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                לקוח: {task.client_name}
                                            </div>
                                        )}
                                    </Link>
                                    <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                </div>
                            ))}
                            {openTasks.length === 0 && (
                                <p className="text-center text-gray-500 py-4">אין משימות פתוחות</p>
                            )}
                            {openTasks.length > 6 && (
                                <div className="text-center pt-2">
                                    <Link 
                                        to={createPageUrl('Tasks')}
                                        className="text-[#3568AE] text-sm hover:underline"
                                    >
                                        צפה בכל המשימות ({openTasks.length})
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Cases */}
                    <div>
                        <div className="flex justify-center items-center gap-4 mb-6">
                            <Link 
                                to={createPageUrl('Cases')}
                                className="text-[22px] font-medium leading-[32px] text-center hover:text-[#3568AE] cursor-pointer transition-colors"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                תיקים פעילים
                            </Link>
                            <div className="bg-green-100 text-green-800 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">
                                {activeCases.length}
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {activeCases.slice(0, 6).map((caseItem) => (
                                <div key={caseItem.id} className="group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <Link 
                                        to={createPageUrl('Cases')}
                                        className="block text-[16px] leading-[24px] text-right hover:text-[#3568AE] cursor-pointer transition-colors"
                                        style={{ 
                                            color: '#484848',
                                            fontFamily: 'Heebo'
                                        }}
                                    >
                                        {caseItem.title}
                                        {caseItem.client_name && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                לקוח: {caseItem.client_name}
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            ))}
                            {activeCases.length === 0 && (
                                <p className="text-center text-gray-500 py-4">אין תיקים פעילים</p>
                            )}
                            {activeCases.length > 6 && (
                                <div className="text-center pt-2">
                                    <Link 
                                        to={createPageUrl('Cases')}
                                        className="text-[#3568AE] text-sm hover:underline"
                                    >
                                        צפה בכל התיקים ({activeCases.length})
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Vertical Divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D9D9D9] transform -translate-x-1/2"></div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="dashboard-card p-8 flex flex-col justify-center items-center">
                <h3 
                    className="text-[22px] font-medium leading-[32px] text-center mb-4"
                    style={{ 
                        color: '#484848',
                        fontFamily: 'Heebo'
                    }}
                >
                    סטטיסטיקות
                </h3>
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={statsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ value }) => value} // Only show the value for the label on the slice
                        >
                            {statsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend wrapperStyle={{ direction: 'rtl', fontFamily: 'Heebo' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
