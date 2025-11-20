import React from 'react';
import { Plus } from 'lucide-react';
import CreateTaskModal from '../tasks/CreateTaskModal';

export default function WelcomeHeader({ onTaskCreated }) {
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
                    ברוך הבא עו״ד עוז מוכתר!
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