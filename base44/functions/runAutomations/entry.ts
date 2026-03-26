import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // שימוש ב-service role כי זה Cron Job חיצוני
    const automations = await base44.asServiceRole.entities.Automation.filter({ is_active: true });
    
    console.log(`נמצאו ${automations.length} אוטומציות פעילות`);
    
    const results = [];
    
    for (const automation of automations) {
      try {
        console.log(`מעבד אוטומציה: ${automation.name}`);
        
        // חיפוש רשומות שתואמות לטריגר
        const triggeredRecords = await findTriggeredRecords(base44, automation);
        
        console.log(`נמצאו ${triggeredRecords.length} רשומות מתאימות`);
        
        // הרצת האוטומציה על כל רשומה
        for (const record of triggeredRecords) {
          await executeAutomation(base44, automation, record);
        }
        
        // עדכון מספר ההרצות
        await base44.asServiceRole.entities.Automation.update(automation.id, {
          last_run: new Date().toISOString(),
          run_count: (automation.run_count || 0) + triggeredRecords.length
        });
        
        results.push({
          automation: automation.name,
          triggered: triggeredRecords.length,
          status: 'success'
        });
        
      } catch (error) {
        console.error(`שגיאה באוטומציה ${automation.name}:`, error);
        results.push({
          automation: automation.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return Response.json({
      success: true,
      processed: automations.length,
      results
    });
    
  } catch (error) {
    console.error('שגיאה בהרצת אוטומציות:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function findTriggeredRecords(base44, automation) {
  const triggerType = automation.trigger_type;
  const triggerConfig = automation.trigger_config || {};
  
  // חיפוש רשומות שנוצרו/עודכנו מאז ההרצה האחרונה
  const lastRun = automation.last_run ? new Date(automation.last_run) : new Date(Date.now() - 10 * 60 * 1000);
  
  switch (triggerType) {
    case 'lead_created':
      // חיפוש לקוחות שנוצרו מאז ההרצה האחרונה
      const allClients = await base44.asServiceRole.entities.Client.list('-created_date', 100);
      return allClients.filter(c => new Date(c.created_date) > lastRun);
      
    case 'lead_created_by_source':
      // חיפוש לקוחות שנוצרו ממקור ספציפי
      const clientsBySource = await base44.asServiceRole.entities.Client.list('-created_date', 100);
      return clientsBySource.filter(c => 
        new Date(c.created_date) > lastRun && 
        c.source === triggerConfig.source
      );
      
    case 'status_changed':
      // זה מורכב יותר - צריך לבדוק ActivityLog
      const activityLogs = await base44.asServiceRole.entities.ClientActivityLog.list('-created_date', 100);
      const statusChangeLogs = activityLogs.filter(log => 
        new Date(log.created_date) > lastRun &&
        log.activity_type === 'status_change' &&
        (!triggerConfig.status_from || log.old_value === triggerConfig.status_from) &&
        (!triggerConfig.status_to || log.new_value === triggerConfig.status_to)
      );
      
      // להחזיר את הלקוחות המתאימים
      const clientIds = [...new Set(statusChangeLogs.map(log => log.client_id))];
      const clients = [];
      for (const clientId of clientIds) {
        const client = await base44.asServiceRole.entities.Client.get(clientId);
        if (client) clients.push(client);
      }
      return clients;
      
    case 'task_assigned':
      const tasks = await base44.asServiceRole.entities.Task.list('-created_date', 100);
      return tasks.filter(t => new Date(t.created_date) > lastRun && t.client_id);
      
    case 'case_created':
      const cases = await base44.asServiceRole.entities.Case.list('-created_date', 100);
      return cases.filter(c => new Date(c.created_date) > lastRun);
      
    case 'appointment_scheduled':
      const appointments = await base44.asServiceRole.entities.Appointment.list('-created_date', 100);
      return appointments.filter(a => new Date(a.created_date) > lastRun);
      
    case 'document_signed':
      const signedDocs = await base44.asServiceRole.entities.SignedDocument.filter({ status: 'signed' });
      return signedDocs.filter(d => 
        new Date(d.signed_at || d.updated_date) > lastRun &&
        (!triggerConfig.template_id || d.template_id === triggerConfig.template_id)
      );
      
    case 'integration_webhook':
      // לטפל בעתיד - webhook logs
      return [];
      
    default:
      return [];
  }
}

async function executeAutomation(base44, automation, record) {
  console.log(`מריץ אוטומציה ${automation.name} על רשומה ${record.id}`);
  
  // יצירת לוג
  const log = await base44.asServiceRole.entities.AutomationLog.create({
    automation_id: automation.id,
    automation_name: automation.name,
    trigger_type: automation.trigger_type,
    entity_id: record.id,
    entity_type: getEntityType(automation.trigger_type),
    status: 'running',
    current_step: 0,
    steps_completed: 0,
    total_steps: automation.steps?.length || 0
  });
  
  const steps = automation.steps || [];
  
  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`מבצע שלב ${i + 1}: ${step.step_type}`);
      
      // בדיקת המתנה
      if (step.step_type === 'wait') {
        const { wait_duration = 1, wait_unit = 'hours' } = step.step_config || {};
        const waitMs = wait_duration * (wait_unit === 'minutes' ? 60000 : wait_unit === 'hours' ? 3600000 : 86400000);
        const waitUntil = new Date(Date.now() + waitMs);
        
        await base44.asServiceRole.entities.AutomationLog.update(log.id, {
          status: 'waiting',
          current_step: i,
          wait_until: waitUntil.toISOString()
        });
        
        console.log(`ממתין עד ${waitUntil.toISOString()}`);
        break; // עצור כאן, נמשיך בהרצה הבאה
      }
      
      await executeStep(base44, step, record, automation);
      
      await base44.asServiceRole.entities.AutomationLog.update(log.id, {
        steps_completed: i + 1,
        current_step: i + 1
      });
    }
    
    // סיום מוצלח
    await base44.asServiceRole.entities.AutomationLog.update(log.id, {
      status: 'completed',
      steps_completed: steps.length
    });
    
  } catch (error) {
    console.error('שגיאה בביצוע אוטומציה:', error);
    await base44.asServiceRole.entities.AutomationLog.update(log.id, {
      status: 'failed',
      error_message: error.message
    });
    throw error;
  }
}

async function executeStep(base44, step, record, automation) {
  const config = step.step_config || {};
  
  // קבלת הלקוח הרלוונטי
  let client = record;
  if (automation.trigger_type === 'case_created' || automation.trigger_type === 'task_assigned') {
    if (record.client_id) {
      client = await base44.asServiceRole.entities.Client.get(record.client_id);
    }
  } else if (automation.trigger_type === 'document_signed') {
    if (record.lead_id) {
      client = await base44.asServiceRole.entities.Client.get(record.lead_id);
    }
  }
  
  const interpolate = (text) => {
    if (!text || !client) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => client[key] || match);
  };
  
  switch (step.step_type) {
    case 'send_email':
      if (client?.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: client.email,
          subject: interpolate(config.subject),
          body: interpolate(config.body)
        });
        console.log(`נשלח מייל ל-${client.email}`);
      }
      break;
      
    case 'send_sms':
      console.log('שליחת SMS - דורש אינטגרציה');
      break;
      
    case 'change_status':
      if (client) {
        await base44.asServiceRole.entities.Client.update(client.id, {
          status: config.new_status
        });
        console.log(`עודכן סטטוס ל-${config.new_status}`);
      }
      break;
      
    case 'create_task':
      if (client) {
        await base44.asServiceRole.entities.Task.create({
          title: interpolate(config.task_title),
          description: interpolate(config.task_description),
          client_id: client.id,
          client_name: client.full_name,
          priority: config.priority || 'בינונית',
          status: 'פתוח'
        });
        console.log('נוצרה משימה');
      }
      break;
      
    case 'create_case':
      if (client) {
        await base44.asServiceRole.entities.Case.create({
          title: interpolate(config.case_title),
          client_id: client.id,
          client_name: client.full_name,
          case_type: config.case_type,
          status: 'פעיל',
          opening_date: new Date().toISOString().split('T')[0]
        });
        console.log('נוצר תיק');
      }
      break;
      
    case 'add_note':
      if (client) {
        await base44.asServiceRole.entities.ClientInteraction.create({
          client_id: client.id,
          interaction_type: 'הערה',
          notes: interpolate(config.note_text),
          date: new Date().toISOString().split('T')[0]
        });
        console.log('נוספה הערה');
      }
      break;
      
    case 'send_document':
      console.log('שליחת מסמך לחתימה - דורש מימוש');
      break;
      
    case 'update_field':
      if (client && config.field_name && config.field_value !== undefined) {
        await base44.asServiceRole.entities.Client.update(client.id, {
          [config.field_name]: interpolate(config.field_value)
        });
        console.log(`עודכן שדה ${config.field_name}`);
      }
      break;
      
    case 'delete_record':
      if (client) {
        await base44.asServiceRole.entities.Client.delete(client.id);
        console.log('רשומה נמחקה');
      }
      break;
      
    default:
      console.log(`סוג שלב לא ידוע: ${step.step_type}`);
  }
}

function getEntityType(triggerType) {
  switch (triggerType) {
    case 'lead_created':
    case 'lead_created_by_source':
    case 'status_changed':
      return 'Client';
    case 'task_assigned':
      return 'Task';
    case 'case_created':
      return 'Case';
    case 'appointment_scheduled':
      return 'Appointment';
    case 'document_signed':
      return 'SignedDocument';
    default:
      return 'Unknown';
  }
}