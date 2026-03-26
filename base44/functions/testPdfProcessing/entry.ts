import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const steps = [];
    
    try {
        steps.push('✅ שלב 1: יצירת מסמך PDF ריק');
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);
        
        steps.push('✅ שלב 2: הוספת עמוד');
        const page = pdfDoc.addPage([595, 842]); // A4
        
        steps.push('✅ שלב 3: טעינת גופן עברי');
        const hebrewFontUrl = 'https://github.com/google/fonts/raw/main/ofl/davidlibre/DavidLibre-Regular.ttf';
        const fontRes = await fetch(hebrewFontUrl);
        
        if (!fontRes.ok) {
            throw new Error(`Failed to fetch Hebrew font: ${fontRes.statusText}`);
        }
        
        const fontBytes = await fontRes.arrayBuffer();
        const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: true });
        
        steps.push('✅ שלב 4: בדיקת קידוד עברי');
        hebrewFont.encodeText('שלום עולם - בדיקת חתימה דיגיטלית');
        
        steps.push('✅ שלב 5: הוספת טקסט עברי ל-PDF');
        page.drawText('בדיקת מערכת חתימה דיגיטלית', {
            x: 50,
            y: 750,
            size: 24,
            font: hebrewFont,
            color: rgb(0.1, 0.5, 0.7)
        });
        
        page.drawText('שלב זה בודק יכולת עיבוד PDF עם גופנים עבריים', {
            x: 50,
            y: 700,
            size: 16,
            font: hebrewFont,
            color: rgb(0, 0, 0)
        });
        
        steps.push('✅ שלב 6: שמירת PDF');
        const pdfBytes = await pdfDoc.save();
        
        steps.push('✅ שלב 7: העלאת קובץ לשרת');
        const base44 = createClientFromRequest(req);
        const pdfFile = new File([pdfBytes], 'test-signature-processing.pdf', { type: 'application/pdf' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file: pdfFile });
        
        if (!uploadResult?.file_url) {
            throw new Error('Upload failed - no URL returned');
        }
        
        steps.push(`✅ שלב 8: הקובץ הועלה בהצלחה!`);
        steps.push(`📄 גודל: ${(pdfBytes.length / 1024).toFixed(2)} KB`);
        steps.push(`🔗 כתובת: ${uploadResult.file_url}`);
        
        return new Response(JSON.stringify({
            success: true,
            steps,
            publicUrl: uploadResult.file_url
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        steps.push(`❌ שגיאה: ${error.message}`);
        
        return new Response(JSON.stringify({
            success: false,
            steps,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});