import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Shield, 
  Key, 
  Mail, 
  Webhook, 
  Calendar, 
  Zap, 
  Users, 
  Building2, 
  Settings, 
  Bot, 
  Layout, 
  FileSignature,
  AlertTriangle,
  Code,
  Server,
  Database,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Documentation() {
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    // Set NO INDEX meta tags
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow, noarchive';
    document.head.appendChild(metaRobots);

    const metaGooglebot = document.createElement('meta');
    metaGooglebot.name = 'googlebot';
    metaGooglebot.content = 'noindex, nofollow, noarchive';
    document.head.appendChild(metaGooglebot);

    const metaGooglebotNews = document.createElement('meta');
    metaGooglebotNews.name = 'googlebot-news';
    metaGooglebotNews.content = 'noindex, nofollow, noarchive';
    document.head.appendChild(metaGooglebotNews);

    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaGooglebot);
      document.head.removeChild(metaGooglebotNews);
    };
  }, []);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CodeBlock = ({ code, language = 'javascript', title, copyId }) => (
    <div className="my-4">
      {title && <div className="text-sm font-semibold text-gray-700 mb-2">{title}</div>}
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm" dir="ltr">
          <code>{code}</code>
        </pre>
        {copyId && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 left-2 text-gray-400 hover:text-white"
            onClick={() => copyToClipboard(code, copyId)}
          >
            {copiedSection === copyId ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <style>{`
        pre code {
          direction: ltr !important;
          text-align: left !important;
        }
      `}</style>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">דוקומנטציה למפתחים</h1>
              <p className="text-blue-100 mt-2">מדריך מקיף למערכת LawForce CRM</p>
            </div>
          </div>
          <Alert className="bg-red-900/30 border-red-400 mt-4">
            <Lock className="h-4 w-4 text-red-200" />
            <AlertDescription className="text-red-100">
              <strong>מסמך פנימי בלבד!</strong> דף זה מוגדר כ-NOINDEX ולא יופיע במנועי חיפוש או ארכיונים. אין לשתף מידע זה עם צדדים שלישיים.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="integrations">אינטגרציות ו-API</TabsTrigger>
            <TabsTrigger value="automations">אוטומציות ומערכת</TabsTrigger>
            <TabsTrigger value="permissions">הרשאות וניהול</TabsTrigger>
            <TabsTrigger value="advanced">תכונות מתקדמות</TabsTrigger>
          </TabsList>

          {/* Integrations & API Tab */}
          <TabsContent value="integrations" className="space-y-6">
            
            {/* Google OAuth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-6 h-6 text-red-500" />
                  Google OAuth Client Secret
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">מהו Google OAuth?</h4>
                  <p className="text-sm text-blue-800">
                    OAuth של Google מאפשר למשתמשים להתחבר למערכת באמצעות חשבון Google שלהם ולגשת לשירותי Google כמו Calendar, Gmail, Drive וכו'.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שלב 1: יצירת פרויקט ב-Google Cloud Console</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
                    <li>גש ל-<a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
                    <li>צור פרויקט חדש או בחר פרויקט קיים</li>
                    <li>עבור ל-APIs & Services → Credentials</li>
                    <li>לחץ על "Create Credentials" → "OAuth client ID"</li>
                    <li>בחר Application type: "Web application"</li>
                    <li>הגדר Authorized redirect URIs:</li>
                  </ol>
                  <CodeBlock
                    code={`https://yourdomain.com/auth/callback
https://base44.app/auth/callback`}
                    copyId="oauth-redirect"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שלב 2: קבלת Client Secret</h4>
                  <p className="text-sm text-gray-600 mb-2">לאחר יצירת OAuth client, תקבל:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm mr-4">
                    <li><strong>Client ID:</strong> מזהה ציבורי של האפליקציה</li>
                    <li><strong>Client Secret:</strong> מפתח סודי (זהו המפתח שצריך לשמור ב-Secrets)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שלב 3: הפעלת APIs נדרשים</h4>
                  <p className="text-sm text-gray-600 mb-2">ב-Google Cloud Console, הפעל את ה-APIs הבאים:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm mr-4">
                    <li>Google Calendar API</li>
                    <li>Google People API (לפרטי משתמש)</li>
                    <li>Gmail API (אם נדרש)</li>
                    <li>Google Drive API (אם נדרש)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שלב 4: הוספת Secret למערכת</h4>
                  <p className="text-sm text-gray-600 mb-2">עבור ל-Dashboard → Settings → Environment Variables והוסף:</p>
                  <CodeBlock
                    code={`Key: google_oauth_client_secret
Value: YOUR_CLIENT_SECRET_HERE`}
                    copyId="oauth-secret"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שלב 5: שימוש בקוד</h4>
                  <CodeBlock
                    title="דוגמה לשימוש ב-OAuth"
                    code={`import { base44 } from '@/api/base44Client';

// אימות משתמש עם Google
const handleGoogleLogin = async () => {
  try {
    const response = await base44.auth.loginWithGoogle();
    console.log('User logged in:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// גישה ל-Google Calendar
const fetchCalendarEvents = async () => {
  const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");
  
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    headers: {
      'Authorization': \`Bearer \${accessToken}\`
    }
  });
  
  const events = await response.json();
  return events;
};`}
                    copyId="oauth-code"
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>אבטחה:</strong> לעולם אל תחשוף את ה-Client Secret בקוד צד לקוח! השתמש רק ב-Backend Functions או Server-Side Code.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* OpenAI API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-green-500" />
                  OpenAI API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded">
                  <h4 className="font-semibold text-green-900 mb-2">מהו OpenAI API?</h4>
                  <p className="text-sm text-green-800">
                    OpenAI API מאפשר גישה למודלי AI מתקדמים כמו GPT-4, GPT-3.5 ליצירת תוכן, ניתוח טקסט, סיכום מסמכים, ועוד.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שלב 1: יצירת API Key</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
                    <li>גש ל-<a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">OpenAI Platform <ExternalLink className="w-3 h-3" /></a></li>
                    <li>התחבר לחשבון או צור חשבון חדש</li>
                    <li>עבור ל-API Keys בתפריט</li>
                    <li>לחץ על "Create new secret key"</li>
                    <li>העתק את המפתח - <strong>לא תוכל לראות אותו שוב!</strong></li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שלב 2: הוספת API Key למערכת</h4>
                  <CodeBlock
                    code={`Key: OpenAI_API_KEY
Value: sk-...your-api-key-here`}
                    copyId="openai-secret"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שלב 3: שימוש במערכת</h4>
                  <p className="text-sm text-gray-600 mb-2">המערכת משתמשת ב-OpenAI בפונקציות הבאות:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm mr-4">
                    <li><strong>סיכום מסמכים:</strong> ניתוח וסיכום אוטומטי של מסמכים משפטיים</li>
                    <li><strong>המלצות AI:</strong> המלצות לפעולות הבאות בתיקים</li>
                    <li><strong>ניתוח סנטימנט:</strong> זיהוי סנטימנט ללקוחות</li>
                    <li><strong>יצירת תוכן:</strong> טיוטות מיילים, מסמכים והודעות</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">דוגמאות קוד</h4>
                  
                  <CodeBlock
                    title="שימוש באינטגרציה המובנית של Base44"
                    code={`import { base44 } from '@/api/base44Client';

// שימוש ב-InvokeLLM
const generateSummary = async (text) => {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: \`סכם את הטקסט הבא בצורה תמציתית: \${text}\`,
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        key_points: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  return result;
};

// שימוש עם חיפוש אינטרנט
const getMarketData = async (query) => {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: \`מצא מידע עדכני על: \${query}\`,
    add_context_from_internet: true
  });
  
  return result;
};`}
                    copyId="openai-base44"
                  />

                  <CodeBlock
                    title="שימוש ישיר ב-Backend Function"
                    code={`// functions/aiHelper.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const openai = new OpenAI({
    apiKey: Deno.env.get("OpenAI_API_KEY"),
  });

  const { prompt } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "אתה עוזר AI למשרד עורכי דין" },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
  });

  return Response.json({
    response: completion.choices[0].message.content
  });
});`}
                    copyId="openai-function"
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>עלויות:</strong> שים לב שכל קריאה ל-API עולה כסף. מומלץ להגדיר מגבלות שימוש ב-OpenAI Platform.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Mail Sender API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-6 h-6 text-blue-500" />
                  Mail Sender API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded">
                  <h4 className="font-semibold text-purple-900 mb-2">שליחת מיילים</h4>
                  <p className="text-sm text-purple-800">
                    המערכת משתמשת ב-Base44 Core Integration לשליחת מיילים. לא נדרש API key נפרד.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שליחת מייל פשוט</h4>
                  <CodeBlock
                    code={`import { base44 } from '@/api/base44Client';

const sendEmail = async () => {
  await base44.integrations.Core.SendEmail({
    to: "client@example.com",
    subject: "עדכון בתיק",
    body: \`
      <html dir="rtl">
        <body style="font-family: Arial, sans-serif;">
          <h2>שלום רב,</h2>
          <p>רצינו לעדכן אותך על התקדמות בתיק שלך.</p>
          <p>בברכה,<br>המשרד</p>
        </body>
      </html>
    \`,
    from_name: "משרד עורכי הדין"
  });
};`}
                    copyId="email-simple"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שליחת מייל עם תבנית</h4>
                  <CodeBlock
                    code={`const sendTemplatedEmail = async (clientData) => {
  const emailBody = \`
    <html dir="rtl">
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">משרד עורכי הדין</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2>שלום \${clientData.full_name},</h2>
          
          <p>רצינו לעדכן אותך על התקדמות בתיק מספר <strong>\${clientData.case_number}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">פרטי העדכון:</h3>
            <ul>
              <li>סטטוס: \${clientData.status}</li>
              <li>תאריך עדכון: \${new Date().toLocaleDateString('he-IL')}</li>
            </ul>
          </div>
          
          <p>במידה ויש לך שאלות, אנא צור איתנו קשר.</p>
          
          <p>בברכה,<br>צוות המשרד</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>מייל זה נשלח אוטומטית ממערכת ניהול התיקים</p>
        </div>
      </body>
    </html>
  \`;

  await base44.integrations.Core.SendEmail({
    to: clientData.email,
    subject: \`עדכון בתיק \${clientData.case_number}\`,
    body: emailBody,
    from_name: "משרד עורכי הדין"
  });
};`}
                    copyId="email-template"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שליחת מיילים באצווה (Bulk)</h4>
                  <CodeBlock
                    code={`const sendBulkEmails = async (recipients) => {
  // שלח מיילים בסבבים כדי לא לעבור מגבלות
  const batchSize = 10;
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(recipient => 
        base44.integrations.Core.SendEmail({
          to: recipient.email,
          subject: "עדכון חשוב",
          body: \`<p>שלום \${recipient.name},</p><p>זהו עדכון חשוב...</p>\`,
          from_name: "המשרד"
        })
      )
    );
    
    // המתן 2 שניות בין אצוות
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};`}
                    copyId="email-bulk"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Make Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Make.com (Integromat)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded">
                  <h4 className="font-semibold text-yellow-900 mb-2">מהו Make?</h4>
                  <p className="text-sm text-yellow-800">
                    Make (לשעבר Integromat) הוא פלטפורמת אוטומציה שמאפשרת לחבר בין מערכות שונות ולהפעיל workflows מורכבים.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">הגדרת Webhook ב-Make</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
                    <li>גש ל-<a href="https://www.make.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Make.com</a> והתחבר לחשבון</li>
                    <li>צור Scenario חדש</li>
                    <li>הוסף Webhook Trigger</li>
                    <li>העתק את כתובת ה-Webhook</li>
                    <li>הגדר את ה-Webhook במערכת בעמוד Integrations</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שליחת נתונים ל-Make</h4>
                  <CodeBlock
                    title="דוגמה לשליחת לקוח חדש ל-Make"
                    code={`// functions/sendToMake.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { clientData } = await req.json();
  
  const MAKE_WEBHOOK_URL = Deno.env.get("MAKE_WEBHOOK_URL");
  
  const response = await fetch(MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: 'client_created',
      timestamp: new Date().toISOString(),
      data: clientData
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send to Make');
  }
  
  return Response.json({ success: true });
});`}
                    copyId="make-webhook"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">אוטומציה עם Make - דוגמאות</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm mr-4">
                    <li><strong>לקוח חדש:</strong> שליחת הודעת WhatsApp + יצירת תיק ב-Google Drive + הוספה ל-CRM חיצוני</li>
                    <li><strong>מסמך חתום:</strong> שמירה ב-Dropbox + שליחת התראה לצוות + עדכון ב-Excel</li>
                    <li><strong>פגישה נקבעה:</strong> הוספה ל-Google Calendar + שליחת SMS + יצירת משימת תזכורת</li>
                    <li><strong>תשלום התקבל:</strong> יצירת חשבונית ב-iCount + שליחת אישור ללקוח + עדכון דוח כספי</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">קבלת נתונים מ-Make</h4>
                  <CodeBlock
                    code={`// functions/webhookReceiver.js
Deno.serve(async (req) => {
  try {
    const data = await req.json();
    
    // אימות מקור הבקשה (אופציונלי אבל מומלץ)
    const secret = req.headers.get('X-Webhook-Secret');
    if (secret !== Deno.env.get('MAKE_SECRET')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // עיבוד הנתונים לפי סוג האירוע
    switch (data.event_type) {
      case 'new_lead':
        // צור לקוח חדש
        await base44.asServiceRole.entities.Client.create({
          full_name: data.name,
          phone: data.phone,
          email: data.email,
          source: 'Make Automation'
        });
        break;
        
      case 'payment_confirmed':
        // עדכן סטטוס תשלום
        await base44.asServiceRole.entities.Financial.update(data.transaction_id, {
          payment_status: 'שולם במלואו'
        });
        break;
    }
    
    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`}
                    copyId="make-receiver"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-6 h-6 text-indigo-500" />
                  Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-indigo-50 border-r-4 border-indigo-500 p-4 rounded">
                  <h4 className="font-semibold text-indigo-900 mb-2">מהם Webhooks?</h4>
                  <p className="text-sm text-indigo-800">
                    Webhooks מאפשרים למערכת לקבל התראות בזמן אמת על אירועים שקורים במערכות חיצוניות.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">יצירת Webhook Endpoint</h4>
                  <CodeBlock
                    title="דוגמה ל-Webhook מאובטח"
                    code={`// functions/secureWebhook.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // 1. אימות חתימה (Signature Verification)
    const signature = req.headers.get('X-Webhook-Signature');
    const body = await req.text();
    
    // חשב חתימה מצופה
    const expectedSignature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(body + Deno.env.get('WEBHOOK_SECRET'))
    );
    
    // השווה חתימות
    if (signature !== Array.from(new Uint8Array(expectedSignature))
        .map(b => b.toString(16).padStart(2, '0')).join('')) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // 2. עבד את הנתונים
    const data = JSON.parse(body);
    const base44 = createClientFromRequest(req);
    
    // 3. בצע פעולות לפי סוג האירוע
    await handleWebhookEvent(data, base44);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleWebhookEvent(data, base44) {
  switch (data.type) {
    case 'payment.success':
      await base44.asServiceRole.entities.Financial.create({
        description: 'תשלום התקבל',
        amount: data.amount,
        type: 'הכנסה',
        client_id: data.client_id
      });
      break;
      
    case 'form.submitted':
      await base44.asServiceRole.entities.Client.create({
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        source: 'Website Form'
      });
      break;
  }
}`}
                    copyId="webhook-secure"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שליחת Webhook</h4>
                  <CodeBlock
                    code={`const sendWebhook = async (url, data) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Source': 'LawForce',
      'X-Timestamp': Date.now().toString()
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(\`Webhook failed: \${response.statusText}\`);
  }
  
  return await response.json();
};

// דוגמה לשימוש
await sendWebhook('https://external-system.com/webhook', {
  event: 'client_updated',
  client_id: '123',
  changes: { status: 'לקוח' }
});`}
                    copyId="webhook-send"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Webhook Retry Logic</h4>
                  <CodeBlock
                    code={`async function sendWebhookWithRetry(url, data, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // אם זה לא הניסיון האחרון, המתן לפני ניסיון נוסף
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000) // Exponential backoff
        );
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }
  
  throw new Error('Webhook failed after all retries');
}`}
                    copyId="webhook-retry"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Google Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-red-500" />
                  Google Calendar Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
                  <h4 className="font-semibold text-red-900 mb-2">אינטגרציה עם Google Calendar</h4>
                  <p className="text-sm text-red-800">
                    המערכת מסונכרנת אוטומטית עם Google Calendar כדי לנהל פגישות ולשלוח תזכורות.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">הגדרה ראשונית</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
                    <li>וודא ש-Google OAuth מוגדר (ראה למעלה)</li>
                    <li>הפעל Google Calendar API ב-Google Cloud Console</li>
                    <li>הגדר את ה-Scopes הנדרשים:
                      <ul className="list-disc list-inside mr-8 mt-2">
                        <li>https://www.googleapis.com/auth/calendar.events</li>
                        <li>https://www.googleapis.com/auth/calendar.readonly</li>
                      </ul>
                    </li>
                    <li>בעמוד Appointments, לחץ על "חבר Google Calendar"</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">יצירת אירוע</h4>
                  <CodeBlock
                    code={`// functions/googleCalendarInsert.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { title, date, time, duration, attendees, description } = await req.json();
  
  // קבל access token
  const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");
  
  // צור אירוע
  const startDateTime = new Date(\`\${date}T\${time}\`);
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
  
  const event = {
    summary: title,
    description: description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Jerusalem',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Jerusalem',
    },
    attendees: attendees.map(email => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };
  
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );
  
  const createdEvent = await response.json();
  
  // שמור במערכת
  await base44.entities.Appointment.create({
    title,
    date,
    time,
    google_event_id: createdEvent.id,
    google_html_link: createdEvent.htmlLink,
  });
  
  return Response.json({ success: true, event: createdEvent });
});`}
                    copyId="gcal-create"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">קריאת אירועים</h4>
                  <CodeBlock
                    code={`const fetchCalendarEvents = async (startDate, endDate) => {
  const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");
  
  const params = new URLSearchParams({
    timeMin: new Date(startDate).toISOString(),
    timeMax: new Date(endDate).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });
  
  const response = await fetch(
    \`https://www.googleapis.com/calendar/v3/calendars/primary/events?\${params}\`,
    {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
      },
    }
  );
  
  const data = await response.json();
  return data.items;
};`}
                    copyId="gcal-read"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">עדכון אירוע</h4>
                  <CodeBlock
                    code={`const updateCalendarEvent = async (eventId, updates) => {
  const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");
  
  const response = await fetch(
    \`https://www.googleapis.com/calendar/v3/calendars/primary/events/\${eventId}\`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  );
  
  return await response.json();
};`}
                    copyId="gcal-update"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">מחיקת אירוע</h4>
                  <CodeBlock
                    code={`const deleteCalendarEvent = async (eventId) => {
  const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");
  
  await fetch(
    \`https://www.googleapis.com/calendar/v3/calendars/primary/events/\${eventId}\`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
      },
    }
  );
};`}
                    copyId="gcal-delete"
                  />
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* Automations & System Tab */}
          <TabsContent value="automations" className="space-y-6">
            
            {/* Automations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-orange-500" />
                  אוטומציות (Automations)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded">
                  <h4 className="font-semibold text-orange-900 mb-2">מערכת אוטומציות</h4>
                  <p className="text-sm text-orange-800">
                    האוטומציות מאפשרות להפעיל פעולות אוטומטיות בתגובה לאירועים במערכת או בזמן מתוכנן.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">סוגי Triggers (טריגרים)</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">lead_created</Badge> - לקוח חדש נוצר
                    <br />
                    <Badge variant="outline">lead_created_by_source</Badge> - לקוח חדש ממקור מסוים
                    <br />
                    <Badge variant="outline">status_changed</Badge> - סטטוס השתנה
                    <br />
                    <Badge variant="outline">task_assigned</Badge> - משימה הוקצתה
                    <br />
                    <Badge variant="outline">case_created</Badge> - תיק חדש נוצר
                    <br />
                    <Badge variant="outline">appointment_scheduled</Badge> - פגישה נקבעה
                    <br />
                    <Badge variant="outline">document_signed</Badge> - מסמך נחתם
                    <br />
                    <Badge variant="outline">integration_webhook</Badge> - Webhook מאינטגרציה חיצונית
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">סוגי Steps (פעולות)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm mr-4">
                    <li><strong>send_email:</strong> שלח מייל ללקוח</li>
                    <li><strong>send_sms:</strong> שלח SMS</li>
                    <li><strong>change_status:</strong> שנה סטטוס לקוח</li>
                    <li><strong>create_task:</strong> צור משימה חדשה</li>
                    <li><strong>create_case:</strong> צור תיק חדש</li>
                    <li><strong>add_note:</strong> הוסף הערה</li>
                    <li><strong>send_document:</strong> שלח מסמך לחתימה</li>
                    <li><strong>wait:</strong> המתן זמן מסוים</li>
                    <li><strong>update_field:</strong> עדכן שדה</li>
                    <li><strong>delete_record:</strong> מחק רשומה</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">יצירת אוטומציה דרך הממשק</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
                    <li>עבור ל-<strong>ניהול מערכת → אוטומציות</strong></li>
                    <li>לחץ על "הוסף אוטומציה"</li>
                    <li>בחר טריגר (אירוע מפעיל)</li>
                    <li>הגדר תנאים (אופציונלי)</li>
                    <li>הוסף שלבי פעולה</li>
                    <li>הפעל את האוטומציה</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">דוגמה: אוטומציה למעקב אחר לקוח חדש</h4>
                  <CodeBlock
                    code={`{
  "name": "מעקב לקוח חדש",
  "trigger_type": "lead_created",
  "trigger_config": {
    "source": "פייסבוק"
  },
  "steps": [
    {
      "step_type": "send_email",
      "order": 1,
      "step_config": {
        "to": "{{client.email}}",
        "subject": "ברוכים הבאים למשרד",
        "body": "שלום {{client.full_name}}, תודה שפנית אלינו..."
      }
    },
    {
      "step_type": "create_task",
      "order": 2,
      "step_config": {
        "title": "התקשר ללקוח {{client.full_name}}",
        "assigned_to": "auto",
        "due_days": 1,
        "priority": "גבוהה"
      }
    },
    {
      "step_type": "wait",
      "order": 3,
      "step_config": {
        "duration": 24,
        "unit": "hours"
      }
    },
    {
      "step_type": "send_email",
      "order": 4,
      "step_config": {
        "to": "{{client.email}}",
        "subject": "האם קיבלת את המידע?",
        "body": "שלום שוב, רצינו לבדוק אם קיבלת את המידע..."
      }
    }
  ],
  "is_active": true
}`}
                    copyId="automation-example"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">הרצת אוטומציה באופן ידני (Backend Function)</h4>
                  <CodeBlock
                    code={`// functions/runAutomations.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { automation_id, entity_id, entity_type } = await req.json();
  
  // טען את האוטומציה
  const automation = await base44.entities.Automation.get(automation_id);
  
  if (!automation.is_active) {
    return Response.json({ error: 'Automation is not active' }, { status: 400 });
  }
  
  // טען את הישות
  const entity = await base44.entities[entity_type].get(entity_id);
  
  // רשום לוג
  const log = await base44.entities.AutomationLog.create({
    automation_id,
    automation_name: automation.name,
    trigger_type: automation.trigger_type,
    entity_id,
    entity_type,
    status: 'running',
    current_step: 0,
    total_steps: automation.steps.length
  });
  
  // בצע כל שלב
  for (const step of automation.steps) {
    try {
      await executeStep(step, entity, base44);
      
      // עדכן לוג
      await base44.entities.AutomationLog.update(log.id, {
        steps_completed: step.order,
        current_step: step.order + 1
      });
      
    } catch (error) {
      // רשום שגיאה
      await base44.entities.AutomationLog.update(log.id, {
        status: 'failed',
        error_message: error.message
      });
      throw error;
    }
  }
  
  // סיום מוצלח
  await base44.entities.AutomationLog.update(log.id, {
    status: 'completed'
  });
  
  return Response.json({ success: true, log_id: log.id });
});

async function executeStep(step, entity, base44) {
  const config = step.step_config;
  
  switch (step.step_type) {
    case 'send_email':
      await base44.integrations.Core.SendEmail({
        to: replaceVariables(config.to, entity),
        subject: replaceVariables(config.subject, entity),
        body: replaceVariables(config.body, entity)
      });
      break;
      
    case 'create_task':
      await base44.entities.Task.create({
        title: replaceVariables(config.title, entity),
        client_id: entity.id,
        assigned_to: config.assigned_to,
        due_date: addDays(new Date(), config.due_days || 0),
        priority: config.priority
      });
      break;
      
    case 'change_status':
      await base44.entities.Client.update(entity.id, {
        status: config.new_status
      });
      break;
      
    case 'wait':
      // המתן (בפועל, צריך לתזמן את השלב הבא)
      await new Promise(resolve => 
        setTimeout(resolve, config.duration * 3600000)
      );
      break;
  }
}

function replaceVariables(text, entity) {
  return text.replace(/{{(.*?)}}/g, (match, path) => {
    const keys = path.split('.');
    let value = entity;
    for (const key of keys) {
      value = value?.[key.trim()];
    }
    return value || '';
  });
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}`}
                    copyId="automation-run"
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6 text-gray-500" />
                  הגדרות מערכת (System Settings)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 border-r-4 border-gray-500 p-4 rounded">
                  <h4 className="font-semibold text-gray-900 mb-2">ניהול הגדרות כלליות</h4>
                  <p className="text-sm text-gray-800">
                    הגדרות מערכת מאפשרות להתאים את המערכת לצרכים הספציפיים של המשרד.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">אפשרויות סטטוס לקוח</h4>
                  <p className="text-sm text-gray-600 mb-2">ניתן להגדיר סטטוסים מותאמים אישית במערכת:</p>
                  <CodeBlock
                    code={`// הגדרת סטטוסים חדשים
const updateClientStatuses = async () => {
  await base44.entities.ClientSettings.update('settings_id', {
    status_options: [
      'ליד חדש',
      'בטיפול',
      'ממתין למסמכים',
      'לקוח פעיל',
      'סגור - הצליח',
      'סגור - לא רלוונטי'
    ]
  });
};`}
                    copyId="settings-status"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">תבניות הודעות</h4>
                  <CodeBlock
                    code={`const createMessageTemplate = async () => {
  const settings = await base44.entities.ClientSettings.list();
  const currentSettings = settings[0];
  
  const newTemplates = [
    ...currentSettings.message_templates,
    {
      id: Date.now().toString(),
      title: 'תזכורת לפגישה',
      body: \`שלום {{full_name}},
      
זוהי תזכורת לפגישה שלנו מחר ב-{{appointment_time}}.
המשרד נמצא ב{{office_address}}.

נשמח לראותך!
בברכה,
{{lawyer_name}}\`
    }
  ];
  
  await base44.entities.ClientSettings.update(currentSettings.id, {
    message_templates: newTemplates
  });
};`}
                    copyId="settings-templates"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">הגדרות ברירת מחדל</h4>
                  <CodeBlock
                    code={`// הגדרת הודעת ברכה אוטומטית
await base44.entities.ClientSettings.update('settings_id', {
  default_welcome_message: \`שלום {{full_name}},
  
תודה שפנית למשרד שלנו בנושא {{service_type}}.
נחזור אליך בהקדם האפשרי.

בברכה,
צוות המשרד\`,
  
  // הגדרות אוטומציה
  automation_settings: {
    send_welcome_message: true,
    auto_followup: true,
    followup_days: 2,
    auto_create_task: true,
    default_task_assignee: 'secretary@office.com'
  }
});`}
                    copyId="settings-defaults"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Client Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  הגדרות לקוח (Client Settings)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">התאמה אישית של שדות לקוח</h4>
                  <p className="text-sm text-blue-800">
                    ניתן להוסיף שדות מותאמים אישית לכל לקוח.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">יצירת שדה מותאם אישית</h4>
                  <CodeBlock
                    code={`const createCustomField = async () => {
  await base44.entities.CustomField.create({
    field_name: 'insurance_company',
    field_label: 'חברת ביטוח',
    field_type: 'select',
    field_options: [
      'כלל ביטוח',
      'הפניקס',
      'מנורה מבטחים',
      'הראל',
      'איי די איי',
      'אחר'
    ],
    is_required: false,
    entity_type: 'Client',
    order: 10,
    is_active: true
  });
};`}
                    copyId="client-custom-field"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שימוש בשדות מותאמים</h4>
                  <CodeBlock
                    code={`// יצירת לקוח עם שדות מותאמים
const createClientWithCustomFields = async () => {
  const client = await base44.entities.Client.create({
    full_name: 'ישראל ישראלי',
    phone: '050-1234567',
    email: 'israel@example.com',
    
    // שדות בסיסיים
    status: 'ליד',
    source: 'פייסבוק',
    
    // שדות מותאמים (נשמרים כ-JSON)
    custom_fields: {
      insurance_company: 'כלל ביטוח',
      policy_number: '12345678',
      claim_date: '2024-01-15',
      injury_type: 'תאונת דרכים'
    }
  });
  
  return client;
};

// קריאת שדות מותאמים
const getClientCustomFields = async (clientId) => {
  const client = await base44.entities.Client.get(clientId);
  return client.custom_fields;
};`}
                    copyId="client-use-custom"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-purple-500" />
                  הגדרות AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded">
                  <h4 className="font-semibold text-purple-900 mb-2">Prompts מותאמים אישית</h4>
                  <p className="text-sm text-purple-800">
                    ניתן להגדיר Prompts של AI לשימושים שונים במערכת.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">יצירת AI Prompt</h4>
                  <CodeBlock
                    code={`const createAiPrompt = async () => {
  await base44.entities.AiPrompt.create({
    name: 'סיכום פגישה',
    description: 'מסכם פגישה עם לקוח ומחלץ נקודות מפתח',
    prompt_template: \`אתה עוזר AI של משרד עורכי דין.
סכם את הפגישה הבאה ותחלץ:
1. נושאים שנדונו
2. החלטות שהתקבלו  
3. פעולות המשך נדרשות
4. מועדים חשובים

תוכן הפגישה:
{{meeting_notes}}

פורמט התשובה ב-JSON:\`,
    response_schema: {
      type: 'object',
      properties: {
        topics: { type: 'array', items: { type: 'string' } },
        decisions: { type: 'array', items: { type: 'string' } },
        action_items: { type: 'array', items: { type: 'string' } },
        important_dates: { type: 'array', items: { type: 'string' } }
      }
    },
    category: 'meetings',
    is_active: true
  });
};`}
                    copyId="ai-prompt-create"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שימוש ב-AI Prompt</h4>
                  <CodeBlock
                    code={`const useMeetingSummary = async (meetingNotes) => {
  // טען את ה-Prompt
  const prompts = await base44.entities.AiPrompt.filter({
    name: 'סיכום פגישה',
    is_active: true
  });
  
  const prompt = prompts[0];
  
  // החלף משתנים
  const finalPrompt = prompt.prompt_template
    .replace('{{meeting_notes}}', meetingNotes);
  
  // הרץ AI
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: finalPrompt,
    response_json_schema: prompt.response_schema
  });
  
  return result;
};

// דוגמת שימוש
const summary = await useMeetingSummary(\`
פגישה עם הלקוח ישראל ישראלי.
דובר על תביעת ביטוח בגין תאונת דרכים ב-15.1.2024.
הלקוח סיפק מסמכים: דוח משטרה, אישורים רפואיים.
הוחלט לפנות לחברת הביטוח תוך 7 ימים.
הפגישה הבאה: 30.1.2024 בשעה 10:00.
\`);

console.log(summary);
// {
//   topics: ['תביעת ביטוח', 'תאונת דרכים'],
//   decisions: ['פנייה לחברת ביטוח תוך 7 ימים'],
//   action_items: ['איסוף מסמכים נוספים', 'שליחת מכתב לביטוח'],
//   important_dates: ['30.1.2024 - פגישה המשך']
// }`}
                    copyId="ai-prompt-use"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">דוגמאות נוספות ל-Prompts</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm mr-4">
                    <li><strong>ניתוח חוזה:</strong> מחלץ סעיפים חשובים, התחייבויות, מועדים</li>
                    <li><strong>המלצות צעד הבא:</strong> מציע פעולות לפי סטטוס התיק</li>
                    <li><strong>יצירת טיוטת מייל:</strong> כותב מייל ללקוח לפי הקשר</li>
                    <li><strong>סיווג דחיפות:</strong> מסווג פניות לפי רמת דחיפות</li>
                    <li><strong>תרגום משפטי:</strong> מתרגם מסמכים תוך שמירה על טרמינולוגיה</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* Permissions & Management Tab */}
          <TabsContent value="permissions" className="space-y-6">
            
            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-500" />
                  ניהול הרשאות (Permissions)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
                  <h4 className="font-semibold text-red-900 mb-2">מערכת הרשאות מבוססת תפקידים</h4>
                  <p className="text-sm text-red-800">
                    המערכת תומכת ב-4 רמות הרשאה: בעלים (Owner), ראש מחלקה (Department Head), עורך דין (Lawyer), ומנהל מערכת (Admin).
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">תפקידים ורמות הרשאה</h4>
                  <div className="space-y-3">
                    <div className="border-r-4 border-blue-500 bg-blue-50 p-3 rounded">
                      <h5 className="font-semibold text-blue-900">Admin (מנהל מערכת)</h5>
                      <p className="text-sm text-blue-800">גישה מלאה לכל המערכת, כולל הגדרות מערכת, חשבונות, קרדיטים</p>
                    </div>
                    <div className="border-r-4 border-purple-500 bg-purple-50 p-3 rounded">
                      <h5 className="font-semibold text-purple-900">Owner (בעל משרד)</h5>
                      <p className="text-sm text-purple-800">גישה מלאה למשרד שלו, ניהול צוות, דוחות, כספים</p>
                    </div>
                    <div className="border-r-4 border-green-500 bg-green-50 p-3 rounded">
                      <h5 className="font-semibold text-green-900">Department Head (ראש מחלקה)</h5>
                      <p className="text-sm text-green-800">ניהול צוות במחלקה, גישה לדוחות, ניהול תיקים</p>
                    </div>
                    <div className="border-r-4 border-gray-500 bg-gray-50 p-3 rounded">
                      <h5 className="font-semibold text-gray-900">Lawyer (עורך דין)</h5>
                      <p className="text-sm text-gray-800">גישה לתיקים שלו בלבד, יצירת לקוחות ומשימות</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">בדיקת הרשאות בקוד</h4>
                  <CodeBlock
                    code={`import { base44 } from '@/api/base44Client';

// בדוק אם המשתמש הוא בעלים
const checkIfOwner = async () => {
  const user = await base44.auth.me();
  return user.user_role === 'owner' || user.role === 'owner';
};

// בדוק אם למשתמש יש הרשאה לראות דוחות
const canViewReports = async () => {
  const user = await base44.auth.me();
  const allowedRoles = ['admin', 'owner', 'department_head'];
  return allowedRoles.includes(user.user_role || user.role);
};

// Guard לדף מוגן
const ProtectedPage = () => {
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    checkAccess();
  }, []);
  
  const checkAccess = async () => {
    const user = await base44.auth.me();
    if (!user || user.user_role !== 'owner') {
      navigate('/');
      return;
    }
    setHasAccess(true);
  };
  
  if (!hasAccess) return <div>בודק הרשאות...</div>;
  
  return <div>תוכן הדף המוגן</div>;
};`}
                    copyId="permissions-check"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">הגבלת גישה ב-Backend Functions</h4>
                  <CodeBlock
                    code={`// functions/adminOnly.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  // בדוק אם המשתמש הוא Admin
  if (user?.role !== 'admin') {
    return Response.json(
      { error: 'Forbidden: Admin access required' }, 
      { status: 403 }
    );
  }
  
  // המשך עם הלוגיקה של האדמין...
  const data = await performAdminOperation();
  
  return Response.json({ success: true, data });
});`}
                    copyId="permissions-backend"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">סינון נתונים לפי הרשאות</h4>
                  <CodeBlock
                    code={`// הצג רק תיקים שהמשתמש רשאי לראות
const getAccessibleCases = async () => {
  const user = await base44.auth.me();
  
  let query = {};
  
  // עורך דין רואה רק את התיקים שלו
  if (user.user_role === 'lawyer') {
    query = { assigned_to: user.email };
  }
  
  // ראש מחלקה רואה את המחלקה שלו
  else if (user.user_role === 'department_head') {
    query = { department: user.department };
  }
  
  // בעלים ואדמין רואים הכל (עם סינון לפי sub_account)
  else if (user.user_role === 'owner' || user.role === 'admin') {
    if (user.sub_account_id) {
      query = { sub_account_id: user.sub_account_id };
    }
  }
  
  const cases = await base44.entities.Case.filter(query);
  return cases;
};`}
                    copyId="permissions-filter"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sub Accounts Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-indigo-500" />
                  ניהול חשבונות משנה (Sub Accounts)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-indigo-50 border-r-4 border-indigo-500 p-4 rounded">
                  <h4 className="font-semibold text-indigo-900 mb-2">מערכת רב-משרדית</h4>
                  <p className="text-sm text-indigo-800">
                    המערכת תומכת בניהול מספר משרדים נפרדים תחת אותה אפליקציה, כל אחד עם המשתמשים והנתונים שלו.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">יצירת משרד חדש</h4>
                  <CodeBlock
                    code={`const createSubAccount = async () => {
  const subAccount = await base44.entities.SubAccount.create({
    name: 'משרד כהן ושות',
    owner_email: 'cohen@lawoffice.com',
    phone: '03-1234567',
    address: 'רחוב הרצל 123, תל אביב',
    license_number: 'L-12345',
    status: 'active',
    subscription_type: 'premium',
    subscription_end_date: '2025-12-31',
    max_users: 10,
    notes: 'משרד בוטיק המתמחה בדיני חברות'
  });
  
  return subAccount;
};`}
                    copyId="subaccount-create"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">הקצאת משתמש למשרד</h4>
                  <CodeBlock
                    code={`const assignUserToSubAccount = async (userId, subAccountId) => {
  await base44.entities.User.update(userId, {
    sub_account_id: subAccountId,
    user_role: 'lawyer'
  });
};

// הזמנת משתמש חדש למשרד
const inviteUserToSubAccount = async (email, role, subAccountId) => {
  // שלח הזמנה
  await base44.users.inviteUser(email, 'user');
  
  // שמור את הפרטים להקצאה לאחר ההרשמה
  sessionStorage.setItem('invite_params', JSON.stringify({
    sub_account_id: subAccountId,
    assigned_role: role
  }));
};`}
                    copyId="subaccount-assign"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">סינון נתונים לפי משרד</h4>
                  <CodeBlock
                    code={`// כל השאילתות צריכות להיות מסוננות לפי sub_account_id
const getOfficeClients = async () => {
  const user = await base44.auth.me();
  
  if (!user.sub_account_id) {
    throw new Error('User not assigned to any office');
  }
  
  const clients = await base44.entities.Client.filter({
    sub_account_id: user.sub_account_id
  });
  
  return clients;
};

// פונקציה כללית לסינון
const filterByOffice = async (entityName, additionalFilters = {}) => {
  const user = await base44.auth.me();
  
  const query = {
    ...additionalFilters,
    sub_account_id: user.sub_account_id
  };
  
  return await base44.entities[entityName].filter(query);
};

// שימוש
const activeCases = await filterByOffice('Case', { status: 'פעיל' });`}
                    copyId="subaccount-filter"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">התחזות (Impersonation) - למנהלי מערכת</h4>
                  <CodeBlock
                    code={`// רק Admin יכול להתחזות
const impersonateUser = async (targetUserId) => {
  const currentUser = await base44.auth.me();
  
  if (currentUser.role !== 'admin') {
    throw new Error('Only admins can impersonate');
  }
  
  const targetUser = await base44.entities.User.get(targetUserId);
  
  // שמור את המשתמש המקורי
  sessionStorage.setItem('original_user', JSON.stringify(currentUser));
  sessionStorage.setItem('impersonating_user', JSON.stringify(targetUser));
  
  // רענן את הדף
  window.location.reload();
};

// חזרה למשתמש מקורי
const stopImpersonation = () => {
  sessionStorage.removeItem('impersonating_user');
  window.location.reload();
};`}
                    copyId="impersonation"
                  />
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* Advanced Features Tab */}
          <TabsContent value="advanced" className="space-y-6">
            
            {/* Custom Pages Studio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-6 h-6 text-teal-500" />
                  סטודיו דפים מותאמים אישית (Object Studio)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-teal-50 border-r-4 border-teal-500 p-4 rounded">
                  <h4 className="font-semibold text-teal-900 mb-2">יצירת ישויות ודפים מותאמים</h4>
                  <p className="text-sm text-teal-800">
                    Object Studio מאפשר ליצור ישויות ודפים חדשים ללא קוד, עם שדות מותאמים אישית.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">יצירת ישות חדשה</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
                    <li>עבור ל-<strong>ניהול מערכת → Object Studio</strong></li>
                    <li>לחץ על "צור ישות חדשה"</li>
                    <li>הגדר:
                      <ul className="list-disc list-inside mr-8 mt-1">
                        <li>שם הישות (יחיד ורבים)</li>
                        <li>שם מערכת (באנגלית, ייחודי)</li>
                        <li>אייקון</li>
                        <li>צבע</li>
                      </ul>
                    </li>
                    <li>הוסף שדות לישות</li>
                    <li>הגדר קטעים (Sections) לארגון השדות</li>
                    <li>הגדר עמודות לתצוגת הרשימה</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">דוגמה: יצירת ישות "מתחרים"</h4>
                  <CodeBlock
                    code={`// יצירת הישות
const competitorObject = await base44.entities.SystemObject.create({
  object_name: 'מתחרים',
  object_name_singular: 'מתחרה',
  system_name: 'Competitor',
  icon: 'Building',
  color: '#FF6B6B',
  description: 'ניהול מתחרים במשרד',
  is_active: true
});

// הוספת שדות
const fields = [
  {
    object_id: competitorObject.id,
    field_name: 'company_name',
    field_label: 'שם החברה',
    field_type: 'text',
    is_required: true,
    order_index: 1
  },
  {
    object_id: competitorObject.id,
    field_name: 'website',
    field_label: 'אתר אינטרנט',
    field_type: 'url',
    is_required: false,
    order_index: 2
  },
  {
    object_id: competitorObject.id,
    field_name: 'market_share',
    field_label: 'נתח שוק (%)',
    field_type: 'number',
    is_required: false,
    order_index: 3
  },
  {
    object_id: competitorObject.id,
    field_name: 'notes',
    field_label: 'הערות',
    field_type: 'textarea',
    is_required: false,
    order_index: 4
  }
];

for (const field of fields) {
  await base44.entities.ObjectField.create(field);
}

// יצירת סקשן
const section = await base44.entities.ObjectSection.create({
  object_id: competitorObject.id,
  section_name: 'פרטי מתחרה',
  order_index: 0,
  color: '#FF6B6B'
});

// הוספת עמודות לתצוגה
const columns = [
  {
    object_id: competitorObject.id,
    field_name: 'company_name',
    column_label: 'שם',
    order_index: 1,
    width: '200px',
    is_visible: true
  },
  {
    object_id: competitorObject.id,
    field_name: 'market_share',
    column_label: 'נתח שוק',
    order_index: 2,
    width: '100px',
    is_visible: true
  }
];

for (const col of columns) {
  await base44.entities.ObjectColumn.create(col);
}`}
                    copyId="object-create"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שימוש בישות המותאמת</h4>
                  <CodeBlock
                    code={`// יצירת רשומה חדשה
const createCompetitor = async () => {
  await base44.entities.CustomRecord.create({
    object_id: competitorObject.id,
    section_id: section.id,
    data: {
      company_name: 'משרד כהן ושות',
      website: 'https://cohen-law.co.il',
      market_share: 15,
      notes: 'מתמחים בדיני נדל"ן'
    }
  });
};

// קריאת כל הרשומות
const getCompetitors = async () => {
  const records = await base44.entities.CustomRecord.filter({
    object_id: competitorObject.id
  });
  
  return records.map(r => r.data);
};

// עדכון רשומה
const updateCompetitor = async (recordId, updates) => {
  const record = await base44.entities.CustomRecord.get(recordId);
  
  await base44.entities.CustomRecord.update(recordId, {
    data: {
      ...record.data,
      ...updates
    }
  });
};`}
                    copyId="object-use"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Digital Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-6 h-6 text-green-500" />
                  חתימה דיגיטלית (Digital Signature)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded">
                  <h4 className="font-semibold text-green-900 mb-2">מערכת חתימה דיגיטלית מובנית</h4>
                  <p className="text-sm text-green-800">
                    המערכת כוללת פתרון חתימה דיגיטלית מלא: העלאת מסמכים, הוספת שדות, שליחה ללקוח, ומעקב אחר סטטוס.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">תהליך החתימה</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm mr-4">
                    <li><strong>יצירת תבנית:</strong> העלה PDF והוסף שדות (חתימה, טקסט, תאריך, checkbox)</li>
                    <li><strong>שליחה ללקוח:</strong> שלח קישור חתימה במייל</li>
                    <li><strong>חתימה:</strong> הלקוח פותח את הקישור, ממלא ומחתים</li>
                    <li><strong>עיבוד:</strong> המערכת מייצרת PDF חתום אוטומטית</li>
                    <li><strong>אחסון:</strong> המסמך החתום נשמר ונשלח למייל</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">יצירת תבנית חתימה</h4>
                  <CodeBlock
                    code={`const createSignatureTemplate = async (pdfUrl, pageImageUrls) => {
  const template = await base44.entities.DigitalSignatureTemplate.create({
    name: 'חוזה שירות משפטי',
    original_pdf_url: pdfUrl,
    page_image_urls: pageImageUrls,
    fields: [
      {
        id: 'client_name',
        type: 'text',
        page: 1,
        x: 10,
        y: 20,
        width: 30,
        height: 5,
        label: 'שם מלא',
        required: true,
        fontSize: 12
      },
      {
        id: 'client_signature',
        type: 'signature',
        page: 1,
        x: 10,
        y: 80,
        width: 40,
        height: 10,
        label: 'חתימה',
        required: true
      },
      {
        id: 'date',
        type: 'date',
        page: 1,
        x: 60,
        y: 80,
        width: 20,
        height: 5,
        label: 'תאריך',
        required: true
      },
      {
        id: 'accept_terms',
        type: 'checkbox',
        page: 2,
        x: 10,
        y: 50,
        width: 5,
        height: 5,
        label: 'אני מסכים לתנאי ההסכם',
        required: true
      }
    ],
    email_subject: 'בקשה לחתימה על חוזה שירות',
    email_body: 'שלום, אנא חתום על המסמך המצורף.'
  });
  
  return template;
};`}
                    copyId="signature-template"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שליחת בקשה לחתימה</h4>
                  <CodeBlock
                    code={`const sendSignatureRequest = async (templateId, clientId) => {
  // צור מסמך חתום
  const { data } = await base44.functions.invoke('sendSignatureRequest', {
    templateId,
    leadId: clientId,
    sendMethod: 'email'
  });
  
  console.log('Signing URL:', data.signing_url);
  return data;
};

// מעקב אחר סטטוס החתימה
const checkSignatureStatus = async (documentId) => {
  const doc = await base44.entities.SignedDocument.get(documentId);
  
  return {
    status: doc.status, // 'sent', 'viewed', 'signed', 'voided'
    signed_at: doc.signed_at,
    signed_pdf_url: doc.signed_pdf_url
  };
};`}
                    copyId="signature-send"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">טיפול בחתימה שהושלמה</h4>
                  <CodeBlock
                    code={`// אוטומציה שמופעלת כשמסמך נחתם
const onDocumentSigned = async (signedDocId) => {
  const signedDoc = await base44.entities.SignedDocument.get(signedDocId);
  const client = await base44.entities.Client.get(signedDoc.lead_id);
  
  // שלח אישור ללקוח
  await base44.integrations.Core.SendEmail({
    to: client.email,
    subject: 'המסמך נחתם בהצלחה',
    body: \`
      <html dir="rtl">
        <body>
          <h2>שלום \${client.full_name},</h2>
          <p>המסמך נחתם בהצלחה ב-\${new Date(signedDoc.signed_at).toLocaleDateString('he-IL')}.</p>
          <p>ניתן להוריד את המסמך החתום <a href="\${signedDoc.signed_pdf_url}">כאן</a>.</p>
          <p>בברכה,<br>המשרד</p>
        </body>
      </html>
    \`
  });
  
  // צור משימה מעקב
  await base44.entities.Task.create({
    title: \`מעקב אחרי \${client.full_name} - חוזה נחתם\`,
    client_id: client.id,
    due_date: addDays(new Date(), 3),
    priority: 'בינונית'
  });
  
  // שנה סטטוס לקוח
  await base44.entities.Client.update(client.id, {
    status: 'לקוח'
  });
};`}
                    copyId="signature-complete"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">ביטול בקשת חתימה</h4>
                  <CodeBlock
                    code={`const voidSignatureRequest = async (documentId, reason) => {
  await base44.functions.invoke('voidSignatureRequest', {
    documentId,
    reason
  });
  
  // שלח התראה ללקוח
  const doc = await base44.entities.SignedDocument.get(documentId);
  const client = await base44.entities.Client.get(doc.lead_id);
  
  await base44.integrations.Core.SendEmail({
    to: client.email,
    subject: 'בקשת החתימה בוטלה',
    body: \`שלום, בקשת החתימה בוטלה. סיבה: \${reason}\`
  });
};`}
                    copyId="signature-void"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Database & Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-6 h-6 text-blue-500" />
                  עבודה עם מסד הנתונים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">שאילתות ופעולות מתקדמות</h4>
                  <p className="text-sm text-blue-800">
                    דוגמאות לשאילתות מורכבות ופעולות batch על הנתונים.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">שאילתות מתקדמות</h4>
                  <CodeBlock
                    code={`// סינון עם מספר תנאים
const getHighValueClients = async () => {
  const clients = await base44.entities.Client.filter({
    status: 'לקוח',
    // ניתן להוסיף סינונים נוספים לפי צורך
  });
  
  // סינון בצד לקוח
  return clients.filter(c => {
    const totalRevenue = calculateClientRevenue(c.id);
    return totalRevenue > 50000;
  });
};

// מיון מתקדם
const getRecentClients = async (limit = 10) => {
  const clients = await base44.entities.Client.list('-created_date', limit);
  return clients;
};

// חיפוש טקסט
const searchClients = async (searchTerm) => {
  const allClients = await base44.entities.Client.list();
  
  return allClients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );
};`}
                    copyId="db-queries"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">פעולות Bulk</h4>
                  <CodeBlock
                    code={`// יצירה מרובה
const bulkCreateClients = async (clientsData) => {
  const results = [];
  
  for (const clientData of clientsData) {
    const client = await base44.entities.Client.create(clientData);
    results.push(client);
    
    // המתן קצר בין יצירות
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// עדכון מרובה
const bulkUpdateStatus = async (clientIds, newStatus) => {
  for (const id of clientIds) {
    await base44.entities.Client.update(id, { status: newStatus });
  }
};

// מחיקה מרובה
const bulkDeleteOldClients = async (beforeDate) => {
  const oldClients = await base44.entities.Client.filter({
    // סינון לפי תאריך
  });
  
  const clientsToDelete = oldClients.filter(c => 
    new Date(c.created_date) < new Date(beforeDate)
  );
  
  for (const client of clientsToDelete) {
    await base44.entities.Client.delete(client.id);
  }
};`}
                    copyId="db-bulk"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Aggregations (צבירות)</h4>
                  <CodeBlock
                    code={`// סטטיסטיקות כלליות
const getClientStats = async () => {
  const clients = await base44.entities.Client.list();
  
  const stats = {
    total: clients.length,
    byStatus: {},
    bySource: {},
    recentWeek: 0,
    recentMonth: 0
  };
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  clients.forEach(client => {
    // ספירה לפי סטטוס
    stats.byStatus[client.status] = (stats.byStatus[client.status] || 0) + 1;
    
    // ספירה לפי מקור
    stats.bySource[client.source] = (stats.bySource[client.source] || 0) + 1;
    
    // ספירה לפי תאריך
    const created = new Date(client.created_date);
    if (created >= weekAgo) stats.recentWeek++;
    if (created >= monthAgo) stats.recentMonth++;
  });
  
  return stats;
};

// דוחות כספיים
const getFinancialReport = async (startDate, endDate) => {
  const transactions = await base44.entities.Financial.filter({
    // סינון לפי תאריכים יעשה בצד לקוח
  });
  
  const filtered = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
  
  const report = {
    totalIncome: 0,
    totalExpense: 0,
    byCategory: {},
    transactions: filtered.length
  };
  
  filtered.forEach(t => {
    if (t.type === 'הכנסה') {
      report.totalIncome += t.amount;
    } else {
      report.totalExpense += t.amount;
    }
    
    report.byCategory[t.category] = (report.byCategory[t.category] || 0) + t.amount;
  });
  
  report.netProfit = report.totalIncome - report.totalExpense;
  
  return report;
};`}
                    copyId="db-aggregations"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-r-4 border-green-500 bg-green-50 p-3 rounded">
                    <h5 className="font-semibold text-green-900">✓ אבטחה</h5>
                    <ul className="text-sm text-green-800 list-disc list-inside mt-1 space-y-1">
                      <li>תמיד בדוק הרשאות משתמש לפני גישה לנתונים רגישים</li>
                      <li>אל תחשוף Secrets בקוד צד לקוח</li>
                      <li>השתמש ב-HTTPS בלבד לכל הקריאות</li>
                      <li>אמת חתימות Webhook לפני עיבוד נתונים</li>
                    </ul>
                  </div>

                  <div className="border-r-4 border-blue-500 bg-blue-50 p-3 rounded">
                    <h5 className="font-semibold text-blue-900">✓ ביצועים</h5>
                    <ul className="text-sm text-blue-800 list-disc list-inside mt-1 space-y-1">
                      <li>טען רק את הנתונים שאתה צריך (שימוש ב-filter במקום list)</li>
                      <li>השתמש ב-caching כשאפשר</li>
                      <li>בצע פעולות bulk בחבילות קטנות</li>
                      <li>הימנע מ-loops מקוננים עם קריאות API</li>
                    </ul>
                  </div>

                  <div className="border-r-4 border-yellow-500 bg-yellow-50 p-3 rounded">
                    <h5 className="font-semibold text-yellow-900">✓ תחזוקה</h5>
                    <ul className="text-sm text-yellow-800 list-disc list-inside mt-1 space-y-1">
                      <li>תעד את הקוד שלך</li>
                      <li>השתמש בשמות משתנים ברורים</li>
                      <li>טפל בשגיאות בצורה נכונה</li>
                      <li>בדוק את הקוד לפני deployment</li>
                    </ul>
                  </div>

                  <div className="border-r-4 border-purple-500 bg-purple-50 p-3 rounded">
                    <h5 className="font-semibold text-purple-900">✓ חוויית משתמש</h5>
                    <ul className="text-sm text-purple-800 list-disc list-inside mt-1 space-y-1">
                      <li>הצג loading states תמיד</li>
                      <li>תן feedback למשתמש על פעולות</li>
                      <li>טפל בשגיאות בצורה ידידותית</li>
                      <li>הפוך את הממשק לנגיש ורספונסיבי</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  );
}