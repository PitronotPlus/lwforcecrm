
import { useState, useEffect } from 'react';
import { SupportTicket } from '@/entities/SupportTicket';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, LifeBuoy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        category: 'שאלה על המערכת'
    });

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const user = await User.me();
            const data = await SupportTicket.filter({ created_by: user.email }, '-created_date');
            setTickets(data);
        } catch (error) {
            console.error("Failed to load support tickets:", error);
        }
        setLoading(false);
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const user = await User.me();
            await SupportTicket.create({
                ...newTicket,
                user_full_name: user.full_name
            });
            setIsFormOpen(false);
            setNewTicket({ title: '', description: '', category: 'שאלה על המערכת' });
            loadTickets();
        } catch (error) {
            console.error("Failed to create ticket:", error);
        }
    };
    
    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <LifeBuoy className="w-8 h-8 text-[#3568AE]" />
                        <h1 className="text-3xl font-bold text-[#3568AE]">מרכז התמיכה</h1>
                    </div>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#67BF91] hover:bg-[#5AA880]">
                                <Plus className="ml-2 w-4 h-4" /> פתיחת פנייה חדשה
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>יצירת פניית תמיכה</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateTicket} className="space-y-4 pt-4">
                                <div>
                                    <label>נושא</label>
                                    <Input value={newTicket.title} onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} required />
                                </div>
                                <div>
                                    <label>קטגוריה</label>
                                     <Select value={newTicket.category} onValueChange={(val) => setNewTicket({...newTicket, category: val})}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="תקלה טכנית">תקלה טכנית</SelectItem>
                                            <SelectItem value="שאלה על המערכת">שאלה על המערכת</SelectItem>
                                            <SelectItem value="הצעת ייעול">הצעת ייעול</SelectItem>
                                            <SelectItem value="חיובים ותשלומים">חיובים ותשלומים</SelectItem>
                                            <SelectItem value="אחר">אחר</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label>תיאור</label>
                                    <Textarea value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} required />
                                </div>
                                <Button type="submit">שלח פנייה</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Placeholder for ticket list */}
                    {loading ? <p>טוען...</p> : tickets.map(ticket => (
                        <div key={ticket.id} className="p-4 border-b last:border-b-0 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{ticket.title}</p>
                                <p className="text-sm text-gray-500">{ticket.category} - נפתח ב: {new Date(ticket.created_date).toLocaleDateString('he-IL')}</p>
                            </div>
                            <Badge>{ticket.status}</Badge>
                        </div>
                    ))}
                    {!loading && tickets.length === 0 && <p className="p-4 text-center text-gray-500">לא נמצאו פניות תמיכה.</p>}
                </div>
            </div>
        </div>
    );
}
