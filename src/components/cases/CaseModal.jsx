import { useState, useEffect } from "react";
import { Case } from "@/entities/Case";
import { Client } from "@/entities/Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';

export default function CaseModal({ client = null, caseToEdit = null, onCaseSaved, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [allClients, setAllClients] = useState([]);
    
    const isEditing = !!caseToEdit;

    const getInitialFormData = () => {
        if (isEditing) {
            return {
                ...caseToEdit,
                opening_date: caseToEdit.opening_date ? format(new Date(caseToEdit.opening_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            };
        }
        return {
            title: '',
            client_id: client ? client.id : '',
            client_name: client ? client.full_name : '',
            case_number: '',
            status: 'פעיל',
            case_type: 'אזרחי',
            opening_date: format(new Date(), 'yyyy-MM-dd'),
            notes: ''
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen && !client && !isEditing) {
            loadClients();
        }
        setFormData(getInitialFormData());
    }, [isOpen, caseToEdit, client]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await Case.update(caseToEdit.id, formData);
            } else {
                const { base44 } = await import("@/api/base44Client");
                const currentUser = await base44.auth.me();
                const caseData = {
                    ...formData,
                    sub_account_id: currentUser?.sub_account_id || null
                };
                await Case.create(caseData);
            }
            onCaseSaved();
            setIsOpen(false);
        } catch (error) {
            console.error(`שגיאה ${isEditing ? 'בעדכון' : 'ביצירת'} תיק:`, error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        {isEditing ? `עריכת תיק: ${caseToEdit.title}` : (client ? `יצירת תיק חדש עבור ${client.full_name}` : 'יצירת תיק חדש')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {!client && !isEditing && (
                         <div>
                            <label className="block text-sm font-medium mb-1">שייך ללקוח *</label>
                            <Select
                                required
                                value={formData.client_id}
                                onValueChange={handleClientChange}
                            >
                                <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
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
                    <div>
                        <label className="block text-sm font-medium mb-1">כותרת התיק *</label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="text-right"
                            placeholder="לדוגמה: תביעת נזיקין נגד חב' הביטוח"
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">סוג התיק</label>
                            <Select
                                value={formData.case_type}
                                onValueChange={(value) => setFormData({...formData, case_type: value})}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="אזרחי">אזרחי</SelectItem>
                                    <SelectItem value="פלילי">פלילי</SelectItem>
                                    <SelectItem value="מסחרי">מסחרי</SelectItem>
                                    <SelectItem value="משפחה">משפחה</SelectItem>
                                    <SelectItem value='נדל"ן'>נדל"ן</SelectItem>
                                    <SelectItem value="עבודה">עבודה</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">סטטוס</label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({...formData, status: value})}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="פעיל">פעיל</SelectItem>
                                    <SelectItem value="סגור">סגור</SelectItem>
                                    <SelectItem value="בהמתנה">בהמתנה</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">הערות</label>
                        <Textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="text-right"
                            rows={3}
                            placeholder="מידע נוסף על התיק..."
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                           {isEditing ? 'שמור שינויים' : 'יצור תיק'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}