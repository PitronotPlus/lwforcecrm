import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

async function parseRequestData(req) {
    const contentType = req.headers.get('content-type') || '';
    console.log('--- Parsing Request Data ---');
    console.log('Content-Type:', contentType);

    try {
        if (contentType.includes('application/json')) {
            const data = await req.json();
            console.log('Parsed as JSON:', data);
            return data;
        } 
        if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await req.text();
            console.log('Raw form-urlencoded text:', text);
            const params = new URLSearchParams(text);
            const data = Object.fromEntries(params.entries());
            console.log('Parsed as form-urlencoded:', data);
            return data;
        }
        
        console.warn('Unknown or missing content-type. Attempting to parse as form data as a fallback.');
        const text = await req.text();
        console.log('Raw body text (fallback):', text);
        
        try {
           const params = new URLSearchParams(text);
           const data = Object.fromEntries(params.entries());
           console.log('Parsed as URLSearchParams (fallback):', data);
           return data;
        } catch (e) {
           console.error('Could not parse body as URLSearchParams. Returning raw text.');
           return { raw_body: text };
        }

    } catch (error) {
        console.error('!!! Critical error parsing request data:', error);
        throw error;
    }
}

function transformToClient(data, fieldMapping, sourceName, integrationId) {
    console.log('--- Transforming Data to Client ---');
    const clientData = {
        source: sourceName || 'Webhook',
        status: 'ליד',
        notes: `נוצר דרך Webhook: ${sourceName}`,
        integration_id: integrationId
    };

    console.log('Field Mapping received:', fieldMapping);
    console.log('Data received:', data);

    for (const [crmField, sourceField] of Object.entries(fieldMapping)) {
        if (data[sourceField]) {
            clientData[crmField] = data[sourceField];
            console.log(`Mapped [${sourceField}] to [${crmField}]: "${data[sourceField]}"`);
        }
    }

    // Add any extra fields from the form to the notes
    const extraFields = [];
    const mappedSourceFields = Object.values(fieldMapping);
    for(const key in data) {
        if (data[key] !== null && data[key] !== undefined && !mappedSourceFields.includes(key)) {
            extraFields.push(`${key}: ${data[key]}`);
        }
    }

    if (extraFields.length > 0) {
        clientData.notes += `\n\nמידע נוסף מהטופס:\n${extraFields.join('\n')}`;
    }

    if (!clientData.email && !clientData.phone) {
        console.error('Validation failed: Client must have an email or a phone number.');
        return null;
    }
    
    console.log('Final Client Data:', clientData);
    return clientData;
}

Deno.serve(async (req) => {
    console.log('🚀🚀🚀 INBOUND WEBHOOK FUNCTION TRIGGERED 🚀🚀🚀');
    const base44 = createClientFromRequest(req);
    
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
        });
    }

    try {
        const url = new URL(req.url);
        const integrationId = url.searchParams.get('integrationId');
        
        if (!integrationId) {
            console.error('FATAL: integrationId parameter is missing from the URL.');
            return new Response(JSON.stringify({ success: false, error: 'Integration ID is missing.' }), { status: 400, headers });
        }
        console.log('🔍 Filtering for integration_id:', integrationId);

        const data = await parseRequestData(req);
        
        const integrations = await base44.asServiceRole.entities.Integration.filter({
            integration_id: integrationId
        });
        
        console.log(`📊 Found ${integrations.length} matching integrations.`);
        
        if (!integrations || integrations.length === 0) {
            console.error(`❌ No integration found with integration_id: ${integrationId}`);
            return new Response(JSON.stringify({ 
                success: false, 
                error: `Integration with ID ${integrationId} not found. Please ensure the integration was saved correctly.` 
            }), { status: 404, headers });
        }
        
        const integration = integrations[0];
        console.log('✅ Found integration:', integration.name, 'with internal DB ID:', integration.id);
        
        const clientData = transformToClient(data, integration.field_mapping, integration.name, integration.id);
        if (!clientData) {
            console.error('❌ Could not create client, transformation failed.');
            return new Response(JSON.stringify({ success: false, error: 'Could not process form data into a valid client.' }), { status: 400, headers });
        }
        
        console.log('📞 Creating client...');
        
        const newClient = await base44.asServiceRole.entities.Client.create(clientData);
        console.log(`✅ Client created - ID: ${newClient.id}`);

        // Update integration stats
        await base44.asServiceRole.entities.Integration.update(integration.id, {
            leads_received: (integration.leads_received || 0) + 1,
            last_sync: new Date().toISOString()
        });
        console.log(`✅ Updated stats for integration ID: ${integration.id}`);

        return new Response(JSON.stringify({ 
            success: true, 
            client_id: newClient.id
        }), { status: 200, headers });

    } catch (error) {
        console.error('🔥🔥🔥 Unhandled Exception in Webhook:', error.message);
        console.error(error.stack);
        return new Response(JSON.stringify({ success: false, error: 'An internal server error occurred.' }), { status: 500, headers });
    }
});