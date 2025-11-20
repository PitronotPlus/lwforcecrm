import React, { useState, useEffect } from 'react';
import { InvokeLLM } from "@/integrations/Core";
import { AiPrompt } from '@/entities/AiPrompt';
import { ChevronDown, Copy, Download } from 'lucide-react';

export default function AppointmentsSection({ appointments = [] }) {
    const [prompts, setPrompts] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState('');
    const [requestText, setRequestText] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        try {
            const data = await AiPrompt.filter({ is_active: true }, 'order');
            setPrompts(data);
            if (data.length > 0) {
                setSelectedPromptId(data[0].id);
            }
        } catch (error) {
            console.error("Failed to load AI prompts:", error);
        }
    };

    const handleGenerate = async () => {
        if (!requestText.trim() || !selectedPromptId) return;

        const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
        if (!selectedPrompt) {
            console.error("Selected prompt not found");
            return;
        }
        
        setIsLoading(true);
        try {
            const finalPrompt = selectedPrompt.prompt_template.replace('{{requestText}}', requestText);
            const response = await InvokeLLM({
                prompt: finalPrompt
            });
            setGeneratedText(response);
        } catch (error) {
            console.error('שגיאה ביצירת הטקסט:', error);
            setGeneratedText('אירעה שגיאה. אנא בדוק שהגדרת את מפתח ה-API של OpenAI בהגדרות המערכת.');
        }
        setIsLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedText);
    };

    const exportAsFile = () => {
        const element = document.createElement('a');
        const file = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `מסמך_משפטי_${new Date().toLocaleDateString('he-IL')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Appointments Card */}
            <div className="dashboard-card p-4 md:p-8">
                <h2 
                    className="text-lg md:text-[22px] font-medium leading-tight md:leading-[32px] text-right mb-4 md:mb-6"
                    style={{ 
                        color: '#484848',
                        fontFamily: 'Heebo'
                    }}
                >
                    תזכורות, מועדים ופגישות
                </h2>
                
                <hr style={{ border: '1px solid #D9D9D9' }} className="mb-4 md:mb-8" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-16 gap-y-3 md:gap-y-6">
                    {appointments.slice(0, 8).map((appointment, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-0 py-2 md:py-0 border-b md:border-b-0 border-gray-100 last:border-b-0">
                            <span 
                                className="text-xs md:text-[15px] leading-tight md:leading-[22px] order-2 md:order-1"
                                style={{ 
                                    color: '#858C94',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                {new Date(appointment.date).toLocaleDateString('he-IL')}
                            </span>
                            <span 
                                className="text-sm md:text-[16px] leading-tight md:leading-[24px] text-right font-medium md:font-normal order-1 md:order-2"
                                style={{ 
                                    color: '#000000',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                {appointment.title}
                            </span>
                        </div>
                    ))}
                     {appointments.length === 0 && (
                        <p className="col-span-2 text-center text-gray-500">אין פגישות או תזכורות להצגה.</p>
                    )}
                </div>
            </div>

            {/* AI Text Generator Card */}
            <div className="dashboard-card p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #E6F3FF 0%, #F0F8FF 100%)' }}>
                {/* AI Label */}
                <div className="mb-3 md:mb-4">
                    <div className="text-left">
                        <span 
                            className="text-2xl md:text-[32px] font-bold"
                            style={{ 
                                color: '#4A5568',
                                fontFamily: 'Heebo'
                            }}
                        >
                            AI
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h2 
                    className="text-base md:text-[18px] font-medium leading-tight md:leading-[26px] text-right mb-4 md:mb-6"
                    style={{ 
                        color: '#2D3748',
                        fontFamily: 'Heebo'
                    }}
                >
                    מחולל ועורך טקסט
                </h2>

                {/* Dropdown for document type */}
                <div className="mb-3 md:mb-4">
                    <div className="relative">
                        <select 
                            value={selectedPromptId}
                            onChange={(e) => setSelectedPromptId(e.target.value)}
                            className="w-full p-2.5 md:p-3 rounded-lg border border-gray-200 bg-white text-right appearance-none text-sm md:text-base"
                            style={{ 
                                fontFamily: 'Heebo',
                                color: '#4A5568'
                            }}
                        >
                            {(prompts || []).map((prompt) => (
                                <option key={prompt.id} value={prompt.id}>
                                    {prompt.category_name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Text input field */}
                <div className="mb-4 md:mb-6">
                    <textarea
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                        placeholder="מה ברצונך לנסח? (לדוגמה: מכתב דרישה לביטול עסקה בגלל איחור באספקה)"
                        className="w-full p-3 md:p-4 rounded-lg border border-gray-200 bg-white text-right h-20 md:h-20 resize-none text-sm md:text-base"
                        style={{ 
                            fontFamily: 'Heebo'
                        }}
                        required
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mb-4 md:mb-6">
                    <button 
                        onClick={handleGenerate}
                        disabled={!requestText.trim() || isLoading}
                        className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-[14px] font-medium text-white disabled:opacity-50 touch-manipulation"
                        style={{ 
                            background: '#67BF91',
                            fontFamily: 'Heebo'
                        }}
                    >
                        {isLoading ? 'מעבד...' : 'עיבוד'}
                    </button>
                </div>

                {/* Generated text output */}
                {generatedText && (
                    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 text-gray-600 hover:text-gray-800"
                                    title="העתק"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={exportAsFile}
                                    className="p-2 text-gray-600 hover:text-gray-800"
                                    title="ייצוא כקובץ"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                            <span 
                                className="text-sm font-medium"
                                style={{ 
                                    color: '#4A5568',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                הטקסט שנוצר:
                            </span>
                        </div>
                        <div 
                            className="text-right whitespace-pre-wrap text-sm leading-relaxed max-h-60 overflow-y-auto"
                            style={{ 
                                fontFamily: 'Heebo',
                                color: '#2D3748'
                            }}
                        >
                            {generatedText}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}