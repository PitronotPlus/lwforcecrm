import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const VOICECENTER_API_URL = 'https://api.voicecenter.com/ForwardDialer/Dialer';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiCode = Deno.env.get('VOICECENTER_API_CODE');
        if (!apiCode) {
            return Response.json({ 
                success: false, 
                error: 'VOICECENTER_API_CODE לא מוגדר ב-Environment Variables' 
            }, { status: 500 });
        }

        const response = await fetch(`${VOICECENTER_API_URL}/GetCampaignList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Code: apiCode
            })
        });

        const result = await response.json();

        if (result.ErrorCode === 0) {
            return Response.json({
                success: true,
                campaigns: result.Data || []
            });
        } else {
            return Response.json({
                success: false,
                error: result.Description || 'שגיאה בקבלת רשימת קמפיינים'
            });
        }

    } catch (error) {
        console.error('Error getting Voicecenter campaigns:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});