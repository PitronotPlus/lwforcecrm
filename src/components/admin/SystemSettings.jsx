import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, Database, Shield, Globe } from 'lucide-react';

export default function SystemSettings() {
    const [settings, setSettings] = useState({
        system_name: 'LawForce',
        support_email: 'support@lawforce.co.il',
        max_users_per_account: 5,
        auto_backup_enabled: true,
        email_notifications: true,
        maintenance_mode: false,
        registration_enabled: true,
        google_drive_integration: true,
        facebook_leads_integration: true
    });

    const handleSave = () => {
        // Save settings logic here
        console.log('שמירת הגדרות:', settings);
        alert('הגדרות המערכת נשמרו בהצלחה!');
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* General Settings */}
            <div className="bg-white rounded-[20px] p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-6 h-6 text-[#3568AE]" />
                    <h3 
                        className="text-[20px] font-medium"
                        style={{ 
                            color: '#484848',
                            fontFamily: 'Heebo'
                        }}
                    >
                        הגדרות כלליות
                    </h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <label 
                            className="block text-[14px] font-medium mb-2 text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            שם המערכת
                        </label>
                        <Input
                            value={settings.system_name}
                            onChange={(e) => updateSetting('system_name', e.target.value)}
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label 
                            className="block text-[14px] font-medium mb-2 text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            אימייל תמיכה
                        </label>
                        <Input
                            type="email"
                            value={settings.support_email}
                            onChange={(e) => updateSetting('support_email', e.target.value)}
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label 
                            className="block text-[14px] font-medium mb-2 text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            מקסימום משתמשים לחשבון
                        </label>
                        <Input
                            type="number"
                            value={settings.max_users_per_account}
                            onChange={(e) => updateSetting('max_users_per_account', parseInt(e.target.value))}
                            className="text-right"
                        />
                    </div>
                </div>
            </div>

            {/* System Features */}
            <div className="bg-white rounded-[20px] p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-[#3568AE]" />
                    <h3 
                        className="text-[20px] font-medium"
                        style={{ 
                            color: '#484848',
                            fontFamily: 'Heebo'
                        }}
                    >
                        פיצ'רים מערכת
                    </h3>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Switch
                            checked={settings.auto_backup_enabled}
                            onCheckedChange={(checked) => updateSetting('auto_backup_enabled', checked)}
                        />
                        <label 
                            className="text-[14px] font-medium text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            גיבוי אוטומטי
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <Switch
                            checked={settings.email_notifications}
                            onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                        />
                        <label 
                            className="text-[14px] font-medium text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            התראות אימייל
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <Switch
                            checked={settings.registration_enabled}
                            onCheckedChange={(checked) => updateSetting('registration_enabled', checked)}
                        />
                        <label 
                            className="text-[14px] font-medium text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            הרשמה חדשה
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <Switch
                            checked={settings.maintenance_mode}
                            onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                        />
                        <label 
                            className="text-[14px] font-medium text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            מצב תחזוקה
                        </label>
                    </div>
                </div>
            </div>

            {/* Integrations */}
            <div className="bg-white rounded-[20px] p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-[#3568AE]" />
                    <h3 
                        className="text-[20px] font-medium"
                        style={{ 
                            color: '#484848',
                            fontFamily: 'Heebo'
                        }}
                    >
                        אינטגרציות חיצוניות
                    </h3>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Switch
                            checked={settings.google_drive_integration}
                            onCheckedChange={(checked) => updateSetting('google_drive_integration', checked)}
                        />
                        <label 
                            className="text-[14px] font-medium text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            אינטגרציה Google Drive
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <Switch
                            checked={settings.facebook_leads_integration}
                            onCheckedChange={(checked) => updateSetting('facebook_leads_integration', checked)}
                        />
                        <label 
                            className="text-[14px] font-medium text-right"
                            style={{ 
                                color: '#484848',
                                fontFamily: 'Heebo'
                            }}
                        >
                            לידים מפייסבוק
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="lg:col-span-2">
                <div className="flex justify-end">
                    <Button 
                        onClick={handleSave}
                        className="bg-[#67BF91] hover:bg-[#5AA880] text-white px-8"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        שמור הגדרות
                    </Button>
                </div>
            </div>
        </div>
    );
}