import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImportClients({ onImportComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [customFields, setCustomFields] = useState([]);

  const systemFields = [
    { value: 'full_name', label: 'שם מלא', required: true },
    { value: 'phone', label: 'טלפון', required: true },
    { value: 'email', label: 'אימייל', required: false },
    { value: 'service_type', label: 'סוג שירות', required: false },
    { value: 'status', label: 'סטטוס', required: false },
    { value: 'initial_need', label: 'צורך ראשוני', required: false },
    { value: 'source', label: 'מקור', required: false },
    { value: 'notes', label: 'הערות', required: false }
  ];

  useEffect(() => {
    if (isOpen) {
      loadCustomFields();
    }
  }, [isOpen]);

  const loadCustomFields = async () => {
    try {
      const fields = await base44.entities.CustomField.filter({ 
        entity_type: 'Client',
        is_active: true 
      });
      setCustomFields(fields.map(f => ({
        value: f.field_name,
        label: f.field_label,
        required: f.is_required
      })));
    } catch (error) {
      console.error('שגיאה בטעינת שדות מותאמים:', error);
    }
  };

  const allFields = [...systemFields, ...customFields];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('יש להעלות קובץ CSV בלבד');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        alert('הקובץ ריק');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {});
      });

      setCsvHeaders(headers);
      setCsvData(data);
      
      // ניחוש אוטומטי של מיפוי
      const autoMapping = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('שם') || lowerHeader.includes('name')) {
          autoMapping[header] = 'full_name';
        } else if (lowerHeader.includes('טלפון') || lowerHeader.includes('phone')) {
          autoMapping[header] = 'phone';
        } else if (lowerHeader.includes('מייל') || lowerHeader.includes('email')) {
          autoMapping[header] = 'email';
        } else if (lowerHeader.includes('שירות') || lowerHeader.includes('service')) {
          autoMapping[header] = 'service_type';
        } else if (lowerHeader.includes('סטטוס') || lowerHeader.includes('status')) {
          autoMapping[header] = 'status';
        }
      });
      setFieldMapping(autoMapping);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    // בדיקת שדות חובה
    const requiredFields = allFields.filter(f => f.required);
    const mappedSystemFields = Object.values(fieldMapping);
    
    const missingRequired = requiredFields.filter(
      field => !mappedSystemFields.includes(field.value)
    );

    if (missingRequired.length > 0) {
      alert(`חסרים שדות חובה: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const clientsToImport = csvData.map(row => {
        const client = {};
        Object.entries(fieldMapping).forEach(([csvField, systemField]) => {
          if (systemField && row[csvField]) {
            client[systemField] = row[csvField];
          }
        });
        // ברירת מחדל לסטטוס
        if (!client.status) {
          client.status = 'ליד';
        }
        return client;
      });

      // ייבוא בקבוצות של 10
      let imported = 0;
      let failed = 0;
      
      for (let i = 0; i < clientsToImport.length; i += 10) {
        const batch = clientsToImport.slice(i, i + 10);
        try {
          await base44.entities.Client.bulkCreate(batch);
          imported += batch.length;
        } catch (error) {
          console.error('שגיאה בייבוא קבוצה:', error);
          failed += batch.length;
        }
      }

      setImportResult({ imported, failed, total: clientsToImport.length });
      
      if (failed === 0) {
        setTimeout(() => {
          setIsOpen(false);
          onImportComplete();
          resetState();
        }, 2000);
      }
    } catch (error) {
      console.error('שגיאה בייבוא:', error);
      alert('שגיאה בייבוא הלקוחות');
    } finally {
      setImporting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setFieldMapping({});
    setImportResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          ייבוא לקוחות
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ייבוא לקוחות מקובץ CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* העלאת קובץ */}
          {!file && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-4">
                גרור קובץ CSV לכאן או לחץ לבחירה
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" asChild>
                  <span>בחר קובץ CSV</span>
                </Button>
              </label>
            </div>
          )}

          {/* מיפוי שדות */}
          {file && csvHeaders.length > 0 && !importResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {csvData.length} שורות | {csvHeaders.length} עמודות
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetState}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <AlertCircle className="w-4 h-4 inline ml-2" />
                  מפה את העמודות מהקובץ לשדות במערכת. שדות חובה מסומנים ב-*
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">מיפוי שדות</h3>
                {csvHeaders.map((header) => (
                  <div key={header} className="grid grid-cols-2 gap-4 items-center">
                    <div className="text-sm font-medium bg-gray-100 p-2 rounded">
                      {header}
                    </div>
                    <Select
                      value={fieldMapping[header] || ''}
                      onValueChange={(value) => 
                        setFieldMapping({ ...fieldMapping, [header]: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר שדה מערכת" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>אל תייבא</SelectItem>
                        {allFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label} {field.required && '*'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={resetState}>
                  ביטול
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-[#67BF91] hover:bg-[#5AA880]"
                >
                  {importing ? 'מייבא...' : `ייבא ${csvData.length} לקוחות`}
                </Button>
              </div>
            </div>
          )}

          {/* תוצאות ייבוא */}
          {importResult && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">הייבוא הושלם!</h3>
              <div className="space-y-1 text-sm">
                <p>סה"כ: {importResult.total} לקוחות</p>
                <p className="text-green-600">יובאו בהצלחה: {importResult.imported}</p>
                {importResult.failed > 0 && (
                  <p className="text-red-600">נכשלו: {importResult.failed}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}