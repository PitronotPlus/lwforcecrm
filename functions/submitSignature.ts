// ===================================================================
// DIGITAL SIGNATURE SUBMISSION FUNCTION
// Uses ISOLATED signature PDF helpers - completely separate from invoices
// ===================================================================

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';

// Helper to log
const log = (...args) => {
    console.error('[SUBMIT_SIGNATURE]', ...args);
};

// Hebrew font URL
const SIGNATURE_HEBREW_FONT_URL = 'https://github.com/google/fonts/raw/main/ofl/davidlibre/DavidLibre-Regular.ttf';

async function getSignatureHebrewFont(pdfDoc) {
    log('Loading Hebrew font...');
    const fontRes = await fetch(SIGNATURE_HEBREW_FONT_URL);
    if (!fontRes.ok) throw new Error(`Failed to fetch signature font: ${fontRes.statusText}`);
    
    const fontBytes = await fontRes.arrayBuffer();
    const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: true });
    log('Hebrew font loaded successfully');
    return hebrewFont;
}

async function fillSignatureFields(pdfDoc, template, field_values, hebrewFont) {
    log('Filling signature fields...');
    const pages = pdfDoc.getPages();

    for (const field of template.fields) {
        if (field.page > pages.length) continue;
        const page = pages[field.page - 1];
        const value = field_values[field.id];

        if (page && value) {
            const fieldRect = {
                x: (field.x / 100) * page.getWidth(),
                y: page.getHeight() - (field.y / 100) * page.getHeight() - (field.height / 100) * page.getHeight(),
                width: (field.width / 100) * page.getWidth(),
                height: (field.height / 100) * page.getHeight(),
            };

            try {
                if (field.type === 'signature' && typeof value === 'string' && value.startsWith('data:image/png;base64')) {
                    const pngImageBytes = Uint8Array.from(atob(value.split(',')[1]), c => c.charCodeAt(0));
                    const pngImage = await pdfDoc.embedPng(pngImageBytes);
                    page.drawImage(pngImage, { ...fieldRect });
                } else if (field.type === 'checkbox') {
                    // Draw checkmark (✓) if checked
                    if (value === true || value === 'true' || value === 'checked') {
                        const centerX = fieldRect.x + fieldRect.width / 2;
                        const centerY = fieldRect.y + fieldRect.height / 2;
                        const size = Math.min(fieldRect.width, fieldRect.height) * 0.7;
                        
                        // Draw green checkmark
                        page.drawText('✓', {
                            x: centerX - size * 0.4,
                            y: centerY - size * 0.45,
                            size: size * 1.5,
                            color: rgb(0.13, 0.72, 0.51),
                            font: hebrewFont
                        });
                    }
                } else if (field.type === 'text' || field.type === 'date') {
                    const text = String(value);
                    let fontSize = field.fontSize && field.fontSize > 0 ? field.fontSize : fieldRect.height * 0.7;
                    fontSize = Math.max(10, Math.min(24, fontSize));
                    
                    page.drawText(text, {
                        x: fieldRect.x + 4,
                        y: fieldRect.y + (fieldRect.height / 2) - (fontSize / 2.5),
                        size: fontSize,
                        color: rgb(0, 0, 0),
                        font: hebrewFont,
                        lineHeight: fontSize * 1.2,
                        maxWidth: fieldRect.width - 8,
                    });
                }
            } catch(e) {
                log(`Failed to draw field ${field.id}: ${e.message}`);
            }
        }
    }
    
    log('PDF fields filled successfully');
    return pdfDoc;
}

async function addSignatureCertificatePage(pdfDoc, document, lead, hebrewFont) {
    log('Adding certificate page...');
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const borderColor = rgb(0.1, 0.5, 0.7);
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderWidth: 2, borderColor, borderOpacity: 0.5 });

    // Title
    page.drawText('תעודת חתימה דיגיטלית', { 
        x: width - 280, 
        y: height - 70, 
        font: hebrewFont, 
        size: 28, 
        color: rgb(0.2, 0.2, 0.2) 
    });
    
    // Reference ID
    page.drawText(`מזהה: ${document.id}`, { 
        x: width - 280, 
        y: height - 100, 
        font: hebrewFont, 
        size: 10, 
        color: rgb(0.5, 0.5, 0.5) 
    });
    
    // Signer name
    const leadFullName = lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    page.drawText(`נחתם על ידי: ${leadFullName}`, { 
        x: width - 280, 
        y: height - 140, 
        font: hebrewFont, 
        size: 14, 
        color: rgb(0, 0, 0) 
    });
    
    // Signing date and time
    const signedDate = new Date(document.signed_at);
    const dateStr = signedDate.toLocaleDateString('he-IL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const timeStr = signedDate.toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    page.drawText(`תאריך: ${dateStr}`, { 
        x: width - 280, 
        y: height - 170, 
        font: hebrewFont, 
        size: 12, 
        color: rgb(0, 0, 0) 
    });
    
    page.drawText(`שעה: ${timeStr}`, { 
        x: width - 280, 
        y: height - 190, 
        font: hebrewFont, 
        size: 12, 
        color: rgb(0, 0, 0) 
    });
    
    // IP Address
    page.drawText(`כתובת IP: ${document.signing_ip || 'לא זמין'}`, { 
        x: width - 280, 
        y: height - 210, 
        font: hebrewFont, 
        size: 12, 
        color: rgb(0, 0, 0) 
    });
    
    // Signatures section
    page.drawText('חתימות:', { 
        x: width - 280, 
        y: height - 250, 
        font: hebrewFont, 
        size: 14, 
        color: rgb(0, 0, 0) 
    });
    
    // Draw signature images if they exist
    let yOffset = height - 280;
    if (document.field_values) {
        for (const [fieldId, value] of Object.entries(document.field_values)) {
            if (typeof value === 'string' && value.startsWith('data:image/png;base64')) {
                try {
                    const pngImageBytes = Uint8Array.from(atob(value.split(',')[1]), c => c.charCodeAt(0));
                    const pngImage = await pdfDoc.embedPng(pngImageBytes);
                    const imgDims = pngImage.scale(0.3);
                    page.drawImage(pngImage, {
                        x: width - 280,
                        y: yOffset - imgDims.height,
                        width: imgDims.width,
                        height: imgDims.height,
                    });
                    yOffset -= imgDims.height + 10;
                } catch (e) {
                    log('Failed to embed signature image:', e.message);
                }
            }
        }
    }
    
    // Security notice
    page.drawText('מסמך זה נחתם באמצעות מערכת חתימה דיגיטלית מאובטחת', { 
        x: width / 2 - 180, 
        y: 60, 
        font: hebrewFont, 
        size: 10, 
        color: rgb(0.5, 0.5, 0.5) 
    });
    
    log('Certificate page added successfully');
    return pdfDoc;
}

Deno.serve(async (req) => {
    log('=== submitSignature START ===');
    
    const base44 = createClientFromRequest(req);
    let documentId, signingTimestamp;

    try {
        const body = await req.json();
        log('Request body received');
        
        if (!body.signing_token || !body.field_values) {
            return new Response(JSON.stringify({ success: false, error: 'בקשה לא תקינה: חסרים פרמטרים' }), { status: 400 });
        }
        const { signing_token, field_values } = body;

        log('Signing token:', signing_token);
        signingTimestamp = new Date().toISOString();

        log('Searching for document...');
        const documents = await base44.asServiceRole.entities.SignedDocument.filter({ signing_token });
        log('Found documents:', documents?.length || 0);
        
        if (!documents || documents.length === 0) {
            log('No document found with token:', signing_token);
            return new Response(JSON.stringify({ success: false, error: 'מסמך לא נמצא - ייתכן שפג תוקפו' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const document = documents[0];
        documentId = document.id;
        log('Found document:', document.id, 'Status:', document.status);

        if (document.status === 'signed') {
            log('Document already signed, returning existing PDF URL:', document.signed_pdf_url);
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'המסמך כבר נחתם',
                document_id: document.id,
                download_url: document.signed_pdf_url,
                signed_pdf_url: document.signed_pdf_url
            }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (document.status === 'voided') {
            return new Response(JSON.stringify({ success: false, error: 'המסמך בוטל' }), { 
                status: 410,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const template = await base44.asServiceRole.entities.DigitalSignatureTemplate.get(document.template_id);
        const client = await base44.asServiceRole.entities.Client.get(document.lead_id);
        
        // Format client as lead for compatibility
        const lead = client ? {
            id: client.id,
            first_name: client.full_name?.split(' ')[0] || client.full_name || '',
            last_name: client.full_name?.split(' ').slice(1).join(' ') || '',
            email: client.email,
            phone: client.phone,
            full_name: client.full_name
        } : null;
        
        if (!template || !lead) {
            return new Response(JSON.stringify({ success: false, error: 'תבנית או לקוח לא נמצאו' }), { status: 404 });
        }
        
        log('📄 Template loaded, PDF URL:', template.original_pdf_url);
        
        if (!template.original_pdf_url) {
             throw new Error("Template is missing the original_pdf_url.");
        }
        
        // Load original PDF
        log('⬇️ Fetching original PDF from:', template.original_pdf_url);
        const pdfResponse = await fetch(template.original_pdf_url);
        log('📡 PDF fetch response status:', pdfResponse.status, pdfResponse.statusText);
        
        if (!pdfResponse.ok) {
            log('❌ Failed to fetch PDF - status:', pdfResponse.status);
            log('❌ Response headers:', Object.fromEntries(pdfResponse.headers.entries()));
            throw new Error(`Failed to fetch original PDF: ${pdfResponse.statusText}`);
        }
        
        const pdfBytes = await pdfResponse.arrayBuffer();
        log('✅ PDF fetched successfully, size:', pdfBytes.byteLength, 'bytes');

        log('📖 Loading PDF document...');
        const pdfDoc = await PDFDocument.load(pdfBytes);
        pdfDoc.registerFontkit(fontkit);
        log('✅ PDF loaded, pages:', pdfDoc.getPageCount());
        
        // Get Hebrew font
        log('🔤 Loading Hebrew font...');
        const hebrewFont = await getSignatureHebrewFont(pdfDoc);
        log('✅ Font loaded');

        // Fill fields
        log('✍️ Filling', template.fields?.length || 0, 'fields...');
        await fillSignatureFields(pdfDoc, template, field_values, hebrewFont);
        log('✅ Fields filled');
        
        // Add certificate page
        log('📜 Adding certificate page...');
        const documentWithSigningInfo = {
            ...document,
            field_values,
            signing_ip: req.headers.get('CF-Connecting-IP') || req.headers.get('x-forwarded-for') || 'unknown',
            signed_at: signingTimestamp
        };
        await addSignatureCertificatePage(pdfDoc, documentWithSigningInfo, lead, hebrewFont);
        log('✅ Certificate added, total pages now:', pdfDoc.getPageCount());

        log('💾 Saving PDF document...');
        const signedPdfBytes = await pdfDoc.save();
        log('✅ PDF saved successfully, final size:', signedPdfBytes.byteLength, 'bytes');
        
        const fileName = `signed_${document.id}_${Date.now()}.pdf`;
        const pdfBlob = new Blob([signedPdfBytes], { type: 'application/pdf' });
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        log('📤 Uploading signed PDF...');
        log('📂 File name:', fileName);
        log('📊 File size:', pdfFile.size, 'bytes');
        
        const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfFile });
        log('📥 Upload result:', JSON.stringify(uploadResult));
        
        const publicUrl = uploadResult?.file_url;
        
        if (!publicUrl) {
            log('❌ Upload failed - no URL in response');
            log('❌ Full upload result:', JSON.stringify(uploadResult));
            throw new Error(`File upload failed - no URL returned`);
        }
        
        log('✅ PDF uploaded successfully!');
        log('🔗 Public URL:', publicUrl);

        log('💾 Updating document in database...');
        log('📝 Document ID:', document.id);
        log('🔗 Saving PDF URL:', publicUrl);
        
        await base44.asServiceRole.entities.SignedDocument.update(document.id, {
            status: 'signed',
            signed_at: signingTimestamp,
            field_values: field_values,
            signed_pdf_url: publicUrl,
            signing_ip: documentWithSigningInfo.signing_ip,
            signing_user_agent: req.headers.get('User-Agent') || 'unknown',
            processing_error_details: null
        });
        
        log('✅ Document updated in database');
        log('✅ Status changed to: signed');
        log('✅ PDF URL saved:', publicUrl);

        // Send email to client
        if (lead.email) {
            try {
                log('📧 Sending email to:', lead.email);
                
                const emailHtml = `
                    <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; padding: 20px; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 המסמך נחתם בהצלחה!</h1>
                        </div>
                        
                        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                            <p style="font-size: 18px; line-height: 1.6; color: #374151;">שלום ${leadFullName},</p>
                            <p style="font-size: 16px; line-height: 1.6; color: #6b7280;">
                                המסמך שחתמת עליו מוכן להורדה ושמור בצורה מאובטחת.
                            </p>
                            
                            <div style="margin: 40px 0; text-align: center;">
                                <a href="${publicUrl}" 
                                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); 
                                          color: white; padding: 18px 45px; text-decoration: none; 
                                          border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                    📥 הורד את המסמך החתום
                                </a>
                            </div>
                            
                            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #86efac;">
                                <p style="font-size: 14px; color: #166534; margin: 0; text-align: center;">
                                    🔒 המסמך החתום מאובטח ומוצפן בטכנולוגיה מתקדמת
                                </p>
                            </div>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                                    אם יש לך שאלות, אנא פנה אלינו | תודה שבחרת בנו
                                </p>
                            </div>
                        </div>
                    </div>
                `;
                
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: lead.email,
                    subject: `✅ המסמך החתום שלך מוכן להורדה - ${template.name}`,
                    body: emailHtml
                });
                log('✅ Email sent successfully');
            } catch (emailError) {
                log('⚠️ Failed to send email:', emailError.message);
            }
        }

        // Verify the update worked
        log('🔍 Verifying document was saved correctly...');
        const updatedDoc = await base44.asServiceRole.entities.SignedDocument.get(document.id);
        log('✅ Verification complete:');
        log('   - Status:', updatedDoc.status);
        log('   - PDF URL:', updatedDoc.signed_pdf_url);
        log('   - Match:', updatedDoc.signed_pdf_url === publicUrl ? '✅' : '❌');
        
        return new Response(JSON.stringify({ 
            success: true, 
            message: 'המסמך נחתם בהצלחה',
            document_id: document.id,
            download_url: publicUrl,
            signed_pdf_url: publicUrl
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        const errorMessage = `שגיאה פנימית בשרת: ${error.message}`;
        log('');
        log('❌❌❌ FUNCTION FAILED ❌❌❌');
        log('Error:', error.message);
        log('Stack:', error.stack);
        log('❌❌❌❌❌❌❌❌❌❌❌❌❌❌');
        log('');
        
        if (documentId) {
            await base44.asServiceRole.entities.SignedDocument.update(documentId, {
                status: 'processing_error',
                processing_error_details: error.message,
                signed_at: signingTimestamp,
            }).catch(e => console.error("Failed to update document status to error:", e));
        }
        
        return new Response(JSON.stringify({ success: false, error: errorMessage, hint: error.message }), { status: 500 });
    }
});