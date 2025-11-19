import { useState, useEffect } from 'react';
import { CommunicationLog } from '@/entities/CommunicationLog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Phone, StickyNote } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const iconMap = {
    email: <Mail className="w-4 h-4 text-blue-500" />,
    whatsapp: <MessageSquare className="w-4 h-4 text-green-500" />,
    phone_call: <Phone className="w-4 h-4 text-purple-500" />,
    note: <StickyNote className="w-4 h-4 text-yellow-500" />,
};

export default function CommunicationLogStream({ clientId, refreshKey }) {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (clientId) {
                try {
                    const data = await CommunicationLog.filter({ client_id: clientId }, '-created_date');
                    setLogs(data);
                } catch (error) {
                    console.error("Failed to fetch communication logs:", error);
                }
            }
        };
        fetchLogs();
    }, [clientId, refreshKey]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle style={{ fontFamily: 'Heebo' }}>היסטוריית תקשורת</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                        {logs.length > 0 ? logs.map(log => (
                            <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="mt-1">{iconMap[log.type]}</div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap" style={{ fontFamily: 'Heebo' }}>{log.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(log.created_date).toLocaleString('he-IL')}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-8" style={{ fontFamily: 'Heebo' }}>אין עדיין תיעוד תקשורת.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}