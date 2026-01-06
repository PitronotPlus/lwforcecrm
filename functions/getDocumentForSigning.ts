import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { token } = await req.json();

        if (!token) {
            return Response.json({ 
                success: false, 
                error: 'חסר אסימון חתימה' 
            }, { status: 400 });
        }

        // מצא את המסמך החתום לפי אסימון
        const docs = await base44.asServiceRole.entities.SignedDocument.filter({ 
            signing_token: token 
        });

        if (docs.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'המסמך לא נמצא או שהקישור לא תקף' 
            }, { status: 404 });
        }

        const doc = docs[0];

        // בדיקה אם כבר נחתם
        if (doc.status === 'signed') {
            return Response.json({ 
                success: false, 
                error: 'המסמך כבר נחתם. לא ניתן לחתום עליו פעם נוספת.' 
            }, { status: 400 });
        }

        // בדיקה אם בוטל
        if (doc.status === 'voided') {
            return Response.json({ 
                success: false, 
                error: 'המסמך בוטל ולא ניתן יותר לחתום עליו.' 
            }, { status: 400 });
        }

        // טען את התבנית
        const templates = await base44.asServiceRole.entities.DocumentTemplate.filter({ 
            id: doc.template_id 
        });

        if (templates.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'תבנית המסמך לא נמצאה' 
            }, { status: 404 });
        }

        const template = templates[0];

        // טען את הליד
        const leads = await base44.asServiceRole.entities.Lead.filter({ 
            id: doc.lead_id 
        });

        if (leads.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'פרטי הלקוח לא נמצאו' 
            }, { status: 404 });
        }

        const lead = leads[0];

        return Response.json({
            success: true,
            template,
            lead,
            document: doc
        });

    } catch (error) {
        console.error('Error in getDocumentForSigning:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});