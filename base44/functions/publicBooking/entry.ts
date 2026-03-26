import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const { action, lawyerId, date, appointmentData } = await req.json();
        
        if (action === 'getLawyer') {
            // טעינת נתוני עורך הדין
            const users = await base44.asServiceRole.entities.User.filter({ id: lawyerId });
            if (users.length === 0) {
                return Response.json({ error: 'Lawyer not found' }, { status: 404 });
            }
            return Response.json({ lawyer: users[0] });
        }
        
        if (action === 'getAvailableSlots') {
            // שליפת הגדרות זמינות של עורך הדין
            const users = await base44.asServiceRole.entities.User.filter({ email: appointmentData.lawyerEmail });
            const lawyer = users[0];
            
            // בדיקה איזה יום בשבוע זה
            const dayOfWeek = new Date(date).getDay();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayNames[dayOfWeek];
            
            // שליפת פגישות קיימות לתאריך
            const existingAppointments = await base44.asServiceRole.entities.Appointment.filter({
                created_by: appointmentData.lawyerEmail,
                date: date
            });
            
            // יצירת שעות זמינות לפי הגדרות המשתמש
            const slots = [];
            
            // אם יש הגדרות זמינות מותאמות אישית
            if (lawyer?.availability_settings && lawyer.availability_settings[dayName]?.enabled) {
                const daySettings = lawyer.availability_settings[dayName];
                const [startHour, startMin] = daySettings.start.split(':').map(Number);
                const [endHour, endMin] = daySettings.end.split(':').map(Number);
                
                let currentHour = startHour;
                let currentMin = startMin;
                
                while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
                    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
                    const isBooked = existingAppointments.some(apt => apt.time === timeStr);
                    if (!isBooked) {
                        slots.push(timeStr);
                    }
                    
                    currentMin += 30;
                    if (currentMin >= 60) {
                        currentMin = 0;
                        currentHour++;
                    }
                }
            } else {
                // ברירת מחדל: 9:00-17:00, כל חצי שעה
                for (let hour = 9; hour < 17; hour++) {
                    for (let minute of [0, 30]) {
                        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                        const isBooked = existingAppointments.some(apt => apt.time === timeStr);
                        if (!isBooked) {
                            slots.push(timeStr);
                        }
                    }
                }
            }
            
            return Response.json({ slots });
        }
        
        if (action === 'createAppointment') {
            // יצירת לקוח חדש
            const client = await base44.asServiceRole.entities.Client.create({
                full_name: appointmentData.full_name,
                phone: appointmentData.phone,
                email: appointmentData.email,
                service_type: appointmentData.service_type,
                status: "ליד",
                source: "קישור הזמנה",
                initial_need: appointmentData.notes
            });
            
            // יצירת הפגישה - שייכת לעורך הדין שיצר את קישור ההזמנה
            const appointment = await base44.asServiceRole.entities.Appointment.create({
                title: `פגישה עם ${appointmentData.full_name}`,
                date: appointmentData.date,
                time: appointmentData.time,
                client_name: appointmentData.full_name,
                client_email: appointmentData.email,
                client_phone: appointmentData.phone,
                notes: appointmentData.notes,
                type: "פגישה",
                location_type: "משרד",
                reminder: true,
                created_by: appointmentData.lawyerEmail,
                assigned_to: appointmentData.lawyerEmail
            });

            // בדיקה אם לעורך הדין יש Google Calendar מחובר
            const users = await base44.asServiceRole.entities.User.filter({ email: appointmentData.lawyerEmail });
            if (users.length > 0 && users[0].google_calendar_connected) {
                try {
                    // יצירת האירוע ב-Google Calendar
                    const [startHour, startMin] = appointmentData.time.split(':');
                    const startDate = new Date(appointmentData.date);
                    startDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
                    
                    const endDate = new Date(startDate);
                    endDate.setMinutes(endDate.getMinutes() + 30); // פגישה של 30 דקות
                    
                    await base44.asServiceRole.functions.invoke('googleCalendarInsert', {
                        appointmentId: appointment.id,
                        summary: `פגישה עם ${appointmentData.full_name}`,
                        description: appointmentData.notes,
                        location: 'המשרד',
                        startISO: startDate.toISOString(),
                        endISO: endDate.toISOString(),
                        clientEmail: appointmentData.email,
                        clientName: appointmentData.full_name,
                        requestMeet: true
                    });
                } catch (gcalError) {
                    console.error('שגיאה ביצירת אירוע Google Calendar:', gcalError);
                }
            }
            
            // שליחת אימייל אישור
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: appointmentData.email,
                    subject: `אישור פגישה - ${appointmentData.date} בשעה ${appointmentData.time}`,
                    body: `שלום ${appointmentData.full_name},\n\nפגישתך עם ${appointmentData.lawyerName} נקבעה בהצלחה!\n\nפרטי הפגישה:\nתאריך: ${appointmentData.date}\nשעה: ${appointmentData.time}\n\nנתראה בקרוב!\n\n${appointmentData.lawyerName}`
                });
            } catch (emailError) {
                console.error("שגיאה בשליחת מייל:", emailError);
            }
            
            return Response.json({ success: true, appointment, client });
        }
        
        return Response.json({ error: 'Invalid action' }, { status: 400 });
        
    } catch (error) {
        console.error("Error in publicBooking:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});