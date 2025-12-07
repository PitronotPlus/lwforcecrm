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

        const { action, campaign_code, target } = await req.json();

        if (!action || !campaign_code) {
            return Response.json({ 
                success: false, 
                error: 'חסרים שדות חובה: action ו-campaign_code' 
            }, { status: 400 });
        }

        let endpoint = '';
        let requestBody = {};

        switch (action) {
            case 'start':
                endpoint = 'StartCampaign';
                requestBody = { Campaign: campaign_code };
                break;
            case 'stop':
                endpoint = 'StopCampaign';
                requestBody = { Campaign: campaign_code };
                break;
            case 'clear':
                endpoint = 'ClearCampaignCalls';
                requestBody = { Campaign: campaign_code };
                break;
            case 'remove_call':
                if (!target) {
                    return Response.json({ 
                        success: false, 
                        error: 'target נדרש להסרת שיחה' 
                    }, { status: 400 });
                }
                endpoint = 'RemoveCall';
                requestBody = { Campaign: campaign_code, Target: target };
                break;
            case 'get_pending':
                endpoint = 'GetCampaignPendingCalls';
                requestBody = { Campaign: campaign_code };
                break;
            case 'get_details':
                endpoint = 'GetCampaignDetails';
                requestBody = { Campaign: campaign_code };
                break;
            default:
                return Response.json({ 
                    success: false, 
                    error: `פעולה לא נתמכת: ${action}` 
                }, { status: 400 });
        }

        const response = await fetch(`${VOICECENTER_API_URL}/${endpoint}`, {
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
                data: result.Data,
                message: result.Description
            });
        } else {
            return Response.json({
                success: false,
                error: result.Description || 'שגיאה בביצוע הפעולה'
            });
        }

    } catch (error) {
        console.error('Error managing campaign:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});