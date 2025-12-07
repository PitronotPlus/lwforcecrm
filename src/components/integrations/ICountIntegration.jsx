import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileText, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

export default function ICountIntegration({ integration, onConfigChange }) {
  const [config, setConfig] = useState(integration?.configuration || {
    cid: '',
    user: '',
    pass: '',
    default_doc_type: 'invoice_receipt',
    auto_send_email: true,
    currency: 'ILS'
  });

  useEffect(() => {
    onConfigChange(config);
  }, [config]);

  const documentTypes = [
    { value: 'invoice_receipt', label: 'חשבונית מס/קבלה' },
    { value: 'invoice', label: 'חשבונית מס' },
    { value: 'receipt', label: 'קבלה' },
    { value: 'credit_invoice', label: 'חשבונית זיכוי' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            אינטגרציה ל-iCount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">✨ מה האינטגרציה הזו עושה?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ הפקת חשבוניות מס, קבלות וחשבוניות מס/קבלה</li>
              <li>✓ יצירת קישורי תשלום ללקוחות</li>
              <li>✓ סליקת כרטיסי אשראי</li>
              <li>✓ ניהול לקוחות ומוצרים</li>
            </ul>
          </div>

          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              <strong>חשוב!</strong> הגדר ב-Dashboard → Environment Variables:
              <br />• ICOUNT_CID
              <br />• ICOUNT_USER
              <br />• ICOUNT_PASS
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>פרטי התחברות API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>מזהה חברה (CID)</Label>
              <Input
                value={config.cid}
                onChange={(e) => setConfig({ ...config, cid: e.target.value })}
                placeholder="your-company-id"
                dir="ltr"
              />
            </div>
            <div>
              <Label>שם משתמש (User)</Label>
              <Input
                value={config.user}
                onChange={(e) => setConfig({ ...config, user: e.target.value })}
                placeholder="username@email.com"
                dir="ltr"
              />
            </div>
            <div>
              <Label>סיסמה (Pass)</Label>
              <Input
                type="password"
                value={config.pass}
                onChange={(e) => setConfig({ ...config, pass: e.target.value })}
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות מסמכים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>סוג מסמך ברירת מחדל</Label>
              <Select 
                value={config.default_doc_type} 
                onValueChange={(v) => setConfig({ ...config, default_doc_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(doc => (
                    <SelectItem key={doc.value} value={doc.value}>
                      {doc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>מטבע</Label>
              <Select 
                value={config.currency} 
                onValueChange={(v) => setConfig({ ...config, currency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">שקל (ILS)</SelectItem>
                  <SelectItem value="USD">דולר (USD)</SelectItem>
                  <SelectItem value="EUR">אירו (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label>שליחת מייל אוטומטית ללקוח</Label>
            <Switch
              checked={config.auto_send_email}
              onCheckedChange={(checked) => setConfig({ ...config, auto_send_email: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {(config.cid && config.user && config.pass) && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">האינטגרציה מוכנה!</h4>
              <p className="text-sm text-green-700">לחץ על "שמור אינטגרציה" להפעלה.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}