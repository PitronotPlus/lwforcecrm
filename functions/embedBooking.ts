Deno.serve((req) => {
    const embedScript = `
(function() {
    'use strict';
    
    const container = document.getElementById('lawforce-booking');
    if (!container) return;
    
    const lawyerId = container.getAttribute('data-lawyer-id');
    if (!lawyerId) return;
    
    const API_URL = '${new URL(req.url).origin}';
    
    let lawyer = null;
    let selectedDate = null;
    let selectedTime = null;
    let availableSlots = [];
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let formData = { full_name: '', phone: '', email: '', service_type: '', notes: '' };
    
    const styles = document.createElement('style');
    styles.textContent = \`
.lf-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl; max-width: 100%; }
.lf-box { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.lf-form-row { margin-bottom: 16px; }
.lf-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
.lf-input:focus { outline: none; border-color: #667eea; }
.lf-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.lf-cal-mini { background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.lf-cal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; font-weight: 600; }
.lf-cal-btn { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.lf-cal-btn:hover { background: #e5e7eb; }
.lf-week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 4px; }
.lf-weekday { text-align: center; font-size: 11px; color: #6b7280; padding: 4px 0; }
.lf-date { text-align: center; padding: 8px 4px; font-size: 13px; cursor: pointer; border-radius: 6px; }
.lf-date:hover:not(.off) { background: #e0e7ff; }
.lf-date.sel { background: #667eea; color: white; font-weight: 600; }
.lf-date.off { color: #d1d5db; cursor: not-allowed; }
.lf-times { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.lf-time { padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 13px; background: white; }
.lf-time:hover { background: #f3f4f6; }
.lf-time.sel { background: #667eea; color: white; border-color: #667eea; }
.lf-submit { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.lf-submit:hover:not(:disabled) { background: #5568d3; }
.lf-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.lf-msg { text-align: center; padding: 32px; }
.lf-check { width: 48px; height: 48px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: white; font-size: 24px; }
.lf-load { border: 3px solid #f3f4f6; border-top: 3px solid #667eea; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin: 32px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@media (max-width: 640px) {
    .lf-two-col { grid-template-columns: 1fr; }
    .lf-times { justify-content: center; }
}
\`;
    document.head.appendChild(styles);
    
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
        
        let html = '<div class="lf-week">';
        ['ש', 'ו', 'ה', 'ד', 'ג', 'ב', 'א'].forEach(d => html += \`<div class="lf-weekday">\${d}</div>\`);
        html += '</div><div class="lf-week">';
        
        for (let i = 0; i < first.getDay(); i++) html += '<div></div>';
        
        let dayCount = 0;
        for (let day = 1; day <= last.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isPast = date < today;
            const isFuture = date > new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
            const isSel = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            if (dayCount > 0 && (first.getDay() + day - 1) % 7 === 0) html += '</div><div class="lf-week">';
            
            html += \`<div class="lf-date \${isPast || isFuture ? 'off' : ''} \${isSel ? 'sel' : ''}" data-date="\${date.toISOString()}">\${day}</div>\`;
            dayCount++;
        }
        
        html += '</div>';
        return html;
    }
    
    function render(state) {
        if (state === 'loading') {
            container.innerHTML = '<div class="lf-widget"><div class="lf-load"></div></div>';
        } else if (state === 'success') {
            container.innerHTML = \`<div class="lf-widget"><div class="lf-box lf-msg">
                <div class="lf-check">✓</div>
                <div style="font-weight:600;margin-bottom:8px">הפגישה נקבעה!</div>
                <div style="font-size:14px;color:#6b7280">קיבלת אישור למייל</div>
            </div></div>\`;
        } else {
            const mon = new Date(currentYear, currentMonth).toLocaleDateString('he-IL', { month: 'long' });
            
            container.innerHTML = \`<div class="lf-widget">
                <div class="lf-box">
                    <div class="lf-cal-mini">
                        <div class="lf-cal-head">
                            <button class="lf-cal-btn" id="lf-prev">‹</button>
                            <span>\${mon} \${currentYear}</span>
                            <button class="lf-cal-btn" id="lf-next">›</button>
                        </div>
                        \${genCal()}
                    </div>
                    
                    \${selectedDate ? \`
                        <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#374151">שעות פנויות:</div>
                        <div class="lf-times">
                            \${availableSlots.length > 0 
                                ? availableSlots.map(s => \`<div class="lf-time \${selectedTime === s ? 'sel' : ''}" data-time="\${s}">\${s}</div>\`).join('')
                                : '<div style="font-size:13px;color:#9ca3af">אין שעות פנויות</div>'
                            }
                        </div>
                    \` : '<div style="font-size:13px;color:#9ca3af;text-align:center;padding:16px 0">בחר תאריך</div>'}
                    
                    <div class="lf-form-row">
                        <input class="lf-input" id="lf-name" placeholder="שם מלא *" value="\${formData.full_name}" />
                    </div>
                    <div class="lf-two-col">
                        <input class="lf-input" id="lf-phone" placeholder="טלפון *" value="\${formData.phone}" />
                        <input class="lf-input" type="email" id="lf-email" placeholder="אימייל *" value="\${formData.email}" />
                    </div>
                    <div class="lf-form-row">
                        <input class="lf-input" id="lf-service" placeholder="נושא הפגישה" value="\${formData.service_type}" />
                    </div>
                    
                    <button class="lf-submit" id="lf-submit" \${!selectedDate || !selectedTime ? 'disabled' : ''}>
                        קבע פגישה
                    </button>
                </div>
            </div>\`;
            attach();
        }
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
        
        document.querySelectorAll('.lf-date:not(.off)').forEach(d => {
            d.addEventListener('click', () => {
                selectedDate = new Date(d.getAttribute('data-date'));
                selectedTime = null;
                loadSlots(selectedDate);
            });
        });
        
        document.querySelectorAll('.lf-time').forEach(t => {
            t.addEventListener('click', () => {
                selectedTime = t.getAttribute('data-time');
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