import { useState, useEffect } from 'react';
import { SupportTicket } from '@/entities/SupportTicket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

export default function SupportTicketManagement() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await SupportTicket.list('-created_date');
            setTickets(data);
        } catch (error) {
            console.error("Failed to load support tickets:", error);
        }
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const colors = {
            'פתוח': 'bg-blue-100 text-blue-800',
            'בטיפול': 'bg-yellow-100 text-yellow-800',
            'סגור': 'bg-green-100 text-green-800'
        };
        return <Badge className={colors[status] || 'bg-gray-100'}>{status}</Badge>;
    };
    
    // Placeholder for viewing/replying to a ticket
    const handleViewTicket = (ticketId) => {
        alert(`יש להטמיע מודאל או עמוד לצפייה ומענה לקריאה מספר ${ticketId}`);
    };

    if (loading) return <p>טוען פניות...</p>;

    return (
        <div className="bg-white rounded-[20px] p-6">
            <h3 className="text-xl font-medium mb-4">ניהול פניות תמיכה</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">נושא</th>
                            <th className="p-2">משתמש</th>
                            <th className="p-2">קטגוריה</th>
                            <th className="p-2">סטטוס</th>
                            <th className="p-2">תאריך פתיחה</th>
                            <th className="p-2">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{ticket.title}</td>
                                <td className="p-2">{ticket.user_full_name}</td>
                                <td className="p-2">{ticket.category}</td>
                                <td className="p-2">{getStatusBadge(ticket.status)}</td>
                                <td className="p-2">{new Date(ticket.created_date).toLocaleDateString('he-IL')}</td>
                                <td className="p-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleViewTicket(ticket.id)}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}