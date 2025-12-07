import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, ExternalLink, AlertCircle, CheckCircle, FileText, DollarSign } from 'lucide-react';

export default function CardcomIntegration({ integration, onConfigChange }) {
  const [config, setConfig] = useState(integration?.configuration || {
    terminal_number: '',
    api_name: '',
    api_password: '',
    language: 'he',
    iso_coin_id: '1',
    operation: 'ChargeOnly',
    default_document_type: 'TaxInvoiceAndReceipt'
  });

  useEffect(() => {
    onConfigChange(config);
  }, [config]);

  const documentTypes = [
    { value: 'TaxInvoiceAndReceipt', label: 'חשבונית מס/קבלה' },
    { value: 'TaxInvoice', label: 'חשבונית מס' },
    { value: 'ReceiptForTaxInvoice', label: 'קבלה' },
    { value: 'TaxInvoiceRefund', label: 'חשבונית זיכוי' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-purple-600" />
            אינטגרציה לאישורית זהב (Cardcom)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-100 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">✨ מה האינטגרציה הזו עושה?</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>✓ יצירת דפי תשלום ללקוחות</li>
              <li>✓ הפקת מסמכים חשבונאיים</li>
              <li>✓ סנכרון אוטומטי עם מערכת ניהול החשבונות</li>
            </ul>
          </div>

          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              <strong>חשוב!</strong> לפני שתתחיל, הגדר ב-Dashboard → Environment Variables:
              <br />• CARDCOM_TERMINAL_NUMBER
              <br />• CARDCOM_API_NAME
              <br />• CARDCOM_API_PASSWORD
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>מספר מסוף (Terminal Number)</Label>
              <Input
                value={config.terminal_number}
                onChange={(e) => setConfig({ ...config, terminal_number: e.target.value })}
                placeholder="1000"
                dir="ltr"
              />
            </div>
            <div>
              <Label>שם משתמש API</Label>
              <Input
                value={config.api_name}
                onChange={(e) => setConfig({ ...config, api_name: e.target.value })}
                placeholder="test2025"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <Label>סיסמת API</Label>
            <Input
              type="password"
              value={config.api_password}
              onChange={(e) => setConfig({ ...config, api_password: e.target.value })}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>סוג מסמך ברירת מחדל</Label>
              <Select 
                value={config.default_document_type} 
                onValueChange={(v) => setConfig({ ...config, default_document_type: v })}
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
                value={config.iso_coin_id} 
                onValueChange={(v) => setConfig({ ...config, iso_coin_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">שקל (ILS)</SelectItem>
                  <SelectItem value="2">דולר (USD)</SelectItem>
                  <SelectItem value="978">אירו (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {(config.terminal_number && config.api_name && config.api_password) && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">האינטגרציה מוכנה!</h4>
              <p className="text-sm text-green-700">
                כל ההגדרות מולאו. לחץ על "שמור אינטגרציה" להפעלה.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}