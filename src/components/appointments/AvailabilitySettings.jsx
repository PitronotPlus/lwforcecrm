import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings, Plus, Trash2, Save } from 'lucide-react';

export default function AvailabilitySettings({ onSave }) {
    const [availability, setAvailability] = useState({
        sunday: { enabled: true, start: '09:00', end: '17:00' },
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: false, start: '09:00', end: '13:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' }
    });
    const [saving, setSaving] = useState(false);

    const dayNames = {
        sunday: 'ראשון',
        monday: 'שני',
        tuesday: 'שלישי',
        wednesday: 'רביעי',
        thursday: 'חמישי',
        friday: 'שישי',
        saturday: 'שבת'
    };

    useEffect(() => {
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
        try {
            const user = await base44.auth.me();
            if (user.availability_settings) {
                setAvailability(user.availability_settings);
            }
        } catch (error) {
            console.error('שגיאה בטעינת זמינות:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await base44.auth.updateMe({ availability_settings: availability });
            if (onSave) onSave(availability);
            alert('הזמינות נשמרה בהצלחה!');
        } catch (error) {
            console.error('שגיאה בשמירת זמינות:', error);
            alert('אירעה שגיאה בשמירה');
        } finally {
            setSaving(false);
        }
    };

    const updateDay = (day, field, value) => {
        setAvailability({
            ...availability,
            [day]: {
                ...availability[day],
                [field]: value
            }
        });
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Heebo' }}>
                    <Settings className="w-5 h-5 text-[#3568AE]" />
                    שעות זמינות
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(availability).map(([day, settings]) => (
                    <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 min-w-[120px]">
                            <Switch
                                checked={settings.enabled}
                                onCheckedChange={(checked) => updateDay(day, 'enabled', checked)}
                            />
                            <span className="font-medium">{dayNames[day]}</span>
                        </div>
                        
                        {settings.enabled && (
                            <div className="flex items-center gap-2 flex-1">
                                <Input
                                    type="time"
                                    value={settings.start}
                                    onChange={(e) => updateDay(day, 'start', e.target.value)}
                                    className="w-32"
                                />
                                <span className="text-gray-500">-</span>
                                <Input
                                    type="time"
                                    value={settings.end}
                                    onChange={(e) => updateDay(day, 'end', e.target.value)}
                                    className="w-32"
                                />
                            </div>
                        )}
                    </div>
                ))}

                <Button 
                    onClick={handleSave} 
                    className="w-full bg-[#67BF91] hover:bg-[#5AA880]"
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                            שומר...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 ml-2" />
                            שמור הגדרות
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}