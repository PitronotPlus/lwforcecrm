import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';
import { getSignatureHebrewFont, fillSignatureFields } from './signaturePdfHelpers.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { template } = await req.json();

        if (!template || !template.original_pdf_url || !template.fields) {
            return new Response('Invalid template data', { status: 400 });
        }

        // Load original PDF
        const pdfResponse = await fetch(template.original_pdf_url);
        if (!pdfResponse.ok) {
            throw new Error('Failed to fetch original PDF');
        }
        
        const pdfBytes = await pdfResponse.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        pdfDoc.registerFontkit(fontkit);
        
        const hebrewFont = await getSignatureHebrewFont(pdfDoc);

        // Create mock field values for preview
        const mockFieldValues = {};
        template.fields.forEach(field => {
            if (field.type === 'text') {
                mockFieldValues[field.id] = `דוגמה: ${field.label}`;
            } else if (field.type === 'date') {
                mockFieldValues[field.id] = new Date().toLocaleDateString('he-IL');
            } else if (field.type === 'checkbox') {
                mockFieldValues[field.id] = 'true'; // Show checked in preview
            } else if (field.type === 'signature') {
                // Generate a simple signature-like preview image
                const canvas = document.createElement ? null : null;
                // Use a more visible signature placeholder for preview
                mockFieldValues[field.id] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAPtSURBVHhe7doxAQAgDMCwgX/PwRCBSrvr+sxMgIBLYE4CAQLfgLAQIHAKCOuUMkiAwBMQFgIETgFhnVIGCRB4AsJCgMApIKxTyiABAk9AWAgQOAWEdUoZJEDgCQgLAQKngLBOKYMECDwBYSFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCswXeEoE4K8yiQQAAAAASUVORK5CYII=';
            }
        });

        await fillSignatureFields(pdfDoc, template, mockFieldValues, hebrewFont, false);

        const previewPdfBytes = await pdfDoc.save();

        return new Response(previewPdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="preview.pdf"'
            }
        });

    } catch (error) {
        console.error('Error generating preview:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});