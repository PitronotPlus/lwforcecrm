import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        const { templateId, leadId, method = 'email' } = await req.json();

        if (!templateId || !leadId) {
            return new Response(JSON.stringify({ success: false, error: 'Template ID and Lead ID are required' }), { status: 400 });
        }

        const [template, client] = await Promise.all([
            base44.entities.DigitalSignatureTemplate.get(templateId),
            base44.entities.Client.get(leadId)
        ]);

        if (!template || !client) {
            return new Response(JSON.stringify({ success: false, error: 'Template or Client not found' }), { status: 404 });
        }
        
        const lead = {
            full_name: client.full_name,
            email: client.email
        };

        // Generate signing token
        const signingToken = crypto.randomUUID();
        
        // Create signed document record
        const signedDocument = await base44.entities.SignedDocument.create({
            template_id: templateId,
            lead_id: leadId,
            status: 'sent',
            signing_token: signingToken,
            sub_account_id: user.sub_account_id
        });

        if (method === 'email') {
            if (!lead.email) {
                return new Response(JSON.stringify({ success: false, error: 'Lead has no email address' }), { status: 400 });
            }

            // Get base URL
            let baseUrl = Deno.env.get('BASE_URL');
            if (!baseUrl || baseUrl.trim() === '') {
                const protocol = req.headers.get('x-forwarded-proto') || 'https';
                const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
                baseUrl = `${protocol}://${host}`;
            }
            
            const signingUrl = `${baseUrl}/SignDocument?token=${signingToken}`;
            
            const emailHtml = `
                <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">✍️ בקשה לחתימה דיגיטלית</h1>
                    </div>
                    
                    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                        <p style="font-size: 18px; line-height: 1.6; color: #374151;">שלום ${lead.full_name || 'לקוח/ה'},</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #6b7280;">
                            ${template.email_body || `נשלח אליך מסמך לחתימה דיגיטלית: <strong>${template.name}</strong>`}
                        </p>
                        
                        <div style="margin: 40px 0; text-align: center;">
                            <a href="${signingUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); 
                                      color: white; padding: 18px 45px; text-decoration: none; 
                                      border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                👉 לחץ כאן לחתימה על המסמך
                            </a>
                        </div>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px;">
                            <p style="font-size: 13px; color: #6b7280; margin: 0;">
                                📌 או העתק את הקישור הבא:<br/>
                                <a href="${signingUrl}" style="color: #10b981; word-break: break-all; font-size: 12px;">${signingUrl}</a>
                            </p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                                🔒 חתימה מאובטחת ומוצפנת | מסמך חתום יישלח אליך במייל לאחר השלמת החתימה
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            await base44.integrations.Core.SendEmail({
                to: lead.email,
                subject: template.email_subject || `בקשה לחתימה: ${template.name}`,
                body: emailHtml
            });

            await base44.entities.CommunicationLog.create({
                client_id: leadId,
                type: 'email',
                direction: 'outgoing',
                content: `נשלח מסמך לחתימה: ${template.name}`,
                status: 'sent'
            });
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'הבקשה נשלחה בהצלחה',
            document: signedDocument,
            signing_token: signingToken
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in sendSignatureRequest:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});