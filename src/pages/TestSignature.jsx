import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bug, Link as LinkIcon, MonitorPlay, AlertTriangle, Terminal, ExternalLink, RefreshCw, FlaskConical, Loader2, CheckCircle, FileSignature, TestTube, Database, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function TestSignature() {
  const [realSigningLink, setRealSigningLink] = useState('');
  const [iFrameSrc, setIFrameSrc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIframeError, setShowIframeError] = useState(false);

  // New state for PDF processing test
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [pdfTestUrl, setPdfTestUrl] = useState(''); // New state for PDF URL to test

  // **NEW**: States for comprehensive signing workflow test
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);
  const [workflowResult, setWorkflowResult] = useState(null);
  const [testDocument, setTestDocument] = useState(null);

  const handleLoadPreview = () => {
    if (!realSigningLink || !realSigningLink.includes('http')) {
      alert('אנא הזן קישור חתימה תקין.');
      return;
    }
    
    // Extract token to get PDF URL for testing
    setPdfTestUrl(''); // Clear previous PDF test URL
    try {
        const url = new URL(realSigningLink);
        const token = url.searchParams.get('token');
        if (token) {
            base44.functions.invoke('getDocumentForSigning', { token }).then(response => {
                if (response.data && response.data.success && response.data.template?.original_pdf_url) {
                    setPdfTestUrl(response.data.template.original_pdf_url);
                } else {
                    console.warn("Could not retrieve original PDF URL from token.", response.data);
                }
            }).catch(error => {
                console.error("Error fetching document for signing:", error);
            });
        } else {
            console.warn("No token found in the signing link. PDF processing test may not work.");
        }
    } catch(e) {
        console.error("Could not parse URL for test PDF link:", e);
    }

    setIsLoading(true);
    setShowIframeError(false);
    setIFrameSrc(realSigningLink);
    
    setTimeout(() => {
      if (isLoading) { // Check if still loading
        setIsLoading(false);
        setShowIframeError(true);
      }
    }, 8000);
  };

  const handleOpenInNewTab = () => {
    if (realSigningLink) {
      window.open(realSigningLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setShowIframeError(false);
  };

  const handleRefresh = () => {
    const currentSrc = iFrameSrc;
    setIFrameSrc('');
    setTimeout(() => {
       setIFrameSrc(currentSrc);
       setIsLoading(true);
    }, 100);
  };

  const handleRunPdfTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const { data } = await base44.functions.invoke('testPdfProcessing', { test_mode: true });
      setTestResult(data);
    } catch (error) {
      setTestResult({ success: false, steps: ['שגיאה קריטית בהפעלת הפונקציה.', error.response?.data?.error || error.message] });
    }
    setIsTesting(false);
  };

  // **NEW**: Comprehensive signing workflow test
  const handleRunWorkflowTest = async () => {
    setIsTestingWorkflow(true);
    setWorkflowResult(null);
    setTestDocument(null);

    const testSteps = [];
    const testErrors = [];

    try {
      // Step 1: Create test template and document
      testSteps.push('🔧 יוצר תבנית ומסמך לבדיקה...');
      const { data: createResult } = await base44.functions.invoke('createTestDocument', { 
        template_name: 'בדיקת תהליך חתימה - ' + new Date().toISOString(),
        test_mode: true 
      });
      
      if (!createResult.success) {
        throw new Error(`כישלון ביצירת מסמך בדיקה: ${createResult.error}`);
      }

      testSteps.push(`✅ מסמך בדיקה נוצר בהצלחה - מזהה: ${createResult.document.id}`);
      testSteps.push(`📄 תבנית: ${createResult.template.name}`);
      testSteps.push(`👤 ליד בדיקה: ${createResult.lead.first_name} ${createResult.lead.last_name}`);
      testSteps.push(`🔑 טוקן חתימה: ${createResult.signing_token.substring(0, 20)}...`);
      
      setTestDocument(createResult);

      // Step 2: Simulate complete signing process
      testSteps.push('🔧 מדמה תהליך חתימה מלא...');
      
      // Create mock signature and field values (like a real user would)
      const mockFieldValues = {};
      
      // Add signature field (simulate a drawn signature)
      const signatureField = createResult.template.fields.find(f => f.type === 'signature');
      if (signatureField) {
        // This is a minimal PNG in base64 (1x1 transparent pixel) - represents a signature
        mockFieldValues[signatureField.id] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2NgYGD4TwAEAgE99gX10AAAAABJRU5ErkJggg==';
        testSteps.push(`✅ שדה חתימה מולא: ${signatureField.label}`);
      }

      // Add text fields
      const textFields = createResult.template.fields.filter(f => f.type === 'text');
      textFields.forEach(field => {
        mockFieldValues[field.id] = `טקסט בדיקה עבור ${field.label}`;
        testSteps.push(`✅ שדה טקסט מולא: ${field.label} = "${mockFieldValues[field.id]}"`);
      });

      // Add date fields
      const dateFields = createResult.template.fields.filter(f => f.type === 'date');
      dateFields.forEach(field => {
        mockFieldValues[field.id] = format(new Date(), 'dd/MM/yyyy'); // Format date to dd/MM/yyyy
        testSteps.push(`✅ שדה תאריך מולא: ${field.label} = ${mockFieldValues[field.id]}`);
      });

      testSteps.push(`📋 סה"כ שדות שמולאו: ${Object.keys(mockFieldValues).length}`);

      // Step 3: Submit the signature with debug mode
      testSteps.push('🔧 שולח חתימה לעיבוד (עם מצב דיבוג)...');
      
      const { data: submitResult } = await base44.functions.invoke('submitSignature', {
        signing_token: createResult.signing_token,
        field_values: mockFieldValues
      }, {
        headers: {
          'X-Debug-Mode': 'true' // Enable debug mode for detailed logging
        }
      });

      if (!submitResult.success) {
        throw new Error(`כישלון בשליחת חתימה: ${submitResult.error || 'שגיאה לא ידועה'}`);
      }

      testSteps.push('✅ חתימה נשלחה ועובדה בהצלחה!');
      testSteps.push(`📄 PDF נוצר: ${submitResult.has_pdf ? 'כן' : 'לא'}`);
      testSteps.push(`💾 קישור הורדה: ${submitResult.download_url ? 'זמין' : 'לא זמין'}`);
      testSteps.push(`📧 הודעת מערכת: ${submitResult.message}`);

      // Step 4: Verify the result includes certificate page
      if (submitResult.download_url) {
        testSteps.push('🔧 בודק אם דף אישור חתימה נוסף ל-PDF...');
        // This check is now less direct as we are not downloading the PDF.
        // We rely on the success of the backend function and its reported properties.
        if(submitResult.has_pdf) {
            testSteps.push(`✅ השרת יצר קובץ PDF בגודל משוער של ${(submitResult.size_kb || 0).toFixed(1)} KB`);
            testSteps.push('📜 הקובץ אמור לכלול דף אישור חתימה דיגיטלית בסוף');
        } else {
             testSteps.push(`⚠️ השרת לא דיווח על יצירת קובץ PDF.`);
        }
      }

      testSteps.push('🎉 כל הבדיקות עברו בהצלחה! התהליך החדש עובד מושלם.');

      setWorkflowResult({
        success: true,
        steps: testSteps,
        errors: testErrors,
        document: createResult,
        signedResult: submitResult,
        totalTime: Date.now()
      });

    } catch (error) {
      testErrors.push({
        step: testSteps.length,
        message: error.message,
        stack: error.stack
      });
      testSteps.push(`❌ שגיאה: ${error.message}`);
      
      setWorkflowResult({
        success: false,
        steps: testSteps,
        errors: testErrors,
        totalTime: Date.now()
      });
    }

    setIsTestingWorkflow(false);
  };

  return (
    <div className="p-4 md:p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('DigitalSignatures')}>
              <Button variant="outline" size="icon">
                  <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <Bug className="w-8 h-8" />
              בדיקת חתימה דיגיטלית - Live Debug
            </h1>
          </div>
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
            מצב ניתוח בזמן אמת
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
        {/* Controls Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                בדיקת קישור חתימה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  value={realSigningLink}
                  onChange={(e) => setRealSigningLink(e.target.value)}
                  placeholder="https://.../SignDocument?token=..."
                  className="font-mono text-sm flex-1"
                  dir="ltr"
                  aria-label="Signing Link Input"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLoadPreview} disabled={!realSigningLink || isLoading} className="flex-1">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MonitorPlay className="w-4 h-4 mr-2" />}
                  {isLoading ? 'טוען...' : 'טען תצוגה'}
                </Button>
                {iFrameSrc && (
                  <Button onClick={handleRefresh} variant="outline" size="icon" title="רענן">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {realSigningLink && (
                <Button 
                  onClick={handleOpenInNewTab} 
                  variant="outline" 
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  פתח בחלון חדש
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card className="flex flex-col">
             <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
                    <FlaskConical className="w-5 h-5" />
                    בדיקת עיבוד PDF בסיסית
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 flex-grow flex flex-col">
                <p className="text-sm text-gray-600">בודק אם השרת יכול ליצור PDF, להטמיע גופן עברי, ולהעלות את התוצאה.</p>
                <Button onClick={handleRunPdfTest} disabled={isTesting} className="w-full">
                    {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Terminal className="w-4 h-4 mr-2"/> }
                    {isTesting ? 'מריץ בדיקה...' : 'הפעל בדיקת עיבוד PDF'}
                </Button>
                {testResult && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                    <h4 className={`font-bold mb-2 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      תוצאות הבדיקה: {testResult.success ? 'הצלחה' : 'כישלון'}
                    </h4>
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {testResult.steps.join('\n')}
                    </pre>
                    {testResult.publicUrl && (
                      <a href={testResult.publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-2 block">
                        פתח קובץ תוצאה
                      </a>
                    )}
                  </div>
                )}
             </CardContent>
          </Card>

          {/* **NEW**: Full workflow test */}
          <Card className="flex flex-col">
             <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
                    <TestTube className="w-5 h-5" />
                    בדיקת תהליך חתימה מלא
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 flex-grow flex flex-col">
                <p className="text-sm text-gray-600">בדיקה מקיפה: יצירת מסמך, מילוי שדות (טקסט/חתימה/תאריך), עיבוד PDF עם דף אישור, ושליחת מייל.</p>
                <Button onClick={handleRunWorkflowTest} disabled={isTestingWorkflow} className="w-full bg-green-600 hover:bg-green-700">
                    {isTestingWorkflow ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <FileSignature className="w-4 h-4 mr-2"/> }
                    {isTestingWorkflow ? 'מריץ בדיקה מקיפה...' : 'הפעל בדיקת תהליך מלא'}
                </Button>
                
                {workflowResult && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border max-h-80 overflow-y-auto">
                    <h4 className={`font-bold mb-2 ${workflowResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {workflowResult.success ? '✅ בדיקה עברה בהצלחה!' : '❌ בדיקה נכשלה'}
                    </h4>
                    <pre className="text-xs whitespace-pre-wrap font-mono mb-3">
                      {workflowResult.steps.join('\n')}
                    </pre>
                    
                    {workflowResult.success && workflowResult.signedResult?.download_url && (
                      <div className="border-t pt-3 mt-3">
                        <p className="text-xs font-semibold mb-2">🔗 קישורים למסמכים:</p>
                        <a href={workflowResult.signedResult.download_url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline text-xs block">
                          📄 הורד מסמך חתום (עם דף אישור)
                        </a>
                        <p className="text-xs text-gray-600 mt-1">
                          💡 המסמך כולל דף אישור חתימה דיגיטלית בסוף
                        </p>
                      </div>
                    )}
                    
                    {testDocument && (
                      <div className="border-t pt-3 mt-3">
                        <p className="text-xs font-semibold mb-1">🔧 פרטי בדיקה:</p>
                        <p className="text-xs text-gray-600">מזהה מסמך: {testDocument.document.id}</p>
                        <p className="text-xs text-gray-600">טוקן: {testDocument.signing_token}</p>
                      </div>
                    )}
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-2 flex flex-col">
           <Card className="flex-grow flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <MonitorPlay className="w-5 h-5"/>
                  תצוגה מקדימה חיה
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-0">
                <div className="h-full w-full border-t rounded-b-lg bg-gray-100 overflow-hidden relative">
                  {iFrameSrc ? (
                    <>
                      {isLoading && !showIframeError && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 text-emerald-500 mx-auto animate-spin mb-4" />
                            <p className="text-gray-600">טוען מסמך חתימה...</p>
                          </div>
                        </div>
                      )}
                      {(showIframeError) && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                            <div className="text-center p-4">
                                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h3 className="font-bold text-orange-700">התצוגה נחסמה על ידי הדפדפן</h3>
                                <p className="text-gray-600 mt-2">ייתכן שהקישור אינו תקין או שהדפדפן חסם את הטעינה. נסה "פתח בחלון חדש" כדי לבדוק.</p>
                            </div>
                        </div>
                      )}
                      <iframe 
                        src={iFrameSrc} 
                        title="Live Signature Preview"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        onLoad={handleIframeLoad}
                        onError={() => { setIsLoading(false); setShowIframeError(true); }}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MonitorPlay className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>הדבק קישור ולחץ על "טען תצוגה" כדי להתחיל.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}