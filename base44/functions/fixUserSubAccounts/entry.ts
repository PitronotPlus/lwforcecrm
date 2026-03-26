import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // רק אדמין יכול להריץ את זה
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // קבל את כל המשתמשים
        const users = await base44.asServiceRole.entities.User.list();
        
        // קבל את כל ה-SubAccounts
        const subAccounts = await base44.asServiceRole.entities.SubAccount.list();
        
        const updates = [];
        
        for (const u of users) {
            // אם למשתמש אין sub_account_id והוא דמות ניהולית
            if (!u.sub_account_id && (u.user_role === 'owner' || u.user_role === 'department_head' || u.role === 'admin')) {
                // נסה למצוא SubAccount לפי email
                const matchingSubAccount = subAccounts.find(sa => sa.owner_email === u.email);
                
                if (matchingSubAccount) {
                    // עדכן את המשתמש עם ה-SubAccount שלו
                    await base44.asServiceRole.entities.User.update(u.id, {
                        sub_account_id: matchingSubAccount.id
                    });
                    updates.push({
                        user: u.full_name || u.email,
                        email: u.email,
                        role: u.user_role || u.role,
                        assigned_sub_account: matchingSubAccount.name,
                        sub_account_id: matchingSubAccount.id
                    });
                } else {
                    // אם אין SubAccount תואם, צור אחד חדש
                    const newSubAccount = await base44.asServiceRole.entities.SubAccount.create({
                        name: u.full_name || u.email,
                        owner_email: u.email,
                        status: 'active',
                        subscription_type: 'trial',
                        max_users: 5
                    });
                    
                    // עדכן את המשתמש
                    await base44.asServiceRole.entities.User.update(u.id, {
                        sub_account_id: newSubAccount.id
                    });
                    
                    updates.push({
                        user: u.full_name || u.email,
                        email: u.email,
                        role: u.user_role || u.role,
                        assigned_sub_account: newSubAccount.name + ' (NEW)',
                        sub_account_id: newSubAccount.id
                    });
                }
            }
        }

        return Response.json({
            success: true,
            message: `תוקנו ${updates.length} משתמשים`,
            updates
        });

    } catch (error) {
        console.error('שגיאה בתיקון משתמשים:', error);
        return Response.json({ 
            error: error.message,
            details: error.toString()
        }, { status: 500 });
    }
});