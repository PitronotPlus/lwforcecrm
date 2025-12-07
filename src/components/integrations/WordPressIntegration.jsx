import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Webhook } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FieldMappingEditor from "./FieldMappingEditor";

export default function WordPressIntegration({ integration, onConfigChange }) {
  const [config, setConfig] = useState(integration?.configuration || {});
  const [fieldMapping, setFieldMapping] = useState(integration?.field_mapping || []);

  const webhookUrl = `${window.location.origin}/functions/webhookReceiver?integration_id=${integration?.integration_id}`;

  useEffect(() => {
    onConfigChange(
      { ...config, webhook_url: webhookUrl },
      fieldMapping,
      null
    );
  }, [config, fieldMapping]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('הועתק ללוח!');
  };

  return (
    <div className="space-y-6">
      {/* Webhook URL */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            כתובת Webhook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Webhook className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-semibold">העתק את הכתובת הזו והדבק אותה בהגדרות הטופס:</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded border font-mono text-sm overflow-x-auto">
                  <span className="flex-1 break-all">{webhookUrl}</span>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookUrl)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                  <strong>⚠️ חשוב:</strong> וודא שהכתובת כוללת את integration_id בסוף. 
                  <br/>אם הטופס לא שולח את השדות בשמות הסטנדרטיים (full_name, email, phone), 
                  הגדר מיפוי שדות למטה.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Field Mapping */}
      <FieldMappingEditor 
        initialMapping={fieldMapping}
        onMappingChange={setFieldMapping}
      />

      {/* Instructions */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-800">📋 הוראות שימוש</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-900 space-y-3">
          <div className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>העתק את כתובת ה-Webhook למעלה (כולל integration_id)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>הדבק אותה בהגדרות הטופס (בסעיף "Webhook" או "Actions after submit")</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>אם הטופס משתמש בשמות שדות לא סטנדרטיים - הגדר מיפוי שדות למעלה</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>שמור את האינטגרציה ובדוק את הטופס - הלקוח אמור להופיע ב-CRM תוך שניות</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}