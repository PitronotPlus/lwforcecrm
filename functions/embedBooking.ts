Deno.serve((req) => {
    const embedScript = `
(function() {
    'use strict';
    
    const container = document.getElementById('lawforce-booking');
    if (!container) {
        console.error('LawForce: Container not found');
        return;
    }
    
    const lawyerId = container.getAttribute('data-lawyer-id');
    if (!lawyerId) {
        console.error('LawForce: Lawyer ID is required');
        return;
    }
    
    const API_URL = '${new URL(req.url).origin}';
    
    let lawyer = null;
    let selectedDate = null;
    let selectedTime = null;
    let availableSlots = [];
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let formData = { full_name: '', phone: '', email: '', service_type: '', notes: '' };
    
    const styles = \`<style>
.lf-container { max-width: 900px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl; }
.lf-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 40px 20px; text-align: center; color: white; margin-bottom: 30px; box-shadow: 0 10px 25px rgba(102,126,234,0.3); }
.lf-header h1 { margin: 0 0 10px 0; font-size: 32px; font-weight: 700; }
.lf-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.lf-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #667eea; }
.lf-label { display: block; font-weight: 500; margin-bottom: 8px; color: #555; }
.lf-input, .lf-textarea { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
.lf-input:focus, .lf-textarea:focus { outline: none; border-color: #667eea; }
.lf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
.lf-cal { background: #f8f9fa; border-radius: 12px; padding: 20px; }
.lf-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.lf-cal-nav { background: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
.lf-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.lf-day { padding: 10px; border-radius: 8px; cursor: pointer; background: white; border: 2px solid transparent; text-align: center; }
.lf-day:hover:not(.disabled) { background: #667eea; color: white; }
.lf-day.selected { background: #667eea; color: white; }
.lf-day.disabled { opacity: 0.3; cursor: not-allowed; }
.lf-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
.lf-slot { padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; text-align: center; }
.lf-slot:hover { background: #667eea; color: white; }
.lf-slot.selected { background: #667eea; color: white; }
.lf-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 20px; }
.lf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.lf-success { text-align: center; padding: 60px 20px; }
.lf-success-icon { width: 80px; height: 80px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; color: white; }
.lf-spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 40px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@media (max-width: 768px) {
    .lf-container { padding: 10px; }
    .lf-header { padding: 30px 15px; }
    .lf-header h1 { font-size: 24px; }
    .lf-card { padding: 20px; }
    .lf-grid { grid-template-columns: 1fr; }
}
</style>\`;
    
    async function api(action, data = {}) {
        const res = await fetch(\`\${API_URL}/functions/publicBooking\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        return result;
    }
    
    function fmt(date) {
        return \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, '0')}-\${String(date.getDate()).padStart(2, '0')}\`;
    }
    
    function fmtHe(date) {
        return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    
    function genCal() {
        const first = new Date(currentYear, currentMonth, 1);
        const last = new Date(currentYear, currentMonth + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let html = '<div class="lf-cal-grid">';
        ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].forEach(d => html += \`<div style="font-weight:600;padding:5px">\${d}</div>\`);
        
        for (let i = 0; i < first.getDay(); i++) html += '<div></div>';
        
        for (let day = 1; day <= last.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isPast = date < today;
            const isFuture = date > new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
            const isSel = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            html += \`<div class="lf-day \${isPast || isFuture ? 'disabled' : ''} \${isSel ? 'selected' : ''}" data-date="\${date.toISOString()}">\${day}</div>\`;
        }
        
        html += '</div>';
        return html;
    }
    
    function render(state) {
        let html = styles;
        
        if (state === 'loading') {
            html += '<div class="lf-container"><div class="lf-spinner"></div></div>';
        } else if (state === 'success') {
            html += \`<div class="lf-container"><div class="lf-card lf-success">
                <div class="lf-success-icon">✓</div>
                <h2 style="color:#10b981">הפגישה נקבעה בהצלחה!</h2>
                <p>קיבלת אישור למייל. נתראה ב-\${fmtHe(selectedDate)} בשעה \${selectedTime}</p>
            </div></div>\`;
        } else {
            const monthName = new Date(currentYear, currentMonth).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
            
            html += \`<div class="lf-container">
                <div class="lf-header">
                    <h1>קביעת פגישה</h1>
                    <p>עם \${lawyer.full_name}</p>
                </div>
                <div class="lf-card">
                    <div class="lf-title">הפרטים שלך</div>
                    <div class="lf-grid">
                        <div><label class="lf-label">שם מלא *</label><input class="lf-input" id="lf-name" required /></div>
                        <div><label class="lf-label">טלפון *</label><input class="lf-input" id="lf-phone" required /></div>
                        <div><label class="lf-label">אימייל *</label><input class="lf-input" type="email" id="lf-email" required /></div>
                        <div><label class="lf-label">נושא</label><input class="lf-input" id="lf-service" /></div>
                    </div>
                    <div><label class="lf-label">הערות</label><textarea class="lf-textarea" id="lf-notes" rows="3"></textarea></div>
                </div>
                <div class="lf-card">
                    <div class="lf-title">בחר תאריך ושעה</div>
                    <div class="lf-grid">
                        <div class="lf-cal">
                            <div class="lf-cal-header">
                                <button class="lf-cal-nav" id="lf-prev">◄</button>
                                <div>\${monthName}</div>
                                <button class="lf-cal-nav" id="lf-next">►</button>
                            </div>
                            \${genCal()}
                        </div>
                        <div>
                            \${selectedDate ? \`
                                <div class="lf-title" style="font-size:16px">שעות פנויות ל-\${fmtHe(selectedDate)}</div>
                                <div class="lf-slots">
                                    \${availableSlots.length > 0 
                                        ? availableSlots.map(s => \`<div class="lf-slot \${selectedTime === s ? 'selected' : ''}" data-time="\${s}">\${s}</div>\`).join('')
                                        : '<p style="text-align:center;color:#999">אין שעות פנויות</p>'
                                    }
                                </div>
                            \` : '<p style="text-align:center;color:#999;padding:40px">בחר תאריך</p>'}
                        </div>
                    </div>
                    <button class="lf-btn" id="lf-submit" \${!selectedDate || !selectedTime ? 'disabled' : ''}>אשר פגישה</button>
                </div>
            </div>\`;
        }
        
        container.innerHTML = html;
        if (state === 'form') attach();
    }
    
    async function loadSlots(date) {
        try {
            const res = await api('getAvailableSlots', { date: fmt(date), appointmentData: { lawyerEmail: lawyer.email } });
            availableSlots = res.slots || [];
            render('form');
        } catch (e) {
            console.error(e);
        }
    }
    
    async function submit() {
        if (!formData.full_name || !formData.phone || !formData.email) {
            alert('יש למלא את כל השדות החובה');
            return;
        }
        render('loading');
        try {
            await api('createAppointment', {
                appointmentData: { ...formData, date: fmt(selectedDate), time: selectedTime, lawyerName: lawyer.full_name, lawyerEmail: lawyer.email }
            });
            render('success');
        } catch (e) {
            alert('שגיאה בקביעת הפגישה');
            render('form');
        }
    }
    
    function attach() {
        document.getElementById('lf-name')?.addEventListener('input', e => formData.full_name = e.target.value);
        document.getElementById('lf-phone')?.addEventListener('input', e => formData.phone = e.target.value);
        document.getElementById('lf-email')?.addEventListener('input', e => formData.email = e.target.value);
        document.getElementById('lf-service')?.addEventListener('input', e => formData.service_type = e.target.value);
        document.getElementById('lf-notes')?.addEventListener('input', e => formData.notes = e.target.value);
        
        document.querySelectorAll('.lf-day:not(.disabled)').forEach(d => {
            d.addEventListener('click', () => {
                selectedDate = new Date(d.getAttribute('data-date'));
                selectedTime = null;
                loadSlots(selectedDate);
            });
        });
        
        document.querySelectorAll('.lf-slot').forEach(s => {
            s.addEventListener('click', () => {
                selectedTime = s.getAttribute('data-time');
                render('form');
            });
        });
        
        document.getElementById('lf-prev')?.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            render('form');
        });
        
        document.getElementById('lf-next')?.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            render('form');
        });
        
        document.getElementById('lf-submit')?.addEventListener('click', submit);
    }
    
    async function init() {
        render('loading');
        try {
            const res = await api('getLawyer', { lawyerId });
            lawyer = res.lawyer;
            render('form');
        } catch (e) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444">שגיאה בטעינת הנתונים</div>';
        }
    }
    
    init();
})();
`;

    return new Response(embedScript, {
        headers: {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600'
        }
    });
});