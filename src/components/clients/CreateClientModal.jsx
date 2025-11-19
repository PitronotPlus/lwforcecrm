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
        utm_medium: ''
    });

    useEffect(() => {
        loadClientSettings();
    }, []);

    const loadClientSettings = async () => {
        try {
            const settings = await ClientSettings.list();
            setClientSettings(settings[0] || {});
        } catch (error) {
            console.error('שגיאה בטעינת הגדרות:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newClient = await Client.create(formData);
            
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
                utm_medium: ''
            });
        } catch (error) {
            console.error('שגיאה ביצירת לקוח:', error);
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