import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        const body = await req.json();
        const templateName = body.template_name || `בדיקת תהליך חתימה - ${new Date().toISOString()}`;

        // Create test PDF
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);
        const page = pdfDoc.addPage([595, 842]);
        
        const hebrewFontUrl = 'https://github.com/google/fonts/raw/main/ofl/davidlibre/DavidLibre-Regular.ttf';
        const fontRes = await fetch(hebrewFontUrl);
        const fontBytes = await fontRes.arrayBuffer();
        const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: true });
        
        page.drawText('מסמך בדיקה לחתימה דיגיטלית', {
            x: 50,
            y: 750,
            size: 24,
            font: hebrewFont,
            color: rgb(0.1, 0.5, 0.7)
        });
        
        page.drawText('זהו מסמך לבדיקת תהליך החתימה המלא', {
            x: 50,
            y: 700,
            size: 16,
            font: hebrewFont
        });
        
        const pdfBytes = await pdfDoc.save();
        const pdfFile = new File([pdfBytes], 'test-document.pdf', { type: 'application/pdf' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file: pdfFile });
        
        // Rasterize for template
        const pageImageUrls = [uploadResult.file_url]; // Simplified for test

        // Create test template
        const template = await base44.entities.DigitalSignatureTemplate.create({
            name: templateName,
            original_pdf_url: uploadResult.file_url,
            page_image_urls: pageImageUrls,
            fields: [
                {
                    id: 'field_name',
                    type: 'text',
                    page: 1,
                    x: 10,
                    y: 40,
                    width: 30,
                    height: 5,
                    label: 'שם מלא',
                    required: true,
                    fontSize: 16
                },
                {
                    id: 'field_date',
                    type: 'date',
                    page: 1,
                    x: 50,
                    y: 40,
                    width: 20,
                    height: 5,
                    label: 'תאריך',
                    required: true,
                    fontSize: 16
                },
                {
                    id: 'field_signature',
                    type: 'signature',
                    page: 1,
                    x: 10,
                    y: 50,
                    width: 25,
                    height: 10,
                    label: 'חתימה',
                    required: true
                }
            ],
            email_subject: 'בדיקת חתימה דיגיטלית',
            email_body: 'זהו מייל בדיקה למערכת החתימה הדיגיטלית.'
        });

        // Create test lead
        const testLead = await base44.entities.Lead.create({
            first_name: 'בדיקה',
            last_name: 'טסט',
            email: user.email,
            phone: '0500000000',
            status: 'חדש'
        });

        // Create signing document
        const signingToken = crypto.randomUUID();
        const document = await base44.entities.SignedDocument.create({
            template_id: template.id,
            lead_id: testLead.id,
            status: 'created',
            signing_token: signingToken
        });

        return new Response(JSON.stringify({
            success: true,
            template,
            lead: testLead,
            document,
            signing_token: signingToken
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in createTestDocument:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});