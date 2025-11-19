import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function PricingSection() {
    const [billingPeriod, setBillingPeriod] = useState('monthly');

    const handlePurchase = (planId, planName) => {
        alert(`נפתחת אפשרות רכישה עבור ${planName}. בקרוב יתווסף מודול תשלום מלא.`);
    };

    const pricingPlans = [
        {
            id: 'individual',
            name: 'משתמש בודד',
            description: 'מושלם לעורכי דין עצמאיים',
            monthlyPrice: 149,
            yearlyPrice: 1490,
            yearlyDiscount: '17% הנחה',
            features: [
                'גישה מלאה למערכת',
                'ניהול לקוחות ותיקים',
                'מחולל מסמכים בינה מלאכותית',
                'ניהול משימות ויומן',
                'דוחות בסיסיים',
                'תמיכה טכנית בסיסית',
                '5GB אחסון'
            ],
            popular: false,
        },
        {
            id: 'small_office',
            name: 'משרד קטן',
            description: 'עד 5 משתמשים',
            monthlyPrice: 449,
            yearlyPrice: 4490,
            yearlyDiscount: '17% הנחה',
            features: [
                'כל התכונות של המנוי הבסיסי',
                'עד 5 משתמשים',
                'ניהול הרשאות מתקדם',
                'דוחות מתקדמים',
                'אינטגרציות חיצוניות',
                'גיבוי אוטומטי',
                '50GB אחסון',
                'תמיכה טכנית מורחבת'
            ],
            popular: true,
        },
        {
            id: 'premium',
            name: 'פרימיום וארגונים',
            description: 'למשרדים שצריכים יותר',
            monthlyPrice: 'מותאם אישית',
            features: [
                'כל התכונות של משרד קטן',
                'מספר משתמשים גמיש',
                'תמיכה טכנית ייעודית (SLA)',
                'הטמעה והדרכה מלאה',
                'אוטומציות מותאמות אישית',
                'חיבור למערכות קיימות',
                'אחסון מותאם אישית'
            ],
            popular: false,
        }
    ];

    const PlanCard = ({ plan }) => (
        <Card className={`flex flex-col border-2 ${plan.popular ? 'border-[#3568AE]' : 'border-gray-200'} rounded-2xl shadow-lg hover:shadow-xl transition-shadow`}>
            {plan.popular && <Badge className="absolute -top-3 right-5 bg-[#3568AE]">הכי פופולרי</Badge>}
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold" style={{ fontFamily: 'Heebo' }}>{plan.name}</CardTitle>
                <p className="text-gray-500">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <div className="text-center my-6">
                    {typeof plan.monthlyPrice === 'number' ? (
                        <>
                            <span className="text-4xl font-bold">₪{billingPeriod === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice / 12).toFixed(0)}</span>
                            <span className="text-gray-500">/ חודש</span>
                            {billingPeriod === 'yearly' && <p className="text-green-600 font-semibold">{plan.yearlyDiscount}</p>}
                        </>
                    ) : (
                        <span className="text-3xl font-bold">{plan.monthlyPrice}</span>
                    )}
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-500" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                <Button 
                    className={`w-full ${plan.popular ? 'bg-[#3568AE] hover:bg-[#2A5494]' : 'bg-gray-700 hover:bg-gray-800'}`}
                    onClick={() => handlePurchase(plan.id, plan.name)}
                >
                    {plan.id === 'premium' ? 'צור קשר' : 'בחר תוכנית'}
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <section className="py-20 px-4" id="pricing">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[#3568AE]">מחירון ותוכניות</h2>
                    <p className="text-lg text-gray-600 mt-2">בחר את התוכנית המתאימה ביותר למשרד שלך.</p>
                </div>
                
                <div className="flex justify-center items-center gap-4 mb-8">
                    <Label htmlFor="billing-switch">חיוב חודשי</Label>
                    <Switch 
                        id="billing-switch"
                        checked={billingPeriod === 'yearly'}
                        onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
                    />
                    <Label htmlFor="billing-switch">חיוב שנתי (חיסכון של 2 חודשים!)</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pricingPlans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} />
                    ))}
                </div>
            </div>
        </section>
    );
}