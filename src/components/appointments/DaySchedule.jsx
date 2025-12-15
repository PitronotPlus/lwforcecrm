import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, Video, Edit, Trash2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';

export default function DaySchedule({ selectedDate, appointments, onEdit, onDelete, availabilitySlots }) {
    const dayAppointments = appointments
        .filter(apt => isSameDay(new Date(apt.date), selectedDate))
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 22:00

    const getAppointmentForHour = (hour) => {
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        return dayAppointments.find(apt => apt.time && apt.time.startsWith(hourStr));
    };

    const isAvailable = (hour) => {
        if (!availabilitySlots || availabilitySlots.length === 0) return true;
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        return availabilitySlots.some(slot => 
            hourStr >= slot.start_time && hourStr < slot.end_time
        );
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Heebo' }}>
                    <Clock className="w-5 h-5 text-[#3568AE]" />
                    לוח זמנים ליום {format(selectedDate, 'd בMMMM', { locale: he })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1 max-h-[600px] overflow-y-auto">
                    {hours.map(hour => {
                        const appointment = getAppointmentForHour(hour);
                        const available = isAvailable(hour);

                        return (
                            <div
                                key={hour}
                                className={`flex items-start gap-3 p-3 rounded-lg border-r-4 ${
                                    appointment 
                                        ? 'bg-blue-50 border-blue-500' 
                                        : available
                                        ? 'bg-gray-50 border-gray-300'
                                        : 'bg-red-50 border-red-300'
                                }`}
                            >
                                <div className="text-sm font-medium text-gray-500 min-w-[60px]">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>

                                {appointment ? (
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-lg">{appointment.title}</h4>
                                                {appointment.client_name && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                        <User className="w-3 h-3" />
                                                        {appointment.client_name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => onEdit(appointment)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => onDelete(appointment.id)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                {appointment.location_type === 'zoom' || appointment.location_type === 'google_meet' ? (
                                                    <Video className="w-4 h-4" />
                                                ) : (
                                                    <MapPin className="w-4 h-4" />
                                                )}
                                                <span>
                                                    {appointment.location_type === 'משרד' && 'במשרד'}
                                                    {appointment.location_type === 'zoom' && 'Zoom'}
                                                    {appointment.location_type === 'google_meet' && 'Google Meet'}
                                                    {appointment.location_type === 'אחר' && appointment.location}
                                                </span>
                                            </div>
                                            {appointment.notes && (
                                                <p className="text-gray-500 mt-1">{appointment.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 text-sm text-gray-400">
                                        {available ? 'פנוי' : 'לא זמין'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}