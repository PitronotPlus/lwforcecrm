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
            // שליפת פגישות קיימות לתאריך
            const existingAppointments = await base44.asServiceRole.entities.Appointment.filter({
                created_by: appointmentData.lawyerEmail,
                date: date
            });
            
            // יצירת שעות זמינות (9:00-18:00, כל חצי שעה)
            const slots = [];
            for (let hour = 9; hour < 18; hour++) {
                for (let minute of [0, 30]) {
                    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    const isBooked = existingAppointments.some(apt => apt.time === timeStr);
                    if (!isBooked) {
                        slots.push(timeStr);
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
            
            // יצירת הפגישה
            const appointment = await base44.asServiceRole.entities.Appointment.create({
                title: `פגישה עם ${appointmentData.full_name}`,
                date: appointmentData.date,
                time: appointmentData.time,
                client_name: appointmentData.full_name,
                notes: appointmentData.notes,
                type: "פגישה",
                location_type: "משרד",
                reminder: true
            });
            
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