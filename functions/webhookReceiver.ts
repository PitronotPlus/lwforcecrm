import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Integration-Id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[${requestId}] 📨 NEW WEBHOOK REQUEST`);
    
    try {
        const base44 = createClientFromRequest(req);
        
        const url = new URL(req.url);
        const integration_id = url.searchParams.get('integration_id') || req.headers.get('x-integration-id');
        
        if (!integration_id) {
            console.log(`[${requestId}] ⚠️ No integration_id`);
            return new Response(JSON.stringify({ success: true }), { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`[${requestId}] 🔑 Integration ID: ${integration_id}`);

        // Parse incoming data
        const contentType = req.headers.get('content-type') || '';
        let rawData = {};
        
        try {
            if (contentType.includes('application/json')) {
                rawData = await req.json();
            } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
                const formData = await req.formData();
                for (const [key, value] of formData.entries()) {
                    rawData[key] = value;
                }
            } else {
                const text = await req.text();
                try {
                    rawData = JSON.parse(text);
                } catch {
                    const params = new URLSearchParams(text);
                    for (const [key, value] of params.entries()) {
                        rawData[key] = value;
                    }
                }
            }
        } catch (parseError) {
            console.error(`[${requestId}] ❌ Parse error:`, parseError.message);
            rawData = {};
        }

        console.log(`[${requestId}] 📥 RAW DATA:`, JSON.stringify(rawData, null, 2));

        // Fetch integration
        const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_id });
        
        if (!integrations || integrations.length === 0) {
            console.error(`[${requestId}] ❌ Integration not found`);
            return new Response(JSON.stringify({ success: true }), { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const integration = integrations[0];
        console.log(`[${requestId}] ✅ Found integration: ${integration.name}`);

        // Map fields
        const clientData = {};
        const fieldMapping = integration.field_mapping || [];

        if (fieldMapping.length > 0) {
            console.log(`[${requestId}] 🗺️ Using field mapping`);
            fieldMapping.forEach(mapping => {
                const sourceValue = rawData[mapping.source];
                if (sourceValue !== undefined && sourceValue !== null && sourceValue !== '') {
                    clientData[mapping.destination] = sourceValue;
                    console.log(`  ${mapping.source} -> ${mapping.destination}: "${sourceValue}"`);
                }
            });
        } else {
            console.log(`[${requestId}] ⚠️ No field mapping, using defaults`);
            
            clientData.full_name = rawData.full_name || rawData.name || rawData['your-name'] || rawData.שם;
            clientData.email = rawData.email || rawData.mail || rawData['your-email'];
            clientData.phone = rawData.phone || rawData.telephone || rawData.tel;
            clientData.notes = rawData.message || rawData.notes || rawData.comment;
        }

        // Set source and status
        clientData.source = integration.name || 'webhook';
        clientData.status = 'ליד';

        console.log(`[${requestId}] 💾 Client data prepared:`, JSON.stringify(clientData, null, 2));

        // Create client
        let savedClient;
        try {
            savedClient = await base44.asServiceRole.entities.Client.create(clientData);
            console.log(`[${requestId}] ✅ Client saved: ${savedClient.id}`);
        } catch (saveError) {
            console.error(`[${requestId}] ❌ Error saving client:`, saveError.message);
            
            // Log the error
            try {
                await base44.asServiceRole.entities.WebhookLog.create({
                    integration_id,
                    request_id: requestId,
                    raw_data: rawData,
                    mapped_data: clientData,
                    status: 'failed',
                    error_message: saveError.message,
                    processing_time_ms: Date.now() - startTime,
                    ip_address: req.headers.get('x-forwarded-for') || 'unknown'
                });
            } catch (logError) {
                console.error(`[${requestId}] Failed to log error:`, logError.message);
            }
            
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Log success
        try {
            await base44.asServiceRole.entities.WebhookLog.create({
                integration_id,
                request_id: requestId,
                raw_data: rawData,
                mapped_data: clientData,
                lead_id: savedClient.id,
                status: 'success',
                processing_time_ms: Date.now() - startTime,
                ip_address: req.headers.get('x-forwarded-for') || 'unknown'
            });
        } catch (logError) {
            console.error(`[${requestId}] Failed to log success:`, logError.message);
        }

        // Update integration stats
        try {
            await base44.asServiceRole.entities.Integration.update(integration.id, {
                leads_received: (integration.leads_received || 0) + 1,
                last_sync: new Date().toISOString(),
                status: 'active'
            });
        } catch (statsError) {
            console.error(`[${requestId}] Failed to update stats:`, statsError.message);
        }

        console.log(`[${requestId}] ✅ WEBHOOK COMPLETE - ${Date.now() - startTime}ms`);

        return new Response(JSON.stringify({
            success: true,
            client_id: savedClient.id,
            message: 'הלקוח נשמר בהצלחה'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error(`[${requestId}] ❌ FATAL ERROR:`, error.message);
        
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});