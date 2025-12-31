import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import CreateTaskModal from '../tasks/CreateTaskModal';

export default function WelcomeHeader({ onTaskCreated }) {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const user = await base44.auth.me();
            setUserName(user.full_name || 'משתמש');
        } catch (error) {
            console.error('שגיאה בטעינת משתמש:', error);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 md:mb-8 gap-3 md:gap-0">
            {/* Welcome Message */}
            <div className="flex-1 w-full text-center md:text-right">
                <h1 
                    className="text-2xl md:text-[40px] font-medium leading-tight md:leading-[59px]"
                    style={{ 
                        color: '#3568AE',
                        fontFamily: 'Heebo'
                    }}
                >
                    ברוך הבא!
                </h1>
            </div>
            
            {/* Add Task Button - Hidden on mobile */}
            <div className="hidden md:block relative">
                <CreateTaskModal 
                    onTaskCreated={onTaskCreated} 
                    triggerText="משימה חדשה"
                    triggerStyle="icon"
                />
            </div>
        </div>
    );
}