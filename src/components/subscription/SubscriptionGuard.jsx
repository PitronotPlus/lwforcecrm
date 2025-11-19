import { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import PricingPage from '../../pages/PricingPage';

export default function SubscriptionGuard({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasValidSubscription, setHasValidSubscription] = useState(false);

    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            // בדיקה אם המשתמש הוא אדמין
            if (currentUser.role === 'admin') {
                setHasValidSubscription(true);
                setLoading(false);
                return;
            }

            // בדיקת סטטוס מנוי
            const now = new Date();
            const subscriptionEndDate = currentUser.subscription_end_date ? new Date(currentUser.subscription_end_date) : null;
            const trialEndDate = currentUser.trial_end_date ? new Date(currentUser.trial_end_date) : null;

            let isValid = false;

            // בדיקה אם המנוי פעיל
            if (currentUser.subscription_status === 'active' && subscriptionEndDate && subscriptionEndDate > now) {
                isValid = true;
            }
            // בדיקה אם תקופת הניסיון עדיין פעילה
            else if (currentUser.subscription_status === 'trial' && trialEndDate && trialEndDate > now) {
                isValid = true;
            }
            // אם אין תאריכי סיום מוגדרים ויש מנוי פעיל
            else if (currentUser.subscription_status === 'active' && !subscriptionEndDate) {
                isValid = true;
            }

            setHasValidSubscription(isValid);
        } catch (error) {
            console.error('שגיאה בבדיקת סטטוס מנוי:', error);
            setHasValidSubscription(false);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F5' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                    <p style={{ fontFamily: 'Heebo', color: '#858C94' }}>בודק סטטוס מנוי...</p>
                </div>
            </div>
        );
    }

    // אם אין מנוי פעיל, הצג דף מחירון
    if (!hasValidSubscription) {
        return <PricingPage />;
    }

    // אם יש מנוי פעיל, הצג את התוכן הרגיל
    return children;
}