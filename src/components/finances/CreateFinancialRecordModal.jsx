import React, { useState, useEffect } from 'react';
import { Financial } from '@/entities/Financial';
import { Client } from '@/entities/Client';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Upload, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CreateFinancialRecordModal({ onRecordCreated, recordToEdit, trigger, preselectedClientId, preselectedClientName }) {
    const [isOpen, setIsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(false);

    const getInitialState = () => ({
        description: recordToEdit?.description || '',
        amount: recordToEdit?.amount || '',
        type: recordToEdit?.type || 'הכנסה',
        category: recordToEdit?.category || 'שכ"ט',
        date: recordToEdit?.date || format(new Date(), 'yyyy-MM-dd'),
        client_id: recordToEdit?.client_id || preselectedClientId || '',
        client_name: recordToEdit?.client_name || preselectedClientName || '',
        payment_method: recordToEdit?.payment_method || '',
        invoice_issued: recordToEdit?.invoice_issued || false,
        invoice_file_url: recordToEdit?.invoice_file_url || ''
    });
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen && !preselectedClientId) {
            loadClients();
        }
    }, [isOpen]);

    const loadClients = async () => {
        try {
            setLoadingClients(true);
            const user = await base44.auth.me();
            
            // טען רק לקוחות מהמשרד של המשתמש
            let data;
            if (user.role === 'admin') {
                data = await Client.list('full_name');
            } else if (user.sub_account_id) {
                data = await Client.filter({ sub_account_id: user.sub_account_id }, 'full_name');
            } else {
                data = await Client.filter({ created_by: user.email }, 'full_name');
            }
            
            setClients(data);
        } catch (error) {
            console.error("שגיאה בטעינת לקוחות:", error);
        } finally {
            setLoadingClients(false);
        }
    };

    const handleClientChange = (clientId) => {
        if (clientId === 'none') {
            setFormData({ ...formData, client_id: '', client_name: '' });
        } else {
            const selectedClient = clients.find(c => c.id === clientId);
            if (selectedClient) {
                setFormData({ 
                    ...formData, 
                    client_id: clientId, 
                    client_name: selectedClient.full_name 
                });
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            setUploading(true);
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setFormData({ ...formData, invoice_file_url: file_url });
        } catch (error) {
            console.error("שגיאה בהעלאת קובץ:", error);
        } finally {
            setUploading(false);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, recordToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await base44.auth.me();
            
            if (recordToEdit) {
                await Financial.update(recordToEdit.id, {
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
            } else {
                await Financial.create({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    sub_account_id: user?.sub_account_id || null
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
                        <label className="block text-sm font-medium mb-1">שיוך ללקוח (אופציונלי)</label>
                        {preselectedClientId ? (
                            <Input
                                value={formData.client_name}
                                disabled
                                className="bg-gray-100"
                            />
                        ) : (
                            <Select 
                                value={formData.client_id || 'none'} 
                                onValueChange={handleClientChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingClients ? "טוען לקוחות..." : "בחר לקוח"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">ללא שיוך ללקוח</SelectItem>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">שיטת תשלום</label>
                        <Select value={formData.payment_method} onValueChange={(val) => setFormData({ ...formData, payment_method: val })}>
                            <SelectTrigger><SelectValue placeholder="בחר שיטת תשלום" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="מזומן">מזומן</SelectItem>
                                <SelectItem value="העברה בנקאית">העברה בנקאית</SelectItem>
                                <SelectItem value="אשראי">אשראי</SelectItem>
                                <SelectItem value="צ'ק">צ'ק</SelectItem>
                                <SelectItem value="אחר">אחר</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="invoice_issued"
                                checked={formData.invoice_issued}
                                onCheckedChange={(checked) => setFormData({ ...formData, invoice_issued: checked })}
                            />
                            <label htmlFor="invoice_issued" className="text-sm font-medium cursor-pointer">
                                הונפקה חשבונית
                            </label>
                        </div>
                        
                        {formData.invoice_issued && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">העלאת קובץ חשבונית</label>
                                <div className="flex items-center gap-2">
                                    <label className="flex-1">
                                        <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3568AE] transition-colors">
                                            {uploading ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                                            ) : (
                                                <Upload className="w-5 h-5 text-gray-500" />
                                            )}
                                            <span className="text-sm text-gray-600">
                                                {uploading ? 'מעלה...' : 'לחץ להעלאת קובץ'}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                {formData.invoice_file_url && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <FileText className="w-4 h-4" />
                                        <a href={formData.invoice_file_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            צפה בחשבונית
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
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