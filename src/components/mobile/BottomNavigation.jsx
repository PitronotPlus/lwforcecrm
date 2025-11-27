import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Users, Briefcase, CheckSquare, Calendar } from 'lucide-react';

export default function BottomNavigation() {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'דשבורד', path: createPageUrl('Dashboard') },
        { icon: Users, label: 'לקוחות', path: createPageUrl('Clients') },
        { icon: Briefcase, label: 'תיקים', path: createPageUrl('Cases') },
        { icon: CheckSquare, label: 'משימות', path: createPageUrl('Tasks') },
        { icon: Calendar, label: 'פגישות', path: createPageUrl('Appointments') }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Spacer to prevent content from being hidden behind fixed nav */}
            <div className="h-16 md:hidden"></div>
            
            {/* Bottom Navigation - Only visible on mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-padding">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                    active 
                                        ? 'text-[#3568AE]' 
                                        : 'text-gray-500'
                                }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs mt-1" style={{ fontFamily: 'Heebo' }}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <style jsx>{`
                .safe-area-padding {
                    padding-bottom: env(safe-area-inset-bottom);
                }
            `}</style>
        </>
    );
}