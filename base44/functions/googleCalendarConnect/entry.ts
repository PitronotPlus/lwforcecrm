import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { code } = await req.json().catch(() => ({}));

        // אם יש code - זה callback מ-Google
        if (code) {
            // Exchange code for tokens
            const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
            const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
            const redirectUri = `${new URL(req.url).origin}/Appointments?tab=google`;

            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code',
                }),
            });

            const tokens = await tokenResponse.json();

            // שמירת הטוקנים בפרופיל המשתמש
            await base44.auth.updateMe({
                google_calendar_connected: true,
                google_refresh_token: tokens.refresh_token,
                google_access_token: tokens.access_token,
                google_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            });

            // הקמת Webhook
            await base44.functions.invoke('googleCalendarSetupWatch', {});

            return Response.json({ success: true });
        }

        // אם אין code - החזר את ה-OAuth URL
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        
        if (!clientId || !clientSecret) {
            return Response.json({ 
                error: 'missing_credentials',
                message: 'Google Calendar integration not configured. Contact system administrator.'
            });
        }
        
        const redirectUri = `${new URL(req.url).origin}/Appointments?tab=google`;
        const scope = 'https://www.googleapis.com/auth/calendar.events';

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scope)}&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${user.id}`;

        return Response.json({ authUrl });

    } catch (error) {
        console.error('Error in googleCalendarConnect:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});