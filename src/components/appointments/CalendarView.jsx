import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { he } from 'date-fns/locale';

export default function CalendarView({ appointments, onDateSelect, selectedDate, onAppointmentClick }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: he });
    const calendarEnd = endOfWeek(monthEnd, { locale: he });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const getAppointmentsForDay = (day) => {
        return appointments.filter(apt => 
            isSameDay(new Date(apt.date), day)
        );
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-[#3568AE]" />
                        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Heebo' }}>
                            {format(currentMonth, 'MMMM yyyy', { locale: he })}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleToday}>
                            היום
                        </Button>
                        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, idx) => {
                        const dayAppointments = getAppointmentsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentDay = isToday(day);

                        return (
                            <button
                                key={idx}
                                onClick={() => onDateSelect(day)}
                                className={`
                                    min-h-[80px] p-2 rounded-lg text-right transition-all
                                    ${!isCurrentMonth ? 'opacity-30' : ''}
                                    ${isSelected ? 'bg-[#3568AE] text-white' : 'hover:bg-gray-100'}
                                    ${isCurrentDay && !isSelected ? 'border-2 border-[#3568AE]' : ''}
                                `}
                            >
                                <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-white' : ''}`}>
                                    {format(day, 'd')}
                                </div>
                                {dayAppointments.length > 0 && (
                                    <div className="space-y-1">
                                        {dayAppointments.slice(0, 2).map((apt, i) => (
                                            <div
                                                key={i}
                                                className={`text-xs p-1 rounded truncate ${
                                                    isSelected 
                                                        ? 'bg-white/20 text-white' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAppointmentClick(apt);
                                                }}
                                            >
                                                {apt.time} {apt.title}
                                            </div>
                                        ))}
                                        {dayAppointments.length > 2 && (
                                            <div className={`text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                                +{dayAppointments.length - 2} נוספים
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}