import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ChevronDown, ChevronUp, AlertCircle, HelpCircle, Zap, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MakeIntegration({ integration, onConfigChange }) {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [fieldMappings, setFieldMappings] = useState(
    Array.isArray(integration.field_mapping) ? integration.field_mapping : []
  );

  const webhookUrl = `${window.location.origin}/functions/webhookReceiver?integration_id=${integration.integration_id}`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'webhook') {
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
      } else {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const systemFields = [
    { value: 'full_name', label: 'שם מלא' },
    { value: 'phone', label: 'טלפון' },
    { value: 'email', label: 'אימייל' },
    { value: 'service_type', label: 'סוג שירות' },
    { value: 'initial_need', label: 'צורך ראשוני' },
    { value: 'source', label: 'מקור' },
    { value: 'notes', label: 'הערות' }
  ];

  const addFieldMapping = () => {
    const newMappings = [...fieldMappings, { source: '', destination: 'full_name' }];
    setFieldMappings(newMappings);
    onConfigChange(null, newMappings, null);
  };

  const updateFieldMapping = (index, field, value) => {
    const newMappings = [...fieldMappings];
    newMappings[index][field] = value;
    setFieldMappings(newMappings);
    onConfigChange(null, newMappings, null);
  };

  const removeFieldMapping = (index) => {
    const newMappings = fieldMappings.filter((_, i) => i !== index);
    setFieldMappings(newMappings);
    onConfigChange(null, newMappings, null);
  };

  const generateExampleJson = () => {
    return JSON.stringify({
      full_name: "{{1.Field data: Full name}}",
      phone: "{{2.Number in E.164 format}}",
      email: "{{1.Field data: Email}}",
      source: "make_integration"
    }, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Webhook URL Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Zap className="w-5 h-5" />
            כתובת Webhook ל-Make
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-700 mb-3">
            העתק את הכתובת הזו ל-HTTP Module ב-Make:
          </p>
          <div className="flex gap-2">
            <Input 
              value={webhookUrl} 
              readOnly 
              className="font-mono text-sm bg-white border-purple-300"
              dir="ltr"
            />
            <Button 
              onClick={() => copyToClipboard(webhookUrl, 'webhook')}
              variant="outline"
              className="shrink-0 border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              {copiedWebhook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step by Step Instructions */}
      <Card className="border-blue-200">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          <CardTitle className="flex items-center justify-between text-blue-800">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              📋 הוראות שלב אחר שלב
            </span>
            {showInstructions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </CardTitle>
        </CardHeader>
        {showInstructions && (
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h4 className="font-bold text-blue-900">איך מחברים לקוח מ-Facebook/WordPress ל-CRM?</h4>
              
              <div className="space-y-3">
                {[
                  { step: '1', title: 'צור Scenario חדש ב-Make', desc: 'לך ל-Make.com → Scenarios → Create a new scenario' },
                  { step: '2', title: 'בחר Trigger (נקודת ההתחלה)', desc: 'לדוגמה: Facebook Lead Ads → Watch Leads' },
                  { step: '3', title: 'הפעל את ה-Trigger פעם אחת', desc: 'לחץ "Run this module only" כדי לראות את ה-Output Bundle' },
                  { step: '4', title: 'הוסף HTTP Module', desc: 'לחץ על ה-+ → בחר HTTP → Make a Request' },
                  { step: '5', title: 'הגדר את ה-HTTP Module', desc: 'URL: הדבק את ה-Webhook URL מלמעלה | Method: POST | Body Type: Raw (JSON)' },
                  { step: '6', title: 'בנה את ה-JSON Body', desc: 'השתמש בדוגמה למטה או בנה משלך' },
                  { step: '7', title: 'שמור והפעל!', desc: 'שמור את ה-Scenario והפעל אותו. הלקוח אמור להופיע ב-CRM תוך שניות!' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <Badge className={idx === 6 ? "bg-green-600 text-white" : "bg-blue-600 text-white"}>{item.step}</Badge>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Example JSON */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">💡 דוגמת JSON לשימוש</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">העתק והדבק ב-Request content ב-Make:</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => copyToClipboard(generateExampleJson(), 'json')}
            >
              {copiedJson ? <Check className="w-4 h-4 ml-1" /> : <Copy className="w-4 h-4 ml-1" />}
              העתק
            </Button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto" dir="ltr">
            {generateExampleJson()}
          </pre>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">חשוב מאוד!</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  לאחר שהדבקת את ה-JSON ב-Make, <strong>חייב למלא את הערכים עם הכפתור הכחול</strong>.
                  אל תשאיר את הטקסט {`{{1: Field data: ...}}`} כפי שהוא - זה רק placeholder!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Mapping */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>מיפוי שדות מתקדם</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fieldMappings.map((mapping, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label className="text-xs text-gray-500">שדה מ-Make *</Label>
                <Input
                  value={mapping.source}
                  onChange={(e) => updateFieldMapping(index, 'source', e.target.value)}
                  placeholder="לדוגמה: email, full_name"
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
                    {systemFields.map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFieldMapping(index)}
                className="shrink-0 text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addFieldMapping} className="w-full border-dashed">
            <Plus className="w-4 h-4 ml-2" />
            הוסף מיפוי שדה
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}