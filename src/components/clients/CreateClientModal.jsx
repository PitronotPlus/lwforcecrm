import { useState, useEffect } from "react";
import { Client } from "@/entities/Client";
import { ClientSettings } from "@/entities/ClientSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function CreateClientModal({ onClientCreated, triggerText = "לקוח חדש" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [clientSettings, setClientSettings] = useState(null);
    const [customFields, setCustomFields] = useState([]);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        service_type: '',
        status: 'ליד',
        initial_need: '',
        source: '',
        notes: '',
        utm_source: '',
        utm_campaign: '',
        utm_medium: '',
        custom_fields: {}
    });

    useEffect(() => {
        loadClientSettings();
        loadCustomFields();
    }, []);

    const loadClientSettings = async () => {
        try {
            const settings = await ClientSettings.list();
            setClientSettings(settings[0] || {});
        } catch (error) {
            console.error('שגיאה בטעינת הגדרות:', error);
        }
    };

    const loadCustomFields = async () => {
        try {
            const { base44 } = await import("@/api/base44Client");
            const fields = await base44.entities.CustomField.filter({ 
                entity_type: 'Client', 
                is_active: true 
            }, 'order');
            setCustomFields(fields);
        } catch (error) {
            console.error('שגיאה בטעינת שדות מותאמים:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // מיזוג השדות המותאמים לתוך הנתונים הראשיים
            const clientData = { ...formData };
            if (formData.custom_fields) {
                Object.assign(clientData, formData.custom_fields);
                delete clientData.custom_fields;
            }
            
            const newClient = await Client.create(clientData);
            
            onClientCreated && onClientCreated(newClient);
            setIsOpen(false);
            setFormData({
                full_name: '',
                phone: '',
                email: '',
                service_type: '',
                status: 'ליד',
                initial_need: '',
                source: '',
                notes: '',
                utm_source: '',
                utm_campaign: '',
                utm_medium: '',
                custom_fields: {}
            });
        } catch (error) {
            console.error('שגיאה ביצירת לקוח:', error);
        }
    };

    const updateCustomField = (fieldName, value) => {
        setFormData({
            ...formData,
            custom_fields: {
                ...formData.custom_fields,
                [fieldName]: value
            }
        });
    };

    const renderCustomField = (field) => {
        const value = formData.custom_fields[field.field_name] || '';
        
        switch (field.field_type) {
            case 'text':
                return (
                    <Input
                        required={field.is_required}
                        value={value}
                        onChange={(e) => updateCustomField(field.field_name, e.target.value)}
                        placeholder={field.default_value || ''}
                    />
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        required={field.is_required}
                        value={value}
                        onChange={(e) => updateCustomField(field.field_name, e.target.value)}
                        placeholder={field.default_value || ''}
                    />
                );
            case 'date':
                return (
                    <Input
                        type="date"
                        required={field.is_required}
                        value={value}
                        onChange={(e) => updateCustomField(field.field_name, e.target.value)}
                    />
                );
            case 'textarea':
                return (
                    <Textarea
                        required={field.is_required}
                        value={value}
                        onChange={(e) => updateCustomField(field.field_name, e.target.value)}
                        placeholder={field.default_value || ''}
                    />
                );
            case 'checkbox':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={value === true || value === 'true'}
                            onChange={(e) => updateCustomField(field.field_name, e.target.checked)}
                            className="rounded"
                        />
                    </div>
                );
            case 'select':
                return (
                    <Select
                        value={value}
                        onValueChange={(val) => updateCustomField(field.field_name, val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="בחר..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(field.field_options || []).map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    className="h-12 px-6 rounded-[15px] text-[18px] font-bold text-white"
                    style={{ background: '#67BF91' }}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {triggerText}
                </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>יצירת לקוח חדש</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium" style={{ fontFamily: 'Heebo' }}>פרטים בסיסיים</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    שם מלא *
                                </label>
                                <Input
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    className="text-right"
                                    placeholder="שם מלא של הלקוח"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    טלפון *
                                </label>
                                <Input
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="text-right"
                                    placeholder="050-1234567"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    מייל
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="text-right"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    סוג שירות
                                </label>
                                <Input
                                    value={formData.service_type}
                                    onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                                    className="text-right"
                                    placeholder="לדוגמה: ייעוץ משפטי, הסכם שכירות"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status & Classification */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium" style={{ fontFamily: 'Heebo' }}>סיווג וסטטוס</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    סטטוס לקוח
                                </label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({...formData, status: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(clientSettings?.status_options || ['ליד', 'פולואפ', 'לקוח']).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    צורך ראשוני
                                </label>
                                <Select
                                    value={formData.initial_need}
                                    onValueChange={(value) => setFormData({...formData, initial_need: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחר צורך" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(clientSettings?.initial_needs_options || []).map((need) => (
                                            <SelectItem key={need} value={need}>
                                                {need}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    מקור הגעה
                                </label>
                                <Select
                                    value={formData.source}
                                    onValueChange={(value) => setFormData({...formData, source: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחר מקור" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(clientSettings?.source_options || ['פה לאוזן', 'שיווק פייסבוק', 'שיווק גוגל']).map((source) => (
                                            <SelectItem key={source} value={source}>
                                                {source}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Marketing Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium" style={{ fontFamily: 'Heebo' }}>פרטי שיווק (אופציונלי)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    UTM Source
                                </label>
                                <Input
                                    value={formData.utm_source}
                                    onChange={(e) => setFormData({...formData, utm_source: e.target.value})}
                                    className="text-right"
                                    placeholder="google, facebook"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    UTM Campaign
                                </label>
                                <Input
                                    value={formData.utm_campaign}
                                    onChange={(e) => setFormData({...formData, utm_campaign: e.target.value})}
                                    className="text-right"
                                    placeholder="summer_promo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                    UTM Medium
                                </label>
                                <Input
                                    value={formData.utm_medium}
                                    onChange={(e) => setFormData({...formData, utm_medium: e.target.value})}
                                    className="text-right"
                                    placeholder="cpc, social"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                            הערות
                        </label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="text-right"
                            rows={3}
                            placeholder="הערות נוספות על הלקוח..."
                        />
                    </div>

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium" style={{ fontFamily: 'Heebo' }}>שדות נוספים</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {customFields.map((field) => (
                                    <div key={field.id}>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            {field.field_label} {field.is_required && '*'}
                                        </label>
                                        {renderCustomField(field)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button 
                            type="submit"
                            className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                        >
                            צור לקוח
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}