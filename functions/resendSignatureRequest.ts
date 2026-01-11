import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        const { documentId, method } = await req.json();

        if (!documentId) {
            return new Response(JSON.stringify({ success: false, error: 'Document ID is required' }), { status: 400 });
        }

        const document = await base44.entities.SignedDocument.get(documentId);
        
        if (!document) {
            return new Response(JSON.stringify({ success: false, error: 'Document not found' }), { status: 404 });
        }

        if (document.status === 'signed') {
            return new Response(JSON.stringify({ success: false, error: 'Document already signed' }), { status: 400 });
        }

        const [template, lead] = await Promise.all([
            base44.entities.DigitalSignatureTemplate.get(document.template_id),
            base44.entities.Lead.get(document.lead_id)
        ]);

        if (!template || !lead || !lead.email) {
            return new Response(JSON.stringify({ success: false, error: 'Template, lead, or email not found' }), { status: 404 });
        }

        if (method === 'email') {
            let baseUrl = Deno.env.get('BASE_URL');
            if (!baseUrl || baseUrl.trim() === '') {
                const protocol = req.headers.get('x-forwarded-proto') || 'https';
                const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
                baseUrl = `${protocol}://${host}`;
            }
            
            const signingUrl = `${baseUrl}/SignDocument?token=${document.signing_token}`;
            
            const emailHtml = `
                <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; padding: 20px;">
                    <h1 style="color: #10b981;">תזכורת - חתימה על מסמך</h1>
                    <p style="font-size: 16px; line-height: 1.6;">שלום ${lead.first_name || 'לקוח/ה'},</p>
                    <p>זוהי תזכורת לחתימה על המסמך: <strong>${template.name}</strong></p>
                    
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${signingUrl}" 
                           style="display: inline-block; background: linear-gradient(to left, #10b981, #14b8a6); 
                                  color: white; padding: 15px 40px; text-decoration: none; 
                                  border-radius: 8px; font-weight: bold; font-size: 18px;">
                            👉 לחץ כאן לחתימה על המסמך
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">
                        או העתק את הקישור:<br/>
                        <a href="${signingUrl}" style="color: #10b981; word-break: break-all;">${signingUrl}</a>
                    </p>
                </div>
            `;
            
            await base44.integrations.Core.SendEmail({
                to: lead.email,
                subject: `תזכורת: ${template.email_subject || template.name}`,
                body: emailHtml
            });

            await base44.entities.LeadActivityLog.create({
                lead_id: document.lead_id,
                activity_type: 'interaction_added',
                description: `נשלחה תזכורת לחתימה: "${template.name}"`,
                source: 'user',
                performed_by: user.email,
                timestamp: new Date().toISOString(),
            });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Error in resendSignatureRequest:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});