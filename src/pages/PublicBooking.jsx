import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, setHours, setMinutes, isSameDay, parse } from "date-fns";
import { he } from "date-fns/locale";

export default function PublicBooking() {
    const [lawyerId, setLawyerId] = useState(null);
    const [lawyer, setLawyer] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        service_type: "",
        notes: ""
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // קבלת מזהה העורך דין מה-URL
        const urlParams = new URLSearchParams(window.location.search);
        const id = window.location.pathname.split('/').pop();
        if (id) {
            setLawyerId(id);
            loadLawyerData(id);
        }
    }, []);

    useEffect(() => {
        if (selectedDate && lawyerId) {
            loadAvailableSlots(selectedDate);
        }
    }, [selectedDate, lawyerId]);

    const loadLawyerData = async (id) => {
        try {
            setLoading(true);
            // טוען את פרטי עורך הדין
            const users = await base44.asServiceRole.entities.User.filter({ id });
            if (users.length > 0) {
                setLawyer(users[0]);
            }
        } catch (error) {
            console.error("שגיאה בטעינת נתונים:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableSlots = async (date) => {
        try {
            // טוען את הפגישות הקיימות לתאריך
            const existingAppointments = await base44.asServiceRole.entities.Appointment.filter({
                created_by: lawyer.email,
                date: format(date, 'yyyy-MM-dd')
            });

            // טוען זמנים לא זמינים
            const unavailableSlots = await base44.asServiceRole.entities.UnavailableSlot.filter({
                created_by: lawyer.email,
                date: format(date, 'yyyy-MM-dd')
            });

            // יצירת שעות זמינות (9:00-18:00, כל חצי שעה)
            const slots = [];
            for (let hour = 9; hour < 18; hour++) {
                for (let minute of [0, 30]) {
                    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    
                    // בדיקה אם השעה תפוסה
                    const isBooked = existingAppointments.some(apt => apt.time === timeStr);
                    const isUnavailable = unavailableSlots.some(slot => {
                        if (!slot.start_time || !slot.end_time) return false;
                        const slotStart = parse(slot.start_time, 'HH:mm', new Date());
                        const slotEnd = parse(slot.end_time, 'HH:mm', new Date());
                        const currentTime = parse(timeStr, 'HH:mm', new Date());
                        return currentTime >= slotStart && currentTime < slotEnd;
                    });
                    
                    if (!isBooked && !isUnavailable) {
                        slots.push(timeStr);
                    }
                }
            }
            
            setAvailableSlots(slots);
        } catch (error) {
            console.error("שגיאה בטעינת שעות פנויות:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedDate || !selectedTime) {
            alert("יש לבחור תאריך ושעה");
            return;
        }

        setSubmitting(true);
        try {
            // יצירת ליד חדש
            const lead = await base44.asServiceRole.entities.Lead.create({
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email,
                specialization: formData.service_type
            });

            // יצירת הפגישה
            await base44.asServiceRole.entities.Appointment.create({
                title: `פגישה עם ${formData.full_name}`,
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: selectedTime,
                client_name: formData.full_name,
                client_phone: formData.phone,
                client_email: formData.email,
                notes: formData.notes,
                type: "פגישה",
                location_type: "משרד",
                reminder: true,
                lead_id: lead.id,
                status: "ממתין לאישור"
            });

            // שליחת אימייל אישור ללקוח
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: formData.email,
                    subject: `אישור פגישה - ${format(selectedDate, 'dd/MM/yyyy')} בשעה ${selectedTime}`,
                    body: `שלום ${formData.full_name},\n\nפגישתך עם ${lawyer.full_name} נקבעה בהצלחה!\n\nפרטי הפגישה:\nתאריך: ${format(selectedDate, 'dd/MM/yyyy', { locale: he })}\nשעה: ${selectedTime}\n\nנתראה בקרוב!\n\n${lawyer.full_name}`
                });
            } catch (emailError) {
                console.error("שגיאה בשליחת מייל:", emailError);
            }

            setSubmitted(true);
        } catch (error) {
            console.error("שגיאה בקביעת פגישה:", error);
            alert("שגיאה בקביעת הפגישה. אנא נסה שנית.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#3568AE]" />
            </div>
        );
    }

    if (!lawyer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-600">עורך דין לא נמצא</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                <Card className="max-w-2xl w-full">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">
                            הפגישה נקבעה בהצלחה!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            קיבלת אישור למייל שלך עם כל הפרטים.
                            <br />
                            נתראה ב-{format(selectedDate, 'dd/MM/yyyy', { locale: he })} בשעה {selectedTime}
                        </p>
                        <Button 
                            onClick={() => {
                                setSubmitted(false);
                                setSelectedDate(null);
                                setSelectedTime(null);
                                setFormData({
                                    full_name: "",
                                    phone: "",
                                    email: "",
                                    service_type: "",
                                    notes: ""
                                });
                            }}
                            className="bg-[#3568AE] hover:bg-[#2a5390]"
                        >
                            קבע פגישה נוספת
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Card className="shadow-2xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#3568AE] to-[#5B8BC7] text-white p-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-2">קביעת פגישה</h1>
                            <p className="text-lg opacity-90">עם {lawyer.full_name}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* פרטים אישיים */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#3568AE]" />
                                    הפרטים שלך
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">שם מלא *</label>
                                        <Input
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            placeholder="שם מלא"
                                            required
                                            className="text-right"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">טלפון *</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            placeholder="05X-XXXXXXX"
                                            required
                                            className="text-right"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">אימייל *</label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            placeholder="example@email.com"
                                            required
                                            className="text-right"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">נושא הפגישה</label>
                                        <Input
                                            value={formData.service_type}
                                            onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                                            placeholder="למה הפגישה?"
                                            className="text-right"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">הערות נוספות</label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        placeholder="פרטים נוספים שחשוב שנדע..."
                                        rows={3}
                                        className="text-right"
                                    />
                                </div>
                            </div>

                            {/* בחירת תאריך */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-[#3568AE]" />
                                    בחר תאריך ושעה
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex justify-center">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                                            locale={he}
                                            className="rounded-lg border shadow-sm"
                                        />
                                    </div>
                                    
                                    <div>
                                        {selectedDate ? (
                                            <div className="space-y-3">
                                                <p className="font-medium text-gray-700">
                                                    שעות פנויות ל-{format(selectedDate, 'dd/MM/yyyy', { locale: he })}:
                                                </p>
                                                <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                                                    {availableSlots.length > 0 ? (
                                                        availableSlots.map((slot) => (
                                                            <Button
                                                                key={slot}
                                                                type="button"
                                                                variant={selectedTime === slot ? "default" : "outline"}
                                                                onClick={() => setSelectedTime(slot)}
                                                                className={`text-sm ${selectedTime === slot ? 'bg-[#3568AE] text-white' : ''}`}
                                                            >
                                                                {slot}
                                                            </Button>
                                                        ))
                                                    ) : (
                                                        <p className="col-span-3 text-gray-500 text-center py-4">
                                                            אין שעות פנויות לתאריך זה
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <div className="text-center">
                                                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p>בחר תאריך מהלוח</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* כפתור שליחה */}
                            <div className="flex justify-center pt-4">
                                <Button
                                    type="submit"
                                    disabled={!selectedDate || !selectedTime || submitting}
                                    className="bg-gradient-to-r from-[#3568AE] to-[#5B8BC7] text-white px-12 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                            קובע פגישה...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 ml-2" />
                                            אשר את הפגישה
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-600 text-sm">
                    <p>מופעל על ידי LawForce CRM</p>
                </div>
            </div>
        </div>
    );
}