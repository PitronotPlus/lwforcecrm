import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';

async function getSignatureHebrewFont(pdfDoc) {
    const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/heebo/Heebo%5Bwght%5D.ttf';
    const fontResponse = await fetch(fontUrl);
    if (!fontResponse.ok) {
        throw new Error('Failed to fetch Hebrew font');
    }
    const fontBytes = await fontResponse.arrayBuffer();
    return await pdfDoc.embedFont(fontBytes, { subset: true });
}

async function fillSignatureFields(pdfDoc, template, fieldValues, hebrewFont) {
    const pages = pdfDoc.getPages();

    for (const field of template.fields) {
        const pageIndex = (field.page || 1) - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        const fieldX = (field.x / 100) * pageWidth;
        const fieldY = pageHeight - ((field.y / 100) * pageHeight);
        const fieldWidth = (field.width / 100) * pageWidth;
        const fieldHeight = (field.height / 100) * pageHeight;

        const value = fieldValues[field.id];
        if (!value) continue;

        if (field.type === 'signature') {
            if (typeof value === 'string' && value.startsWith('data:image')) {
                try {
                    const base64Data = value.split(',')[1];
                    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                    const image = await pdfDoc.embedPng(imageBytes);
                    
                    const aspectRatio = image.width / image.height;
                    let drawWidth = fieldWidth;
                    let drawHeight = fieldHeight;
                    
                    if (fieldWidth / fieldHeight > aspectRatio) {
                        drawWidth = fieldHeight * aspectRatio;
                    } else {
                        drawHeight = fieldWidth / aspectRatio;
                    }
                    
                    const xOffset = (fieldWidth - drawWidth) / 2;
                    const yOffset = (fieldHeight - drawHeight) / 2;
                    
                    page.drawImage(image, {
                        x: fieldX + xOffset,
                        y: fieldY - fieldHeight + yOffset,
                        width: drawWidth,
                        height: drawHeight,
                    });
                } catch (error) {
                    console.error('Error embedding signature image:', error);
                }
            }
        } else if (field.type === 'checkbox') {
            if (value === true || value === 'true') {
                const checkSize = Math.min(fieldWidth, fieldHeight) * 0.8;
                const checkX = fieldX + (fieldWidth - checkSize) / 2;
                const checkY = fieldY - (fieldHeight + checkSize) / 2;

                page.drawText('✓', {
                    x: checkX,
                    y: checkY,
                    size: checkSize,
                    font: hebrewFont,
                    color: { type: 'RGB', red: 0, green: 0.5, blue: 0 },
                });
            }
        } else if (field.type === 'text' || field.type === 'date') {
            // CRITICAL: Use the EXACT fontSize specified in the field
            const fontSize = field.fontSize && field.fontSize > 0 
                ? field.fontSize 
                : 16;
            
            // Calculate proper vertical centering to match final PDF
            const textY = fieldY - (fieldHeight / 2) - (fontSize / 3);

            page.drawText(value.toString(), {
                x: fieldX + 4,
                y: textY,
                size: fontSize,
                font: hebrewFont,
                maxWidth: fieldWidth - 8,
            });
        }
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { template } = await req.json();

        if (!template || !template.original_pdf_url || !template.fields) {
            return Response.json({ error: 'Invalid template data' }, { status: 400 });
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
                mockFieldValues[field.id] = '21/01/2026';
            } else if (field.type === 'checkbox') {
                mockFieldValues[field.id] = 'true';
            } else if (field.type === 'signature') {
                // Generate a more visible signature placeholder
                mockFieldValues[field.id] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAPtSURBVHhe7doxAQAgDMCwgX/PwRCBSrvr+sxMgIBLYE4CAQLfgLAQIHAKCOuUMkiAwBMQFgIETgFhnVIGCRB4AsJCgMApIKxTyiABAk9AWAgQOAWEdUoZJEDgCQgLAQKngLBOKYMECDwBYSFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCgjrlDJIgMATEBYCBA4BYUFA4BQQ1illkACBJyAsBAgcAsJCgMApIKxTyiABAk9AWAgQOASEhQCBU0BYp5RBAgSegLAQIHAICAsBAqeAsE4pgwQIPAFhIUDgEBAWAgROAWGdUgYJEHgCwkKAwCEgLAQInALCOqUMEiDwBISFAIFDQFgIEDgFhHVKGSRA4AkICwECh4CwECBwCswXeEoE4K8yiQQAAAAASUVORK5CYII=';
            }
        });

        await fillSignatureFields(pdfDoc, template, mockFieldValues, hebrewFont);

        const previewPdfBytes = await pdfDoc.save();

        return new Response(previewPdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="preview.pdf"'
            }
        });

    } catch (error) {
        console.error('Error generating preview:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});