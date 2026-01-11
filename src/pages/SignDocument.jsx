import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertTriangle, PartyPopper, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SignatureStepper from '../components/signatures/SignatureStepper';
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
  const [step, setStep] = useState(1); // 1: review, 2: form, 3: success
  
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalPdfUrl, setFinalPdfUrl] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [signatureData, setSignatureData] = useState(null);

  const location = useLocation();

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

  const handleProceedToForm = () => {
    if (!isConsentChecked) {
      alert('יש לאשר את קריאת המסמך לפני שממשיכים.');
      return;
    }
    setStep(2);
  };
  
  const handleSubmitSignature = async (e) => {
    e.preventDefault();
    const signatureField = data?.template?.fields.find(f => f.type === 'signature');
    if (signatureField?.required && !signatureData) {
      alert('יש למלא את החתימה');
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
        setStep(3);
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
  const signatureFieldExists = template?.fields.some(f => f.type === 'signature');

  const renderContent = () => {
    switch (step) {
      case 1: // Review Step
        return (
          <>
            <div className="text-center bg-gray-50 p-3 sm:p-4 border-t border-b border-gray-200 sticky top-[148px] z-10">
                <div className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base px-2">בלחיצה על הכפתור אני מאשר/ת כי קראתי את המסמך לפני החתימה עליו</div>
                <div className="flex justify-center items-center gap-2 sm:gap-4 px-2">
                  <Button onClick={handleProceedToForm} className="bg-green-500 hover:bg-green-600 rounded-full px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base" size="sm" disabled={!isConsentChecked}>
                    למילוי המסמך ו/או חתימה - לחצו כאן
                  </Button>
                </div>
                 <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
                    <Checkbox id="terms" checked={isConsentChecked} onCheckedChange={setIsConsentChecked} />
                    <label htmlFor="terms" className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      קראתי ומאשר/ת את המסמך
                    </label>
                  </div>
                 <button onClick={handleRefresh} className="text-xs text-blue-600 hover:underline mt-3 sm:mt-4">
                  אם המסמך אינו נטען כראוי - לחצו כאן
                </button>
            </div>
            <div className="flex-grow overflow-y-auto bg-gray-200 p-2 sm:p-4">
              <div className="max-w-4xl mx-auto bg-white shadow-lg">
                {template.page_image_urls && template.page_image_urls.map((url, index) => (
                  <img key={index} src={url} alt={`עמוד ${index + 1}`} className="w-full h-auto border" />
                ))}
              </div>
            </div>
          </>
        );
      case 2: // Form Step
        return (
          <div className="flex-grow overflow-y-auto bg-gray-100 p-3 sm:p-4 md:p-8">
            <div className="w-full max-w-2xl mx-auto p-3 sm:p-4 md:p-8 bg-white rounded-lg shadow-md">
              <form onSubmit={handleSubmitSignature} className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-center">הזנת פרטים וחתימה</h2>
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-md" role="alert"><p className="font-bold text-sm sm:text-base">שגיאה</p><p className="text-sm sm:text-base">{error}</p></div>}

                {template.fields.map(field => {
                  if (field.type === 'text' || field.type === 'date') {
                    return (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-right block w-full font-semibold text-sm sm:text-base">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          type={field.type === 'date' ? 'date' : 'text'}
                          placeholder={field.type === 'date' ? 'DD/MM/YYYY' : ''}
                          value={fieldValues[field.id] || ''}
                          onChange={(e) => setFieldValues(prev => ({...prev, [field.id]: e.target.value}))}
                          required={field.required}
                          className="bg-gray-50 border-gray-300 text-sm sm:text-base"
                        />
                      </div>
                    );
                  } else if (field.type === 'checkbox') {
                    return (
                      <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          id={field.id}
                          checked={fieldValues[field.id] === true}
                          onCheckedChange={(checked) => setFieldValues(prev => ({...prev, [field.id]: checked}))}
                        />
                        <Label htmlFor={field.id} className="text-sm sm:text-base font-medium cursor-pointer">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                      </div>
                    );
                  }
                  return null;
                })}

                {signatureFieldExists && (
                  <div className="space-y-2">
                    <Label className="text-right block w-full font-semibold text-sm sm:text-base">נא לחתום במסגרת</Label>
                    <InlineSignaturePad onSignatureChange={setSignatureData} />
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-base sm:text-lg py-4 sm:py-6 rounded-lg">
                  {isSubmitting ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : 'הקליקו כאן לאחר החתימה'}
                </Button>
              </form>
            </div>
          </div>
        );
      case 3: // Success Step
        return (
          <div className="flex-grow overflow-y-auto bg-gray-100 p-3 sm:p-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-md">
                 <PartyPopper className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">המסמך נחתם בהצלחה!</h2>
                <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600">עותק חתום של המסמך נשלח אליך למייל.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <a href={finalPdfUrl} download={`signed_document.pdf`} className="inline-block">
                    <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">הורד עותק</Button>
                  </a>
                  <Button variant="outline" onClick={() => window.close()} className="w-full sm:w-auto">סגור</Button>
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <iframe src={finalPdfUrl} className="w-full h-[60vh] sm:h-[80vh]" title="מסמך חתום" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" dir="rtl">
      {data && (
        <header className="bg-white border-b sticky top-0 z-20 px-2 sm:px-0">
          <SignatureStepper currentStep={step} />
        </header>
      )}
      <main className="flex-1 flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
}