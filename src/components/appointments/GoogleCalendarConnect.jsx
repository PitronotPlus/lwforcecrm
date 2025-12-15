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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-gray-800 mb-2">💡 למנהל המערכת:</p>
                            <p className="text-xs text-gray-600">
                                כדי להפעיל חיבור Google Calendar, יש להגדיר פעם אחת (לכל האפליקציה):<br/>
                                1. צור OAuth Client ב-<a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-blue-600 underline">Google Cloud Console</a><br/>
                                2. הגדר את GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET בהגדרות הסודות של האפליקציה<br/>
                                3. אחרי זה - כל משתמש יוכל להתחבר ליומן שלו בקליק
                            </p>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                            חבר את יומן Google שלך כדי:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                            <li>לסנכרן פגישות אוטומטית</li>
                            <li>לשלוח הזמנות ללקוחות עם אישור/דחייה</li>
                            <li>לקבל עדכונים בזמן אמת</li>
                            <li>ליצור פגישות Google Meet אוטומטיות</li>
                        </ul>
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