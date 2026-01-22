// ===================================================================
// DIGITAL SIGNATURE PDF HELPERS - ISOLATED MODULE
// This module is EXCLUSIVELY for digital signature PDF operations
// DO NOT USE THIS FOR INVOICES OR OTHER PDF OPERATIONS
// ===================================================================

import { PDFDocument, rgb, StandardFonts, PageSizes } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';

// Hebrew font URL - ONLY FOR DIGITAL SIGNATURES
const SIGNATURE_HEBREW_FONT_URL = 'https://github.com/google/fonts/raw/main/ofl/davidlibre/DavidLibre-Regular.ttf';

/**
 * Loads Hebrew font for digital signatures from external URL
 * @param {PDFDocument} pdfDoc 
 * @returns {Promise<PDFFont>}
 */
export async function getSignatureHebrewFont(pdfDoc) {
    const fontRes = await fetch(SIGNATURE_HEBREW_FONT_URL);
    if (!fontRes.ok) throw new Error(`Failed to fetch signature font: ${fontRes.statusText}`);
    
    const fontBytes = await fontRes.arrayBuffer();
    const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: true });
    hebrewFont.encodeText('בדיקה'); // Sanity check
    
    return hebrewFont;
}

/**
 * Adds certificate page to signed document
 */
export async function addSignatureCertificatePage(pdfDoc, document, lead, hebrewFont, debugMode = false) {
    if (debugMode) console.log('🔧 DEBUG: Starting addSignatureCertificatePage...');
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    try {
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const borderColor = rgb(0.1, 0.5, 0.7);
        page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderWidth: 2, borderColor, borderOpacity: 0.5 });
        page.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderWidth: 1, borderColor, borderOpacity: 0.3 });

        page.drawText('Signature Certificate', { x: 50, y: height - 70, font: fontBold, size: 28, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`Reference Number: ${document.id}`, { x: 50, y: height - 100, font: hebrewFont, size: 10, color: rgb(0.5, 0.5, 0.5) });
        
        const createdDate = document.created_date ? new Date(document.created_date).toLocaleString('he-IL', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A';
        page.drawText(`Sent on: ${createdDate} UTC`, { x: width - 250, y: height - 100, font: hebrewFont, size: 10, color: rgb(0.5, 0.5, 0.5) });

        page.drawRectangle({ x: 50, y: height - 450, width: width - 100, height: 320, borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1 });
        
        page.drawText('נחתם על ידי', { x: width - 125, y: height - 160, font: hebrewFont, size: 14 });
        
        const leadFullName = lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
        page.drawText(leadFullName, { x: width - (70 + hebrewFont.widthOfTextAtSize(leadFullName, 16)), y: height - 190, font: hebrewFont, size: 16, color: rgb(0.1, 0.1, 0.1) });
        
        page.drawText(lead.email, { x: 70, y: height - 210, font: hebrewFont, size: 12, color: rgb(0.3, 0.3, 0.3) });

        const signedDate = document.signed_at ? new Date(document.signed_at).toLocaleString('he-IL', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A';
        const signedText = `נחתם: ${signedDate} UTC`;
        page.drawText(signedText, { x: width - (70 + hebrewFont.widthOfTextAtSize(signedText, 10)), y: height - 255, font: hebrewFont, size: 10, color: rgb(0.5, 0.5, 0.5) });

        if (document.field_values) {
            const signatureFieldValue = Object.values(document.field_values).find(v => typeof v === 'string' && v.startsWith('data:image/png;base64'));
            if (signatureFieldValue) {
                const pngImageBytes = Uint8Array.from(atob(signatureFieldValue.split(',')[1]), c => c.charCodeAt(0));
                const pngImage = await pdfDoc.embedPng(pngImageBytes);
                page.drawImage(pngImage, { x: width / 2, y: height - 230, width: 150, height: 60 });
                page.drawRectangle({ x: width / 2 - 5, y: height - 235, width: 160, height: 70, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });
            }
        }

        const ipText = `כתובת IP: ${document.signing_ip || 'לא תועדה'}`;
        page.drawText(ipText, { x: width / 2 + 100 - hebrewFont.widthOfTextAtSize(ipText, 10), y: height - 280, font: hebrewFont, size: 10, color: rgb(0.5, 0.5, 0.5) });

        const completedText1 = `המסמך הושלם על ידי כל הצדדים בתאריך`;
        const completedText2 = `${signedDate} UTC`;
        page.drawText(completedText1, { x: width - 50 - hebrewFont.widthOfTextAtSize(completedText1, 10), y: height - 480, font: hebrewFont, size: 10, color: rgb(0.5, 0.5, 0.5) });
        page.drawText(completedText2, { x: width - 50 - hebrewFont.widthOfTextAtSize(completedText2, 10), y: height - 495, font: hebrewFont, size: 10, color: rgb(0.5, 0.5, 0.5) });
        
        if (debugMode) console.log('🔧 DEBUG: Certificate page added successfully.');
        return pdfDoc;
    } catch (e) {
        if (debugMode) console.error(`🔧 DEBUG: Error in addSignatureCertificatePage: ${e.message}`, e.stack);
        throw e;
    }
}

/**
 * Fills PDF template fields with user data
 */
export async function fillSignatureFields(pdfDoc, template, field_values, hebrewFont, debugMode = false) {
    if (debugMode) console.log('🔧 DEBUG: Starting fillSignatureFields...');
    
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
                    // Draw checkmark if checked
                    if (value === true || value === 'true' || value === 'checked') {
                        const centerX = fieldRect.x + fieldRect.width / 2;
                        const centerY = fieldRect.y + fieldRect.height / 2;
                        const checkSize = Math.min(fieldRect.width, fieldRect.height) * 0.8;
                        
                        // Draw V checkmark using Standard font for better support
                        const checkFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                        page.drawText('✓', {
                            x: centerX - checkSize * 0.35,
                            y: centerY - checkSize * 0.4,
                            size: checkSize * 1.2,
                            color: rgb(0.13, 0.72, 0.51),
                            font: checkFont
                        });
                    }
                } else if (field.type === 'text' || field.type === 'date') {
                    const text = String(value);
                    
                    let fontSize;
                    if (field.fontSize && field.fontSize > 0) {
                        // Use manually set fontSize but ensure it's within reasonable bounds
                        fontSize = Math.max(8, Math.min(72, field.fontSize));
                        if (debugMode) console.log(`Field ${field.id}: Using manual fontSize=${fontSize}pt (bounded)`);
                    } else {
                        // Auto-calculate based on field height
                        fontSize = Math.max(10, Math.min(24, fieldRect.height * 0.7));
                        if (debugMode) console.log(`Field ${field.id}: Using dynamic fontSize=${fontSize}pt`);
                    }
                    
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
                 if (debugMode) console.log(`DEBUG: Failed to draw field ${field.id}: ${e.message}`);
            }
        }
    }
    
    if (debugMode) console.log('🔧 DEBUG: PDF fields filled successfully.');
    return pdfDoc;
}