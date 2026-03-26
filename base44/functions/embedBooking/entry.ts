import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const embedScript = `
(function() {
    const container = document.getElementById('lawforce-booking');
    if (!container) return;
    
    const lawyerId = container.getAttribute('data-lawyer-id');
    if (!lawyerId) return;
    
    const API_URL = '${new URL(req.url).origin}/functions/publicBooking';
    
    let lawyer = null;
    let selectedDate = null;
    let selectedTime = null;
    let availableSlots = [];
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    
    // Styles
    const style = document.createElement('style');
    style.textContent = \`
        .lf-widget { font-family: -apple-system, sans-serif; direction: rtl; max-width: 100%; }
        .lf-box { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .lf-cal { background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
        .lf-cal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 600; font-size: 14px; }
        .lf-cal-btn { background: white; border: 1px solid #d1d5db; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
        .lf-week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 4px; }
        .lf-day-label { text-align: center; font-size: 11px; color: #6b7280; padding: 4px; }
        .lf-day { text-align: center; padding: 8px 4px; font-size: 13px; cursor: pointer; border-radius: 6px; background: white; }
        .lf-day:hover:not(.disabled) { background: #e0e7ff; }
        .lf-day.selected { background: #667eea; color: white; font-weight: 600; }
        .lf-day.disabled { color: #d1d5db; cursor: not-allowed; }
        .lf-slots { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; max-height: 200px; overflow-y: auto; }
        .lf-slot { padding: 8px 14px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 13px; background: white; }
        .lf-slot:hover { background: #f3f4f6; }
        .lf-slot.selected { background: #667eea; color: white; border-color: #667eea; font-weight: 600; }
        .lf-input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; margin-bottom: 12px; box-sizing: border-box; }
        .lf-input:focus { outline: none; border-color: #667eea; }
        .lf-btn { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 15px; }
        .lf-btn:hover:not(:disabled) { background: #5568d3; }
        .lf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lf-success { text-align: center; padding: 24px; }
        .lf-check { width: 48px; height: 48px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: white; font-size: 24px; }
        .lf-loading { text-align: center; padding: 32px; color: #6b7280; }
        .lf-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; display: block; }
        @media (max-width: 640px) { .lf-slots { justify-content: center; } }
    \`;
    document.head.appendChild(style);
    
    // API calls
    async function api(data) {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    }
    
    async function init() {
        render('loading');
        const data = await api({ action: 'getLawyer', lawyerId });
        if (data.lawyer) {
            lawyer = data.lawyer;
            render('form');
        }
    }
    
    async function loadSlots(date) {
        const data = await api({
            action: 'getAvailableSlots',
            date: date.toISOString().split('T')[0],
            appointmentData: { lawyerEmail: lawyer.email }
        });
        availableSlots = data.slots || [];
        render('form');
    }
    
    async function submit() {
        const name = document.getElementById('lf-name').value.trim();
        const phone = document.getElementById('lf-phone').value.trim();
        const email = document.getElementById('lf-email').value.trim();
        
        if (!name || !phone || !email || !selectedDate || !selectedTime) {
            alert('נא למלא את כל השדות הנדרשים');
            return;
        }
        
        render('loading');
        await api({
            action: 'createAppointment',
            appointmentData: {
                full_name: name,
                phone: phone,
                email: email,
                service_type: document.getElementById('lf-service')?.value || '',
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
                lawyerName: lawyer.full_name,
                lawyerEmail: lawyer.email
            }
        });
        render('success');
    }
    
    function genCal() {
        const first = new Date(currentYear, currentMonth, 1);
        const last = new Date(currentYear, currentMonth + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let html = '<div class="lf-week">';
        ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].forEach(d => html += \`<div class="lf-day-label">\${d}</div>\`);
        html += '</div><div class="lf-week">';
        
        for (let i = 0; i < first.getDay(); i++) html += '<div></div>';
        
        let count = 0;
        for (let day = 1; day <= last.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isPast = date < today;
            const isFuture = date > new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
            const isSel = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            if (count > 0 && (first.getDay() + day - 1) % 7 === 0) html += '</div><div class="lf-week">';
            
            html += \`<div class="lf-day \${isPast || isFuture ? 'disabled' : ''} \${isSel ? 'selected' : ''}" data-date="\${date.toISOString()}">\${day}</div>\`;
            count++;
        }
        
        html += '</div>';
        return html;
    }
    
    function render(state) {
        if (state === 'loading') {
            container.innerHTML = '<div class="lf-widget"><div class="lf-loading">טוען...</div></div>';
        } else if (state === 'success') {
            container.innerHTML = \`<div class="lf-widget"><div class="lf-box lf-success">
                <div class="lf-check">✓</div>
                <div style="font-weight:600;margin-bottom:8px">הפגישה נקבעה בהצלחה!</div>
                <div style="font-size:14px;color:#6b7280">אישור נשלח למייל</div>
            </div></div>\`;
        } else {
            const mon = new Date(currentYear, currentMonth).toLocaleDateString('he-IL', { month: 'long' });
            
            container.innerHTML = \`<div class="lf-widget">
                <div class="lf-box">
                    <div class="lf-label">בחר תאריך</div>
                    <div class="lf-cal">
                        <div class="lf-cal-head">
                            <button class="lf-cal-btn" id="lf-prev">‹</button>
                            <span>\${mon} \${currentYear}</span>
                            <button class="lf-cal-btn" id="lf-next">›</button>
                        </div>
                        \${genCal()}
                    </div>
                    
                    \${selectedDate ? \`
                        <div class="lf-label">בחר שעה</div>
                        <div class="lf-slots">
                            \${availableSlots.length > 0 
                                ? availableSlots.map(s => \`<div class="lf-slot \${selectedTime === s ? 'selected' : ''}" data-time="\${s}">\${s}</div>\`).join('')
                                : '<div style="font-size:13px;color:#9ca3af;text-align:center;width:100%">אין שעות פנויות</div>'
                            }
                        </div>
                    \` : ''}
                    
                    <div class="lf-label">פרטים</div>
                    <input class="lf-input" id="lf-name" placeholder="שם מלא *" />
                    <input class="lf-input" id="lf-phone" placeholder="טלפון *" />
                    <input class="lf-input" type="email" id="lf-email" placeholder="אימייל *" />
                    <input class="lf-input" id="lf-service" placeholder="נושא (אופציונלי)" />
                    
                    <button class="lf-btn" id="lf-submit" \${!selectedDate || !selectedTime ? 'disabled' : ''}>
                        קבע פגישה עם \${lawyer.full_name}
                    </button>
                </div>
            </div>\`;
            
            attach();
        }
    }
    
    function attach() {
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
    
    init();
})();
`;

        return new Response(embedScript, {
            headers: {
                'Content-Type': 'application/javascript',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response('console.error("LawForce embed error:", ' + JSON.stringify(error.message) + ');', {
            status: 500,
            headers: { 'Content-Type': 'application/javascript' }
        });
    }
});