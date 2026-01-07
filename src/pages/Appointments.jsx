import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Appointment } from "@/entities/Appointment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Calendar, Clock, MapPin, User, Edit, Trash2, Video, ExternalLink } from 'lucide-react';
import BookingLinkSection from "../components/appointments/BookingLinkSection";
import CalendarView from "../components/appointments/CalendarView";
import DaySchedule from "../components/appointments/DaySchedule";
import AvailabilitySettings from "../components/appointments/AvailabilitySettings";
import GoogleCalendarConnect from "../components/appointments/GoogleCalendarConnect";

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUser, setCurrentUser] = useState(null);
    const [availabilitySlots, setAvailabilitySlots] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        client_name: '',
        location_type: 'משרד',
        location: '',
        meeting_link: '',
        notes: '',
        type: 'פגישה'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = await base44.auth.me();
            
            // Admin רואה הכל, אחרים רואים רק מהמשרד שלהם
            let appointmentsData;
            if (user.role === 'admin') {
                appointmentsData = await Appointment.list('-date');
            } else if (user.sub_account_id) {
                appointmentsData = await Appointment.filter({ sub_account_id: user.sub_account_id }, '-date');
            } else {
                // עצמאי - רואה רק שלו
                appointmentsData = await Appointment.filter({ created_by: user.email }, '-date');
            }
            
            setAppointments(appointmentsData);
            setCurrentUser(user);
            
            // טען הגדרות זמינות
            if (user.availability_settings) {
                const slots = convertAvailabilityToSlots(user.availability_settings);
                setAvailabilitySlots(slots);
            }
        } catch (error) {
            console.error("שגיאה בטעינת נתונים:", error);
        }
    };

    const convertAvailabilityToSlots = (settings) => {
        const slots = [];
        Object.entries(settings).forEach(([day, config]) => {
            if (config.enabled) {
                slots.push({
                    day,
                    start_time: config.start,
                    end_time: config.end
                });
            }
        });
        return slots;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAppointment) {
                await Appointment.update(editingAppointment.id, formData);
            } else {
                const appointmentData = {
                    ...formData,
                    sub_account_id: currentUser?.sub_account_id || null
                };
                await Appointment.create(appointmentData);
            }
            resetForm();
            loadData();
        } catch (error) {
            console.error("שגיאה בשמירת פגישה:", error);
        }
    };

    const handleEdit = (appointment) => {
        setEditingAppointment(appointment);
        setFormData(appointment);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את הפגישה?')) {
            try {
                await Appointment.delete(id);
                loadData();
            } catch (error) {
                console.error("שגיאה במחיקת פגישה:", error);
            }
        }
    };

    const handleAppointmentClick = (appointment) => {
        handleEdit(appointment);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            date: '',
            time: '',
            client_name: '',
            location_type: 'משרד',
            location: '',
            meeting_link: '',
            notes: '',
            type: 'פגישה'
        });
        setEditingAppointment(null);
        setShowForm(false);
    };

    const filteredAppointments = appointments.filter(apt => 
        apt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const upcomingAppointments = filteredAppointments.filter(apt => new Date(apt.date) >= new Date());
    const pastAppointments = filteredAppointments.filter(apt => new Date(apt.date) < new Date());

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-[1315px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 
                        className="text-[32px] font-bold"
                        style={{ color: '#3568AE', fontFamily: 'Heebo' }}
                    >
                        יומן ופגישות
                    </h1>
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                    >
                        <Plus className="ml-2 w-4 h-4" />
                        {showForm ? 'ביטול' : 'פגישה חדשה'}
                    </Button>
                </div>

                <Tabs defaultValue="calendar" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="calendar">יומן</TabsTrigger>
                        <TabsTrigger value="list">רשימת פגישות</TabsTrigger>
                        <TabsTrigger value="availability">הגדרות זמינות</TabsTrigger>
                        <TabsTrigger value="google">Google Calendar</TabsTrigger>
                    </TabsList>

                    {/* Calendar Tab */}
                    <TabsContent value="calendar" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <CalendarView
                                    appointments={appointments}
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    onAppointmentClick={handleAppointmentClick}
                                />
                            </div>
                            <div>
                                <DaySchedule
                                    selectedDate={selectedDate}
                                    appointments={appointments}
                                    availabilitySlots={availabilitySlots}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* List Tab */}
                    <TabsContent value="list" className="space-y-6">
                        {/* Search */}
                        <div className="relative max-w-sm">
                            <Input
                                placeholder="חיפוש פגישה..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>

                        {/* Booking Link Section */}
                        <BookingLinkSection />

                {/* Form */}
                {showForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle style={{ fontFamily: 'Heebo' }}>
                                {editingAppointment ? 'ערוך פגישה' : 'פגישה חדשה'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="כותרת הפגישה *"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                    <Input
                                        placeholder="שם הלקוח"
                                        value={formData.client_name}
                                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        required
                                    />
                                    <Input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">מקום פגישה</label>
                                        <Select 
                                            value={formData.location_type} 
                                            onValueChange={(val) => setFormData({...formData, location_type: val, meeting_link: val === 'משרד' ? '' : formData.meeting_link})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="בחר מקום" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="משרד">במשרד</SelectItem>
                                                <SelectItem value="zoom">Zoom</SelectItem>
                                                <SelectItem value="google_meet">Google Meet</SelectItem>
                                                <SelectItem value="אחר">מיקום אחר</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.location_type === 'אחר' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">פרט מיקום</label>
                                            <Input
                                                placeholder="כתובת / מיקום"
                                                value={formData.location}
                                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            />
                                        </div>
                                    )}

                                    {(formData.location_type === 'zoom' || formData.location_type === 'google_meet') && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">קישור לפגישה</label>
                                            <Input
                                                placeholder={formData.location_type === 'zoom' ? 'https://zoom.us/j/...' : 'https://meet.google.com/...'}
                                                value={formData.meeting_link}
                                                onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                                            />
                                        </div>
                                    )}
                                </div>

                                <Textarea
                                    placeholder="הערות (אופציונלי)"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    rows={3}
                                />

                                <div className="flex gap-2">
                                    <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880]">
                                        {editingAppointment ? 'עדכן' : 'צור'} פגישה
                                    </Button>
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        ביטול
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Heebo' }}>
                            פגישות עתידיות ({upcomingAppointments.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingAppointments.map(apt => (
                                <Card key={apt.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg">{apt.title}</h3>
                                            <Badge className="bg-green-100 text-green-800">עתידית</Badge>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm text-gray-600">
                                            {apt.client_name && (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    {apt.client_name}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(apt.date).toLocaleDateString('he-IL')}
                                            </div>
                                            {apt.time && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {apt.time}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                {apt.location_type === 'zoom' || apt.location_type === 'google_meet' ? (
                                                    <Video className="w-4 h-4" />
                                                ) : (
                                                    <MapPin className="w-4 h-4" />
                                                )}
                                                <span>
                                                    {apt.location_type === 'משרד' && 'במשרד'}
                                                    {apt.location_type === 'zoom' && 'Zoom'}
                                                    {apt.location_type === 'google_meet' && 'Google Meet'}
                                                    {apt.location_type === 'אחר' && apt.location}
                                                    {!apt.location_type && apt.location}
                                                </span>
                                                {apt.meeting_link && (
                                                    <a 
                                                        href={apt.meeting_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[#3568AE] hover:underline flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        הצטרף
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {apt.notes && (
                                            <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
                                                {apt.notes}
                                            </p>
                                        )}

                                        <div className="flex gap-2 mt-4 pt-3 border-t">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleEdit(apt)}
                                            >
                                                <Edit className="w-4 h-4 ml-1" />
                                                ערוך
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleDelete(apt.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4 ml-1" />
                                                מחק
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Appointments */}
                {pastAppointments.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-500" style={{ fontFamily: 'Heebo' }}>
                            פגישות קודמות ({pastAppointments.length})
                        </h2>
                        <div className="space-y-2">
                            {pastAppointments.map(apt => (
                                <Card key={apt.id} className="opacity-60">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium">{apt.title}</p>
                                                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                                    {apt.client_name && <span>{apt.client_name}</span>}
                                                    <span>{new Date(apt.date).toLocaleDateString('he-IL')}</span>
                                                    {apt.time && <span>{apt.time}</span>}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleDelete(apt.id)}
                                                className="text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {filteredAppointments.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">אין פגישות מתוכננות</p>
                            <Button 
                                onClick={() => setShowForm(true)}
                                className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                            >
                                <Plus className="ml-2 w-4 h-4" />
                                צור פגישה ראשונה
                            </Button>
                            </CardContent>
                            </Card>
                            )}
                            </TabsContent>

                            {/* Availability Tab */}
                            <TabsContent value="availability">
                                <AvailabilitySettings
                                    onSave={(newAvailability) => {
                                        const slots = convertAvailabilityToSlots(newAvailability);
                                        setAvailabilitySlots(slots);
                                    }}
                                />
                            </TabsContent>

                            {/* Google Calendar Tab */}
                            <TabsContent value="google">
                                <GoogleCalendarConnect />
                            </TabsContent>
                            </Tabs>
                            </div>
                            </div>
                            );
                            }