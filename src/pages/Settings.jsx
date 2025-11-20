import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, User as UserIcon, Bell, Shield, Palette, Database } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [userSettings, setUserSettings] = useState({
        notifications_enabled: true,
        auto_backup: true,
        google_drive_integration: false,
        email_notifications: true,
        sms_notifications: false,
        task_reminders: true,
        appointment_reminders: true,
        theme: 'light',
        language: 'he',
        timezone: 'Asia/Jerusalem'
    });
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        phone: '',
        law_firm_name: '',
        license_number: '',
        specialization: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const userData = await User.me();
            setUser(userData);
            setProfileData({
                full_name: userData.full_name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                law_firm_name: userData.law_firm_name || '',
                license_number: userData.license_number || '',
                specialization: userData.specialization || []
            });
            setUserSettings({
                ...userSettings,
                ...userData.settings
            });
        } catch (error) {
            console.error('שגיאה בטעינת נתוני משתמש:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSave = async () => {
        try {
            await User.updateMyUserData(profileData);
            alert('הפרופיל נשמר בהצלחה!');
        } catch (error) {
            console.error('שגיאה בשמירת פרופיל:', error);
            alert('שגיאה בשמירת הפרופיל');
        }
    };

    const handleSettingsSave = async () => {
        try {
            await User.updateMyUserData({ settings: userSettings });
            alert('ההגדרות נשמרו בהצלחה!');
        } catch (error) {
            console.error('שגיאה בשמירת הגדרות:', error);
            alert('שגיאה בשמירת ההגדרות');
        }
    };

    const updateSetting = (key, value) => {
        setUserSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSpecializationChange = (value) => {
        const currentSpecs = profileData.specialization || [];
        let newSpecs;
        if (currentSpecs.includes(value)) {
            newSpecs = currentSpecs.filter(spec => spec !== value);
        } else {
            newSpecs = [...currentSpecs, value];
        }
        setProfileData({...profileData, specialization: newSpecs});
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
                <div className="max-w-4xl mx-auto text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                    <p style={{ fontFamily: 'Heebo', color: '#858C94' }}>טוען הגדרות...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-full md:max-w-5xl mx-auto">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <Shield className="w-6 md:w-8 h-6 md:h-8 text-[#3568AE]" />
                    <h1 
                        className="text-2xl md:text-[32px] font-bold"
                        style={{ 
                            color: '#3568AE',
                            fontFamily: 'Heebo'
                        }}
                    >
                        הגדרות אישיות
                    </h1>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white rounded-[20px] p-1">
                        <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                            <UserIcon className="w-3 md:w-4 h-3 md:h-4" />
                            <span className="hidden sm:inline">פרופיל</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                            <Bell className="w-3 md:w-4 h-3 md:h-4" />
                            <span className="hidden sm:inline">התראות</span>
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                            <Database className="w-3 md:w-4 h-3 md:h-4" />
                            <span className="hidden sm:inline">אינטגרציות</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                            <Palette className="w-3 md:w-4 h-3 md:h-4" />
                            <span className="hidden sm:inline">תצוגה</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* פרופיל */}
                    <TabsContent value="profile" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle style={{ fontFamily: 'Heebo' }}>פרטים אישיים</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            שם מלא
                                        </label>
                                        <Input
                                            value={profileData.full_name}
                                            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                                            className="text-right"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            אימייל
                                        </label>
                                        <Input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="text-right bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            טלפון
                                        </label>
                                        <Input
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                            className="text-right"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            מספר רישיון
                                        </label>
                                        <Input
                                            value={profileData.license_number}
                                            onChange={(e) => setProfileData({...profileData, license_number: e.target.value})}
                                            className="text-right"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                        שם המשרד
                                    </label>
                                    <Input
                                        value={profileData.law_firm_name}
                                        onChange={(e) => setProfileData({...profileData, law_firm_name: e.target.value})}
                                        className="text-right"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                        תחומי התמחות
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {['אזרחי', 'פלילי', 'מסחרי', 'משפחה', 'נדל"ן', 'עבודה', 'ביטוח', 'מיסים'].map(spec => (
                                            <label key={spec} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={profileData.specialization?.includes(spec) || false}
                                                    onChange={() => handleSpecializationChange(spec)}
                                                />
                                                <span className="text-sm" style={{ fontFamily: 'Heebo' }}>{spec}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleProfileSave} className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                        <Save className="w-4 h-4 mr-2" />
                                        שמור פרופיל
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* התראות */}
                    <TabsContent value="notifications" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle style={{ fontFamily: 'Heebo' }}>הגדרות התראות</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <label className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>
                                            התראות אימייל
                                        </label>
                                        <Switch
                                            checked={userSettings.email_notifications}
                                            onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <label className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>
                                            התראות SMS
                                        </label>
                                        <Switch
                                            checked={userSettings.sms_notifications}
                                            onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <label className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>
                                            תזכורות למשימות
                                        </label>
                                        <Switch
                                            checked={userSettings.task_reminders}
                                            onCheckedChange={(checked) => updateSetting('task_reminders', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <label className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>
                                            תזכורות לפגישות
                                        </label>
                                        <Switch
                                            checked={userSettings.appointment_reminders}
                                            onCheckedChange={(checked) => updateSetting('appointment_reminders', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSettingsSave} className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                        <Save className="w-4 h-4 mr-2" />
                                        שמור הגדרות
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* אינטגרציות */}
                    <TabsContent value="integrations" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle style={{ fontFamily: 'Heebo' }}>אינטגרציות חיצוניות</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <label className="text-sm font-medium block" style={{ fontFamily: 'Heebo' }}>
                                                אינטגרציה Google Drive
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                סנכרון אוטומטי של מסמכים לגוגל דרייב
                                            </p>
                                        </div>
                                        <Switch
                                            checked={userSettings.google_drive_integration}
                                            onCheckedChange={(checked) => updateSetting('google_drive_integration', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <label className="text-sm font-medium block" style={{ fontFamily: 'Heebo' }}>
                                                גיבוי אוטומטי
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                גיבוי יומי של כל הנתונים
                                            </p>
                                        </div>
                                        <Switch
                                            checked={userSettings.auto_backup}
                                            onCheckedChange={(checked) => updateSetting('auto_backup', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSettingsSave} className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                        <Save className="w-4 h-4 mr-2" />
                                        שמור הגדרות
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* תצוגה */}
                    <TabsContent value="appearance" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle style={{ fontFamily: 'Heebo' }}>הגדרות תצוגה</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            ערכת נושא
                                        </label>
                                        <Select
                                            value={userSettings.theme}
                                            onValueChange={(value) => updateSetting('theme', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">בהיר</SelectItem>
                                                <SelectItem value="dark">כהה</SelectItem>
                                                <SelectItem value="auto">אוטומטי</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Heebo' }}>
                                            אזור זמן
                                        </label>
                                        <Select
                                            value={userSettings.timezone}
                                            onValueChange={(value) => updateSetting('timezone', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Asia/Jerusalem">ישראל (UTC+2/+3)</SelectItem>
                                                <SelectItem value="Europe/London">לונדון (UTC+0/+1)</SelectItem>
                                                <SelectItem value="America/New_York">ניו יורק (UTC-5/-4)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSettingsSave} className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                        <Save className="w-4 h-4 mr-2" />
                                        שמור הגדרות
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}