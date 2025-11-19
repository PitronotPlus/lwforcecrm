
import { useState, useEffect } from 'react';
import { ClientSettings } from '@/entities/ClientSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Plus, Trash2, Tag, MessageSquare, ListChecks } from 'lucide-react';

export default function ClientSettingsManager() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newOption, setNewOption] = useState({ status: '', source: '', need: '' });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            let data = await ClientSettings.list();
            if (data.length > 0) {
                setSettings(data[0]);
            } else {
                // Create default settings if none exist
                const defaultSettings = {
                    status_options: ["ליד", "פולואפ", "לקוח", "לא נסגר", "יקר עבורו", "נתפס לפני שטופל", "לא רלוונטי"],
                    initial_needs_options: ["ייעוץ", "ייצוג בבית משפט", "עריכת חוזה"],
                    source_options: ["פה לאוזן", "שיווק פייסבוק", "שיווק גוגל", "רשתות חברתיות אחרות", "לקוח ממליץ", "אחר"],
                    message_templates: [
                        { id: crypto.randomUUID(), title: "תזכורת לפגישה", body: "שלום {{full_name}}, רק להזכירך על פגישתנו מחר בשעה..." },
                        { id: crypto.randomUUID(), title: "בקשת מסמכים", body: "שלום {{full_name}}, לצורך המשך הטיפול, אנא העבר/י אלינו את המסמכים הבאים..." }
                    ]
                };
                const newSettings = await ClientSettings.create(defaultSettings);
                setSettings(newSettings);
            }
        } catch (error) {
            console.error("שגיאה בטעינת הגדרות:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (settings && settings.id) {
                await ClientSettings.update(settings.id, settings);
                alert("ההגדרות נשמרו בהצלחה!");
            }
        } catch (error) {
            console.error("שגיאה בשמירת הגדרות:", error);
            alert("שגיאה בשמירת ההגדרות.");
        }
    };
    
    const handleTemplateChange = (index, field, value) => {
        const updatedTemplates = [...settings.message_templates];
        updatedTemplates[index][field] = value;
        setSettings(prev => ({ ...prev, message_templates: updatedTemplates }));
    };

    const addTemplate = () => {
        const newTemplate = { id: crypto.randomUUID(), title: 'תבנית חדשה', body: '' };
        setSettings(prev => ({ ...prev, message_templates: [...prev.message_templates, newTemplate] }));
    };

    const removeTemplate = (index) => {
        const updatedTemplates = settings.message_templates.filter((_, i) => i !== index);
        setSettings(prev => ({ ...prev, message_templates: updatedTemplates }));
    };
    
    const handleOptionChange = (type, index, value) => {
        const key = `${type}_options`;
        const updatedOptions = [...settings[key]];
        updatedOptions[index] = value;
        setSettings(prev => ({...prev, [key]: updatedOptions}));
    }

    const addOption = (type) => {
        const key = `${type}_options`;
        const optionValue = newOption[type].trim();
        if (optionValue && !settings[key].includes(optionValue)) {
            setSettings(prev => ({...prev, [key]: [...prev[key], optionValue]}));
            setNewOption(prev => ({...prev, [type]: ''}));
        }
    }

    const removeOption = (type, index) => {
        const key = `${type}_options`;
        const updatedOptions = settings[key].filter((_, i) => i !== index);
        setSettings(prev => ({...prev, [key]: updatedOptions}));
    }

    if (loading) {
        return <div>טוען הגדרות...</div>;
    }

    if (!settings) {
        return <div>שגיאה בטעינת הגדרות. אנא נסה לרענן את הדף.</div>;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare /> תבניות הודעות
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(settings?.message_templates || []).map((template, index) => (
                        <div key={template.id} className="p-4 border rounded-lg space-y-2 relative">
                             <Button size="icon" variant="ghost" className="absolute top-2 left-2 text-red-500" onClick={() => removeTemplate(index)}>
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                            <Input
                                placeholder="כותרת התבנית"
                                value={template.title || ''}
                                onChange={(e) => handleTemplateChange(index, 'title', e.target.value)}
                            />
                            <Textarea
                                placeholder="גוף ההודעה. ניתן להשתמש ב-{{full_name}} עבור שם הלקוח."
                                value={template.body || ''}
                                onChange={(e) => handleTemplateChange(index, 'body', e.target.value)}
                                rows={3}
                            />
                        </div>
                    ))}
                    <Button onClick={addTemplate}><Plus className="ml-2 w-4 h-4"/> הוסף תבנית</Button>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-8">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Tag/>אפשרויות סטטוס</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(settings?.status_options || []).map((option, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <Input value={option || ''} onChange={(e) => handleOptionChange('status', index, e.target.value)} />
                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeOption('status', index)}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                             <Input placeholder="הוסף סטטוס חדש" value={newOption.status} onChange={e => setNewOption({...newOption, status: e.target.value})} />
                             <Button onClick={() => addOption('status')}><Plus className="w-4 h-4"/></Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks/>אפשרויות צורך ראשוני</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(settings?.initial_needs_options || []).map((option, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <Input value={option || ''} onChange={(e) => handleOptionChange('initial_needs', index, e.target.value)} />
                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeOption('initial_needs', index)}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                        ))}
                         <div className="flex gap-2 pt-2">
                             <Input placeholder="הוסף צורך חדש" value={newOption.need} onChange={e => setNewOption({...newOption, need: e.target.value})} />
                             <Button onClick={() => addOption('initial_needs')}><Plus className="w-4 h-4"/></Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Tag/>אפשרויות מקור הגעה</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(settings?.source_options || []).map((option, index) => (
                             <div key={index} className="flex gap-2 items-center">
                                <Input value={option || ''} onChange={(e) => handleOptionChange('source', index, e.target.value)} />
                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeOption('source', index)}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                        ))}
                         <div className="flex gap-2 pt-2">
                             <Input placeholder="הוסף מקור חדש" value={newOption.source} onChange={e => setNewOption({...newOption, source: e.target.value})} />
                             <Button onClick={() => addOption('source')}><Plus className="w-4 h-4"/></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex justify-end">
                <Button onClick={handleSave} size="lg" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                    <Save className="ml-2 w-4 h-4" />
                    שמור הגדרות
                </Button>
            </div>
        </div>
    );
}
