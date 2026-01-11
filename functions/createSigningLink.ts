import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { templateId, clientId } = await req.json();

        const [template, client] = await Promise.all([
            base44.entities.DigitalSignatureTemplate.filter({ id: templateId }).then(r => r[0]),
            base44.entities.Client.filter({ id: clientId }).then(r => r[0])
        ]);

        if (!template || !client) {
            return new Response(JSON.stringify({ success: false, error: 'Template or Client not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const signingToken = crypto.randomUUID();
        
        // Return relative URL - the frontend will construct the full URL
        const signingUrl = `/SignDocument?token=${signingToken}`;

        const signedDocument = await base44.entities.SignedDocument.create({
            template_id: templateId,
            lead_id: clientId,
            status: 'created',
            signing_token: signingToken
        });

        return new Response(JSON.stringify({ 
            success: true, 
            signingUrl,
            document: signedDocument 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in createSigningLink:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});