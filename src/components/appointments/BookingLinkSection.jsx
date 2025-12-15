import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Copy, Check, Code, Share2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function BookingLinkSection() {
    const [bookingUrl, setBookingUrl] = useState("");
    const [embedCode, setEmbedCode] = useState("");
    const [iframeCode, setIframeCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadBookingLink();
    }, []);

    const loadBookingLink = async () => {
        try {
            const user = await base44.auth.me();
            setCurrentUser(user);
            
            // יצירת קישור הזמנה ייחודי למשתמש
            const baseUrl = window.location.origin;
            const userBookingUrl = `${baseUrl}/Booking?id=${user.id}`;
            setBookingUrl(userBookingUrl);
            
            // קוד הטמעה כפתור
            const embed = `<a href="${userBookingUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-family: 'Heebo', sans-serif;">קבע פגישה עם ${user.full_name}</a>`;
            setEmbedCode(embed);
            
            // קוד Iframe
            const iframe = `<iframe src="${userBookingUrl}" width="100%" height="800" frameborder="0" style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></iframe>`;
            setIframeCode(iframe);
        } catch (error) {
            console.error("שגיאה בטעינת קישור הזמנה:", error);
        }
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("שגיאה בהעתקה:", error);
        }
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[#3568AE]" />
                    קישור הזמנת פגישות - שיתוף עם לקוחות
                </CardTitle>
                <p className="text-sm text-gray-600">
                    שתף קישור זה עם הלקוחות שלך כדי לאפשר להם לקבוע פגישות ישירות איתך
                </p>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="link" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="link">קישור ישיר</TabsTrigger>
                        <TabsTrigger value="button">כפתור</TabsTrigger>
                        <TabsTrigger value="embed">טופס מוטמע</TabsTrigger>
                        <TabsTrigger value="iframe">Iframe</TabsTrigger>
                    </TabsList>

                    {/* קישור ישיר */}
                    <TabsContent value="link" className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                קישור להזמנת פגישות
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={bookingUrl}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    onClick={() => copyToClipboard(bookingUrl, 'link')}
                                    variant="outline"
                                    className="flex-shrink-0"
                                >
                                    {copied === 'link' ? (
                                        <>
                                            <Check className="w-4 h-4 ml-1" />
                                            הועתק!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 ml-1" />
                                            העתק
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>💡 טיפ:</strong> שתף קישור זה באתר שלך, בחתימת המייל, ברשתות החברתיות או בווטסאפ כדי לאפשר ללקוחות לקבוע פגישות בקלות.
                            </p>
                        </div>
                    </TabsContent>

                    {/* כפתור הטמעה */}
                    <TabsContent value="button" className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                קוד HTML לכפתור
                            </label>
                            <Textarea
                                value={embedCode}
                                readOnly
                                className="font-mono text-xs h-24"
                            />
                            <Button
                                onClick={() => copyToClipboard(embedCode, 'embed')}
                                variant="outline"
                                className="mt-2"
                            >
                                {copied === 'embed' ? (
                                    <>
                                        <Check className="w-4 h-4 ml-1" />
                                        הועתק!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 ml-1" />
                                        העתק קוד
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">תצוגה מקדימה:</p>
                            <div dangerouslySetInnerHTML={{ __html: embedCode }} />
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>📌 הוראות שימוש:</strong> העתק את הקוד והדבק אותו בקוד ה-HTML של האתר שלך, בדף הנחיתה או בכל מקום אחר שבו תרצה שהלקוחות יראו את הכפתור.
                            </p>
                        </div>
                    </TabsContent>

                    {/* טופס מוטמע רספונסיבי */}
                    <TabsContent value="embed" className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                קוד JavaScript להטמעה רספונסיבית
                            </label>
                            <Textarea
                                value={`<div id="lawforce-booking"></div>
                    <script>
                    (function() {
                    const container = document.getElementById('lawforce-booking');
                    if (!container) return;

                    // יצירת הטופס
                    container.innerHTML = \`
                    <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; color: white; text-align: center; margin-bottom: 24px;">
                    <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: bold;">קביעת פגישה</h2>
                    <p style="margin: 0; opacity: 0.9; font-size: 16px;">מלא את הפרטים ונחזור אליך בהקדם</p>
                    </div>
                    <iframe src="${bookingUrl}" width="100%" height="900" frameborder="0" style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></iframe>
                    </div>
                    \`;
                    })();
                    </script>`}
                                readOnly
                                className="font-mono text-xs"
                                rows={20}
                            />
                            <Button
                                onClick={() => copyToClipboard(`<div id="lawforce-booking"></div>
                    <script>
                    (function() {
                    const container = document.getElementById('lawforce-booking');
                    if (!container) return;

                    container.innerHTML = \`
                    <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; color: white; text-align: center; margin-bottom: 24px;">
                    <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: bold;">קביעת פגישה</h2>
                    <p style="margin: 0; opacity: 0.9; font-size: 16px;">מלא את הפרטים ונחזור אליך בהקדם</p>
                    </div>
                    <iframe src="${bookingUrl}" width="100%" height="900" frameborder="0" style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></iframe>
                    </div>
                    \`;
                    })();
                    </script>`, 'embedjs')}
                                variant="outline"
                                className="mt-2"
                            >
                                {copied === 'embedjs' ? (
                                    <>
                                        <Check className="w-4 h-4 ml-1" />
                                        הועתק!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 ml-1" />
                                        העתק קוד
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">תצוגה מקדימה:</p>
                            <div className="bg-white p-4 rounded-lg" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '32px', color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>קביעת פגישה</h2>
                                    <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>מלא את הפרטים ונחזור אליך בהקדם</p>
                                </div>
                                <iframe 
                                    src={bookingUrl} 
                                    width="100%" 
                                    height="600" 
                                    frameBorder="0"
                                    style={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    title="תצוגה מקדימה"
                                />
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>🎨 הטמעה מעוצבת:</strong> קוד זה משלב את הטופס באתר שלך עם כותרת מעוצבת ועיצוב רספונסיבי. פשוט הדבק את הקוד בעמוד שלך והטופס יופיע אוטומטית! הקוד מתאים לכל אתר - WordPress, Wix, או כל פלטפורמה אחרת.
                            </p>
                        </div>
                    </TabsContent>

                    {/* Iframe */}
                    <TabsContent value="iframe" className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                קוד Iframe להטמעה מלאה
                            </label>
                            <Textarea
                                value={iframeCode}
                                readOnly
                                className="font-mono text-xs h-24"
                            />
                            <Button
                                onClick={() => copyToClipboard(iframeCode, 'iframe')}
                                variant="outline"
                                className="mt-2"
                            >
                                {copied === 'iframe' ? (
                                    <>
                                        <Check className="w-4 h-4 ml-1" />
                                        הועתק!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 ml-1" />
                                        העתק קוד
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">תצוגה מקדימה:</p>
                            <div className="bg-white p-2 rounded-lg border-2 border-gray-200 overflow-hidden">
                                <iframe 
                                    src={bookingUrl} 
                                    width="100%" 
                                    height="600" 
                                    frameBorder="0"
                                    style={{ border: 'none', borderRadius: '8px' }}
                                    title="תצוגה מקדימה של טופס הזמנת פגישות"
                                />
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>🚀 הטמעה מלאה:</strong> הדבק את הקוד הזה באתר שלך כדי להטמיע את כל טופס קביעת הפגישות ישירות בדף. הלקוחות יוכלו לקבוע פגישה מבלי לעזוב את האתר שלך!
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}