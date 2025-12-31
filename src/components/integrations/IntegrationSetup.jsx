import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { Integration } from "@/entities/Integration";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WordPressIntegration from "./WordPressIntegration";
import MakeIntegration from "./MakeIntegration";
import CardcomIntegration from "./CardcomIntegration";
import ICountIntegration from "./ICountIntegration";
import VoicecenterIntegration from "./VoicecenterIntegration";

const generateId = () => `int_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;

export default function IntegrationSetup({ type, integration: initialIntegration, onClose, onSave, subAccountId = null }) {
  const [integration, setIntegration] = useState(
    initialIntegration || {
      name: "",
      type: type,
      status: 'active',
      integration_id: generateId(),
      configuration: {},
      field_mapping: [],
      automation_rules: {},
      sub_account_id: subAccountId
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!integration.name) {
        alert("שם האינטגרציה חובה.");
        setIsLoading(false);
        return;
      }
      
      if (!integration.id) { 
        const payload = {
          ...integration,
          configuration: {
            ...integration.configuration,
            webhook_url: `${window.location.origin}/functions/webhookReceiver`
          }
        };
        await Integration.create(payload);
        alert("אינטגרציה נוצרה בהצלחה!");
      } else {
        await Integration.update(integration.id, { ...integration, status: integration.status || 'active' });
        alert("אינטגרציה עודכנה בהצלחה!");
      }
      
      onSave();
    } catch (error) {
      console.error("שגיאה בשמירת האינטגרציה:", error);
      alert("שגיאה בשמירת האינטגרציה: " + (error.message || 'אנא נסה שוב'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfigChange = (newConfig, newFieldMapping, newAutomationRules) => {
    setIntegration(prev => {
      const updatedIntegration = { ...prev };
      if (newConfig) updatedIntegration.configuration = newConfig;
      if (newFieldMapping) updatedIntegration.field_mapping = newFieldMapping;
      if (newAutomationRules) updatedIntegration.automation_rules = newAutomationRules;
      return updatedIntegration;
    });
  };

  const renderIntegrationForm = () => {
    switch(type) {
      case 'make':
        return (
          <MakeIntegration
            integration={integration}
            onConfigChange={handleConfigChange}
          />
        );
      case 'voicecenter':
        return (
          <VoicecenterIntegration
            integration={integration}
            onConfigChange={handleConfigChange}
          />
        );
      case 'cardcom':
        return (
          <CardcomIntegration
            integration={integration}
            onConfigChange={handleConfigChange}
          />
        );
      case 'icount':
        return (
          <ICountIntegration
            integration={integration}
            onConfigChange={handleConfigChange}
          />
        );
      case 'wordpress_form': 
      case 'website_form':
      case 'webhook':
      case 'zapier':
        return (
          <WordPressIntegration 
            integration={integration} 
            onConfigChange={handleConfigChange}
          />
        );
      default: 
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p>סוג אינטגרציה לא נתמך: {type}</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Heebo' }}>הגדרת אינטגרציה</h2>
            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Heebo' }}>
              {type === 'make' && "חבר אוטומציות חכמות מ-Make ישירות ל-CRM."}
              {type === 'cardcom' && "חבר את המערכת לאישורית זהב לסליקת אשראי והפקת מסמכים."}
              {type === 'icount' && "חבר את המערכת ל-iCount להפקת חשבוניות וסליקה."}
              {type === 'voicecenter' && "חבר חייגן אוטומטי לניהול קמפיינים טלפוניים."}
              {type === 'wordpress_form' && "קבל לקוחות ישירות מוורדפרס או כל מערכת התומכת ב-Webhooks."}
              {type === 'website_form' && "קבל לקוחות מטפסים באתר שלך או ממקורות Webhook כלליים."}
              {type === 'webhook' && "קבל לקוחות מכל מערכת התומך ב-Webhooks."}
              {type === 'zapier' && "התחבר לאלפי אפליקציות דרך Zapier."}
            </p>
          </div>
        </DialogHeader>

        <main className="p-6 overflow-y-auto flex-1">
          <div className="space-y-2 mb-8">
            <Label htmlFor="integration-name" className="text-base font-semibold">
              שם האינטגרציה (לזיהוי פנימי)
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              לדוגמה: "טופס צור קשר מהאתר", "קמפיין פייסבוק יוני 2024".
            </p>
            <Input 
              id="integration-name"
              value={integration.name}
              onChange={(e) => setIntegration({ ...integration, name: e.target.value })}
              placeholder="הזן שם ברור לאינטגרציה"
              className="text-lg"
            />
          </div>

          {renderIntegrationForm()}
        </main>
        
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 ml-2 animate-spin"/> : <Save className="w-4 h-4 ml-2" />}
            שמור אינטגרציה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}