import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        // Google שולח מידע ב-headers
        const channelId = req.headers.get('X-Goog-Channel-ID');
        const resourceId = req.headers.get('X-Goog-Resource-ID');
        const resourceState = req.headers.get('X-Goog-Resource-State');
        const messageNumber = req.headers.get('X-Goog-Message-Number');

        console.log('Webhook received:', { channelId, resourceId, resourceState, messageNumber });

        // אם זה sync - אין צורך לטפל
        if (resourceState === 'sync') {
            return new Response('OK', { status: 200 });
        }

        // אם זה exists - יש שינוי, צריך לסנכרן
        if (resourceState === 'exists') {
            // נמצא את המשתמש המתאים לפי channelId
            const users = await base44.asServiceRole.entities.User.filter({
                watch_channel_id: channelId
            });

            if (users.length > 0) {
                const user = users[0];
                
                // קריאה לפונקציית הסנכרון
                await base44.asServiceRole.functions.invoke('googleCalendarSync', {
                    userEmail: user.email
                });
            }
        }

        return new Response('OK', { status: 200 });

    } catch (error) {
        console.error('Error in googleCalendarWebhook:', error);
        return new Response('Error', { status: 500 });
    }
});