import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';

export default function MobileHeader({ currentUser, onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const userRole = currentUser?.user_role || currentUser?.role || 'lawyer';
    const isManager = userRole === 'owner' || userRole === 'department_head' || userRole === 'admin';

    const profileMenuItems = [
        { icon: User, label: 'פרופיל והגדרות', path: createPageUrl('Settings') }
    ];

    if (currentUser?.role === 'admin' || currentUser?.user_role === 'admin') {
        profileMenuItems.unshift({ icon: Settings, label: 'ניהול מערכת', path: createPageUrl('AdminDashboard') });
    }

    const navigationItems = [
        { label: 'דשבורד', path: createPageUrl('Dashboard') },
        { label: 'לקוחות', path: createPageUrl('Clients') },
        { label: 'תיקים', path: createPageUrl('Cases') },
        { label: 'משימות', path: createPageUrl('Tasks') },
        { label: 'פגישות', path: createPageUrl('Appointments') },
        ...(isManager ? [{ label: 'ניהול צוות', path: createPageUrl('TeamManagement') }] : []),
        { label: 'שיווק', path: createPageUrl('Marketing') },
        { label: 'כספים', path: createPageUrl('Finances') },
        { label: 'קרדיטים', path: createPageUrl('Credits') },
        { label: 'תמיכה', path: createPageUrl('Support') }
    ];

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
            <div className="flex items-center justify-between h-14 px-4 relative z-[60]">
                <button 
                    onClick={() => {
                        setMenuOpen(!menuOpen);
                        setProfileOpen(false);
                    }}
                    className="p-2 touch-manipulation active:bg-gray-100 rounded-lg transition-colors"
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <Link to={createPageUrl('Dashboard')} onClick={() => {
                    setMenuOpen(false);
                    setProfileOpen(false);
                }}>
                    <h1 className="text-2xl" style={{ color: '#3568AE', fontFamily: 'Heebo' }}>
                        <span className="font-black">Law</span><span className="font-normal">Force</span>
                    </h1>
                </Link>

                <button 
                    onClick={() => {
                        setProfileOpen(!profileOpen);
                        setMenuOpen(false);
                    }}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center touch-manipulation active:bg-gray-300 transition-colors"
                >
                    <User className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Navigation Menu Overlay */}
            {menuOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 top-14"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
                        {navigationItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 touch-manipulation"
                                style={{ fontFamily: 'Heebo' }}
                            >
                                <span className="text-base">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {/* Profile Menu Overlay */}
            {profileOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 top-14"
                        onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
                        {profileMenuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 touch-manipulation"
                                    style={{ fontFamily: 'Heebo' }}
                                >
                                    <Icon className="w-5 h-5 text-gray-600" />
                                    <span className="text-base">{item.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => {
                                setProfileOpen(false);
                                onLogout();
                            }}
                            className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 w-full text-right text-red-600 touch-manipulation"
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-base">יציאה</span>
                        </button>
                    </div>
                </>
            )}
        </header>
    );
}