import React, { useState } from 'react';
import { Financial } from '@/entities/Financial';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function CreateFinancialRecordModal({ onRecordCreated, recordToEdit, trigger }) {
    const [isOpen, setIsOpen] = useState(false);
    const getInitialState = () => ({
        description: recordToEdit?.description || '',
        amount: recordToEdit?.amount || '',
        type: recordToEdit?.type || 'הכנסה',
        category: recordToEdit?.category || 'שכ"ט',
        date: recordToEdit?.date || format(new Date(), 'yyyy-MM-dd'),
        client_name: recordToEdit?.client_name || ''
    });
    const [formData, setFormData] = useState(getInitialState());

    React.useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, recordToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (recordToEdit) {
                await Financial.update(recordToEdit.id, {
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
            } else {
                await Financial.create({
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
            }
            onRecordCreated();
            setIsOpen(false);
            setFormData(getInitialState());
        } catch (error) {
            console.error("שגיאה בשמירת רישום כספי:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף רישום
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        {recordToEdit ? 'עריכת רישום כספי' : 'הוספת רישום כספי חדש'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">תיאור *</label>
                        <Input
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">סכום *</label>
                            <Input
                                required
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">תאריך *</label>
                            <Input
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">סוג *</label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="הכנסה">הכנסה</SelectItem>
                                    <SelectItem value="הוצאה">הוצאה</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">קטגוריה *</label>
                            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='שכ"ט'>שכ"ט</SelectItem>
                                    <SelectItem value="סושיאל">סושיאל</SelectItem>
                                    <SelectItem value="פה לאוזן">פה לאוזן</SelectItem>
                                    <SelectItem value="פרסום">פרסום</SelectItem>
                                    <SelectItem value="משרדיות">משרדיות</SelectItem>
                                    <SelectItem value="אחר">אחר</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">שם לקוח (אופציונלי)</label>
                        <Input
                            value={formData.client_name}
                            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>ביטול</Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880]">
                            {recordToEdit ? 'עדכן רישום' : 'שמור רישום'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}