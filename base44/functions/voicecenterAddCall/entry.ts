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

        const { campaign_code, target, customer_name, caller_id, priority } = await req.json();

        if (!campaign_code || !target) {
            return Response.json({ 
                success: false, 
                error: 'חסרים שדות חובה: campaign_code ו-target' 
            }, { status: 400 });
        }

        const requestBody = {
            Campaign: campaign_code,
            Target: target,
            CustomerName: customer_name,
            Priority: priority || 1,
            IsDateLocal: "true"
        };

        if (caller_id) {
            requestBody.CallerID = caller_id;
        }

        const response = await fetch(`${VOICECENTER_API_URL}/AddCall`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (result.ErrorCode === 0) {
            return Response.json({
                success: true,
                message: 'השיחה נוספה בהצלחה לקמפיין'
            });
        } else {
            return Response.json({
                success: false,
                error: result.Description || 'שגיאה בהוספת שיחה'
            });
        }

    } catch (error) {
        console.error('Error adding call to Voicecenter:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});