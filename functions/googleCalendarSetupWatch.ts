import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // קבלת access token של המשתמש
        let accessToken = user.google_access_token;
        
        // בדיקה אם הטוקן פג תוקף
        if (new Date(user.google_token_expiry) < new Date()) {
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

            await base44.auth.updateMe({
                google_access_token: tokens.access_token,
                google_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            });
        }
        
        if (!accessToken) {
            return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });
        }

        // יצירת channel ID ייחודי
        const channelId = `${user.id}-${Date.now()}`;
        const webhookAddress = `${new URL(req.url).origin}/functions/googleCalendarWebhook`;

        const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events/watch';

        const body = {
            id: channelId,
            type: 'web_hook',
            address: webhookAddress,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`events.watch failed: ${errText}`);
        }

        const result = await response.json();

        // שמירת פרטי ה-watch
        await base44.auth.updateMe({
            watch_channel_id: result.id,
            watch_resource_id: result.resourceId,
            watch_expiration: new Date(parseInt(result.expiration)).toISOString()
        });

        return Response.json({
            success: true,
            channelId: result.id,
            expiration: new Date(parseInt(result.expiration)).toISOString()
        });

    } catch (error) {
        console.error('Error in googleCalendarSetupWatch:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});