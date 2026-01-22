import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Upload,
  FileText,
  Type,
  Calendar,
  PenTool,
  CheckSquare,
  X,
  Save,
  Settings,
  Loader2,
  Eye
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FIELD_TYPES = [
  { id: 'signature', label: 'חתימה', icon: PenTool, color: 'bg-blue-500' },
  { id: 'text', label: 'טקסט', icon: Type, color: 'bg-green-500' },
  { id: 'date', label: 'תאריך', icon: Calendar, color: 'bg-purple-500' },
  { id: 'checkbox', label: 'תיבת סימון ✓', icon: CheckSquare, color: 'bg-orange-500' }
];

export default function TemplateEditor({ template, onSave, onCancel }) {
  const [templateData, setTemplateData] = useState({
    name: template?.name || '',
    original_pdf_url: template?.original_pdf_url || '',
    page_image_urls: template?.page_image_urls || [],
    fields: template?.fields || [],
    email_subject: template?.email_subject || 'בקשה לחתימה דיגיטלית',
    email_body: template?.email_body || 'שלום,\n\nאנא חתמו על המסמך המצורף.\n\nתודה רבה!'
  });

  const [selectedFieldType, setSelectedFieldType] = useState('signature');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRasterizing, setIsRasterizing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);
  
  const [selectedField, setSelectedField] = useState(null);
  const [showFieldSettings, setShowFieldSettings] = useState(false);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartCoords, setResizeStartCoords] = useState({ x: 0, y: 0 });
  const [resizeStartField, setResizeStartField] = useState(null);
  const [activeHandle, setActiveHandle] = useState(null);

  const [isDraggingField, setIsDraggingField] = useState(false);
  const [dragStartInfo, setDragStartInfo] = useState({ x: 0, y: 0, fieldX: 0, fieldY: 0, fieldId: null });

  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const fileInputRef = useRef();
  const imageContainerRef = useRef();
  const viewerContainerRef = useRef();

  const MIN_FIELD_WIDTH = 2;
  const MIN_FIELD_HEIGHT = 2;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setIsPdfJsLoaded(true);
      } else {
        setUploadError("Failed to load PDF processing library. Please try again or refresh.");
      }
    };
    script.onerror = () => {
      setUploadError("Failed to load PDF processing library. Check your internet connection.");
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const updateField = useCallback((fieldId, updates) => {
    setTemplateData(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    }));
    setSelectedField(prev => prev && prev.id === fieldId ? { ...prev, ...updates } : prev);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !resizeStartField || !imageContainerRef.current) return;

      const containerRect = imageContainerRef.current.getBoundingClientRect();
      const deltaX_px = e.clientX - resizeStartCoords.x;
      const deltaY_px = e.clientY - resizeStartCoords.y;

      const deltaX_perc = (deltaX_px / containerRect.width) * 100;
      const deltaY_perc = (deltaY_px / containerRect.height) * 100;

      let newWidth = resizeStartField.width;
      let newHeight = resizeStartField.height;
      let newX = resizeStartField.x;
      let newY = resizeStartField.y;

      switch (activeHandle) {
        case 'br':
          newWidth = resizeStartField.width + deltaX_perc;
          newHeight = resizeStartField.height + deltaY_perc;
          break;
        case 'bl':
          newWidth = resizeStartField.width - deltaX_perc;
          newHeight = resizeStartField.height + deltaY_perc;
          newX = resizeStartField.x + deltaX_perc;
          break;
        case 'tr':
          newWidth = resizeStartField.width + deltaX_perc;
          newHeight = resizeStartField.height - deltaY_perc;
          newY = resizeStartField.y + deltaY_perc;
          break;
        case 'tl':
          newWidth = resizeStartField.width - deltaX_perc;
          newHeight = resizeStartField.height - deltaY_perc;
          newX = resizeStartField.x + deltaX_perc;
          newY = resizeStartField.y + deltaY_perc;
          break;
        default:
          break;
      }

      newWidth = Math.max(MIN_FIELD_WIDTH, newWidth);
      newHeight = Math.max(MIN_FIELD_HEIGHT, newHeight);
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      newX = Math.min(newX, 100 - newWidth);
      newY = Math.min(newY, 100 - newHeight);
      newWidth = Math.min(newWidth, 100 - newX);
      newHeight = Math.min(newHeight, 100 - newY);

      updateField(resizeStartField.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setActiveHandle(null);
      setResizeStartCoords({ x: 0, y: 0 });
      setResizeStartField(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartCoords, resizeStartField, activeHandle, updateField]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingField || !dragStartInfo.fieldId || !imageContainerRef.current) return;

      const containerRect = imageContainerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX_px = clientX - dragStartInfo.x;
      const deltaY_px = clientY - dragStartInfo.y;

      const deltaX_perc = (deltaX_px / containerRect.width) * 100;
      const deltaY_perc = (deltaY_px / containerRect.height) * 100;

      let newX = dragStartInfo.fieldX + deltaX_perc;
      let newY = dragStartInfo.fieldY + deltaY_perc;

      const field = templateData.fields.find(f => f.id === dragStartInfo.fieldId);
      if (!field) return;

      newX = Math.max(0, Math.min(100 - field.width, newX));
      newY = Math.max(0, Math.min(100 - field.height, newY));

      updateField(dragStartInfo.fieldId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDraggingField(false);
      setDragStartInfo({ x: 0, y: 0, fieldX: 0, fieldY: 0, fieldId: null });
    };

    if (isDraggingField) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingField, dragStartInfo, templateData.fields, updateField]);

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setUploadError('אנא בחר קובץ PDF בלבד.');
      return;
    }
    if (!isPdfJsLoaded) {
      setUploadError('ספריית PDF עדיין בטעינה, נסה שוב בעוד מספר שניות.');
      return;
    }

    setIsUploading(true);
    setIsRasterizing(false);
    setUploadError(null);
    setPageNum(1);
    setSelectedField(null);
    setShowFieldSettings(false);

    try {
      const originalPdfUploadResult = await base44.integrations.Core.UploadFile({ file });
      
      const fileNameWithoutExt = file.name.replace(/\.pdf$/, '');
      setTemplateData(prev => ({ 
        ...prev, 
        original_pdf_url: originalPdfUploadResult.file_url, 
        name: prev.name || fileNameWithoutExt,
        page_image_urls: [],
        fields: prev.fields.map(f => ({ ...f, page: 1 }))
      }));
      
      setIsUploading(false);
      setIsRasterizing(true);

      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        try {
          const pdfData = new Uint8Array(event.target.result);
          const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
          const numPages = pdf.numPages;
          const pageImageUrls = [];
          
          const DPI = 150; 
          const OUTPUT_SCALE = DPI / 96;

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: OUTPUT_SCALE });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const imageFile = new File([blob], `page-${i}.png`, { type: 'image/png' });
            
            const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
            pageImageUrls.push(file_url);
            
            setTemplateData(prev => ({
                ...prev,
                page_image_urls: [...pageImageUrls]
            }));
          }
          setIsRasterizing(false);
        } catch (rasterError) {
           console.error('שגיאה בהמרת PDF לתמונה:', rasterError);
           setUploadError(`שגיאה בהמרת PDF: ${rasterError.message}. נסה שוב עם קובץ אחר.`);
           setIsRasterizing(false);
           setTemplateData(prev => ({ ...prev, page_image_urls: [] }));
        }
      };
      fileReader.readAsArrayBuffer(file);

    } catch (error) {
      console.error('שגיאה בתהליך העלאת ועיבוד הקובץ:', error);
      setUploadError(`אירעה שגיאה בעיבוד הקובץ: ${error.message}`);
      setIsUploading(false);
      setIsRasterizing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleCanvasClick = (e) => {
    if (!selectedFieldType || !imageContainerRef.current || isResizing || isDraggingField) return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const isSignature = selectedFieldType === 'signature';
    const isCheckbox = selectedFieldType === 'checkbox';
    
    const newField = {
      id: Date.now().toString(),
      type: selectedFieldType,
      page: pageNum,
      x: Math.max(0, Math.min(100 - (isSignature ? 15 : isCheckbox ? 2 : 10), x)),
      y: Math.max(0, Math.min(100 - (isSignature ? 6 : isCheckbox ? 2 : 4), y)),
      width: isSignature ? 15 : isCheckbox ? 2 : 10,
      height: isSignature ? 6 : isCheckbox ? 2 : 4,
      label: `${FIELD_TYPES.find(f => f.id === selectedFieldType)?.label} ${templateData.fields.filter(f => f.type === selectedFieldType).length + 1}`,
      required: isSignature
    };

    setTemplateData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setSelectedField(newField);
    setShowFieldSettings(true);
  };

  const removeField = (fieldId) => {
    setTemplateData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
    setSelectedField(null);
    setShowFieldSettings(false);
  };

  const handleFieldClick = (field, e) => {
    e.stopPropagation();
    setSelectedField(field);
    setShowFieldSettings(true);
  };

  const startDrag = (e, field) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target;
    if (target.classList.contains('resize-handle')) {
        return;
    }

    setIsDraggingField(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setDragStartInfo({
        x: clientX,
        y: clientY,
        fieldX: field.x,
        fieldY: field.y,
        fieldId: field.id
    });
    
    setSelectedField(field);
    setShowFieldSettings(true);
  };

  const startResize = (e, handleType, field) => {
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(handleType);
    setResizeStartCoords({ x: e.clientX, y: e.clientY });
    setResizeStartField({ ...field });
    setSelectedField(field);
    setShowFieldSettings(true);
  };

  const handleSave = async () => {
    if (!templateData.name || !templateData.original_pdf_url || templateData.page_image_urls.length === 0) {
      alert('אנא העלה קובץ PDF ומלא את שם התבנית.');
      return;
    }
    try {
      const user = await base44.auth.me();
      onSave({
        ...templateData,
        sub_account_id: user.sub_account_id
      });
    } catch (error) {
      alert('שגיאה בשמירת התבנית');
      console.error('Error:', error);
    }
  };

  const handleGeneratePreview = async () => {
    if (!templateData.original_pdf_url || templateData.fields.length === 0) {
      alert('אנא העלה PDF והוסף לפחות שדה אחד לפני התצוגה המקדימה');
      return;
    }

    setIsGeneratingPreview(true);
    try {
      const response = await base44.functions.invoke('previewTemplate', {
        template: templateData
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('שגיאה ביצירת תצוגה מקדימה: ' + error.message);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setShowPreview(false);
    setPreviewUrl(null);
  };

  const changePage = (delta) => {
    if (templateData.page_image_urls.length === 0) return;
    const newPageNum = pageNum + delta;
    if (newPageNum >= 1 && newPageNum <= templateData.page_image_urls.length) {
      setPageNum(newPageNum);
      if (selectedField && selectedField.page !== newPageNum) {
        setSelectedField(null);
        setShowFieldSettings(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full max-w-7xl h-full sm:h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-bold">
            {template ? 'עריכת תבנית' : 'יצירת תבנית חדשה'}
          </h2>
          <div className="flex items-center gap-1 sm:gap-2">
            {templateData.original_pdf_url && templateData.fields.length > 0 && (
              <Button
                onClick={handleGeneratePreview}
                disabled={isGeneratingPreview}
                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                size="sm"
              >
                {isGeneratingPreview ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 animate-spin" />
                    <span className="hidden sm:inline">יוצר תצוגה...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    <span className="hidden sm:inline">תצוגה מקדימה</span>
                    <span className="sm:hidden">תצוגה</span>
                  </>
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-l p-3 sm:p-6 overflow-y-auto max-h-[40vh] md:max-h-none">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">פרטי התבנית</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>שם התבנית</Label>
                    <Input
                      value={templateData.name}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="לדוגמה: חוזה שירות"
                    />
                  </div>

                  <div>
                    <Label>קובץ PDF</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setIsDragging(true)}
                      onDragLeave={() => setIsDragging(false)}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        {isUploading ? 'מעלה PDF מקורי...' : 
                         isRasterizing ? `ממיר עמוד ${templateData.page_image_urls.length + 1}...` : 
                         'גרור קובץ PDF או לחץ להעלאה'}
                      </p>
                      {(isUploading || isRasterizing) && <Loader2 className="w-6 h-6 mx-auto text-gray-400 animate-spin mt-2" />}
                      {templateData.original_pdf_url && !isUploading && !isRasterizing && (
                        <p className="text-xs text-gray-500 mt-2">
                          קובץ נוכחי: {templateData.name || templateData.original_pdf_url.split('/').pop()}
                        </p>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                      />
                    </div>
                    {uploadError && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">
                        {uploadError}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {templateData.page_image_urls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">שדות לחתימה</CardTitle>
                    <p className="text-sm text-gray-600">לחץ על סוג השדה ואז על המסמך למיקום</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.map((fieldType) => (
                        <Button
                          key={fieldType.id}
                          variant={selectedFieldType === fieldType.id ? "default" : "outline"}
                          className={`p-3 h-auto flex-col gap-2 ${
                            selectedFieldType === fieldType.id ? fieldType.color : ''
                          }`}
                          onClick={() => setSelectedFieldType(fieldType.id)}
                        >
                          <fieldType.icon className="w-5 h-5" />
                          <span className="text-xs">{fieldType.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {showFieldSettings && selectedField && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      הגדרות שדה
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>תווית השדה</Label>
                      <Input
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>רוחב (%)</Label>
                        <Input
                          type="number"
                          min={MIN_FIELD_WIDTH}
                          max={100 - selectedField.x}
                          value={Math.round(selectedField.width)}
                          onChange={(e) => {
                            let val = parseFloat(e.target.value);
                            if (isNaN(val)) val = MIN_FIELD_WIDTH;
                            val = Math.max(MIN_FIELD_WIDTH, Math.min(100 - selectedField.x, val));
                            updateField(selectedField.id, { width: val });
                          }}
                        />
                      </div>
                      <div>
                        <Label>גובה (%)</Label>
                        <Input
                          type="number"
                          min={MIN_FIELD_HEIGHT}
                          max={100 - selectedField.y}
                          value={Math.round(selectedField.height)}
                          onChange={(e) => {
                            let val = parseFloat(e.target.value);
                            if (isNaN(val)) val = MIN_FIELD_HEIGHT;
                            val = Math.max(MIN_FIELD_HEIGHT, Math.min(100 - selectedField.y, val));
                            updateField(selectedField.id, { height: val });
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={selectedField.required}
                        onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="required">שדה חובה</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowFieldSettings(false);
                          setSelectedField(null);
                        }}
                      >
                        סגור
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeField(selectedField.id)}
                      >
                        מחק שדה
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {templateData.fields.filter(f => f.page === pageNum).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">שדות בעמוד הנוכחי</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {templateData.fields.filter(f => f.page === pageNum).map((field) => {
                        const fieldType = FIELD_TYPES.find(f => f.id === field.type);
                        return (
                          <div
                            key={field.id}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              selectedField?.id === field.id ? 'bg-emerald-100 border border-emerald-300' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={(e) => handleFieldClick(field, e)}
                          >
                            <div className="flex items-center gap-2">
                              {fieldType && <fieldType.icon className="w-4 h-4" />}
                              <span className="text-sm">{field.label}</span>
                              {field.required && <span className="text-red-500 text-xs">*</span>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeField(field.id);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">הגדרות מייל</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>נושא המייל</Label>
                    <Input
                      value={templateData.email_subject}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, email_subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>תוכן המייל</Label>
                    <Textarea
                      value={templateData.email_body}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, email_body: e.target.value }))}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div ref={viewerContainerRef} className="flex-1 p-3 sm:p-6 overflow-auto bg-gray-50">
            {templateData.page_image_urls.length > 0 ? (
                <div className="flex flex-col items-center">
                  {templateData.page_image_urls.length > 1 && (
                    <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changePage(-1)}
                        disabled={pageNum <= 1}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">עמוד קודם</span>
                        <span className="sm:hidden">קודם</span>
                      </Button>
                      <span className="text-xs sm:text-sm whitespace-nowrap">
                        עמוד {pageNum} מתוך {templateData.page_image_urls.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changePage(1)}
                        disabled={pageNum >= templateData.page_image_urls.length}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">עמוד הבא</span>
                        <span className="sm:hidden">הבא</span>
                      </Button>
                    </div>
                  )}
                  <div
                    ref={imageContainerRef}
                    className="relative bg-white shadow-lg cursor-crosshair mx-auto"
                    onClick={handleCanvasClick}
                  >
                    <img 
                      src={templateData.page_image_urls[pageNum - 1]} 
                      alt={`עמוד ${pageNum}`}
                      className="block w-full h-auto"
                    />
                    {templateData.fields
                      .filter(field => field.page === pageNum)
                      .map((field) => {
                        const fieldType = FIELD_TYPES.find(f => f.id === field.type);
                        const isSelected = selectedField?.id === field.id;
                        
                        return (
                          <div
                            key={field.id}
                            className={`absolute border-2 flex items-center justify-center transition-all cursor-move ${
                              isSelected
                                ? 'border-solid border-emerald-500 bg-emerald-100/80 shadow-lg'
                                : `border-dashed border-${fieldType.color.replace('bg-', '')} bg-opacity-20 hover:bg-opacity-40`
                            }`}
                            style={{
                              left: `${field.x}%`,
                              top: `${field.y}%`,
                              width: `${field.width}%`,
                              height: `${field.height}%`,
                            }}
                            onClick={(e) => handleFieldClick(field, e)}
                            onMouseDown={(e) => startDrag(e, field)}
                            onTouchStart={(e) => startDrag(e, field)}
                          >
                            <div 
                              className="bg-white/90 rounded px-1 py-0.5 flex items-center gap-1 text-xs font-medium pointer-events-none"
                            >
                              {fieldType && <fieldType.icon className="w-3 h-3" />}
                              {field.label}
                              {field.required && <span className="text-red-500">*</span>}
                            </div>

                            {/* Live Preview of Field Content */}
                            {imageContainerRef.current && (
                              <div 
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: field.type === 'checkbox' ? 'center' : 'flex-start',
                                  padding: field.type === 'checkbox' ? '0' : '4px',
                                }}
                              >
                                {field.type === 'checkbox' && (
                                  <span 
                                    className="text-green-600 font-bold" 
                                    style={{ 
                                      fontSize: `${(field.height / 100) * imageContainerRef.current.offsetHeight * 0.7}px` 
                                    }}
                                  >
                                    ✓
                                  </span>
                                )}
                                {field.type === 'text' && (
                                  <span 
                                    className="text-black/50 font-medium truncate"
                                    style={{ 
                                      fontSize: `${(field.height / 100) * imageContainerRef.current.offsetHeight * 0.75}px`,
                                      lineHeight: '1.2'
                                    }}
                                  >
                                    טקסט לדוגמא
                                  </span>
                                )}
                                {field.type === 'date' && (
                                  <span 
                                    className="text-black/50 font-medium truncate"
                                    style={{ 
                                      fontSize: `${(field.height / 100) * imageContainerRef.current.offsetHeight * 0.75}px`,
                                      lineHeight: '1.2'
                                    }}
                                  >
                                    21/01/2026
                                  </span>
                                )}
                              </div>
                            )}

                            {isSelected && (
                              <>
                                <div
                                  className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-emerald-500 rounded-full cursor-nw-resize z-10"
                                  onMouseDown={(e) => startResize(e, 'tl', field)}
                                ></div>
                                <div
                                  className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full cursor-ne-resize z-10"
                                  onMouseDown={(e) => startResize(e, 'tr', field)}
                                ></div>
                                <div
                                  className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-500 rounded-full cursor-sw-resize z-10"
                                  onMouseDown={(e) => startResize(e, 'bl', field)}
                                ></div>
                                <div
                                  className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full cursor-se-resize z-10"
                                  onMouseDown={(e) => startResize(e, 'br', field)}
                                ></div>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  {isUploading || isRasterizing ? (
                    <>
                      <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
                      <p>{isUploading ? 'מעלה PDF מקורי...' : `ממיר את המסמך לתמונות עמוד ${templateData.page_image_urls.length + 1}`}</p>
                    </>
                  ) : (
                    <>
                      <FileText className="w-16 h-16 mx-auto mb-4" />
                      <p>העלה קובץ PDF לתחילת העבודה</p>
                    </>
                  )}
                  {!isPdfJsLoaded && !isUploading && !isRasterizing && (
                    <p className="mt-2 text-sm text-yellow-600">
                      טוען ספריית עיבוד PDF...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 sm:gap-3 p-3 sm:p-6 border-t">
          <Button variant="outline" onClick={onCancel} size="sm">
            ביטול
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm" size="sm" disabled={isUploading || isRasterizing || templateData.page_image_urls.length === 0}>
            <Save className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            שמירה
          </Button>
        </div>
      </div>

      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white sm:rounded-2xl shadow-2xl w-full max-w-5xl h-full sm:h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h3 className="text-base sm:text-xl font-bold">תצוגה מקדימה - כך המסמך ייראה לאחר חתימה</h3>
              <Button variant="ghost" size="icon" onClick={handleClosePreview}>
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            </div>
            <div className="p-3 sm:p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <p className="text-xs sm:text-sm text-gray-600">
                💡 זוהי תצוגה מקדימה עם ערכי מדגם. גודל הפונט שאתה רואה כאן הוא הגודל האמיתי שיופיע במסמך החתום.
              </p>
              <Button onClick={handleClosePreview} size="sm" className="w-full sm:w-auto">
                סגור
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}