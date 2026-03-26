import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state'); // userId

        if (!code) {
            return Response.redirect('/Appointments?tab=google&error=no_code');
        }

        // Exchange code for tokens
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = `${url.origin}/functions/googleCalendarCallback`;

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

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        const tokens = await tokenResponse.json();

        // שמירת הטוקנים עבור המשתמש
        await base44.asServiceRole.entities.User.update(state, {
            google_calendar_connected: true,
            google_refresh_token: tokens.refresh_token,
            google_access_token: tokens.access_token,
            google_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        });

        // הפניה חזרה לדף הפגישות
        return Response.redirect('/Appointments?tab=google&connected=true');

    } catch (error) {
        console.error('Error in googleCalendarCallback:', error);
        return Response.redirect('/Appointments?tab=google&error=true');
    }
});