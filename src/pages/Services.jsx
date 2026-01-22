import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Upload, FileText, Briefcase } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Services() {
    const [services, setServices] = useState([]);
    const [clients, setClients] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newServiceType, setNewServiceType] = useState('');
    const [showNewServiceInput, setShowNewServiceInput] = useState(false);
    const [formData, setFormData] = useState({
        client_id: '',
        client_name: '',
        product_id: '',
        product_name: '',
        status: 'פתוח',
        bot_status: 'ממתין',
        action_date: '',
        price: '',
        payment_status: 'לא שולם',
        amount_paid: '',
        balance: '',
        attachments: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [servicesData, clientsData, settingsData] = await Promise.all([
                base44.entities.Service.list('-created_date'),
                base44.entities.Client.list('full_name'),
                base44.entities.ClientSettings.list()
            ]);
            setServices(servicesData);
            setClients(clientsData);
            setServiceTypes(settingsData[0]?.service_type_options || []);
        } catch (error) {
            console.error("שגיאה בטעינת נתונים:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await base44.auth.me();
            const serviceData = {
                ...formData,
                price: formData.price ? parseFloat(formData.price) : null,
                amount_paid: formData.amount_paid ? parseFloat(formData.amount_paid) : null,
                balance: formData.balance ? parseFloat(formData.balance) : null,
                sub_account_id: user?.sub_account_id || null
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
                        client_id: formData.client_id,
                        client_name: formData.client_name,
                        payment_method: 'העברה בנקאית',
                        invoice_issued: false,
                        sub_account_id: user?.sub_account_id || null
                    });
                }
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error("שגיאה בשמירת שירות:", error);
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            client_id: service.client_id || '',
            client_name: service.client_name || '',
            product_id: service.product_id || '',
            product_name: service.product_name || '',
            status: service.status || 'פתוח',
            bot_status: service.bot_status || 'ממתין',
            action_date: service.action_date || '',
            price: service.price || '',
            payment_status: service.payment_status || 'לא שולם',
            amount_paid: service.amount_paid || '',
            balance: service.balance || '',
            attachments: service.attachments || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('האם למחוק שירות זה?')) {
            try {
                await base44.entities.Service.delete(id);
                loadData();
            } catch (error) {
                console.error("שגיאה במחיקת שירות:", error);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await base44.integrations.Core.UploadFile({ file });
            const newAttachments = [...(formData.attachments || []), result.file_url];
            setFormData({ ...formData, attachments: newAttachments });
        } catch (error) {
            console.error("שגיאה בהעלאת קובץ:", error);
            alert("שגיאה בהעלאת הקובץ");
        }
        setUploading(false);
    };

    const removeAttachment = (index) => {
        const newAttachments = formData.attachments.filter((_, i) => i !== index);
        setFormData({ ...formData, attachments: newAttachments });
    };

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        setFormData({
            ...formData,
            client_id: clientId,
            client_name: client?.full_name || ''
        });
    };

    const handleServiceTypeChange = (value) => {
        if (value === '__new__') {
            setShowNewServiceInput(true);
            setFormData({
                ...formData,
                product_id: '',
                product_name: ''
            });
        } else {
            setFormData({
                ...formData,
                product_id: value,
                product_name: value
            });
        }
    };

    const handleAddNewServiceType = async () => {
        if (!newServiceType.trim()) return;
        
        try {
            const settingsData = await base44.entities.ClientSettings.list();
            const settings = settingsData[0];
            const updatedServiceTypes = [...(settings?.service_type_options || []), newServiceType.trim()];
            
            await base44.entities.ClientSettings.update(settings.id, {
                service_type_options: updatedServiceTypes
            });
            
            setServiceTypes(updatedServiceTypes);
            setFormData({
                ...formData,
                product_id: newServiceType.trim(),
                product_name: newServiceType.trim()
            });
            setNewServiceType('');
            setShowNewServiceInput(false);
        } catch (error) {
            console.error("שגיאה בהוספת סוג שירות:", error);
        }
    };

    const handleRemoveServiceType = async (typeToRemove) => {
        if (!confirm(`האם למחוק את סוג השירות "${typeToRemove}"?`)) return;
        
        try {
            const settingsData = await base44.entities.ClientSettings.list();
            const settings = settingsData[0];
            const updatedServiceTypes = (settings?.service_type_options || []).filter(t => t !== typeToRemove);
            
            await base44.entities.ClientSettings.update(settings.id, {
                service_type_options: updatedServiceTypes
            });
            
            setServiceTypes(updatedServiceTypes);
        } catch (error) {
            console.error("שגיאה במחיקת סוג שירות:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            client_id: '',
            client_name: '',
            product_id: '',
            product_name: '',
            status: 'פתוח',
            bot_status: 'ממתין',
            action_date: '',
            price: '',
            payment_status: 'לא שולם',
            amount_paid: '',
            balance: '',
            attachments: []
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

    const filteredServices = services.filter(service =>
        service.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F5' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                    <p style={{ fontFamily: 'Heebo' }}>טוען שירותים...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-[1315px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-[32px] font-bold" style={{ color: '#3568AE', fontFamily: 'Heebo' }}>
                        שירותים
                    </h1>
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                    >
                        <Plus className="ml-2 w-4 h-4" />
                        שירות חדש
                    </Button>
                </div>

                <div className="relative max-w-sm mb-6">
                    <Input
                        placeholder="חיפוש שירות..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {filteredServices.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">אין שירותים במערכת</p>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                            >
                                <Plus className="ml-2 w-4 h-4" />
                                צור שירות ראשון
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredServices.map((service) => (
                            <Card key={service.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-2">{service.product_name}</h3>
                                            <p className="text-sm text-gray-600">לקוח: {service.client_name}</p>
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

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                        <div>
                                            <span className="text-gray-500">סטטוס בוט:</span>
                                            <p className="font-medium">{service.bot_status}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">תאריך פעולה:</span>
                                            <p className="font-medium">
                                                {service.action_date ? new Date(service.action_date).toLocaleDateString('he-IL') : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">מחיר:</span>
                                            <p className="font-medium text-[#67BF91]">₪{service.price || 0}</p>
                                            {service.payment_status === 'שולם חלקית' && service.amount_paid && (
                                                <p className="text-xs text-gray-500">שולם: ₪{service.amount_paid} | יתרה: ₪{service.balance}</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-gray-500">קבצים מצורפים:</span>
                                            <p className="font-medium">{service.attachments?.length || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(service)}
                                        >
                                            <Edit className="w-4 h-4 ml-1" />
                                            ערוך
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(service.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4 ml-1" />
                                            מחק
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle style={{ fontFamily: 'Heebo' }}>
                                {editingService ? 'עריכת שירות' : 'שירות חדש'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">לקוח *</label>
                                    <Select value={formData.client_id} onValueChange={handleClientChange} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="בחר לקוח" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">סוג שירות *</label>
                                    {showNewServiceInput ? (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newServiceType}
                                                    onChange={(e) => setNewServiceType(e.target.value)}
                                                    placeholder="הקלד סוג שירות חדש"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddNewServiceType();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleAddNewServiceType}
                                                    size="sm"
                                                    className="bg-[#67BF91]"
                                                >
                                                    הוסף
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewServiceInput(false);
                                                        setNewServiceType('');
                                                    }}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    ביטול
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Select value={formData.product_id} onValueChange={handleServiceTypeChange} required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="בחר או הוסף סוג שירות" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {serviceTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>{type}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="__new__" className="text-[#67BF91] font-medium">
                                                        + הוסף סוג שירות חדש
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {serviceTypes.length > 0 && (
                                                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded">
                                                    {serviceTypes.map((type) => (
                                                        <Badge key={type} variant="outline" className="flex items-center gap-1">
                                                            {type}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveServiceType(type)}
                                                                className="ml-1 hover:text-red-600"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">סטטוס</label>
                                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="פתוח">פתוח</SelectItem>
                                            <SelectItem value="בטיפול">בטיפול</SelectItem>
                                            <SelectItem value="הושלם">הושלם</SelectItem>
                                            <SelectItem value="בוטל">בוטל</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">סטטוס בוט</label>
                                    <Select value={formData.bot_status} onValueChange={(val) => setFormData({ ...formData, bot_status: val })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ממתין">ממתין</SelectItem>
                                            <SelectItem value="בתהליך">בתהליך</SelectItem>
                                            <SelectItem value="הושלם">הושלם</SelectItem>
                                            <SelectItem value="נכשל">נכשל</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">תאריך פעולה</label>
                                    <Input
                                        type="date"
                                        value={formData.action_date}
                                        onChange={(e) => setFormData({ ...formData, action_date: e.target.value })}
                                    />
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">סטטוס תשלום</label>
                                <Select value={formData.payment_status} onValueChange={(val) => setFormData({ ...formData, payment_status: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
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
                                            placeholder="0"
                                            value={formData.balance}
                                            disabled
                                            className="bg-gray-100"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">קבצים מצורפים</label>
                                <div className="space-y-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('file-upload').click()}
                                        disabled={uploading}
                                        className="w-full"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 ml-2"></div>
                                                מעלה...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 ml-2" />
                                                העלה קובץ
                                            </>
                                        )}
                                    </Button>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    {formData.attachments && formData.attachments.length > 0 && (
                                        <div className="space-y-1">
                                            {formData.attachments.map((url, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-gray-500" />
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            קובץ {index + 1}
                                                        </a>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeAttachment(index)}
                                                        className="text-red-500"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
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
            </div>
        </div>
    );
}