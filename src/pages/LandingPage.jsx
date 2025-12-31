import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Users, Zap, Shield, Headphones, BookOpen, Settings } from 'lucide-react';
// Removed: import SurveyModal from '../components/landing/SurveyModal';
import LeadForm from '../components/landing/LeadForm';
import PricingSection from '../components/landing/PricingSection';
import { createPageUrl } from '@/utils';

export default function LandingPage() {
    // Removed: const [isSurveyOpen, setIsSurveyOpen] = useState(false);

    useEffect(() => {
        handleInviteParameters();
    }, []);

    const handleInviteParameters = async () => {
        const params = new URLSearchParams(window.location.search);
        const inviterId = params.get('inviter_id');
        const subAccountId = params.get('sub_account_id');
        const assignedRole = params.get('assigned_role');

        if (inviterId && subAccountId && assignedRole) {
            // שמירת פרמטרי ההזמנה ל-sessionStorage לשימוש לאחר הרישום
            sessionStorage.setItem('invite_params', JSON.stringify({
                inviter_id: inviterId,
                inviter_email: params.get('inviter_email'),
                sub_account_id: subAccountId,
                assigned_role: assignedRole
            }));

            // עדכון המשתמש לאחר רישום
            try {
                const { base44 } = await import("@/api/base44Client");
                const isAuth = await base44.auth.isAuthenticated();
                
                if (isAuth) {
                    const inviteParams = JSON.parse(sessionStorage.getItem('invite_params'));
                    if (inviteParams) {
                        await base44.auth.updateMe({
                            sub_account_id: inviteParams.sub_account_id,
                            user_role: inviteParams.assigned_role
                        });
                        sessionStorage.removeItem('invite_params');
                        window.location.href = createPageUrl('Dashboard');
                    }
                }
            } catch (error) {
                console.error('שגיאה בעדכון משתמש מוזמן:', error);
            }
        }
    };

    const handleLogin = async () => {
        const { base44 } = await import("@/api/base44Client");
        const callbackUrl = createPageUrl('Dashboard');
        base44.auth.redirectToLogin(callbackUrl);
    };

    const handleSignup = async () => {
        const { base44 } = await import("@/api/base44Client");
        const callbackUrl = window.location.href; // חזרה לדף הנוכחי עם הפרמטרים
        base44.auth.redirectToLogin(callbackUrl);
    };

    return (
        <div className="bg-white text-gray-800" style={{ fontFamily: 'Heebo', direction: 'rtl' }}>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    {/* ימין: כפתורי כניסה */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={handleLogin}
                            className="text-sm md:text-base px-3 md:px-4 py-2 touch-manipulation"
                        >
                            התחבר
                        </Button>
                        <Button 
                            className="bg-[#3568AE] hover:bg-[#2A5494] text-white text-sm md:text-base px-3 md:px-4 py-2 touch-manipulation" 
                            onClick={handleSignup}
                        >
                           הרשמה ללא עלות
                        </Button>
                    </div>
                    {/* שמאל: לוגו וניווט */}
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-2">
                            <a href="#features" className="text-gray-600 hover:text-[#3568AE] px-3 py-2">מה כלול?</a>
                            <a href="#pricing" className="text-gray-600 hover:text-[#3568AE] px-3 py-2">תמחור</a>
                            <a href="#about" className="text-gray-600 hover:text-[#3568AE] px-3 py-2">מי אנחנו</a>
                        </div>
                        <div className="flex items-center">
                           <h1 className="text-2xl font-black text-[#3568AE]">Law<span className="font-normal">Force</span></h1>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="pt-24">
                {/* Hero Section */}
                <section className="text-center py-20 px-4 bg-gray-50">
                    <div className="container mx-auto px-6">
                        {/* H1 class updated per outline, text retained from original */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#3568AE]">כל הלקוחות שלך בוואטסאפ?</h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">הגיע הזמן למערכת מכירות וניהול לקוחות שנבנתה לעורך דין – ולא לעסק כללי.</p>
                        {/* New button added below */}
                        <div className="mt-8 flex justify-center gap-4">
                            <Button 
                                className="bg-[#3568AE] hover:bg-[#2A5494] text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 touch-manipulation"
                                onClick={handleSignup}
                            >
                                <Star className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                                אני רוצה חודש התנסות ללא עלות!
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Problem/Solution Section */}
                <section className="py-20 px-4 container mx-auto">
                    <div className="text-center max-w-3xl mx-auto">
                        <p className="text-lg text-gray-700">
                            אם אתה עורך דין עצמאי או עובד במשרד קטן, אתה בטח מכיר את זה: לקוחות מתפספסים, תיקים מתפזרים בין וואטסאפ, מייל, פתקים, ובלגן של משימות לא מסודרות.
                            LawForce נבנתה בדיוק בשבילך – מערכת CRM בעברית מלאה שמבינה איך משרד עו״ד באמת עובד.
                            היא מרכזת לקוחות, תיקים, שיחות ומשימות במקום אחד, עם סוכן AI משפטי שעוזר לך למכור, להישמע מקצועי, ולעקוב אחרי כל שלב – בלי לשבור את הראש.
                        </p>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-gray-50" id="features">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl font-bold text-center mb-10">מה כלול במערכת LawForce</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
                            {[
                                { title: "CRM בעברית – פשוט ונוח", desc: "לא עוד אקסלים ופתקים. מערכת ניהול מותאמת בדיוק למשרד עו\"ד." },
                                { title: "מערך ניהול ומיצוי מכירות", desc: "תיעוד שיחות אוטומטי, הוצאת תובנות מכירה והמלצות לפעולות הבאות." },
                                { title: "ניהול משימות מדויק", desc: "תזכורות, פולואפים, פגישות, תיעוד – הכל במקום אחד, מתוזמן וחכם." },
                                { title: "AI משפטי שעובד בשבילך", desc: "מנסח מכתבים, תמלולים ותובנות חכמות מכל שיחה עם לקוח." },
                                { title: "מותאם לעורכי דין ישראלים", desc: "בלי בלבול, בלי תרגומים, בלי פתרונות כלליים שמפספסים את המטרה." },
                                { title: "סוגרים יותר תיקים בפחות זמן", desc: "מערכת מכירות וניהול לקוחות שמדברת עברית משפטית." }
                            ].map(feature => (
                                <Card key={feature.title}>
                                    <CardHeader><CardTitle>{feature.title}</CardTitle></CardHeader>
                                    <CardContent><p>{feature.desc}</p></CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mockup Section / Why it works Section */}
                <section className="py-20 container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-center mb-10">כך זה נראה מבפנים:</h2>
                    <div className="max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden">
                        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4d8fa51f3_image.png" alt="LawForce Dashboard Mockup" className="w-full h-auto" />
                    </div>
                </section>

                <PricingSection id="pricing" /> {/* Added id for navigation */}

                {/* Testimonials Section */}
                <section className="bg-blue-50 py-20">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl font-bold text-center mb-10">מה עורכי דין מספרים על LawForce</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="flex flex-col">
                                <CardContent className="pt-6 flex-grow">
                                    <blockquote className="border-r-4 border-[#3568AE] pr-4 italic">
                                        "סוף סוף מרגיש שאני מנהל משרד – לא רק כיבוי שריפות. עכשיו הכול מתועד, מסודר, ונראה הרבה יותר מקצועי גם מול הלקוחות."
                                    </blockquote>
                                </CardContent>
                                <CardHeader><CardTitle>— עו״ד עידן ב' | משרד בתחום דיני משפחה</CardTitle></CardHeader>
                            </Card>
                            <Card className="flex flex-col">
                                <CardContent className="pt-6 flex-grow">
                                    <blockquote className="border-r-4 border-[#3568AE] pr-4 italic">
                                        "לא האמנתי ש־CRM יכול לעזור במכירות – טעיתי. עכשיו כל ליד נכנס למערכת, עם תזכורת, תיעוד וכל מה שצריך."
                                    </blockquote>
                                </CardContent>
                                <CardHeader><CardTitle>— עו״ד ליטל כ' | עצמאית, נזיקין ותביעות קטנות</CardTitle></CardHeader>
                            </Card>
                            <Card className="flex flex-col">
                                <CardContent className="pt-6 flex-grow">
                                    <blockquote className="border-r-4 border-[#3568AE] pr-4 italic">
                                        "ה־AI ניסח לי מכתב ללקוח יותר טוב ממני. ברצינות. חסך לי 40 דקות."
                                    </blockquote>
                                </CardContent>
                                <CardHeader><CardTitle>— עו״ד יאיר מ' | משרד ליטיגציה מסחרית</CardTitle></CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section className="py-20 container mx-auto px-6" id="about">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-4">מי אנחנו</h2>
                        <p className="text-lg text-gray-700 mb-4">
                            LawForce נולדה מתוך כאב אמיתי ופותחה על ידי עורכי דין ישראלים. מאחורי LawForce עומד עו״ד מעין סער – עם ניסיון של למעלה מ-15 שנה בעולם המשפט, השיווק והטכנולוגיה.
                        </p>
                        <p className="text-gray-600">
                            אנחנו יודעים להקים מערכות שבאמת עובדות – כי אנחנו עושים את זה כבר שנים.
                        </p>
                    </div>
                </section>

                {/* New section before final CTA */}
                <section className="bg-white py-20 px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">מחליטים לצאת מהכאוס?</h2>
                    <p className="text-lg text-gray-600 mb-8">זה הזמן שלך לקחת שליטה – לא רק על הלקוחות, אלא על כל העסק המשפטי שלך.</p>
                     <Button 
                        className="bg-[#3568AE] hover:bg-[#2A5494] text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 touch-manipulation"
                        onClick={handleSignup}
                    >
                        <Star className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                        הרשמה לחודש התנסות ללא עלות
                    </Button>
                </section>
                
                {/* Final CTA and Lead Form */}
                <section className="py-20 bg-gray-800 text-white">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-right">
                            <h2 className="text-3xl font-bold mb-4">רוצה להצטרף לעורכי הדין שכבר עובדים חכם יותר?</h2>
                            <p className="text-lg mb-6">השאר פרטים עכשיו וקבל מאיתנו את כל המידע, בלי התחייבות. אנחנו כאן כדי לע giúp לך לנהל, למכור ולנצח – בקלות.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold text-center mb-4 text-gray-800">השארת פרטים</h3>
                            <LeadForm />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 text-center">
                <div className="container mx-auto">
                    <p>© 2024 LawForce. כל הזכויות שמורות.</p>
                    <a href="https://wa.me/972000000000?text=היי%20אשמח%20לשמוע%20פרטים%20נוספים" target="_blank" className="text-green-400 hover:text-green-300 mt-2 inline-block" rel="noopener noreferrer">
                        צור קשר בוואטסאפ
                    </a>
                </div>
            </footer>
        </div>
    );
}