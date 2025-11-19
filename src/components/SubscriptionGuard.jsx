import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import PricingPage from '@/pages/PricingPage';
import PostSignupSurvey from '@/pages/PostSignupSurvey';

export default function SubscriptionGuard({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F5' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                    <p style={{ fontFamily: 'Heebo', color: '#858C94' }}>טוען...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        // This case is handled by Layout which renders LandingPage
        return null;
    }

    const isTrial = user.subscription_status === 'trial';
    const surveyCompleted = user.survey_completed;
    const isExpired = ['expired', 'cancelled'].includes(user.subscription_status);

    // If user is on trial and hasn't completed the survey, show the survey.
    if (isTrial && !surveyCompleted) {
        return <PostSignupSurvey />;
    }

    // If user is on trial and completed the survey, or their subscription is expired, show the pricing page.
    if ((isTrial && surveyCompleted) || isExpired) {
        return <PricingPage />;
    }

    // Otherwise, user has an active subscription.
    return children;
}