import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Play, Pause, Clock, Mail, MessageSquare, FileText, CheckCircle, Calendar, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const TRIGGER_TYPES = [
  { value: 'lead_created', label: 'רשומה חדשה נוצרה', icon: Plus },
  { value: 'lead_created_by_source', label: 'רשומה חדשה ממקור ספציפי', icon: Plus },
  { value: 'status_changed', label: 'סטטוס השתנה', icon: CheckCircle },
  { value: 'task_assigned', label: 'משימה הוגדרה', icon: CheckCircle },
  { value: 'case_created', label: 'תיק נוצר', icon: FileText },
  { value: 'appointment_scheduled', label: 'פגישה נקבעה', icon: Calendar },
  { value: 'document_signed', label: 'מסמך נחתם', icon: FileText },
  { value: 'integration_webhook', label: 'אינטגרציה (Webhook)', icon: CheckCircle }
];

const STEP_TYPES = [
  { value: 'send_email', label: 'שליחת מייל', icon: Mail },
  { value: 'send_sms', label: 'שליחת SMS', icon: MessageSquare },
  { value: 'change_status', label: 'שינוי סטטוס', icon: CheckCircle },
  { value: 'create_task', label: 'יצירת משימה', icon: CheckCircle },
  { value: 'create_case', label: 'יצירת תיק', icon: FileText },
  { value: 'add_note', label: 'הוספת הערה/תיעוד', icon: FileText },
  { value: 'send_document', label: 'שליחת מסמך לחתימה', icon: FileText },
  { value: 'wait', label: 'המתנה', icon: Clock },
  { value: 'update_field', label: 'עדכון שדה', icon: Edit },
  { value: 'delete_record', label: 'מחיקת רשומה', icon: Trash2 }
];

export default function AutomationManager() {
  const [automations, setAutomations] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [clientSettings, setClientSettings] = useState(null);
  const [documentTemplates, setDocumentTemplates] = useState([]);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('automations');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'lead_created',
    trigger_config: {},
    steps: [],
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [automationsData, integrationsData, logsData, clientSettingsData] = await Promise.all([
        base44.entities.Automation.list('-created_date'),
        base44.entities.Integration.filter({ is_active: true }),
        base44.entities.AutomationLog.list('-created_date', 50),
        base44.entities.ClientSettings.list()
      ]);
      setAutomations(automationsData);
      setIntegrations(integrationsData);
      setLogs(logsData);
      setClientSettings(clientSettingsData[0] || {});
      
      // טען תבניות חתימה דיגיטלית אם קיימות
      try {
        const templates = await base44.entities.SignedDocument.list();
        const uniqueTemplates = [...new Set(templates.map(t => t.template_id))].filter(Boolean);
        setDocumentTemplates(uniqueTemplates);
      } catch (error) {
        console.log('אין תבניות חתימה דיגיטלית');
      }
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || formData.steps.length === 0) {
        alert('חובה למלא שם ולפחות שלב אחד');
        return;
      }

      const automationData = { ...formData };

      if (editingAutomation) {
        await base44.entities.Automation.update(editingAutomation.id, automationData);
      } else {
        await base44.entities.Automation.create(automationData);
      }

      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('שגיאה בשמירת אוטומציה:', error);
      alert('שגיאה בשמירה: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק אוטומציה זו?')) return;

    try {
      await base44.entities.Automation.delete(id);
      await loadData();
    } catch (error) {
      console.error('שגיאה במחיקה:', error);
    }
  };

  const handleToggleActive = async (automation) => {
    try {
      await base44.entities.Automation.update(automation.id, {
        is_active: !automation.is_active
      });
      await loadData();
    } catch (error) {
      console.error('שגיאה בעדכון סטטוס:', error);
    }
  };

  const handleEdit = (automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description || '',
      trigger_type: automation.trigger_type,
      trigger_config: automation.trigger_config || {},
      steps: automation.steps || [],
      is_active: automation.is_active
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAutomation(null);
    setFormData({
      name: '',
      description: '',
      trigger_type: 'lead_created',
      trigger_config: {},
      steps: [],
      is_active: true
    });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          step_type: 'send_email',
          step_config: {},
          order: formData.steps.length
        }
      ]
    });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    if (field === 'step_type') {
      newSteps[index] = { ...newSteps[index], [field]: value, step_config: {} };
    } else {
      newSteps[index] = { ...newSteps[index], [field]: value };
    }
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStepConfig = (index, configKey, configValue) => {
    const newSteps = [...formData.steps];
    newSteps[index].step_config = {
      ...newSteps[index].step_config,
      [configKey]: configValue
    };
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const moveStep = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    newSteps.forEach((step, i) => {
      step.order = i;
    });

    setFormData({ ...formData, steps: newSteps });
  };

  const renderStepConfig = (step, index) => {
    const stepType = step.step_type;
    const config = step.step_config || {};

    switch (stepType) {
      case 'send_email':
        return (
          <div className="space-y-2">
            <div>
              <Label>נושא המייל</Label>
              <Input
                value={config.subject || ''}
                onChange={(e) => updateStepConfig(index, 'subject', e.target.value)}
                placeholder="נושא המייל"
              />
            </div>
            <div>
              <Label>תוכן המייל</Label>
              <Textarea
                value={config.body || ''}
                onChange={(e) => updateStepConfig(index, 'body', e.target.value)}
                placeholder="תוכן ההודעה (ניתן להשתמש ב-{{full_name}}, {{phone}}, וכו')"
                rows={4}
              />
            </div>
          </div>
        );

      case 'send_sms':
        return (
          <div>
            <Label>תוכן ההודעה</Label>
            <Textarea
              value={config.message || ''}
              onChange={(e) => updateStepConfig(index, 'message', e.target.value)}
              placeholder="תוכן ההודעה (ניתן להשתמש ב-{{full_name}}, {{phone}}, וכו')"
              rows={3}
            />
          </div>
        );

      case 'change_status':
        const statusOptions = clientSettings?.status_options || ['ליד', 'פולואפ', 'לקוח', 'לא נסגר'];
        return (
          <div>
            <Label>סטטוס חדש</Label>
            <Select
              value={config.new_status || ''}
              onValueChange={(value) => updateStepConfig(index, 'new_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'create_task':
        return (
          <div className="space-y-2">
            <div>
              <Label>כותרת המשימה</Label>
              <Input
                value={config.task_title || ''}
                onChange={(e) => updateStepConfig(index, 'task_title', e.target.value)}
                placeholder="כותרת המשימה"
              />
            </div>
            <div>
              <Label>תיאור המשימה</Label>
              <Textarea
                value={config.task_description || ''}
                onChange={(e) => updateStepConfig(index, 'task_description', e.target.value)}
                placeholder="תיאור המשימה"
                rows={2}
              />
            </div>
            <div>
              <Label>עדיפות</Label>
              <Select
                value={config.priority || 'בינונית'}
                onValueChange={(value) => updateStepConfig(index, 'priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="נמוכה">נמוכה</SelectItem>
                  <SelectItem value="בינונית">בינונית</SelectItem>
                  <SelectItem value="גבוהה">גבוהה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'create_case':
        return (
          <div className="space-y-2">
            <div>
              <Label>כותרת התיק</Label>
              <Input
                value={config.case_title || ''}
                onChange={(e) => updateStepConfig(index, 'case_title', e.target.value)}
                placeholder="כותרת התיק"
              />
            </div>
            <div>
              <Label>סוג תיק</Label>
              <Select
                value={config.case_type || ''}
                onValueChange={(value) => updateStepConfig(index, 'case_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג תיק" />
                </SelectTrigger>
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
          </div>
        );

      case 'add_note':
        return (
          <div>
            <Label>תוכן ההערה</Label>
            <Textarea
              value={config.note_text || ''}
              onChange={(e) => updateStepConfig(index, 'note_text', e.target.value)}
              placeholder="תוכן ההערה לתיעוד"
              rows={3}
            />
          </div>
        );

      case 'send_document':
        return (
          <div>
            <Label>מזהה תבנית מסמך</Label>
            <Input
              value={config.template_id || ''}
              onChange={(e) => updateStepConfig(index, 'template_id', e.target.value)}
              placeholder="מזהה התבנית לחתימה דיגיטלית"
            />
          </div>
        );

      case 'wait':
        return (
          <div className="space-y-2">
            <div>
              <Label>משך ההמתנה</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={config.wait_duration || 1}
                  onChange={(e) => updateStepConfig(index, 'wait_duration', parseInt(e.target.value))}
                  min="1"
                  className="w-20"
                />
                <Select
                  value={config.wait_unit || 'hours'}
                  onValueChange={(value) => updateStepConfig(index, 'wait_unit', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">דקות</SelectItem>
                    <SelectItem value="hours">שעות</SelectItem>
                    <SelectItem value="days">ימים</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'update_field':
        return (
          <div className="space-y-2">
            <div>
              <Label>שם השדה</Label>
              <Input
                value={config.field_name || ''}
                onChange={(e) => updateStepConfig(index, 'field_name', e.target.value)}
                placeholder="לדוגמה: notes, service_type"
              />
            </div>
            <div>
              <Label>ערך חדש</Label>
              <Input
                value={config.field_value || ''}
                onChange={(e) => updateStepConfig(index, 'field_value', e.target.value)}
                placeholder="הערך החדש לשדה"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTriggerConfig = () => {
    const triggerType = formData.trigger_type;

    switch (triggerType) {
      case 'integration_webhook':
        return (
          <div>
            <Label>אינטגרציה</Label>
            <Select
              value={formData.trigger_config.integration_id || ''}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  trigger_config: { ...formData.trigger_config, integration_id: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר אינטגרציה" />
              </SelectTrigger>
              <SelectContent>
                {integrations.map((int) => (
                  <SelectItem key={int.id} value={int.id}>
                    {int.integration_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'status_changed':
        return (
          <div className="space-y-2">
            <div>
              <Label>מסטטוס</Label>
              <Select
                value={formData.trigger_config.status_from || ''}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    trigger_config: { ...formData.trigger_config, status_from: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="כל סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>כל סטטוס</SelectItem>
                  <SelectItem value="ליד">ליד</SelectItem>
                  <SelectItem value="פולואפ">פולואפ</SelectItem>
                  <SelectItem value="לקוח">לקוח</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>לסטטוס</Label>
              <Select
                value={formData.trigger_config.status_to || ''}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    trigger_config: { ...formData.trigger_config, status_to: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סטטוס יעד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ליד">ליד</SelectItem>
                  <SelectItem value="פולואפ">פולואפ</SelectItem>
                  <SelectItem value="לקוח">לקוח</SelectItem>
                  <SelectItem value="לא נסגר">לא נסגר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3568AE]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* הסבר CRON Job */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">איך עובדות האוטומציות?</h3>
              <p className="text-sm text-blue-800">
                מערכת האוטומציות פועלת ברקע באמצעות Cron Jobs - משימות מתוזמנות שבודקות כל כמה דקות אם יש טריגרים שהופעלו (לקוח חדש, שינוי סטטוס וכו').
                כאשר טריגר מתקיים, המערכת מבצעת את כל השלבים שהגדרת באוטומציה בזה אחר זה, כולל המתנות בין שלבים.
              </p>
              <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                <li>הבדיקות מתבצעות אוטומטית כל 5 דקות</li>
                <li>כל אוטומציה רצה בנפרד ולא משפיעה על אחרות</li>
                <li>ניתן לעקוב אחר ביצוע בלשונית "היסטוריה"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="automations">אוטומציות</TabsTrigger>
            <TabsTrigger value="logs">היסטוריה</TabsTrigger>
          </TabsList>

          {selectedTab === 'automations' && (
            <Button
              className="bg-[#67BF91] hover:bg-[#5AA880]"
              onClick={() => {
                setEditingAutomation(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 ml-2" />
              אוטומציה חדשה
            </Button>
          )}
        </div>

        <TabsContent value="automations" className="space-y-4">
          {automations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">עדיין לא הוגדרו אוטומציות</p>
                <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 ml-2" />
                  צור אוטומציה ראשונה
                </Button>
              </CardContent>
            </Card>
          ) : (
            automations.map((automation) => {
              const trigger = TRIGGER_TYPES.find((t) => t.value === automation.trigger_type);
              return (
                <Card key={automation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{automation.name}</h3>
                          {automation.is_active ? (
                            <Badge className="bg-green-100 text-green-800">פעיל</Badge>
                          ) : (
                            <Badge variant="secondary">לא פעיל</Badge>
                          )}
                          <Badge variant="outline">
                            {automation.run_count || 0} ביצועים
                          </Badge>
                        </div>
                        {automation.description && (
                          <p className="text-sm text-gray-600 mb-2">{automation.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">טריגר:</span>
                          <span>{trigger?.label}</span>
                          <span className="mx-2">•</span>
                          <span>{automation.steps?.length || 0} שלבים</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(automation)}
                          title={automation.is_active ? 'השהה' : 'הפעל'}
                        >
                          {automation.is_active ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(automation)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(automation.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {logs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">אין היסטוריה של ביצועי אוטומציות</p>
              </CardContent>
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{log.automation_name}</span>
                        <Badge
                          className={
                            log.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : log.status === 'waiting'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {log.status === 'completed' ? 'הושלם' :
                           log.status === 'failed' ? 'נכשל' :
                           log.status === 'waiting' ? 'ממתין' : 'רץ'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>שלבים: {log.steps_completed}/{log.total_steps}</span>
                        {log.error_message && (
                          <span className="text-red-600 mr-2">• {log.error_message}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(log.created_date).toLocaleString('he-IL')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAutomation ? 'עריכת אוטומציה' : 'יצירת אוטומציה חדשה'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <Label>שם האוטומציה *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="לדוגמה: שליחת ברכה ללקוח חדש"
                />
              </div>

              <div>
                <Label>תיאור</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="תיאור האוטומציה"
                  rows={2}
                />
              </div>

              <div>
                <Label>טריגר (מה מפעיל את האוטומציה) *</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, trigger_type: value, trigger_config: {} })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderTriggerConfig()}

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>אוטומציה פעילה</Label>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">שלבי האוטומציה</h3>
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="w-4 h-4 ml-1" />
                  הוסף שלב
                </Button>
              </div>

              <div className="space-y-3">
                {formData.steps.map((step, index) => {
                  const stepType = STEP_TYPES.find((t) => t.value === step.step_type);
                  return (
                    <Card key={index} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">שלב {index + 1}</span>
                              <Badge variant="outline">{stepType?.label}</Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveStep(index, 'up')}
                                disabled={index === 0}
                                className="h-7 w-7"
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveStep(index, 'down')}
                                disabled={index === formData.steps.length - 1}
                                className="h-7 w-7"
                              >
                                ↓
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStep(index)}
                                className="text-red-500 hover:text-red-700 h-7 w-7"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label>סוג הפעולה</Label>
                            <Select
                              value={step.step_type}
                              onValueChange={(value) => updateStep(index, 'step_type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STEP_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {renderStepConfig(step, index)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {formData.steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    לא הוגדרו שלבים. לחץ על "הוסף שלב" להתחלה
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCloseDialog}>
                ביטול
              </Button>
              <Button onClick={handleSave} className="bg-[#67BF91] hover:bg-[#5AA880]">
                שמור אוטומציה
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}