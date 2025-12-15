import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            appointmentId,
            summary,
            description,
            location,
            startISO,
            endISO,
            clientEmail,
            clientName,
            requestMeet = true
        } = await req.json();

        // קבלת access token של המשתמש
        let accessToken = user.google_access_token;
        
        // בדיקה אם הטוקן פג תוקף
        if (new Date(user.google_token_expiry) < new Date()) {
            // רענון הטוקן
            const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
            const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    refresh_token: user.google_refresh_token,
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'refresh_token',
                }),
            });

            const tokens = await refreshResponse.json();
            accessToken = tokens.access_token;

            // עדכון הטוקן החדש
            await base44.auth.updateMe({
                google_access_token: tokens.access_token,
                google_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            });
        }
        
        if (!accessToken) {
            return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });
        }

        // יצירת אירוע ב-Google Calendar
        const event = {
            summary,
            description,
            location,
            start: { dateTime: startISO, timeZone: 'Asia/Jerusalem' },
            end: { dateTime: endISO, timeZone: 'Asia/Jerusalem' },
        };

        // הוספת המשתתף (הלקוח)
        if (clientEmail) {
            event.attendees = [{
                email: clientEmail,
                displayName: clientName,
                responseStatus: 'needsAction'
            }];
        }

        // Google Meet
        if (requestMeet) {
            event.conferenceData = {
                createRequest: {
                    requestId: crypto.randomUUID(),
                },
            };
        }

        const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
        url.searchParams.set('sendUpdates', 'all');
        if (requestMeet) url.searchParams.set('conferenceDataVersion', '1');

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Google Calendar API error: ${errText}`);
        }

        const result = await response.json();

        // עדכון ה-Appointment עם פרטי Google
        if (appointmentId) {
            await base44.entities.Appointment.update(appointmentId, {
                google_event_id: result.id,
                google_calendar_id: 'primary',
                google_html_link: result.htmlLink,
                google_meet_link: result.hangoutLink || result.conferenceData?.entryPoints?.[0]?.uri,
                google_status: result.status,
                client_response_status: 'needsAction'
            });
        }

        return Response.json({
            success: true,
            eventId: result.id,
            htmlLink: result.htmlLink,
            meetLink: result.hangoutLink || result.conferenceData?.entryPoints?.[0]?.uri
        });

    } catch (error) {
        console.error('Error in googleCalendarInsert:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});