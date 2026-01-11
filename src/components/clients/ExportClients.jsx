import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ExportClients({ clients }) {
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
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

  const handleExport = () => {
    if (clients.length === 0) {
      alert('אין לקוחות לייצוא');
      return;
    }

    // הכנת הנתונים לייצוא - כולל שדות מותאמים
    const headers = [
      'שם מלא',
      'טלפון',
      'אימייל',
      'סוג שירות',
      'סטטוס',
      'צורך ראשוני',
      'מקור',
      'הערות',
      ...customFields.map(field => field.field_label),
      'תאריך יצירה'
    ];

    const csvRows = [headers.join(',')];

    clients.forEach(client => {
      const row = [
        client.full_name || '',
        client.phone || '',
        client.email || '',
        client.service_type || '',
        client.status || '',
        client.initial_need || '',
        client.source || '',
        (client.notes || '').replace(/,/g, ';').replace(/\n/g, ' '),
        ...customFields.map(field => client[field.field_name] || ''),
        new Date(client.created_date).toLocaleDateString('he-IL')
      ];
      csvRows.push(row.map(cell => `"${cell}"`).join(','));
    });

    // יצירת קובץ CSV
    const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM for Hebrew support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      ייצוא לקוחות
    </Button>
  );
}