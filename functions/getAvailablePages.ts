import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        // Get all SystemObject entities to build dynamic page list
        let dynamicPages = [];
        try {
            const systemObjects = await base44.asServiceRole.entities.SystemObject.list('order_in_menu');
            dynamicPages = systemObjects
                .filter(obj => obj.page_route && obj.is_active !== false)
                .map(obj => ({
                    name: obj.display_name_singular,
                    path: `/${obj.page_route}`
                }));
        } catch (error) {
            console.log('Could not load SystemObject:', error.message);
        }

        // Complete list of all pages in the application
        const allKnownPages = [
            { name: 'דשבורד', path: '/Dashboard' },
            { name: 'לקוחות', path: '/Clients' },
            { name: 'תיקים', path: '/Cases' },
            { name: 'משימות', path: '/Tasks' },
            { name: 'פגישות', path: '/Appointments' },
            { name: 'מוצרים', path: '/Products' },
            { name: 'שירותים', path: '/Services' },
            { name: 'שיווק', path: '/Marketing' },
            { name: 'כספים', path: '/Finances' },
            { name: 'קרדיטים', path: '/Credits' },
            { name: 'תמיכה', path: '/Support' },
            { name: 'הגדרות', path: '/Settings' },
            { name: 'ניהול צוות', path: '/TeamManagement' },
            { name: 'ניהול מערכת', path: '/AdminDashboard' },
            { name: 'חתימה דיגיטלית', path: '/DigitalSignatures' },
            { name: 'קביעת פגישה', path: '/Booking' },
            { name: 'פרטי לקוח', path: '/ClientDetails' },
            { name: 'תמחור', path: '/PricingPage' }
        ];

        // Combine known pages with dynamic pages and remove duplicates
        const allPages = [...allKnownPages, ...dynamicPages];
        const uniquePages = Array.from(
            new Map(allPages.map(p => [p.path, p])).values()
        );

        // Sort alphabetically by name
        uniquePages.sort((a, b) => a.name.localeCompare(b.name, 'he'));

        return new Response(JSON.stringify({
            success: true,
            pages: uniquePages
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in getAvailablePages:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});