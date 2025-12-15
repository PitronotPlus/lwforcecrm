import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userEmail } = await req.json().catch(() => ({ userEmail: user.email }));

        // קבלת access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
        
        if (!accessToken) {
            return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });
        }

        // קבלת syncToken אם קיים
        const syncToken = user.calendar_sync_token;

        const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
        url.searchParams.set('singleEvents', 'true');
        url.searchParams.set('showDeleted', 'true');

        if (syncToken) {
            url.searchParams.set('syncToken', syncToken);
        } else {
            // סנכרון ראשוני - מהיום ולחודשיים קדימה
            const now = new Date();
            const future = new Date();
            future.setMonth(future.getMonth() + 2);
            url.searchParams.set('timeMin', now.toISOString());
            url.searchParams.set('timeMax', future.toISOString());
        }

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Google Calendar API error: ${errText}`);
        }

        const result = await response.json();

        // עדכון כל האירועים שהשתנו
        for (const event of result.items || []) {
            // מציאת הפגישה המתאימה לפי google_event_id
            const appointments = await base44.asServiceRole.entities.Appointment.filter({
                google_event_id: event.id,
                created_by: userEmail
            });

            if (appointments.length > 0) {
                const appointment = appointments[0];
                
                // עדכון סטטוס לקוח אם השתנה
                const attendee = event.attendees?.find(a => a.email === appointment.client_email);
                
                const updates = {
                    google_status: event.status
                };

                if (attendee) {
                    updates.client_response_status = attendee.responseStatus;
                }

                // אם האירוע נמחק
                if (event.status === 'cancelled') {
                    updates.google_status = 'cancelled';
                }

                await base44.asServiceRole.entities.Appointment.update(appointment.id, updates);
            }
        }

        // שמירת syncToken החדש
        if (result.nextSyncToken) {
            await base44.asServiceRole.entities.User.update(user.id, {
                calendar_sync_token: result.nextSyncToken
            });
        }

        return Response.json({
            success: true,
            itemsUpdated: result.items?.length || 0
        });

    } catch (error) {
        console.error('Error in googleCalendarSync:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});