import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';

export default function MobileHeader({ currentUser, onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const menuItems = [
        { icon: User, label: 'פרופיל', path: createPageUrl('Settings') },
        { icon: Settings, label: 'הגדרות', path: createPageUrl('Settings') }
    ];

    if (currentUser?.role === 'admin') {
        menuItems.unshift({ icon: Settings, label: 'ניהול מערכת', path: createPageUrl('AdminDashboard') });
    }

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
            <div className="flex items-center justify-between h-14 px-4">
                <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2"
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <Link to={createPageUrl('Dashboard')}>
                    <h1 className="text-2xl" style={{ color: '#3568AE', fontFamily: 'Heebo' }}>
                        <span className="font-black">Law</span><span className="font-normal">Force</span>
                    </h1>
                </Link>

                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                                    style={{ fontFamily: 'Heebo' }}
                                >
                                    <Icon className="w-5 h-5 text-gray-600" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                onLogout();
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-right text-red-600"
                            style={{ fontFamily: 'Heebo' }}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>יציאה</span>
                        </button>
                    </div>
                </>
            )}
        </header>
    );
}