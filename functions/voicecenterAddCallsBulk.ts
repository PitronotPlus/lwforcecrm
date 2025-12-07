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
                error: 'VOICECENTER_API_CODE לא מוגדר' 
            }, { status: 500 });
        }

        const { campaign_code, calls, caller_id } = await req.json();

        if (!campaign_code || !calls || !Array.isArray(calls)) {
            return Response.json({ 
                success: false, 
                error: 'חסרים שדות חובה: campaign_code ו-calls (מערך)' 
            }, { status: 400 });
        }

        if (calls.length > 100000) {
            return Response.json({ 
                success: false, 
                error: 'ניתן להוסיף עד 100,000 יעדים בבקשה אחת' 
            }, { status: 400 });
        }

        const voicecenterCalls = calls.map(call => {
            const callData = {
                Campaign: campaign_code,
                Target: call.phone,
                CustomerName: call.name || '',
                Priority: call.priority || 1,
                IsDateLocal: "true"
            };

            if (caller_id) {
                callData.CallerID = caller_id;
            }

            return callData;
        });

        const response = await fetch(`${VOICECENTER_API_URL}/AddCallsBulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(voicecenterCalls)
        });

        const result = await response.json();

        if (result.ErrorCode === 0) {
            const successCount = result.AddResult?.filter(r => r.ErrorCode === 0).length || 0;
            const failCount = result.AddResult?.filter(r => r.ErrorCode !== 0).length || 0;

            return Response.json({
                success: true,
                message: `${successCount} שיחות נוספו${failCount > 0 ? `, ${failCount} נכשלו` : ''}`,
                results: result.AddResult
            });
        } else {
            return Response.json({
                success: false,
                error: result.Description || 'שגיאה בהוספת שיחות'
            });
        }

    } catch (error) {
        console.error('Error adding bulk calls:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});