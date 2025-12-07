import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, AlertCircle, ExternalLink, RefreshCw, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VoicecenterIntegration({ integration, onConfigChange }) {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const config = integration.configuration || {};

  const handleConfigChange = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const handleLoadCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const { voicecenterGetCampaigns } = await import('@/functions/voicecenterGetCampaigns');
      const response = await voicecenterGetCampaigns();
      if (response.data.success) {
        setCampaigns(response.data.campaigns);
        alert(response.data.campaigns.length > 0 
          ? `✅ נמצאו ${response.data.campaigns.length} קמפיינים פעילים`
          : '⚠️ לא נמצאו קמפיינים. צור קמפיין ב-Voicecenter תחילה.');
      } else {
        alert('❌ שגיאה: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      alert('❌ שגיאה בטעינת קמפיינים: ' + error.message);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Voicecenter Dialer API</strong> - מאפשר לך לנהל קמפיינים של חייגן אוטומטי, להוסיף יעדי שיחה ועוד.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-500" />
            הגדרות Voicecenter API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voicecenter-code">
              Voicecenter API Code <Badge variant="destructive" className="mr-2">חובה</Badge>
            </Label>
            <Input
              id="voicecenter-code"
              value={config.voicecenter_code || ''}
              onChange={(e) => handleConfigChange('voicecenter_code', e.target.value)}
              placeholder="הזן את קוד ה-API שלך מ-Voicecenter"
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              קוד זה נמצא בחשבון Voicecenter שלך תחת הגדרות API
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-campaign">
              Campaign Code (ברירת מחדל)
            </Label>
            <div className="flex gap-2">
              <Input
                id="default-campaign"
                value={config.default_campaign_code || ''}
                onChange={(e) => handleConfigChange('default_campaign_code', e.target.value)}
                placeholder="קוד קמפיין ברירת מחדל"
                className="font-mono flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadCampaigns}
                disabled={isLoadingCampaigns || !config.voicecenter_code}
              >
                {isLoadingCampaigns ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {campaigns.length > 0 && (
              <Select
                value={config.default_campaign_code || ''}
                onValueChange={(value) => handleConfigChange('default_campaign_code', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר קמפיין מהרשימה" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.Code} value={campaign.Code}>
                      {campaign.Name} - {campaign.TotalPendingCalls || 0} שיחות
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caller-id">Caller ID (ברירת מחדל)</Label>
            <Input
              id="caller-id"
              value={config.default_caller_id || ''}
              onChange={(e) => handleConfigChange('default_caller_id', e.target.value)}
              placeholder="למשל: 0722776772"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-lg">שיטות API זמינות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {['קבלת רשימת קמפיינים', 'הוספת יעד שיחה', 'הוספה המונית (עד 100,000)', 'הסרת יעד שיחה', 'התחלה/הפסקת קמפיין', 'יעדים ממתינים'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          
          <Button 
            asChild
            variant="outline" 
            size="sm"
            className="w-full mt-4"
          >
            <a 
              href="https://www.voicenter.com/API/Dialer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              תיעוד API המלא של Voicecenter
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}