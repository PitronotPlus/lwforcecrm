import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }

        // Get all SystemObject entities to build dynamic page list
        const systemObjects = await base44.entities.SystemObject.list('order_in_menu');
        
        const pages = systemObjects
            .filter(obj => obj.page_route && obj.is_active !== false)
            .map(obj => ({
                name: obj.display_name_singular,
                path: `/${obj.page_route}`
            }));

        // Add built-in system pages that are always available
        const builtInPages = [
            { name: 'דשבורד', path: '/Dashboard' },
            { name: 'הגדרות', path: '/Settings' },
            { name: 'ניהול צוות', path: '/TeamManagement' },
            { name: 'ניהול מערכת', path: '/AdminDashboard' },
            { name: 'תמיכה', path: '/Support' },
            { name: 'קרדיטים', path: '/Credits' },
            { name: 'שיווק', path: '/Marketing' },
            { name: 'כספים', path: '/Finances' },
            { name: 'חתימה דיגיטלית', path: '/DigitalSignatures' }
        ];

        // Combine and remove duplicates based on path
        const allPages = [...builtInPages, ...pages];
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