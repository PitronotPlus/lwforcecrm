import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    if (!(await base44.auth.isAuthenticated())) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { integrationId } = await req.json();
        const user = await base44.auth.me();

        if (!integrationId) {
            return new Response(JSON.stringify({ success: false, error: 'Integration ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`[DIAGNOSE] Verifying integration: ${integrationId}`);
        
        const integrations = await base44.asServiceRole.entities.Integration.filter({
            integration_id: integrationId
        });

        if (integrations && integrations.length > 0) {
             return new Response(JSON.stringify({ 
                success: true, 
                message: `החיבור תקין! אינטגרציה בשם '${integrations[0].name}' נמצאה בהצלחה.`,
                integration: integrations[0]
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
             return new Response(JSON.stringify({ 
                success: false, 
                error: `האינטגרציה עם המזהה ${integrationId} לא נמצאה. ודא שהעתקת את הכתובת המלאה וששמרת את האינטגרציה במערכת.`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Error in diagnoseWebhook function:', error);
        return new Response(JSON.stringify({ success: false, error: 'An internal server error occurred in the diagnostic function.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});