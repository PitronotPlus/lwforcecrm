
import { useState, useEffect } from 'react';
import { AiPrompt } from '@/entities/AiPrompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function AiPromptManager() {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        setLoading(true);
        try {
            const data = await AiPrompt.list('order');
            setPrompts(data);
        } catch (error) {
            console.error("Failed to load AI prompts:", error);
        }
        setLoading(false);
    };

    const handlePromptChange = (index, field, value) => {
        const updatedPrompts = [...prompts];
        updatedPrompts[index][field] = value;
        setPrompts(updatedPrompts);
    };

    const addPrompt = () => {
        const newPrompt = {
            category_name: 'קטגוריה חדשה',
            prompt_template: "אתה עורך דין מומחה בכתיבה משפטית. בהתבסס על הבקשה: '{{requestText}}', נסח את המסמך.",
            is_active: true,
            order: prompts.length > 0 ? Math.max(...prompts.map(p => p.order)) + 1 : 1
        };
        setPrompts([...prompts, newPrompt]);
    };

    const removePrompt = async (id, index) => {
        if (!id) {
            // If the prompt is new and not saved yet, just remove from state
            setPrompts(prompts.filter((_, i) => i !== index));
            return;
        }
        if (window.confirm("האם אתה בטוח שברצונך למחוק פרומפט זה?")) {
            try {
                await AiPrompt.delete(id);
                loadPrompts();
            } catch (error) {
                console.error("Failed to delete prompt:", error);
            }
        }
    };

    const handleSaveAll = async () => {
        try {
            await Promise.all(prompts.map(prompt => {
                const dataToSave = {
                    category_name: prompt.category_name,
                    prompt_template: prompt.prompt_template,
                    is_active: prompt.is_active,
                    order: prompt.order
                };
                if (prompt.id) {
                    return AiPrompt.update(prompt.id, dataToSave);
                } else {
                    return AiPrompt.create(dataToSave);
                }
            }));
            alert("כל השינויים נשמרו בהצלחה!");
            loadPrompts();
        } catch (error) {
            console.error("Failed to save prompts:", error);
            alert("שגיאה בשמירת הפרומפטים.");
        }
    };
    
    if (loading) return <div>טוען הגדרות פרומפטים...</div>;

    return (
        <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[20px] font-medium" style={{ color: '#484848', fontFamily: 'Heebo' }}>
                    ניהול פרומפטים למחולל AI
                </h3>
                <Button onClick={handleSaveAll}><Save className="ml-2 w-4 h-4" /> שמור הכל</Button>
            </div>
            <div className="space-y-4">
                {(prompts || []).map((prompt, index) => (
                    <div key={prompt.id || index} className="p-4 border rounded-lg space-y-3 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="שם הקטגוריה"
                                value={prompt.category_name}
                                onChange={(e) => handlePromptChange(index, 'category_name', e.target.value)}
                                className="font-bold"
                            />
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <label className="text-sm">פעיל</label>
                                <Switch
                                    checked={prompt.is_active}
                                    onCheckedChange={(checked) => handlePromptChange(index, 'is_active', checked)}
                                />
                            </div>
                            <Button size="icon" variant="ghost" className="text-red-500 flex-shrink-0" onClick={() => removePrompt(prompt.id, index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <div>
                            <Textarea
                                placeholder="תבנית הפרומפט. השתמש ב-{{requestText}} עבור קלט המשתמש."
                                value={prompt.prompt_template}
                                onChange={(e) => handlePromptChange(index, 'prompt_template', e.target.value)}
                                rows={4}
                                className="text-right"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">טיפ: השתמש ב- <code>{"{{requestText}}"}</code> כדי לשלב את בקשת המשתמש בפרומפט.</p>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={addPrompt} className="mt-6"><Plus className="ml-2 w-4 h-4" /> הוסף פרומפט חדש</Button>
        </div>
    );
}
