import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Briefcase, Calendar, DollarSign } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ClientServices({ client }) {
    const [services, setServices] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [newServiceType, setNewServiceType] = useState('');
    const [showNewServiceInput, setShowNewServiceInput] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        product_name: '',
        status: 'פתוח',
        bot_status: 'ממתין',
        action_date: '',
        price: '',
        payment_status: 'לא שולם',
        amount_paid: '',
        balance: ''
    });

    useEffect(() => {
        loadServices();
        loadServiceTypes();
    }, [client.id]);

    const loadServices = async () => {
        try {
            const data = await base44.entities.Service.filter({ client_id: client.id }, '-created_date');
            setServices(data);
        } catch (error) {
            console.error("שגיאה בטעינת שירותים:", error);
        }
        setLoading(false);
    };

    const loadServiceTypes = async () => {
        try {
            const settingsData = await base44.entities.ClientSettings.list();
            setServiceTypes(settingsData[0]?.service_type_options || []);
        } catch (error) {
            console.error("שגיאה בטעינת סוגי שירות:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const serviceData = {
                ...formData,
                client_id: client.id,
                client_name: client.full_name
            };

            let service;
            if (editingService) {
                await base44.entities.Service.update(editingService.id, serviceData);
                service = { ...editingService, ...serviceData };
            } else {
                service = await base44.entities.Service.create(serviceData);
            }

            // יצירת רשומה פיננסית אם יש תשלום
            if (formData.payment_status !== 'לא שולם' && formData.price) {
                const amount = formData.payment_status === 'שולם במלואו' 
                    ? parseFloat(formData.price) 
                    : parseFloat(formData.amount_paid || 0);

                if (amount > 0) {
                    await base44.entities.Financial.create({
                        description: `תשלום עבור שירות: ${formData.product_name}`,
                        amount: amount,
                        type: 'הכנסה',
                        category: 'שכ"ט',
                        date: new Date().toISOString().split('T')[0],
                        client_id: client.id,
                        client_name: client.full_name,
                        payment_method: 'העברה בנקאית',
                        invoice_issued: false
                    });
                }
            }

            resetForm();
            loadServices();
        } catch (error) {
            console.error("שגיאה בשמירת שירות:", error);
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            product_id: service.product_id || '',
            product_name: service.product_name || '',
            status: service.status || 'פתוח',
            bot_status: service.bot_status || 'ממתין',
            action_date: service.action_date || '',
            price: service.price || '',
            payment_status: service.payment_status || 'לא שולם',
            amount_paid: service.amount_paid || '',
            balance: service.balance || ''
        });
        setShowForm(true);
    };

    const handleServiceTypeChange = (value) => {
        if (value === '__new__') {
            setShowNewServiceInput(true);
            setFormData({ ...formData, product_id: '', product_name: '' });
        } else {
            setFormData({ ...formData, product_id: value, product_name: value });
        }
    };

    const handleAddNewServiceType = async () => {
        if (!newServiceType.trim()) return;
        try {
            const settingsData = await base44.entities.ClientSettings.list();
            const settings = settingsData[0];
            const updatedServiceTypes = [...(settings?.service_type_options || []), newServiceType.trim()];
            await base44.entities.ClientSettings.update(settings.id, { service_type_options: updatedServiceTypes });
            setServiceTypes(updatedServiceTypes);
            setFormData({ ...formData, product_id: newServiceType.trim(), product_name: newServiceType.trim() });
            setNewServiceType('');
            setShowNewServiceInput(false);
        } catch (error) {
            console.error("שגיאה בהוספת סוג שירות:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            product_id: '',
            product_name: '',
            status: 'פתוח',
            bot_status: 'ממתין',
            action_date: '',
            price: '',
            payment_status: 'לא שולם',
            amount_paid: '',
            balance: ''
        });
        setEditingService(null);
        setShowForm(false);
    };

    const getStatusColor = (status) => {
        const colors = {
            'פתוח': 'bg-blue-100 text-blue-800',
            'בטיפול': 'bg-yellow-100 text-yellow-800',
            'הושלם': 'bg-green-100 text-green-800',
            'בוטל': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            'לא שולם': 'bg-red-100 text-red-800',
            'שולם חלקית': 'bg-yellow-100 text-yellow-800',
            'שולם במלואו': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="text-center py-4">טוען שירותים...</div>;
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Heebo' }}>
                        שירותים ({services.length})
                    </h3>
                    <Button
                        onClick={() => setShowForm(true)}
                        size="sm"
                        className="bg-[#67BF91] hover:bg-[#5AA880]"
                    >
                        <Plus className="ml-2 w-4 h-4" />
                        הוסף שירות
                    </Button>
                </div>

                {services.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>אין שירותים ללקוח זה</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {services.map((service) => (
                            <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-lg">{service.product_name}</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className={getStatusColor(service.status)}>
                                            {service.status}
                                        </Badge>
                                        <Badge className={getPaymentStatusColor(service.payment_status)}>
                                            {service.payment_status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-600">
                                            {service.action_date ? new Date(service.action_date).toLocaleDateString('he-IL') : 'ללא תאריך'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-500" />
                                        <span className="text-[#67BF91] font-medium">₪{service.price || 0}</span>
                                    </div>
                                </div>

                                {service.payment_status === 'שולם חלקית' && service.amount_paid && (
                                    <div className="text-sm text-gray-600 mb-3">
                                        שולם: ₪{service.amount_paid} | יתרה: ₪{service.balance}
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(service)}
                                    className="text-[#3568AE]"
                                >
                                    <Edit className="w-4 h-4 ml-1" />
                                    ערוך
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle style={{ fontFamily: 'Heebo' }}>
                                {editingService ? 'עריכת שירות' : 'שירות חדש'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">סוג שירות *</label>
                                {showNewServiceInput ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={newServiceType}
                                            onChange={(e) => setNewServiceType(e.target.value)}
                                            placeholder="הקלד סוג שירות חדש"
                                        />
                                        <Button type="button" onClick={handleAddNewServiceType} size="sm">הוסף</Button>
                                        <Button type="button" onClick={() => { setShowNewServiceInput(false); setNewServiceType(''); }} size="sm" variant="outline">ביטול</Button>
                                    </div>
                                ) : (
                                    <Select value={formData.product_id} onValueChange={handleServiceTypeChange} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="בחר סוג שירות" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceTypes.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                            <SelectItem value="__new__" className="text-[#67BF91] font-medium">
                                                + הוסף סוג שירות חדש
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">סטטוס</label>
                                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="פתוח">פתוח</SelectItem>
                                            <SelectItem value="בטיפול">בטיפול</SelectItem>
                                            <SelectItem value="הושלם">הושלם</SelectItem>
                                            <SelectItem value="בוטל">בוטל</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">תאריך פעולה</label>
                                    <Input
                                        type="date"
                                        value={formData.action_date}
                                        onChange={(e) => setFormData({ ...formData, action_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">מחיר</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">סטטוס תשלום</label>
                                <Select value={formData.payment_status} onValueChange={(val) => setFormData({ ...formData, payment_status: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="לא שולם">לא שולם</SelectItem>
                                        <SelectItem value="שולם חלקית">שולם חלקית</SelectItem>
                                        <SelectItem value="שולם במלואו">שולם במלואו</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.payment_status === 'שולם חלקית' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">סכום ששולם</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.amount_paid}
                                            onChange={(e) => {
                                                const paid = parseFloat(e.target.value) || 0;
                                                const total = parseFloat(formData.price) || 0;
                                                setFormData({ 
                                                    ...formData, 
                                                    amount_paid: e.target.value,
                                                    balance: total - paid
                                                });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">יתרה לתשלום</label>
                                        <Input
                                            type="number"
                                            value={formData.balance}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880]">
                                    {editingService ? 'עדכן' : 'צור'} שירות
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    ביטול
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}