import React, { useState, useEffect } from "react";
import { Appointment } from "@/entities/Appointment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";

export default function ClientAppointments({ client }) {
    const [appointments, setAppointments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        notes: ''
    });

    useEffect(() => {
        loadAppointments();
    }, [client.id]);

    const loadAppointments = async () => {
        try {
            const allAppointments = await Appointment.list('-date');
            const clientAppointments = allAppointments.filter(apt => 
                apt.client_name === client.full_name
            );
            setAppointments(clientAppointments);
        } catch (error) {
            console.error("שגיאה בטעינת פגישות:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await Appointment.create({
                ...newAppointment,
                client_name: client.full_name,
                type: 'פגישה'
            });
            setNewAppointment({ title: '', date: '', time: '', location: '', notes: '' });
            setShowForm(false);
            loadAppointments();
        } catch (error) {
            console.error("שגיאה ביצירת פגישה:", error);
        }
    };

    const upcomingAppointments = appointments.filter(apt => new Date(apt.date) >= new Date());
    const pastAppointments = appointments.filter(apt => new Date(apt.date) < new Date());

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ fontFamily: 'Heebo' }}>פגישות ({appointments.length})</CardTitle>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                >
                    <Plus className="ml-2 w-4 h-4" />
                    {showForm ? 'ביטול' : 'קבע פגישה'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {showForm && (
                    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-green-50 rounded-lg">
                        <Input
                            placeholder="כותרת הפגישה"
                            value={newAppointment.title}
                            onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                            required
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="date"
                                value={newAppointment.date}
                                onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                                required
                            />
                            <Input
                                type="time"
                                value={newAppointment.time}
                                onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                            />
                        </div>
                        
                        <Input
                            placeholder="מיקום הפגישה"
                            value={newAppointment.location}
                            onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                        />
                        
                        <Textarea
                            placeholder="הערות (אופציונלי)"
                            value={newAppointment.notes}
                            onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                            rows={2}
                        />
                        
                        <div className="flex gap-2">
                            <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880]">שמור</Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>ביטול</Button>
                        </div>
                    </form>
                )}

                {upcomingAppointments.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">פגישות עתידיות</h4>
                        {upcomingAppointments.map(apt => (
                            <div key={apt.id} className="p-3 bg-green-50 rounded-lg border-r-4 border-green-500">
                                <p className="font-medium">{apt.title}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(apt.date).toLocaleDateString('he-IL')}
                                    </div>
                                    {apt.time && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {apt.time}
                                        </div>
                                    )}
                                    {apt.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {apt.location}
                                        </div>
                                    )}
                                </div>
                                {apt.notes && <p className="text-sm text-gray-600 mt-2">{apt.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {pastAppointments.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-500">פגישות קודמות</h4>
                        {pastAppointments.map(apt => (
                            <div key={apt.id} className="p-3 bg-gray-50 rounded-lg opacity-60">
                                <p className="font-medium">{apt.title}</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(apt.date).toLocaleDateString('he-IL')} {apt.time && `• ${apt.time}`}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {appointments.length === 0 && (
                    <p className="text-center text-gray-500 py-4">אין פגישות מתוכננות</p>
                )}
            </CardContent>
        </Card>
    );
}