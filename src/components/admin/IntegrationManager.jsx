import React, { useState, useEffect } from 'react';
import { Integration } from '@/entities/Integration';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Copy, TestTube, Activity, CheckCircle, XCircle } from 'lucide-react';

export default function IntegrationManager() {
    const [integrations, setIntegrations] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [testing, setTesting] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [newIntegration, setNewIntegration] = useState({
        name: '',
        type: 'webhook',
        field_mapping: []
    });

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            const data = await Integration.list('-created_date');
            setIntegrations(data);
        } catch (error) {
            console.error('שגיאה בטעינת אינטגרציות:', error);
        }
    };

    const generateIntegrationId = () => {
        return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const handleCreate = async () => {
        try {
            const integrationId = generateIntegrationId();
            
            await Integration.create({
                ...newIntegration,
                integration_id: integrationId,
                status: 'active',
                leads_received: 0
            });

            setNewIntegration({ name: '', type: 'webhook', field_mapping: [] });
            setShowForm(false);
            loadIntegrations();
        } catch (error) {
            console.error('שגיאה ביצירת אינטגרציה:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את האינטגרציה?')) {
            try {
                await Integration.delete(id);
                loadIntegrations();
            } catch (error) {
                console.error('שגיאה במחיקת אינטגרציה:', error);
            }
        }
    };

    const copyWebhookUrl = (integrationId) => {
        const baseUrl = window.location.origin;
        const webhookUrl = `${baseUrl}/api/functions/webhookReceiver?integration_id=${integrationId}`;
        navigator.clipboard.writeText(webhookUrl);
        alert('כתובת ה-Webhook הועתקה ללוח');
    };

    const testIntegration = async (integration) => {
        setTesting(integration.id);
        setTestResult(null);
        
        try {
            const response = await base44.functions.invoke('testWebhook', {
                integration_id: integration.integration_id,
                test_data: {
                    full_name: 'בדיקה טסט',
                    email: 'test@example.com',
                    phone: '0501234567',
                    message: 'זהו ליד בדיקה'
                }
            });

            setTestResult({
                success: response.data.success,
                message: response.data.success ? 'הבדיקה עברה בהצלחה!' : response.data.error,
                log: response.data.log
            });
        } catch (error) {
            setTestResult({
                success: false,
                message: error.message
            });
        } finally {
            setTesting(null);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'error': 'bg-red-100 text-red-800'
        };
        return colors[status] || colors['inactive'];
    };

    const addFieldMapping = () => {
        setNewIntegration({
            ...newIntegration,
            field_mapping: [...(newIntegration.field_mapping || []), { source: '', destination: '' }]
        });
    };

    const updateFieldMapping = (index, field, value) => {
        const updated = [...newIntegration.field_mapping];
        updated[index][field] = value;
        setNewIntegration({ ...newIntegration, field_mapping: updated });
    };

    const removeFieldMapping = (index) => {
        const updated = newIntegration.field_mapping.filter((_, i) => i !== index);
        setNewIntegration({ ...newIntegration, field_mapping: updated });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">ניהול אינטגרציות</h3>
                <Button onClick={() => setShowForm(!showForm)} className="bg-[#3568AE]">
                    <Plus className="w-4 h-4 ml-2" />
                    {showForm ? 'ביטול' : 'אינטגרציה חדשה'}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>אינטגרציה חדשה</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="שם האינטגרציה"
                            value={newIntegration.name}
                            onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                        />

                        <Select
                            value={newIntegration.type}
                            onValueChange={(value) => setNewIntegration({ ...newIntegration, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="בחר סוג" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="webhook">Webhook</SelectItem>
                                <SelectItem value="zapier">Zapier</SelectItem>
                                <SelectItem value="make">Make</SelectItem>
                                <SelectItem value="wordpress">WordPress</SelectItem>
                                <SelectItem value="facebook">Facebook Leads</SelectItem>
                                <SelectItem value="google_ads">Google Ads</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="font-medium">מיפוי שדות</label>
                                <Button size="sm" variant="outline" onClick={addFieldMapping}>
                                    <Plus className="w-3 h-3 ml-1" />
                                    הוסף שדה
                                </Button>
                            </div>

                            {newIntegration.field_mapping?.map((mapping, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        placeholder="שדה מקור"
                                        value={mapping.source}
                                        onChange={(e) => updateFieldMapping(index, 'source', e.target.value)}
                                    />
                                    <span>→</span>
                                    <Select
                                        value={mapping.destination}
                                        onValueChange={(value) => updateFieldMapping(index, 'destination', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="שדה יעד" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full_name">שם מלא</SelectItem>
                                            <SelectItem value="email">אימייל</SelectItem>
                                            <SelectItem value="phone">טלפון</SelectItem>
                                            <SelectItem value="service_type">סוג שירות</SelectItem>
                                            <SelectItem value="initial_need">צורך ראשוני</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFieldMapping(index)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleCreate} className="bg-[#67BF91]">צור אינטגרציה</Button>
                            <Button variant="outline" onClick={() => setShowForm(false)}>ביטול</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {testResult && (
                <Card className={testResult.success ? 'border-green-500' : 'border-red-500'}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            {testResult.success ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="font-medium">{testResult.message}</span>
                        </div>
                        
                        {testResult.log && (
                            <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto">
                                <pre className="text-xs">{JSON.stringify(testResult.log, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {integrations.map(integration => (
                    <Card key={integration.id}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-lg">{integration.name}</h4>
                                        <Badge className={getStatusBadge(integration.status)}>
                                            {integration.status}
                                        </Badge>
                                        <Badge variant="outline">{integration.type}</Badge>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>לידים שהתקבלו: {integration.leads_received || 0}</p>
                                        {integration.last_sync && (
                                            <p>סנכרון אחרון: {new Date(integration.last_sync).toLocaleString('he-IL')}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {integration.integration_id}
                                            </code>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyWebhookUrl(integration.integration_id)}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => testIntegration(integration)}
                                        disabled={testing === integration.id}
                                    >
                                        {testing === integration.id ? (
                                            <Activity className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <TestTube className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(integration.id)}
                                        className="text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {integrations.length === 0 && !showForm && (
                    <div className="text-center py-12 text-gray-500">
                        <p>אין אינטגרציות במערכת</p>
                        <Button onClick={() => setShowForm(true)} className="mt-4 bg-[#3568AE]">
                            <Plus className="w-4 h-4 ml-2" />
                            צור אינטגרציה ראשונה
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}