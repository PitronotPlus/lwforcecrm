import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Client } from "@/entities/Client";
import { ClientSettings } from "@/entities/ClientSettings";
import { Task } from "@/entities/Task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    User, 
    Phone, 
    Mail, 
    Calendar, 
    MessageCircle, 
    Send, 
    Settings, 
    ExternalLink,
    Plus,
    Edit,
    Folder,
    FileText
} from "lucide-react";
import CommunicationLogStream from "../components/clients/CommunicationLogStream";
import CommunicationPanel from "../components/clients/CommunicationPanel";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import { Case } from "@/entities/Case";
import CaseModal from "../components/cases/CaseModal";

export default function ClientDetails() {
    const [searchParams] = useSearchParams();
    const clientId = searchParams.get('id');
    
    const [client, setClient] = useState(null);
    const [clientSettings, setClientSettings] = useState(null);
    const [clientCases, setClientCases] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [refreshLogKey, setRefreshLogKey] = useState(0);

    useEffect(() => {
        if (clientId) {
            loadClient();
            loadCases();
        }
        loadClientSettings();
    }, [clientId]);

    const loadClient = async () => {
        try {
            const data = await Client.get(clientId);
            setClient(data);
            setEditForm(data);
        } catch (error) {
            console.error('שגיאה בטעינת לקוח:', error);
        }
    };

    const loadCases = async () => {
        try {
            const data = await Case.filter({ client_id: clientId });
            setClientCases(data);
        } catch(error) {
            console.error('שגיאה בטעינת תיקים:', error)
        }
    }

    const loadClientSettings = async () => {
        try {
            const settings = await ClientSettings.list();
            setClientSettings(settings[0] || {});
        } catch (error) {
            console.error('שגיאה בטעינת הגדרות:', error);
        }
    };

    const handleSave = async () => {
        try {
            // Check for status change automation
            if (editForm.status !== client.status && editForm.automation_settings?.auto_send_on_status_change) {
                const template = clientSettings?.message_templates?.find(t => t.id === editForm.automation_settings.status_change_template_id);
                if (template) {
                    console.log(`Sending template "${template.title}" to ${client.full_name} due to status change from ${client.status} to ${editForm.status}.`);
                }
            }
            await Client.update(clientId, editForm);
            setClient(editForm);
            setIsEditing(false);
        } catch (error) {
            console.error('שגיאה בשמירת לקוח:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'ליד': 'bg-blue-100 text-blue-800',
            'פולואפ': 'bg-yellow-100 text-yellow-800',
            'לקוח': 'bg-green-100 text-green-800',
            'לא נסגר': 'bg-red-100 text-red-800',
            'יקר עבורו': 'bg-orange-100 text-orange-800',
            'נתפס לפני שטופל': 'bg-purple-100 text-purple-800',
            'לא רלוונטי': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (!client) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
                <div className="max-w-4xl mx-auto text-center">
                    <p style={{ fontFamily: 'Heebo', color: '#858C94' }}>טוען פרטי לקוח...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Communication Log on the left */}
                <div className="lg:col-span-1">
                    <CommunicationLogStream clientId={clientId} refreshKey={refreshLogKey} />
                </div>
                
                {/* Main Content on the right */}
                <div className="lg:col-span-2">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <User className="w-8 h-8 text-[#3568AE]" />
                            <h1 
                                className="text-[32px] font-bold"
                                style={{ 
                                    color: '#3568AE',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                {client.full_name}
                            </h1>
                            <Badge className={getStatusColor(client.status)}>
                                {client.status}
                            </Badge>
                        </div>
                        
                        <div className="flex gap-4">
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant="outline"
                                className="border-[#3568AE] text-[#3568AE] hover:bg-[#3568AE]/10"
                            >
                                <Edit className="ml-2 w-4 h-4" />
                                {isEditing ? 'בטל עריכה' : 'ערוך פרטים'}
                            </Button>
                            
                            {isEditing && (
                                <Button
                                    onClick={handleSave}
                                    className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                                >
                                    שמור שינויים
                                </Button>
                            )}
                        </div>
                    </div>

                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="details">פרטי לקוח</TabsTrigger>
                            <TabsTrigger value="cases">תיקים</TabsTrigger>
                            <TabsTrigger value="marketing">פרטי שיווק</TabsTrigger>
                            <TabsTrigger value="communication">תקשורת</TabsTrigger>
                            <TabsTrigger value="automation">הודעות אוטומטיות</TabsTrigger>
                        </TabsList>

                        {/* פרטי לקוח */}
                        <TabsContent value="details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle style={{ fontFamily: 'Heebo' }}>מידע אישי</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                שם מלא
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.full_name || ''}
                                                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                                                    className="text-right"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span style={{ fontFamily: 'Heebo' }}>{client.full_name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                טלפון
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.phone || ''}
                                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                                    className="text-right"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <a 
                                                        href={`tel:${client.phone}`}
                                                        className="text-[#3568AE] hover:underline"
                                                        style={{ fontFamily: 'Heebo' }}
                                                    >
                                                        {client.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                אימייל
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    type="email"
                                                    value={editForm.email || ''}
                                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                    className="text-right"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <a 
                                                        href={`mailto:${client.email}`}
                                                        className="text-[#3568AE] hover:underline"
                                                        style={{ fontFamily: 'Heebo' }}
                                                    >
                                                        {client.email}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                תאריך יצירה
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span style={{ fontFamily: 'Heebo' }}>
                                                    {new Date(client.created_date).toLocaleDateString('he-IL')}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle style={{ fontFamily: 'Heebo' }}>מידע מקצועי</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                סוג שירות
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.service_type || ''}
                                                    onChange={(e) => setEditForm({...editForm, service_type: e.target.value})}
                                                    className="text-right"
                                                />
                                            ) : (
                                                <span style={{ fontFamily: 'Heebo' }}>{client.service_type}</span>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                סטטוס לקוח
                                            </label>
                                            {isEditing ? (
                                                <Select
                                                    value={editForm.status || ''}
                                                    onValueChange={(value) => setEditForm({...editForm, status: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="בחר סטטוס" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(clientSettings?.status_options || []).map((status) => (
                                                            <SelectItem key={status} value={status}>
                                                                {status}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge className={getStatusColor(client.status)}>
                                                    {client.status}
                                                </Badge>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                צורך ראשוני
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.initial_need || ''}
                                                    onChange={(e) => setEditForm({...editForm, initial_need: e.target.value})}
                                                    className="text-right"
                                                />
                                            ) : (
                                                <span style={{ fontFamily: 'Heebo' }}>{client.initial_need}</span>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                מקור הגעה
                                            </label>
                                            {isEditing ? (
                                                <Select
                                                    value={editForm.source || ''}
                                                    onValueChange={(value) => setEditForm({...editForm, source: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="בחר מקור" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(clientSettings?.source_options || []).map((source) => (
                                                            <SelectItem key={source} value={source}>
                                                                {source}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span style={{ fontFamily: 'Heebo' }}>{client.source}</span>
                                            )}
                                        </div>

                                        {client.google_drive_link && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                    תיקיית Google Drive
                                                </label>
                                                <a 
                                                    href={client.google_drive_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[#3568AE] hover:underline"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span style={{ fontFamily: 'Heebo' }}>פתח תיקיית Drive</span>
                                                </a>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* תיקים */}
                        <TabsContent value="cases">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle style={{ fontFamily: 'Heebo' }}>תיקים</CardTitle>
                                    <CaseModal client={client} onCaseSaved={loadCases}>
                                        <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                            <Plus className="ml-2 w-4 h-4" />
                                            הוסף תיק
                                        </Button>
                                    </CaseModal>
                                </CardHeader>
                                <CardContent>
                                    {clientCases.length > 0 ? (
                                        <div className="space-y-4">
                                            {clientCases.map(caseItem => (
                                                <div key={caseItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-5 h-5 text-gray-600" />
                                                        <div>
                                                            <p className="font-medium">{caseItem.title}</p>
                                                            <p className="text-sm text-gray-500">{caseItem.case_type} - {caseItem.status}</p>
                                                        </div>
                                                    </div>
                                                    <CaseModal caseToEdit={caseItem} onCaseSaved={loadCases}>
                                                        <Button variant="ghost" size="sm">צפה/ערוך תיק</Button>
                                                    </CaseModal>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">לא נמצאו תיקים עבור לקוח זה.</p>
                                        <CaseModal client={client} onCaseSaved={loadCases}>
                                            <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                                <Plus className="ml-2 w-4 h-4" />
                                                הוסף תיק
                                            </Button>
                                        </CaseModal>
                                      </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        {/* פרטי שיווק */}
                        <TabsContent value="marketing">
                            <Card>
                                <CardHeader>
                                    <CardTitle style={{ fontFamily: 'Heebo' }}>פרטי שיווק מתקדמים</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            UTM Source
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.utm_source || ''}
                                                onChange={(e) => setEditForm({...editForm, utm_source: e.target.value})}
                                                className="text-right"
                                            />
                                        ) : (
                                            <span style={{ fontFamily: 'Heebo' }}>{client.utm_source || 'לא זמין'}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            UTM Campaign
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.utm_campaign || ''}
                                                onChange={(e) => setEditForm({...editForm, utm_campaign: e.target.value})}
                                                className="text-right"
                                            />
                                        ) : (
                                            <span style={{ fontFamily: 'Heebo' }}>{client.utm_campaign || 'לא זמין'}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            UTM Medium
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.utm_medium || ''}
                                                onChange={(e) => setEditForm({...editForm, utm_medium: e.target.value})}
                                                className="text-right"
                                            />
                                        ) : (
                                            <span style={{ fontFamily: 'Heebo' }}>{client.utm_medium || 'לא זמין'}</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* תקשורת */}
                        <TabsContent value="communication">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle style={{ fontFamily: 'Heebo' }}>שליחת הודעה ללקוח</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CommunicationPanel 
                                            client={client} 
                                            clientSettings={clientSettings}
                                            onMessageSent={() => setRefreshLogKey(k => k + 1)}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle style={{ fontFamily: 'Heebo' }}>יצירת משימה עבור הלקוח</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CreateTaskModal 
                                            client={client}
                                            onTaskCreated={() => console.log('משימה נוצרה עבור הלקוח')}
                                            triggerText="צור משימה עבור הלקוח"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* אוטומציות */}
                        <TabsContent value="automation">
                            <Card>
                                <CardHeader>
                                    <CardTitle style={{ fontFamily: 'Heebo' }}>הגדרות הודעות אוטומטיות</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <label htmlFor="welcome-msg-toggle" className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>שליחת הודעת פתיחה אוטומטית לליד חדש</label>
                                        <input
                                            id="welcome-msg-toggle"
                                            type="checkbox"
                                            className="toggle-switch"
                                            disabled={!isEditing}
                                            checked={editForm.automation_settings?.send_welcome_message || false}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                automation_settings: {
                                                    ...editForm.automation_settings,
                                                    send_welcome_message: e.target.checked
                                                }
                                            })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <label htmlFor="status-change-toggle" className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>שליחת הודעה אוטומטית בשינוי סטטוס</label>
                                         <input
                                            id="status-change-toggle"
                                            type="checkbox"
                                            className="toggle-switch"
                                            disabled={!isEditing}
                                            checked={editForm.automation_settings?.auto_send_on_status_change || false}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                automation_settings: {
                                                    ...editForm.automation_settings,
                                                    auto_send_on_status_change: e.target.checked
                                                }
                                            })}
                                        />
                                    </div>
                                    
                                    {isEditing && editForm.automation_settings?.auto_send_on_status_change && (
                                        <div className="pl-4">
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                בחר תבנית הודעה לשליחה
                                            </label>
                                            <Select
                                                value={editForm.automation_settings?.status_change_template_id || ''}
                                                onValueChange={(value) => setEditForm({
                                                    ...editForm,
                                                    automation_settings: {
                                                        ...editForm.automation_settings,
                                                        status_change_template_id: value
                                                    }
                                                })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="בחר תבנית" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(clientSettings?.message_templates || []).map((template) => (
                                                        <SelectItem key={template.id} value={template.id}>
                                                            {template.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <label htmlFor="auto-followup-toggle" className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>יצירת משימת פולואפ אוטומטית</label>
                                        <input
                                            id="auto-followup-toggle"
                                            type="checkbox"
                                            className="toggle-switch"
                                            disabled={!isEditing}
                                            checked={editForm.automation_settings?.auto_followup || false}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                automation_settings: {
                                                    ...editForm.automation_settings,
                                                    auto_followup: e.target.checked
                                                }
                                            })}
                                        />
                                    </div>

                                    {isEditing && editForm.automation_settings?.auto_followup && (
                                        <div className="pl-4">
                                            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                                מספר ימים למשימת פולואפ
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={editForm.automation_settings?.followup_days || 1}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    automation_settings: {
                                                        ...editForm.automation_settings,
                                                        followup_days: parseInt(e.target.value) || 1
                                                    }
                                                })}
                                                className="w-32"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}