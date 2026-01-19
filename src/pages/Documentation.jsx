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

          {/* Continue in next message due to length... */}
          
        </Tabs>
      </div>
    </div>
  );
}