import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { integration_id, test_data } = await req.json();
        
        if (!integration_id) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'integration_id is required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const log = [];
        const addLog = (message, data = null) => {
            const entry = {
                timestamp: new Date().toISOString(),
                message,
                data
            };
            log.push(entry);
            console.log(message, data);
        };

        addLog('🧪 Starting webhook test', { integration_id });

        addLog('Step 1: Fetching integration...');
        const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_id });
        
        if (!integrations || integrations.length === 0) {
            addLog('❌ Integration not found');
            return new Response(JSON.stringify({
                success: false,
                error: 'Integration not found',
                log
            }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const integration = integrations[0];
        addLog('✅ Integration found', { name: integration.name, id: integration.id });

        addLog('Step 2: Parsing test data...');
        const defaultTestData = {
            full_name: 'בדיקה טסט',
            email: 'test@example.com',
            phone: '0501234567',
            message: 'זהו ליד בדיקה'
        };
        
        const rawData = test_data || defaultTestData;
        addLog('📥 Raw data received', rawData);

        addLog('Step 3: Mapping fields...');
        const clientData = {};
        const fieldMapping = integration.field_mapping || [];

        if (fieldMapping.length > 0) {
            addLog('Using field mapping', fieldMapping);
            fieldMapping.forEach(mapping => {
                const sourceValue = rawData[mapping.source];
                if (sourceValue !== undefined && sourceValue !== null && sourceValue !== '') {
                    clientData[mapping.destination] = sourceValue;
                    addLog(`Mapped: ${mapping.source} -> ${mapping.destination}`, sourceValue);
                }
            });
        } else {
            addLog('⚠️ No field mapping configured, using common field names');
            
            clientData.full_name = rawData.full_name || rawData.fullName || rawData.name;
            clientData.email = rawData.email || rawData.mail;
            clientData.phone = rawData.phone || rawData.telephone;
            clientData.initial_need = rawData.message || rawData.notes;
        }

        clientData.source = integration.name || 'webhook_test';
        clientData.status = 'ליד';
        clientData.notes = `נוצר מבדיקת אינטגרציה\nזמן: ${new Date().toISOString()}`;

        addLog('💾 Final client data prepared', clientData);

        addLog('Step 4: Saving client...');
        let client;
        try {
            client = await base44.asServiceRole.entities.Client.create(clientData);
            addLog('✅ Client saved successfully', { client_id: client.id });
        } catch (saveError) {
            addLog('❌ Failed to save client', { error: saveError.message });
            throw saveError;
        }

        addLog('Step 5: Updating integration stats...');
        try {
            await base44.asServiceRole.entities.Integration.update(integration.id, {
                leads_received: (integration.leads_received || 0) + 1,
                last_sync: new Date().toISOString()
            });
            addLog('✅ Integration stats updated');
        } catch (updateError) {
            addLog('⚠️ Failed to update stats', { error: updateError.message });
        }

        addLog('🎉 Test completed successfully!');

        return new Response(JSON.stringify({
            success: true,
            client_id: client.id,
            client_name: client.full_name,
            log,
            summary: {
                integration_found: true,
                client_created: true
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Test webhook error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack,
            log: log || []
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});