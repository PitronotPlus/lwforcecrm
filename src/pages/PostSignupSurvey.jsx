import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SurveyResponse } from '@/entities/SurveyResponse';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';

export default function PostSignupSurvey() {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({
        uses_crm: '',
        current_crm_system: '',
        management_tools: [],
        other_management_tool: '',
        main_pain_point: '',
        improvement_potential: ''
    });
    const navigate = useNavigate();

    const handleAnswerChange = (key, value) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleCheckboxChange = (item) => {
        const currentTools = answers.management_tools;
        if (currentTools.includes(item)) {
            handleAnswerChange('management_tools', currentTools.filter(tool => tool !== item));
        } else {
            handleAnswerChange('management_tools', [...currentTools, item]);
        }
    };

    const handleSubmit = async () => {
        const finalAnswers = { ...answers };
        if (answers.other_management_tool) {
            finalAnswers.management_tools.push(`אחר: ${answers.other_management_tool}`);
        }
        delete finalAnswers.other_management_tool;

        try {
            await SurveyResponse.create(finalAnswers);
            await User.updateMyUserData({ survey_completed: true });
            navigate(createPageUrl('PricingPage'));
        } catch (error) {
            console.error("שגיאה בשליחת הסקר:", error);
            alert("אירעה שגיאה, אנא נסה שוב.");
        }
    };

    const managementToolsOptions = [
        'וואטסאפ', 'מייל', 'מחברת / פתקים', 'גוגל שיטס / אקסל', 'תוכנה משפטית (נט המשפט, עודכנית וכו’)'
    ];

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <Label>1. האם אתה משתמש כרגע במערכת CRM כלשהי?</Label>
                        <RadioGroup value={answers.uses_crm} onValueChange={(val) => handleAnswerChange('uses_crm', val)}>
                            <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="כן, באופן קבוע" id="q1-1" /><Label htmlFor="q1-1">כן, באופן קבוע</Label></div>
                            <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="ניסיתי בעבר, לא היה לי נוח" id="q1-2" /><Label htmlFor="q1-2">ניסיתי בעבר, לא היה לי נוח</Label></div>
                            <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="לא, אני לא משתמש" id="q1-3" /><Label htmlFor="q1-3">לא, אני לא משתמש</Label></div>
                        </RadioGroup>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <Label htmlFor="crm-system">2. אם אתה כן משתמש – איזו מערכת זו?</Label>
                        <Input id="crm-system" value={answers.current_crm_system} onChange={(e) => handleAnswerChange('current_crm_system', e.target.value)} />
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <Label>3. באיזה אמצעים אתה כיום מנהל את הלקוחות והתיקים שלך?</Label>
                        {managementToolsOptions.map(tool => (
                            <div key={tool} className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox id={tool} checked={answers.management_tools.includes(tool)} onCheckedChange={() => handleCheckboxChange(tool)} />
                                <Label htmlFor={tool}>{tool}</Label>
                            </div>
                        ))}
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Input placeholder="אחר..." value={answers.other_management_tool} onChange={(e) => handleAnswerChange('other_management_tool', e.target.value)} />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <Label>4. מה הכי מפריע לך באופן הניהול היום?</Label>
                        <RadioGroup value={answers.main_pain_point} onValueChange={(val) => handleAnswerChange('main_pain_point', val)}>
                             <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="הכל מפוזר ואין שליטה" id="q4-1" /><Label htmlFor="q4-1">הכל מפוזר ואין שליטה</Label></div>
                             <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="שוכח לחזור ללקוחות" id="q4-2" /><Label htmlFor="q4-2">שוכח לחזור ללקוחות</Label></div>
                             <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="אין לי דרך לתעד שיחות/תיעוד" id="q4-3" /><Label htmlFor="q4-3">אין לי דרך לתעד שיחות/תיעוד</Label></div>
                             <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="קשה לי למכור שירותים משפטיים" id="q4-4" /><Label htmlFor="q4-4">קשה לי למכור שירותים משפטיים</Label></div>
                             <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="אין לי בעיה – אני מרוצה מהשיטה שלי" id="q4-5" /><Label htmlFor="q4-5">אין לי בעיה – אני מרוצה מהשיטה שלי</Label></div>
                        </RadioGroup>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-4">
                        <Label>5. עד כמה מערכת שתעזור לך לנהל תיקים, לקוחות, שיחות ומשימות – עם עיצוב נוח ובינה מלאכותית – תוכל לשפר את העבודה שלך?</Label>
                        <RadioGroup value={answers.improvement_potential} onValueChange={(val) => handleAnswerChange('improvement_potential', val)}>
                            <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="לא חושב שתעזור" id="q5-1" /><Label htmlFor="q5-1">לא חושב שתעזור</Label></div>
                            <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="איני יודע" id="q5-2" /><Label htmlFor="q5-2">איני יודע</Label></div>
                            <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="מאמין שתעזור" id="q5-3" /><Label htmlFor="q5-3">מאמין שתעזור</Label></div>
                            <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="תעזור מאוד!" id="q5-4" /><Label htmlFor="q5-4">תעזור מאוד!</Label></div>
                        </RadioGroup>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const nextStep = () => {
        if (step === 1 && answers.uses_crm !== 'כן, באופן קבוע') {
            setStep(3); // Skip question 2 if not using a CRM
        } else {
            setStep(s => s + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: 'Heebo', direction: 'rtl' }}>
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-center text-2xl font-bold mb-2">שאלון קצר (30 שניות)</h1>
                <p className="text-center text-gray-600 mb-8">נשמח להכיר אותך טוב יותר כדי להתאים לך את המערכת.</p>
                <div className="py-4 min-h-[250px]">
                    {renderStep()}
                </div>
                <div className="flex justify-between items-center mt-6">
                    {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>הקודם</Button>}
                    <div className="flex-grow"></div>
                    {step < 5 && <Button onClick={nextStep}>הבא</Button>}
                    {step === 5 && <Button onClick={handleSubmit}>שלח וסיים</Button>}
                </div>
            </div>
        </div>
    );
}