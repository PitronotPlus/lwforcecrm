import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        const { documentId } = await req.json();

        if (!documentId) {
            return new Response(JSON.stringify({ success: false, error: 'Document ID is required' }), { status: 400 });
        }

        const document = await base44.entities.SignedDocument.get(documentId);
        
        if (!document) {
            return new Response(JSON.stringify({ success: false, error: 'Document not found' }), { status: 404 });
        }

        if (document.status === 'signed') {
            return new Response(JSON.stringify({ success: false, error: 'Cannot void a signed document' }), { status: 400 });
        }

        await base44.entities.SignedDocument.update(documentId, {
            status: 'voided'
        });

        const template = await base44.entities.DigitalSignatureTemplate.get(document.template_id);
        
        await base44.entities.CommunicationLog.create({
            client_id: document.lead_id,
            type: 'note',
            direction: 'outgoing',
            content: `בקשת חתימה בוטלה: "${template?.name || 'מסמך'}"`,
            status: 'logged'
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Error in voidSignatureRequest:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});