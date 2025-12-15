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
                                קוד JavaScript להטמעה מלאה (ללא iframe)
                            </label>
                            <Textarea
                                value={`<div id="lawforce-booking" data-lawyer-id="${currentUser?.id}"></div>
                    <script src="${window.location.origin}/embed-booking.js"></script>`}
                                readOnly
                                className="font-mono text-xs"
                                rows={3}
                            />
                            <Button
                                onClick={() => copyToClipboard(`<div id="lawforce-booking" data-lawyer-id="${currentUser?.id}"></div>
                    <script src="${window.location.origin}/embed-booking.js"></script>`, 'embedjs')}
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
                            <div className="bg-white p-4 rounded-lg">
                                <iframe 
                                    src={bookingUrl} 
                                    width="100%" 
                                    height="800" 
                                    frameBorder="0"
                                    style={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    title="תצוגה מקדימה"
                                />
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 space-y-2">
                                <strong className="block">🎨 הטמעה מלאה ורספונסיבית:</strong>
                                <span className="block">• הטופס משתלב לחלוטין עם העיצוב של האתר שלך</span>
                                <span className="block">• רספונסיבי למובייל, טאבלט ומחשב</span>
                                <span className="block">• בונה את הטופס ישירות בעמוד (ללא iframe)</span>
                                <span className="block">• מתאים ל-WordPress, Wix, Shopify וכל אתר אחר</span>
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