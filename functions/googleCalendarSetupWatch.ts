import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
        
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