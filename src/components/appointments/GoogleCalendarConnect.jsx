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
    }, []);

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
            // קבלת טוקן OAuth דרך BASE44
            const token = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
            
            if (token) {
                // שמירת מצב מחובר
                await base44.auth.updateMe({ google_calendar_connected: true });
                setConnected(true);
                
                // יצירת Webhook לעדכונים אוטומטיים
                await base44.functions.invoke('googleCalendarSetupWatch', {});
                
                alert('חיבור ליומן Google הושלם בהצלחה!');
            }
        } catch (error) {
            console.error('שגיאה בחיבור:', error);
            alert('אירעה שגיאה בחיבור. אנא נסה שוב.');
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