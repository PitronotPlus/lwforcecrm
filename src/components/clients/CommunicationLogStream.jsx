import { useState, useEffect } from 'react';
import { CommunicationLog } from '@/entities/CommunicationLog';
import { ClientActivityLog } from '@/entities/ClientActivityLog';
import { Appointment } from '@/entities/Appointment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Phone, StickyNote, Activity, Calendar, User } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const iconMap = {
    email: <Mail className="w-4 h-4 text-blue-500" />,
    whatsapp: <MessageSquare className="w-4 h-4 text-green-500" />,
    phone_call: <Phone className="w-4 h-4 text-purple-500" />,
    note: <StickyNote className="w-4 h-4 text-yellow-500" />,
    activity: <Activity className="w-4 h-4 text-orange-500" />,
    appointment: <Calendar className="w-4 h-4 text-indigo-500" />,
};

export default function CommunicationLogStream({ clientId, refreshKey }) {
    const [allLogs, setAllLogs] = useState([]);

    useEffect(() => {
        const fetchAllLogs = async () => {
            if (clientId) {
                try {
                    // טען כל סוגי הלוגים
                    const [communications, activities, appointments] = await Promise.all([
                        CommunicationLog.filter({ client_id: clientId }),
                        ClientActivityLog.filter({ client_id: clientId }),
                        Appointment.filter({ client_id: clientId })
                    ]);

                    // המר לפורמט אחיד
                    const formattedCommunications = communications.map(log => ({
                        id: `comm-${log.id}`,
                        type: log.type,
                        content: log.content,
                        created_date: log.created_date,
                        created_by: log.created_by,
                        source: 'communication'
                    }));

                    const formattedActivities = activities.map(log => ({
                        id: `act-${log.id}`,
                        type: 'activity',
                        content: log.description,
                        activity_type: log.activity_type,
                        created_date: log.created_date,
                        created_by: log.performed_by,
                        source: 'activity'
                    }));

                    const formattedAppointments = appointments.map(apt => ({
                        id: `apt-${apt.id}`,
                        type: 'appointment',
                        content: `פגישה: ${apt.title}`,
                        appointment_date: apt.date,
                        appointment_time: apt.time,
                        created_date: apt.created_date,
                        created_by: apt.created_by,
                        source: 'appointment'
                    }));

                    // איחוד ומיון לפי תאריך יצירה
                    const combined = [...formattedCommunications, ...formattedActivities, ...formattedAppointments]
                        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

                    setAllLogs(combined);
                } catch (error) {
                    console.error("Failed to fetch logs:", error);
                }
            }
        };
        fetchAllLogs();
    }, [clientId, refreshKey]);

    const getActivityColor = (type) => {
        const colors = {
            'נוצר': 'bg-green-100 text-green-800',
            'עודכן': 'bg-blue-100 text-blue-800',
            'שינוי סטטוס': 'bg-purple-100 text-purple-800',
            'משימה נוספה': 'bg-yellow-100 text-yellow-800',
            'אינטרקציה': 'bg-orange-100 text-orange-800',
            'מסמך הועלה': 'bg-pink-100 text-pink-800',
            'מסמך נמחק': 'bg-red-100 text-red-800',
            'תשלום': 'bg-emerald-100 text-emerald-800',
            'פגישה נקבעה': 'bg-indigo-100 text-indigo-800',
            'הודעה נשלחה': 'bg-cyan-100 text-cyan-800',
            'הערה נוספה': 'bg-amber-100 text-amber-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle style={{ fontFamily: 'Heebo' }}>
                    היסטוריית תקשורת ופעילות ({allLogs.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                        {allLogs.length > 0 ? allLogs.map(log => (
                            <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-r-2" style={{
                                borderColor: log.source === 'communication' ? '#3B7CDF' : log.source === 'activity' ? '#F59E0B' : '#6366F1'
                            }}>
                                <div className="mt-1">{iconMap[log.type]}</div>
                                <div className="flex-1">
                                    {log.activity_type && (
                                        <Badge className={`${getActivityColor(log.activity_type)} mb-2`}>
                                            {log.activity_type}
                                        </Badge>
                                    )}
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap" style={{ fontFamily: 'Heebo' }}>
                                        {log.content}
                                    </p>
                                    {log.appointment_date && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            תאריך פגישה: {new Date(log.appointment_date).toLocaleDateString('he-IL')} {log.appointment_time}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span>
                                            {new Date(log.created_date).toLocaleDateString('he-IL', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {log.created_by && (
                                            <>
                                                <span>•</span>
                                                <User className="w-3 h-3" />
                                                <span>{log.created_by}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-8" style={{ fontFamily: 'Heebo' }}>
                                אין עדיין תיעוד תקשורת או פעילות.
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}