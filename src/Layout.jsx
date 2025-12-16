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

    useEffect(() => {
        // Reload user data when URL changes (after login redirect)
        loadUserData();
    }, [location.pathname]);

    const loadUserData = async () => {
        try {
            const { base44 } = await import("@/api/base44Client");
            const isAuth = await base44.auth.isAuthenticated();
            if (isAuth) {
                const user = await base44.auth.me();
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        } catch (error) {
            console.error("Error loading user:", error);
            setCurrentUser(null);
        }
        setLoading(false);
    };

    // תפריט ניווט לפי הגדרות מהמערכת
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        if (currentUser) {
            loadMenuItems();
        }
    }, [currentUser]);

    const loadMenuItems = async () => {
        try {
            const { base44 } = await import("@/api/base44Client");
            const configs = await base44.entities.MenuConfiguration.list('order_index');
            
            // זיהוי תפקיד המשתמש - בדיקה מרובת שכבות
            let userRole = 'lawyer'; // ברירת מחדל
            
            if (currentUser) {
                // בדיקה ראשונה: האם יש role מוגדר
                if (currentUser.role) {
                    userRole = currentUser.role;
                }
                // בדיקה שנייה: האם יש user_role מוגדר (עדיפות גבוהה יותר)
                if (currentUser.user_role) {
                    userRole = currentUser.user_role;
                }
                
                console.log('Current user object:', currentUser);
                console.log('Detected user role:', userRole);
            }
            
            if (configs.length === 0) {
                // אין הגדרות תפריט, השתמש בברירת מחדל
                const defaultMenu = [
                    { title: "דשבורד", url: createPageUrl("Dashboard"), roles: ['admin', 'owner', 'department_head', 'lawyer'] },
                    { title: "לקוחות", url: createPageUrl("Clients"), roles: ['admin', 'owner', 'department_head', 'lawyer'] },
                    { title: "תיקים", url: createPageUrl("Cases"), roles: ['admin', 'owner', 'department_head', 'lawyer'] },
                    { title: "משימות", url: createPageUrl("Tasks"), roles: ['admin', 'owner', 'department_head', 'lawyer'] },
                    { title: "פגישות", url: createPageUrl("Appointments"), roles: ['admin', 'owner', 'department_head', 'lawyer'] },
                    { title: "שיווק", url: createPageUrl("Marketing"), roles: ['admin', 'owner', 'department_head'] },
                    { title: "כספים", url: createPageUrl("Finances"), roles: ['admin', 'owner', 'department_head'] },
                    { title: "קרדיטים", url: createPageUrl("Credits"), roles: ['admin', 'owner'] },
                    { title: "תמיכה", url: createPageUrl("Support"), roles: ['admin', 'owner', 'department_head', 'lawyer'] }
                ];
                
                setMenuItems(defaultMenu.filter(item => item.roles.includes(userRole)));
            } else {
                // טען מההגדרות וסנן לפי תפקיד משתמש
                const items = configs
                    .filter(c => {
                        // הצג רק פריטים גלויים
                        if (c.is_visible === false) return false;
                        
                        // בדוק אם למשתמש יש הרשאה לראות את הפריט
                        const allowedRoles = c.allowed_roles && c.allowed_roles.length > 0 
                            ? c.allowed_roles 
                            : ['admin', 'owner', 'department_head', 'lawyer'];
                        
                        console.log('Menu item:', c.display_name, 'Allowed roles:', allowedRoles, 'User role:', userRole);
                        return allowedRoles.includes(userRole);
                    })
                    .map(c => ({
                        title: c.display_name,
                        url: c.custom_route || createPageUrl(c.object_id || c.display_name)
                    }));
                
                console.log('Filtered menu items for role', userRole, ':', items);
                setMenuItems(items);
            }
        } catch (error) {
            console.error('שגיאה בטעינת תפריט:', error);
            // ברירת מחדל במקרה של שגיאה
            const defaultMenu = [
                { title: "דשבורד", url: createPageUrl("Dashboard") },
                { title: "לקוחות", url: createPageUrl("Clients") },
                { title: "תיקים", url: createPageUrl("Cases") },
                { title: "משימות", url: createPageUrl("Tasks") },
                { title: "פגישות", url: createPageUrl("Appointments") }
            ];
            setMenuItems(defaultMenu);
        }
    };

    const getNavigationItems = () => {
        return menuItems;
    };

    // תפריט פרופיל לפי סוג משתמש
    const getProfileMenuItems = () => {
        if (!currentUser) return [];

        const userRole = currentUser.user_role || currentUser.role || 'lawyer';
        const isManager = userRole === 'owner' || userRole === 'department_head' || userRole === 'admin';

        const baseItems = [
            { title: "פרופיל והגדרות", url: createPageUrl("Settings") }
        ];

        // הוספת ניהול צוות לבעלי משרד וראשי מחלקות
        if (isManager) {
            baseItems.push({ title: "ניהול צוות", url: createPageUrl("TeamManagement") });
        }

        // הוספת ניהול מערכת רק למנהלי מערכת (admin)
        if (currentUser.role === 'admin' || currentUser.user_role === 'admin') {
            baseItems.unshift({ title: "ניהול מערכת", url: createPageUrl("AdminDashboard") });
        }

        baseItems.push({ title: "יציאה", url: "#", action: "logout" });
        return baseItems;
    };

    const handleLogin = async () => {
        try {
            const { base44 } = await import("@/api/base44Client");
            const callbackUrl = createPageUrl('Dashboard');
            base44.auth.redirectToLogin(callbackUrl);
        } catch (error) {
            console.error("שגיאה בהתחברות:", error);
        }
    };

    const handleMenuClick = async (item) => {
        if (item.action === "logout") {
            try {
                const { base44 } = await import("@/api/base44Client");
                await base44.auth.logout();
                setCurrentUser(null);
            } catch (error) {
                console.error("שגיאה ביציאה:", error);
            }
        }
        setIsProfileMenuOpen(false);
    };

    const navigationItems = getNavigationItems();
    const profileMenuItems = getProfileMenuItems();

    // דפים פומביים ללא Layout
    const publicPages = ['Booking'];
    const isPublicPage = publicPages.includes(currentPageName);

    if (loading && !isPublicPage) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F5' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                    <p style={{ fontFamily: 'Heebo', color: '#858C94' }}>טוען...</p>
                </div>
            </div>
        );
    }

    // דפים פומביים - הצג רק את התוכן ללא header/navigation
    if (isPublicPage) {
        return (
            <div className="min-h-screen" style={{ 
                fontFamily: 'Heebo, -apple-system, BlinkMacSystemFont, sans-serif',
                direction: 'rtl'
            }}>
                {children}
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            const { base44 } = await import("@/api/base44Client");
            await base44.auth.logout();
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