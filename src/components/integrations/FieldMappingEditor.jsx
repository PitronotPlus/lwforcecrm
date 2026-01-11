import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FieldMappingEditor({ initialMapping, onMappingChange }) {
  const [fieldMappings, setFieldMappings] = React.useState(initialMapping || []);
  const [customFields, setCustomFields] = React.useState([]);

  React.useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      const fields = await base44.entities.CustomField.filter({ entity_type: 'Client', is_active: true });
      setCustomFields(fields);
    } catch (error) {
      console.error('שגיאה בטעינת שדות מותאמים:', error);
    }
  };

  const systemFields = [
    { value: 'full_name', label: 'שם מלא', group: 'system' },
    { value: 'phone', label: 'טלפון', group: 'system' },
    { value: 'email', label: 'אימייל', group: 'system' },
    { value: 'service_type', label: 'סוג שירות', group: 'system' },
    { value: 'initial_need', label: 'צורך ראשוני', group: 'system' },
    { value: 'source', label: 'מקור', group: 'system' },
    { value: 'notes', label: 'הערות', group: 'system' }
  ];

  const allFields = [
    ...systemFields,
    ...customFields.map(field => ({
      value: `custom_${field.field_name}`,
      label: `${field.field_label} (מותאם)`,
      group: 'custom'
    }))
  ];

  const addFieldMapping = () => {
    const newMappings = [...fieldMappings, { source: '', destination: 'full_name' }];
    setFieldMappings(newMappings);
    onMappingChange(newMappings);
  };

  const updateFieldMapping = (index, field, value) => {
    const newMappings = [...fieldMappings];
    newMappings[index][field] = value;
    setFieldMappings(newMappings);
    onMappingChange(newMappings);
  };

  const removeFieldMapping = (index) => {
    const newMappings = fieldMappings.filter((_, i) => i !== index);
    setFieldMappings(newMappings);
    onMappingChange(newMappings);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>מיפוי שדות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          קבע איזה שדות מהמקור החיצוני מתאימים לאיזה שדות במערכת
        </p>

        {fieldMappings.map((mapping, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label className="text-xs text-gray-500">שדה מהמקור *</Label>
              <Input
                value={mapping.source}
                onChange={(e) => updateFieldMapping(index, 'source', e.target.value)}
                placeholder="לדוגמה: email, name, phone"
                className="mt-1"
                dir="ltr"
              />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="flex-1">
              <Label className="text-xs text-gray-500">שדה במערכת *</Label>
              <Select
                value={mapping.destination}
                onValueChange={(value) => updateFieldMapping(index, 'destination', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">שדות מערכת</div>
                  {systemFields.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                  {customFields.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-t mt-1">שדות מותאמים אישית</div>
                      {customFields.map(field => (
                        <SelectItem key={`custom_${field.field_name}`} value={`custom_${field.field_name}`}>
                          {field.field_label} (מותאם)
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFieldMapping(index)}
              className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addFieldMapping}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 ml-2" />
          הוסף מיפוי שדה
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📌 הוראות למיפוי:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>שדה מהמקור:</strong> הכנס את שם השדה כפי שהוא מגיע מהמקור החיצוני</li>
            <li><strong>שדה במערכת:</strong> בחר לאן הנתון יישמר במערכת</li>
            <li>חובה למפות לפחות שדה אחד: <code className="bg-blue-100 px-1 rounded">phone</code> או <code className="bg-blue-100 px-1 rounded">email</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}