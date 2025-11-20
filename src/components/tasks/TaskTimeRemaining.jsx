import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';

export default function TaskTimeRemaining({ dueDate, compact = false }) {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
        if (!dueDate) return;

        const calculateTime = () => {
            const now = new Date();
            const due = new Date(dueDate);
            const diff = due - now;

            if (diff < 0) {
                setIsOverdue(true);
                setTimeRemaining(Math.abs(diff));
            } else {
                setIsOverdue(false);
                setTimeRemaining(diff);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [dueDate]);

    const formatTime = (milliseconds) => {
        if (!milliseconds) return { days: 0, hours: 0, minutes: 0 };
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        return { days, hours, minutes };
    };

    if (!dueDate) return null;

    const time = formatTime(timeRemaining);

    if (compact) {
        return (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                <Clock className="w-3 h-3" />
                {isOverdue ? (
                    <span>באיחור {time.days > 0 ? `${time.days}ד ` : ''}{time.hours}ש {time.minutes}ד</span>
                ) : (
                    <span>נשאר {time.days > 0 ? `${time.days}ד ` : ''}{time.hours}ש {time.minutes}ד</span>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4" />
            {isOverdue ? (
                <span className="text-sm font-medium">
                    באיחור: {time.days > 0 && `${time.days} ימים `}{time.hours} שעות {time.minutes} דקות
                </span>
            ) : (
                <span className="text-sm font-medium">
                    זמן נותר: {time.days > 0 && `${time.days} ימים `}{time.hours} שעות {time.minutes} דקות
                </span>
            )}
        </div>
    );
}