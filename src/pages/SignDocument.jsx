import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertTriangle, PartyPopper, RotateCw, Lock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Inline Signature Pad Component
const InlineSignaturePad = ({ onSignatureChange }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
  }, []);

  const getCoords = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches ? event.touches[0] : null;
    return {
      x: (touch ? touch.clientX : event.clientX) - rect.left,
      y: (touch ? touch.clientY : event.clientY) - rect.top,
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();
    const { x, y } = getCoords(event.nativeEvent || event);
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    if(isEmpty) setIsEmpty(false);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { x, y } = getCoords(event.nativeEvent || event);
    const context = canvasRef.current.getContext('2d');
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const context = canvasRef.current.getContext('2d');
    context.closePath();
    setIsDrawing(false);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSignatureChange(null);
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-40 sm:h-48 bg-gray-50 border border-gray-300 rounded-lg cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
      <div className="text-center mt-2">
        <Button type="button" variant="outline" onClick={clearCanvas} disabled={isEmpty} size="sm">
          <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
          <span className="text-xs sm:text-sm">נקה</span>
        </Button>
      </div>
    </div>
  );
};


export default function SignDocument() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalPdfUrl, setFinalPdfUrl] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [signatureData, setSignatureData] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setError('אסימון חתימה חסר או לא תקין.');
        setLoading(false);
        return;
      }
      
      try {
        const { data: responseData } = await base44.functions.invoke('getDocumentForSigning', { token });
        if (responseData.success) {
          setData(responseData);
          // Pre-fill form fields
          const initialValues = {};
          if (responseData.template && responseData.lead) {
            responseData.template.fields.forEach(field => {
              if (field.type === 'text') {
                const labelLower = field.label.toLowerCase();
                if (labelLower.includes('שם') && (labelLower.includes('מלא') || labelLower.includes('פרטי'))) {
                  initialValues[field.id] = `${responseData.lead.first_name || ''} ${responseData.lead.last_name || ''}`.trim();
                } else if (labelLower.includes('מייל') || labelLower.includes('email')) {
                  initialValues[field.id] = responseData.lead.email || '';
                } else if (labelLower.includes('טלפון') || labelLower.includes('phone')) {
                  initialValues[field.id] = responseData.lead.phone || '';
                }
              } else if (field.type === 'date') {
                  // Do not pre-fill date to avoid format conflicts
              }
            });
          }
          setFieldValues(initialValues);
        } else {
          setError(responseData.error || 'שגיאה בטעינת מסמך.');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'שגיאה לא צפויה בטעינת המסמך.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [location.search]);

  const getRequiredFieldCount = () => {
    return template?.fields?.filter(f => f.required).length || 0;
  };

  const getFilledRequiredFieldCount = () => {
    if (!template?.fields) return 0;
    return template.fields.filter(f => {
      if (!f.required) return false;
      const value = fieldValues[f.id];
      if (f.type === 'checkbox') return value === true;
      return value && value.toString().trim() !== '';
    }).length;
  };

  const isFormComplete = () => {
    const requiredCount = getRequiredFieldCount();
    const filledCount = getFilledRequiredFieldCount();
    return requiredCount > 0 && requiredCount === filledCount && signatureData;
  };
  
  const handleSubmitSignature = async (e) => {
    e.preventDefault();
    if (!isFormComplete()) {
      setError('יש למלא את כל השדות החובה וחתום על המסמך');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    const finalValues = { ...fieldValues };
    data.template.fields.forEach(field => {
      if (field.type === 'signature') {
        finalValues[field.id] = signatureData;
      }
    });

    try {
      const { data: submitResult } = await base44.functions.invoke('submitSignature', {
        signing_token: token,
        field_values: finalValues,
      });

      if (submitResult.success) {
        setFinalPdfUrl(submitResult.download_url);
        setIsSuccess(true);
      } else {
        setError(submitResult.error || 'שגיאה בשליחת החתימה.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'שגיאה לא צפויה בשליחת החתימה.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => window.location.reload();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>טוען מסמך לחתימה...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-600 p-4 text-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">שגיאה בטעינת המסמך</h2>
        <p>{error}</p>
      </div>
    );
  }

  const { template, lead } = data || {};
  const [selectedFieldId, setSelectedFieldId] = useState(null);

  const isFieldFilled = (field) => {
    const value = fieldValues[field.id];
    if (field.type === 'checkbox') return value === true;
    return value && value.toString().trim() !== '';
  };

  const renderFieldOverlay = (field) => {
    if (!field.x || !field.y || !field.width || !field.height) return null;
    
    const isFilled = isFieldFilled(field);
    const isRequired = field.required;
    
    return (
      <div
        key={field.id}
        className="absolute cursor-pointer transition-all border-2 flex items-start justify-start p-1"
        style={{
          left: `${field.x}%`,
          top: `${field.y}%`,
          width: `${field.width}%`,
          height: `${field.height}%`,
          borderColor: isFilled ? '#22c55e' : (isRequired ? '#dc2626' : '#9ca3af'),
          backgroundColor: isFilled ? 'rgba(34, 197, 94, 0.1)' : (isRequired ? 'rgba(220, 38, 38, 0.1)' : 'rgba(156, 163, 175, 0.1)'),
        }}
        onClick={() => setSelectedFieldId(field.id)}
      >
        <div className="rounded-full p-0.5" style={{
          backgroundColor: isFilled ? '#22c55e' : (isRequired ? '#dc2626' : '#9ca3af')
        }}>
          {isFilled ? (
            <Check className="w-3 h-3 text-white" />
          ) : (
            <span className="text-white text-xs font-bold">*</span>
          )}
        </div>
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-8 md:p-12 text-center">
            <div className="mb-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <PartyPopper className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">המסמך נחתם בהצלחה!</h2>
              <p className="text-lg text-gray-600 mb-8">עותק חתום של המסמך נשלח אליך במייל</p>
            </div>
            <div className="flex flex-col gap-4 mb-8">
              <a href={finalPdfUrl} download="signed_document.pdf">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6 rounded-xl shadow-lg">
                  📥 הורד עותק חתום
                </Button>
              </a>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-xl p-6">
              <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                המסמך החתום מאובטח ומוצפן בטכנולוגיה מתקדמת
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const requiredFilled = getFilledRequiredFieldCount();
  const requiredTotal = getRequiredFieldCount();

  return (
    <div className="h-screen bg-gray-100 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b shadow-sm p-4 flex-shrink-0">
        <div className="max-w-full mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">{data?.template?.name}</h1>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{requiredFilled} מתוך {requiredTotal} שדות חובה מולאו</span>
              <span className="text-emerald-600 font-semibold">{Math.round((requiredFilled / requiredTotal) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${requiredTotal > 0 ? (requiredFilled / requiredTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex gap-4 p-4">
        {/* Document */}
        <div className="flex-1 overflow-y-auto bg-gray-200 rounded-lg shadow-md p-4">
          <div className="max-w-4xl mx-auto">
            {template?.page_image_urls?.map((url, imgIndex) => (
              <div key={imgIndex} className="relative bg-white shadow-lg mb-4 last:mb-0">
                <img src={url} alt={`עמוד ${imgIndex + 1}`} className="w-full" />
                {/* Field Overlays */}
                {template?.fields?.map(field => {
                  if (field.page !== (imgIndex + 1)) return null;
                  return renderFieldOverlay(field);
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Fields */}
        <div className="w-96 flex-shrink-0 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
          {/* Fields List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700 sticky top-0 bg-white pb-2">שדות למילוי:</p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            {template?.fields?.map(field => {
              const isSelected = field.id === selectedFieldId;
              const isFilled = isFieldFilled(field);

              if (field.type === 'text' || field.type === 'date') {
                return (
                  <div 
                    key={field.id} 
                    className={`space-y-1 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'} ${isFilled ? 'bg-green-50' : ''}`}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <Label htmlFor={field.id} className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                      <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                      {isFilled && <Check className="w-3 h-3 text-green-600" />}
                    </Label>
                    <Input
                      id={field.id}
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => setFieldValues(prev => ({...prev, [field.id]: e.target.value}))}
                      className="h-8 text-sm bg-white border-gray-300"
                    />
                  </div>
                );
              } else if (field.type === 'checkbox') {
                return (
                  <div 
                    key={field.id} 
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'} ${isFilled ? 'bg-green-50' : ''}`}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <Checkbox
                      id={field.id}
                      checked={fieldValues[field.id] === true}
                      onCheckedChange={(checked) => setFieldValues(prev => ({...prev, [field.id]: checked}))}
                    />
                    <Label htmlFor={field.id} className="text-xs font-medium cursor-pointer flex-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                  </div>
                );
              } else if (field.type === 'signature') {
                return (
                  <div 
                    key={field.id} 
                    className={`space-y-1 p-2 rounded transition-colors ${isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'} ${isFilled ? 'bg-green-50' : ''}`}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                      <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                      {isFilled && <Check className="w-3 h-3 text-green-600" />}
                    </Label>
                    <InlineSignaturePad onSignatureChange={setSignatureData} />
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 flex-shrink-0 space-y-3">
            {requiredFilled < requiredTotal && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-amber-800 text-xs font-medium">
                  יש למלא {requiredTotal - requiredFilled} שדות נוספים
                </p>
              </div>
            )}
            <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              <span>תהליך מאובטח</span>
            </div>
            <Button 
              onClick={handleSubmitSignature}
              disabled={!isFormComplete() || isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : '✓'} סיום ושליחה
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
  }