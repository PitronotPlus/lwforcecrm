import { ClientActivityLog } from "@/entities/ClientActivityLog";

/**
 * פונקציה לתיעוד פעילות בלוג הלקוח
 * @param {string} clientId - מזהה הלקוח
 * @param {string} activityType - סוג הפעילות
 * @param {string} description - תיאור הפעילות
 * @param {string} performedBy - מי ביצע את הפעילות
 * @param {object} options - אפשרויות נוספות (field_changed, old_value, new_value, metadata)
 */
export async function logClientActivity(clientId, activityType, description, performedBy, options = {}) {
    try {
        await ClientActivityLog.create({
            client_id: clientId,
            activity_type: activityType,
            description: description,
            performed_by: performedBy,
            field_changed: options.field_changed || null,
            old_value: options.old_value || null,
            new_value: options.new_value || null,
            metadata: options.metadata || null
        });
    } catch (error) {
        console.error("שגיאה בתיעוד פעילות:", error);
    }
}

/**
 * השוואת שדות ותיעוד שינויים
 */
export async function logClientChanges(clientId, oldData, newData, performedBy) {
    const fieldsToTrack = {
        full_name: 'שם מלא',
        phone: 'טלפון',
        email: 'אימייל',
        status: 'סטטוס',
        service_type: 'סוג שירות',
        source: 'מקור הגעה',
        initial_need: 'צורך ראשוני',
        notes: 'הערות'
    };

    for (const [field, hebrewName] of Object.entries(fieldsToTrack)) {
        if (oldData[field] !== newData[field]) {
            await logClientActivity(
                clientId,
                field === 'status' ? 'שינוי סטטוס' : 'עודכן',
                `שדה "${hebrewName}" עודכן`,
                performedBy,
                {
                    field_changed: hebrewName,
                    old_value: oldData[field] || 'ריק',
                    new_value: newData[field] || 'ריק'
                }
            );
        }
    }
}