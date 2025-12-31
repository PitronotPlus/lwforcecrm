import React, { useState, useEffect } from "react";
import { Integration } from "@/entities/Integration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Phone,
  CreditCard,
  FileText,
  Zap,
  Webhook
} from "lucide-react";
import { WebhookLog } from "@/entities/WebhookLog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import IntegrationSetup from "../integrations/IntegrationSetup";

export default function IntegrationManager({ subAccountId = null }) {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState(null);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [showWebhookLogs, setShowWebhookLogs] = useState(false);
  const [selectedIntegrationForLogs, setSelectedIntegrationForLogs] = useState(null);

  useEffect(() => {
      loadIntegrations();
  }, [subAccountId]);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await Integration.list("-created_date");
      setIntegrations(data);
    } catch (error) {
      console.error("שגיאה בטעינת האינטגרציות:", error);
    }
    setIsLoading(false);
  };

  const handleOpenSetup = (type, integration = null) => {
    setSelectedIntegrationType(type);
    setEditingIntegration(integration);
    setShowSetup(true);
  };

  const handleStatusToggle = async (integration) => {
    const newStatus = ['active', 'connected'].includes(integration.status) ? 'inactive' : 'active';
    const originalIntegrations = [...integrations];
    setIntegrations(integrations.map(i => i.id === integration.id ? { ...i, status: newStatus } : i));

    try {
      await Integration.update(integration.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update integration status", error);
      alert("שגיאה בעדכון סטטוס האינטגרציה.");
      setIntegrations(originalIntegrations);
    }
  };
  
  const handleDelete = async (integration) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את האינטגרציה? פעולה זו תנתק את החיבור ואינה ניתנת לשחזור.")) {
      setIsLoading(true);
      try {
        await Integration.delete(integration.id);
        loadIntegrations();
      } catch (error) {
        console.error("שגיאה במחיקת האינטגרציה:", error);
        alert("שגיאה במחיקת האינטגרציה.");
        setIsLoading(false);
      }
    }
  };

  const handleViewWebhookLogs = async (integration) => {
    setSelectedIntegrationForLogs(integration);
    setShowWebhookLogs(true);
    setWebhookLogs([]);
    
    try {
      let logs = [];
      
      if (integration.integration_id) {
        logs = await WebhookLog.filter(
          { integration_id: integration.integration_id },
          '-created_date',
          100
        );
      }
      
      if ((!logs || logs.length === 0) && integration.id) {
        logs = await WebhookLog.filter(
          { integration_id: integration.id },
          '-created_date',
          100
        );
      }
      
      setWebhookLogs(logs || []);
    } catch (error) {
      console.error('Error loading webhook logs:', error);
      alert('שגיאה בטעינת לוג בקשות ה-Webhook.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const integrationLogos = {
    make: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915272876069a395cd67b1e/cca436e85_image.png',
    zapier: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915272876069a395cd67b1e/b74833bb0_image.png',
    wordpress_form: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915272876069a395cd67b1e/18102d9fe_image.png',
    webhook: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915272876069a395cd67b1e/18102d9fe_image.png',
    website_form: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915272876069a395cd67b1e/18102d9fe_image.png',
    voicecenter: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6928321e2c82f116750e861e/6eac73896_Voicenter.png',
    cardcom: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915272876069a395cd67b1e/54008a935_image.png',
    icount: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6915272876069a395cd67b1e/0a63781f2_image.png'
  };

  const getIntegrationIcon = (type) => {
    const logo = integrationLogos[type];
    if (logo) {
      return <img src={logo} alt={type} className="w-10 h-10 object-contain rounded-lg" />;
    }
    switch (type) {
      case 'make': return <Zap className="w-8 h-8 text-purple-600" />;
      case 'zapier': return <Zap className="w-8 h-8 text-orange-600" />;
      case 'wordpress_form': return <Webhook className="w-8 h-8 text-purple-600" />;
      case 'website_form': return <Webhook className="w-8 h-8 text-green-600" />;
      case 'webhook': return <Webhook className="w-8 h-8 text-purple-600" />;
      case 'cardcom': return <CreditCard className="w-8 h-8 text-indigo-600" />;
      case 'icount': return <FileText className="w-8 h-8 text-blue-600" />;
      case 'voicecenter': return <Phone className="w-8 h-8 text-red-600" />;
      default: return <Zap className="w-8 h-8 text-orange-600" />;
    }
  };

  const integrationTypes = [
    {
      type: 'make',
      name: 'Make',
      description: 'חבר אוטומציות חכמות מ-Make ישירות ל-CRM עם הוראות מפורטות',
      icon: Zap,
      color: 'text-purple-600',
      available: true,
      logo: integrationLogos.make
    },
    {
      type: 'zapier',
      name: 'Zapier',
      description: 'חבר אוטומציות חכמות מ-Zapier ישירות ל-CRM עם הוראות מפורטות',
      icon: Zap,
      color: 'text-orange-600',
      available: true,
      logo: integrationLogos.zapier
    },
    {
      type: 'wordpress_form',
      name: 'Webhook',
      description: 'קבל נתונים מכל מערכת חיצונית (וורדפרס, Zapier, ועוד) דרך webhook',
      icon: Webhook,
      color: 'text-purple-600',
      available: true,
      logo: integrationLogos.wordpress_form
    },
    {
      type: 'voicecenter',
      name: 'Voicecenter',
      description: 'חייגן אוטומטי לניהול קמפיינים, הוספת יעדי שיחה ושליחת לקוחות לשיחות',
      icon: Phone,
      color: 'text-red-600',
      available: true,
      logo: integrationLogos.voicecenter
    },
    {
      type: 'cardcom',
      name: 'אישורית זהב',
      description: 'סליקת אשראי והפקת מסמכים חשבונאיים',
      icon: CreditCard,
      color: 'text-indigo-600',
      available: true,
      logo: integrationLogos.cardcom
    },
    {
      type: 'icount',
      name: 'iCount',
      description: 'סליקת אשראי והפקת מסמכים חשבונאיים',
      icon: FileText,
      color: 'text-blue-600',
      available: true,
      logo: integrationLogos.icount
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#3568AE', fontFamily: 'Heebo' }}>
            אינטגרציות חיצוניות
          </h2>
          <p className="text-gray-600" style={{ fontFamily: 'Heebo' }}>
            התחבר למקורות לקוחות חיצוניים ואוטמט את תהליכי העבודה
          </p>
        </div>
      </div>

      {/* Available Integrations */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Heebo' }}>אינטגרציות זמינות</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationTypes.map((integrationType) => (
            <Card key={integrationType.type} className="bg-white hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  {integrationType.logo ? (
                    <img src={integrationType.logo} alt={integrationType.name} className="w-10 h-10 object-contain rounded-lg" />
                  ) : (
                    <integrationType.icon className={`w-8 h-8 ${integrationType.color}`} />
                  )}
                  <div>
                    <CardTitle className="text-lg" style={{ fontFamily: 'Heebo' }}>{integrationType.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm" style={{ fontFamily: 'Heebo' }}>
                  {integrationType.description}
                </p>
                <Button
                  className="w-full bg-[#67BF91] hover:bg-[#5AA880] text-white"
                  onClick={() => handleOpenSetup(integrationType.type, null)}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הגדר אינטגרציה
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Integrations */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Heebo' }}>אינטגרציות פעילות</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : integrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getIntegrationIcon(integration.type)}
                      <div>
                        <CardTitle className="text-lg" style={{ fontFamily: 'Heebo' }}>{integration.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {integrationTypes.find(it => it.type === integration.type)?.name || integration.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`switch-${integration.id}`}
                          checked={['active', 'connected'].includes(integration.status)}
                          onCheckedChange={() => handleStatusToggle(integration)}
                        />
                        <Label htmlFor={`switch-${integration.id}`} className={`text-sm font-medium ${
                          ['active', 'connected'].includes(integration.status) ? 'text-green-700' :
                          integration.status === 'error' ? 'text-red-700' :
                          integration.status === 'pending' ? 'text-yellow-700' : 'text-gray-700'
                        }`}>
                          {
                            ['active', 'connected'].includes(integration.status) ? 'פעיל' :
                            integration.status === 'error' ? 'שגיאה' :
                            integration.status === 'pending' ? 'בהגדרה' : 'לא פעיל'
                          }
                        </Label>
                      </div>
                      {integration.status === 'error' && integration.error_message && (
                        <p className="text-xs text-red-600 max-w-[150px] text-right" title={integration.error_message}>
                          {integration.error_message.substring(0, 40)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">לקוחות התקבלו:</span>
                      <span className="font-medium">{integration.leads_received || 0}</span>
                    </div>
                    {integration.last_sync && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">סנכרון אחרון:</span>
                        <span className="font-medium">
                          {new Date(integration.last_sync).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenSetup(integration.type, integration)}>
                      <Settings className="w-4 h-4 ml-1" />
                      הגדרות
                    </Button>
                    {(integration.type === 'webhook' || integration.type === 'wordpress_form' || integration.type === 'website_form' || integration.type === 'zapier' || integration.type === 'make') && (
                      <Button 
                        onClick={() => handleViewWebhookLogs(integration)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 ml-1" />
                        לוג
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" className="flex-1 gap-1" onClick={() => handleDelete(integration)}>
                      <Trash2 className="w-4 h-4" />
                      מחק
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white p-12 text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Heebo' }}>אין אינטגרציות פעילות</h3>
            <p className="text-gray-600 mb-4" style={{ fontFamily: 'Heebo' }}>
              התחל לאסוף לקוחות על ידי הגדרת האינטגרציה הראשונה שלך
            </p>
          </Card>
        )}
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <IntegrationSetup
          type={selectedIntegrationType}
          integration={editingIntegration}
          onClose={() => {
            setShowSetup(false);
            setSelectedIntegrationType(null);
            setEditingIntegration(null);
          }}
          onSave={() => {
            setShowSetup(false);
            setSelectedIntegrationType(null);
            setEditingIntegration(null);
            loadIntegrations();
          }}
        />
      )}

      {/* Webhook Logs Modal */}
      <Dialog open={showWebhookLogs} onOpenChange={setShowWebhookLogs}>
        {selectedIntegrationForLogs && (
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Heebo' }}>
                לוג בקשות Webhook - {selectedIntegrationForLogs.name}
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedIntegrationForLogs.integration_id}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-2 overflow-y-auto flex-1">
              {webhookLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">אין בקשות עדיין</h3>
                  <p>כאשר יתקבלו בקשות webhook הן יופיעו כאן</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    סה"כ {webhookLogs.length} בקשות (מוצגות עד 100 אחרונות)
                  </div>
                  <div className="space-y-4">
                    {webhookLogs.map(log => (
                      <Card 
                        key={log.id} 
                        className={
                          log.status === 'success' 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {log.status === 'success' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                                {new Date(log.created_date).toLocaleString('he-IL')}
                              </CardTitle>
                              {log.request_id && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Request ID: <code className="bg-gray-100 px-2 py-1 rounded">{log.request_id}</code>
                                </p>
                              )}
                              {log.lead_id && (
                                <p className="text-sm text-green-600 mt-1">
                                  לקוח נוצר: <code className="bg-green-100 px-2 py-1 rounded">{log.lead_id}</code>
                                </p>
                              )}
                              {log.error_message && (
                                <p className="text-sm text-red-600 mt-1">
                                  שגיאה: {log.error_message}
                                </p>
                              )}
                            </div>
                            <div className="text-left">
                              <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                {log.status}
                              </Badge>
                              {log.processing_time_ms && (
                                <p className="text-xs text-gray-500 mt-1">{log.processing_time_ms}ms</p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">נתונים גולמיים:</h4>
                              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-64" dir="ltr">
                                {log.raw_data ? JSON.stringify(log.raw_data, null, 2) : 'No data'}
                              </pre>
                            </div>
                            {log.mapped_data && (
                              <div>
                                <h4 className="font-semibold mb-2">נתונים לאחר מיפוי:</h4>
                                <pre className="bg-blue-900 text-blue-100 p-3 rounded text-xs overflow-x-auto max-h-64" dir="ltr">
                                  {JSON.stringify(log.mapped_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}