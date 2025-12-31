import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical, Save, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FIELD_TYPES = [
  { value: 'text', label: 'טקסט' },
  { value: 'number', label: 'מספר' },
  { value: 'date', label: 'תאריך' },
  { value: 'select', label: 'בחירה מרשימה' },
  { value: 'textarea', label: 'טקסט ארוך' },
  { value: 'checkbox', label: 'תיבת סימון' }
];

export default function CustomFieldsManager({ subAccountId = null }) {
  const [customFields, setCustomFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    field_options: [],
    is_required: false,
    default_value: '',
    is_active: true,
    entity_type: 'Client'
  });

  useEffect(() => {
      loadCustomFields();
  }, [subAccountId]);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      const fields = await base44.entities.CustomField.filter({ entity_type: 'Client' }, 'order');
      setCustomFields(fields);
    } catch (error) {
      console.error('שגיאה בטעינת שדות:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // המרת שם השדה לאנגלית עם _ במקום רווחים
      const sanitizedFieldName = formData.field_name.trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      const fieldData = {
        ...formData,
        field_name: sanitizedFieldName || `custom_${Date.now()}`,
        order: editingField ? editingField.order : customFields.length
      };

      if (editingField) {
        await base44.entities.CustomField.update(editingField.id, fieldData);
      } else {
        await base44.entities.CustomField.create(fieldData);
      }

      await loadCustomFields();
      handleCloseDialog();
    } catch (error) {
      console.error('שגיאה בשמירת שדה:', error);
      alert('שגיאה בשמירת השדה: ' + error.message);
    }
  };

  const handleDelete = async (fieldId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק שדה זה?')) return;

    try {
      await base44.entities.CustomField.delete(fieldId);
      await loadCustomFields();
    } catch (error) {
      console.error('שגיאה במחיקת שדה:', error);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      field_options: field.field_options || [],
      is_required: field.is_required,
      default_value: field.default_value || '',
      is_active: field.is_active,
      entity_type: field.entity_type
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingField(null);
    setFormData({
      field_name: '',
      field_label: '',
      field_type: 'text',
      field_options: [],
      is_required: false,
      default_value: '',
      is_active: true,
      entity_type: 'Client'
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      field_options: [...formData.field_options, '']
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.field_options];
    newOptions[index] = value;
    setFormData({ ...formData, field_options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = formData.field_options.filter((_, i) => i !== index);
    setFormData({ ...formData, field_options: newOptions });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Heebo' }}>שדות מותאמים אישית</h2>
          <p className="text-sm text-gray-600">נהל שדות נוספים שיופיעו בכרטיסי לקוחות ובאינטגרציות</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#67BF91] hover:bg-[#5AA880]" onClick={() => setEditingField(null)}>
              <Plus className="w-4 h-4 ml-2" />
              שדה חדש
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingField ? 'עריכת שדה' : 'יצירת שדה חדש'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>שם השדה (אנגלית) *</Label>
                  <Input
                    value={formData.field_name}
                    onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                    placeholder="לדוגמה: company_name"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">ייעשה שימוש באותיות קטנות ו-_ בלבד</p>
                </div>

                <div>
                  <Label>תווית השדה (עברית) *</Label>
                  <Input
                    value={formData.field_label}
                    onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                    placeholder="לדוגמה: שם החברה"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>סוג השדה</Label>
                  <Select
                    value={formData.field_type}
                    onValueChange={(value) => setFormData({ ...formData, field_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>ערך ברירת מחדל</Label>
                  <Input
                    value={formData.default_value}
                    onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
                    placeholder="אופציונלי"
                  />
                </div>
              </div>

              {formData.field_type === 'select' && (
                <div>
                  <Label>אפשרויות לבחירה</Label>
                  <div className="space-y-2 mt-2">
                    {formData.field_options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`אפשרות ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      הוסף אפשרות
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                  />
                  <Label>שדה חובה</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>פעיל</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseDialog}>
                  ביטול
                </Button>
                <Button onClick={handleSave} className="bg-[#67BF91] hover:bg-[#5AA880]">
                  <Save className="w-4 h-4 ml-2" />
                  שמור
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {customFields.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">עדיין לא הוגדרו שדות מותאמים אישית</p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="w-4 h-4 ml-2" />
                צור שדה ראשון
              </Button>
            </CardContent>
          </Card>
        ) : (
          customFields.map((field) => (
            <Card key={field.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{field.field_label}</span>
                        <Badge variant="outline" className="text-xs">
                          {FIELD_TYPES.find(t => t.value === field.field_type)?.label}
                        </Badge>
                        {field.is_required && (
                          <Badge className="bg-red-100 text-red-800 text-xs">חובה</Badge>
                        )}
                        {!field.is_active && (
                          <Badge variant="secondary" className="text-xs">לא פעיל</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        שם שדה: <code className="bg-gray-100 px-1 rounded">{field.field_name}</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(field)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}