import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, User, ChevronDown, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import LandingPage from "@/pages/LandingPage";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import MobileHeader from "@/components/mobile/MobileHeader";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const { User } = await import("@/entities/User");
            const user = await User.me();
            setCurrentUser(user);
        } catch (error) {
            // משתמש לא מחובר
            setCurrentUser(null);
        }
        setLoading(false);
    };

    // תפריט ניווט לפי סוג משתמש
    const getNavigationItems = () => {
        if (!currentUser) return []; // אם לא מחובר, אין תפריט ניווט
        
        const baseItems = [
            { title: "דשבורד", url: createPageUrl("Dashboard") },
            { title: "לקוחות", url: createPageUrl("Clients") },
            { title: "תיקים", url: createPageUrl("Cases") },
            { title: "משימות", url: createPageUrl("Tasks") },
            { title: "פגישות", url: createPageUrl("Appointments") },
            { title: "שיווק", url: createPageUrl("Marketing") },
            { title: "כספים", url: createPageUrl("Finances") },
            { title: "קרדיטים", url: createPageUrl("Credits") },
            { title: "תמיכה", url: createPageUrl("Support") }
        ];

        return baseItems;
    };

    // תפריט פרופיל לפי סוג משתמש
    const getProfileMenuItems = () => {
        if (!currentUser) return [];

        const baseItems = [
            { title: "עריכת פרופיל", url: createPageUrl("Settings") },
            { title: "הגדרות", url: createPageUrl("Settings") }
        ];

        // הוספת ניהול מערכת רק למנהלי מערכת
        if (currentUser.role === 'admin') {
            baseItems.unshift({ title: "ניהול מערכת", url: createPageUrl("AdminDashboard") });
        }

        baseItems.push({ title: "יציאה", url: "#", action: "logout" });
        return baseItems;
    };

    const handleLogin = async () => {
        try {
            const { User } = await import("@/entities/User");
            await User.login();
        } catch (error) {
            console.error("שגיאה בהתחברות:", error);
        }
    };

    const handleMenuClick = async (item) => {
        if (item.action === "logout") {
            try {
                const { User } = await import("@/entities/User");
                await User.logout();
                setCurrentUser(null); // עדכון מצב מקומי אחרי יציאה
            } catch (error) {
                console.error("שגיאה ביציאה:", error);
            }
        }
        setIsProfileMenuOpen(false);
    };

    const navigationItems = getNavigationItems();
    const profileMenuItems = getProfileMenuItems();

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

    const handleLogout = async () => {
        try {
            const { User } = await import("@/entities/User");
            await User.logout();
            setCurrentUser(null);
        } catch (error) {
            console.error("שגיאה ביציאה:", error);
        }
    };

    return (
        <div className="min-h-screen" style={{ 
            fontFamily: 'Heebo, -apple-system, BlinkMacSystemFont, sans-serif',
            direction: 'rtl',
            background: '#F5F5F5'
        }}>
            <style>
            {`
                @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@100;200;300;400;500;600;700;800;900&display=swap');
                
                * {
                    direction: rtl;
                }
                
                .heebo-font {
                    font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
                }
                
                body {
                    font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    direction: rtl !important;
                }

                /* Mobile optimizations */
                @media (max-width: 768px) {
                    body {
                        padding-bottom: env(safe-area-inset-bottom);
                    }
                }

                /* PWA display mode */
                @media all and (display-mode: standalone) {
                    body {
                        padding-top: env(safe-area-inset-top);
                    }
                }
                
                .dashboard-card {
                    background: #FFFFFF;
                    border-radius: 30px;
                    box-shadow: 0px 0px 6px 3px rgba(0, 0, 0, 0.05);
                }
                
                .navigation-item {
                    font-family: 'Heebo';
                    font-weight: 500;
                    font-size: 18px;
                    line-height: 26px;
                    text-align: center;
                    color: #000000;
                    text-decoration: none;
                    padding: 8px 16px;
                    transition: all 0.2s ease;
                }
                
                .navigation-item:hover, .navigation-item.active {
                    color: #3568AE;
                    font-weight: 700;
                }
                
                .profile-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    min-width: 160px;
                    z-index: 1000;
                }

                .profile-menu-item {
                    display: block;
                    padding: 12px 16px;
                    text-decoration: none;
                    color: #484848;
                    font-family: 'Heebo';
                    font-size: 14px;
                    border-bottom: 1px solid #f0f0f0;
                    transition: background-color 0.2s;
                    cursor: pointer;
                }

                .profile-menu-item:hover {
                    background-color: #f8f9fa;
                }

                .profile-menu-item:last-child {
                    border-bottom: none;
                }
            `}
            </style>

            {/* Mobile Header */}
            {currentUser && (
                <MobileHeader currentUser={currentUser} onLogout={handleLogout} />
            )}

            {/* Desktop Header - Conditionally render header only for logged-in users */}
            {currentUser && (
                <header className="hidden md:block w-full h-[93px] bg-white border-b border-gray-200 relative z-50">
                    <div className="max-w-[1315px] mx-auto h-full flex items-center justify-between px-4">
                        {/* Right side of header */}
                        <div className="flex items-center gap-8">
                            {/* User Avatar */}
                            <div className="relative">
                                <div 
                                    className="w-[42px] h-[42px] rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                >
                                    <User className="w-6 h-6 text-gray-600" />
                                </div>
                                
                                {/* Profile Menu */}
                                {isProfileMenuOpen && (
                                    <div className="profile-menu">
                                        {profileMenuItems.map((item, index) => (
                                            item.action ? (
                                                <button
                                                    key={index}
                                                    onClick={() => handleMenuClick(item)}
                                                    className="profile-menu-item w-full text-right"
                                                >
                                                    {item.title}
                                                </button>
                                            ) : (
                                                <Link
                                                    key={index}
                                                    to={item.url}
                                                    className="profile-menu-item"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    {item.title}
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Navigation */}
                            <nav className="flex items-center gap-8">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.title}
                                        to={item.url}
                                        className={`navigation-item ${location.pathname === item.url ? 'active' : ''}`}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Left side of header */}
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <Link to={createPageUrl("Dashboard")}>
                                <h1 className="text-[40px] leading-[59px] cursor-pointer hover:opacity-80 transition-opacity" style={{ color: '#3568AE', fontFamily: 'Heebo' }}>
                                    <span className="font-black">Law</span><span className="font-normal">Force</span>
                                </h1>
                            </Link>
                        </div>
                    </div>
                </header>
            )}
            
            {/* Main Content */}
            <main className="w-full pt-14 md:pt-0">
                {currentUser ? (
                    <>
                        <SubscriptionGuard>
                            {children}
                        </SubscriptionGuard>
                        <BottomNavigation />
                        <PWAInstallPrompt />
                    </>
                ) : (
                    <LandingPage />
                )}
            </main>

            {/* Close profile menu when clicking outside */}
            {isProfileMenuOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileMenuOpen(false)}
                />
            )}
        </div>
    );
}