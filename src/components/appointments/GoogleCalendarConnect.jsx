import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function GoogleCalendarConnect() {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        checkConnection();
        
        // בדיקה אם חזרנו מ-OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            handleOAuthCallback(code);
        }
    }, []);

    const handleOAuthCallback = async (code) => {
        try {
            await base44.functions.invoke('googleCalendarConnect', { code });
            setConnected(true);
            // ניקוי ה-URL
            window.history.replaceState({}, '', '/Appointments?tab=google');
            alert('חיבור ליומן Google הושלם בהצלחה!');
        } catch (error) {
            console.error('שגיאה בהשלמת החיבור:', error);
        }
    };

    const checkConnection = async () => {
        try {
            const user = await base44.auth.me();
            // בדיקה אם יש טוקן של Google Calendar
            const hasToken = user.google_calendar_connected || false;
            setConnected(hasToken);
        } catch (error) {
            console.error('שגיאה בבדיקת חיבור:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            // קריאה לפונקציה שמתחילה OAuth flow למשתמש הנוכחי
            const result = await base44.functions.invoke('googleCalendarConnect', {});
            
            if (result.data.error === 'missing_credentials') {
                alert('חיבור Google Calendar טרם הוגדר במערכת.\n\nיש לפנות למנהל המערכת להגדרת חיבור Google Calendar (פעם אחת בלבד).');
                return;
            }
            
            if (result.data.authUrl) {
                // הפניית המשתמש לדף האישור של Google
                window.location.href = result.data.authUrl;
            }
        } catch (error) {
            console.error('שגיאה בחיבור:', error);
            if (error.message?.includes('GOOGLE_CLIENT_ID')) {
                alert('חיבור Google Calendar טרם הוגדר במערכת.\n\nיש לפנות למנהל המערכת.');
            } else {
                alert('אירעה שגיאה בחיבור. אנא נסה שוב.');
            }
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('האם אתה בטוח שברצונך להתנתק מיומן Google?')) return;
        
        try {
            await base44.auth.updateMe({ google_calendar_connected: false });
            setConnected(false);
            alert('התנתקת מיומן Google');
        } catch (error) {
            console.error('שגיאה בהתנתקות:', error);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await base44.functions.invoke('googleCalendarSync', {});
            alert('סנכרון הושלם בהצלחה!');
        } catch (error) {
            console.error('שגיאה בסנכרון:', error);
            alert('אירעה שגיאה בסנכרון');
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">טוען...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-[#3568AE]" />
                        חיבור ליומן Google
                    </div>
                    {connected ? (
                        <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            מחובר
                        </Badge>
                    ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3 ml-1" />
                            לא מחובר
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {connected ? (
                    <>
                        <p className="text-sm text-gray-600">
                            הפגישות שלך מסתנכרנות אוטומטית עם יומן Google. הלקוחות מקבלים הזמנות ויכולים לאשר או לדחות ישירות מהיומן שלהם.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSync}
                                variant="outline"
                                disabled={syncing}
                                className="flex-1"
                            >
                                {syncing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3568AE] ml-2" />
                                        מסנכרן...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 ml-2" />
                                        סנכרן עכשיו
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleDisconnect}
                                variant="outline"
                                className="flex-1 text-red-600 hover:bg-red-50"
                            >
                                התנתק
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                🔧 מדריך הגדרה חד-פעמית למנהל המערכת
                            </h3>
                            
                            <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-green-500">
                                <p className="text-sm font-semibold text-green-800 mb-2">✅ חשוב להבין:</p>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                    <strong>ההגדרה הזו היא פעם אחת בלבד לכל המערכת.</strong><br/>
                                    אחרי ההגדרה - כל עורך דין במשרד יוכל להתחבר ליומן Google <strong>שלו</strong> בקליק אחד.<br/>
                                    היומנים לא מתערבבים - כל אחד רואה רק את הפגישות שלו.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="font-semibold text-gray-800 mb-2">שלב 1: צור פרויקט ב-Google Cloud</p>
                                    <ol className="text-xs text-gray-700 space-y-2 pr-4" style={{ listStyleType: 'decimal' }}>
                                        <li>היכנס ל-<a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline font-medium">Google Cloud Console</a></li>
                                        <li>לחץ על "Select a project" ואז "NEW PROJECT"</li>
                                        <li>תן לפרויקט שם (למשל: "LawForce Calendar") ולחץ CREATE</li>
                                        <li>המתן שהפרויקט ייווצר ובחר בו</li>
                                    </ol>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="font-semibold text-gray-800 mb-2">שלב 2: הפעל את Google Calendar API</p>
                                    <ol className="text-xs text-gray-700 space-y-2 pr-4" style={{ listStyleType: 'decimal' }}>
                                        <li>בתפריט הצד, לחץ על "APIs & Services" → "Library"</li>
                                        <li>חפש "Google Calendar API"</li>
                                        <li>לחץ על התוצאה ואז על כפתור "ENABLE"</li>
                                    </ol>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="font-semibold text-gray-800 mb-2">שלב 3: צור OAuth Consent Screen</p>
                                    <ol className="text-xs text-gray-700 space-y-2 pr-4" style={{ listStyleType: 'decimal' }}>
                                        <li>עבור ל-"APIs & Services" → "OAuth consent screen"</li>
                                        <li>בחר <strong>"External"</strong> ולחץ CREATE</li>
                                        <li>מלא את הפרטים הבסיסיים:
                                            <ul className="pr-4 mt-1 space-y-1" style={{ listStyleType: 'circle' }}>
                                                <li>App name: LawForce (או שם המשרד שלך)</li>
                                                <li>User support email: האימייל שלך</li>
                                                <li>Developer contact: האימייל שלך</li>
                                            </ul>
                                        </li>
                                        <li>לחץ "SAVE AND CONTINUE" בכל השלבים (אפשר לדלג על Scopes)</li>
                                        <li>בשלב "Test users" - הוסף את כל כתובות המייל של עורכי הדין שיצטרכו להתחבר</li>
                                        <li>לחץ SAVE AND CONTINUE עד הסוף</li>
                                    </ol>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="font-semibold text-gray-800 mb-2">שלב 4: צור OAuth 2.0 Client ID</p>
                                    <ol className="text-xs text-gray-700 space-y-2 pr-4" style={{ listStyleType: 'decimal' }}>
                                        <li>עבור ל-"APIs & Services" → <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-blue-600 underline">"Credentials"</a></li>
                                        <li>לחץ על "+ CREATE CREDENTIALS" → "OAuth client ID"</li>
                                        <li>בחר Application type: <strong>"Web application"</strong></li>
                                        <li>תן שם (למשל: "LawForce Web Client")</li>
                                        <li>ב-"Authorized redirect URIs" לחץ "+ ADD URI" והוסף:
                                            <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs break-all">
                                                {window.location.origin}/Appointments?tab=google
                                            </div>
                                        </li>
                                        <li>לחץ CREATE</li>
                                        <li><strong className="text-red-600">חשוב!</strong> תיפתח חלונית עם Client ID ו-Client Secret - <strong>העתק אותם!</strong></li>
                                    </ol>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="font-semibold text-gray-800 mb-2">שלב 5: הזן את הפרטים במערכת</p>
                                    <ol className="text-xs text-gray-700 space-y-2 pr-4" style={{ listStyleType: 'decimal' }}>
                                        <li>עבור להגדרות המערכת → סודות (Secrets)</li>
                                        <li>הוסף סוד חדש בשם: <code className="bg-gray-100 px-2 py-1 rounded">GOOGLE_CLIENT_ID</code></li>
                                        <li>הדבק את ה-Client ID שקיבלת</li>
                                        <li>הוסף סוד נוסף בשם: <code className="bg-gray-100 px-2 py-1 rounded">GOOGLE_CLIENT_SECRET</code></li>
                                        <li>הדבק את ה-Client Secret שקיבלת</li>
                                        <li>שמור</li>
                                    </ol>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
                                    <p className="font-semibold text-green-800 mb-2">✅ סיימת! מה עכשיו?</p>
                                    <p className="text-xs text-gray-700">
                                        מעכשיו כל עורך דין במשרד יכול ללחוץ על "חבר יומן Google" למטה,<br/>
                                        להתחבר עם חשבון Google <strong>שלו</strong>, והמערכת תסנכרן את הפגישות <strong>שלו</strong> בלבד.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                            <p className="text-sm font-semibold text-gray-800 mb-2">למה זה טוב בשבילך?</p>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                                <li>סנכרון אוטומטי של פגישות ליומן Google שלך</li>
                                <li>שליחת הזמנות ללקוחות עם אפשרות אישור/דחייה</li>
                                <li>עדכונים בזמן אמת משני הצדדים</li>
                                <li>יצירת פגישות Google Meet אוטומטית</li>
                                <li>כל עורך דין מנהל את היומן שלו בנפרד</li>
                            </ul>
                        </div>
                        
                        <Button
                            onClick={handleConnect}
                            className="w-full bg-[#3568AE] hover:bg-[#2a5390]"
                        >
                            <CalendarIcon className="w-4 h-4 ml-2" />
                            חבר יומן Google
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}