import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Link2, X } from 'lucide-react';

export default function SendModal({ template, leads, onSend, onCreateLink, onCancel }) {
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);

    const handleSendEmail = async () => {
        if (!selectedLeadId) {
            alert('יש לבחור לקוח');
            return;
        }

        setIsSending(true);
        try {
            await onSend(template.id, selectedLeadId, 'email');
        } finally {
            setIsSending(false);
        }
    };

    const handleCreateLink = async () => {
        if (!selectedLeadId) {
            alert('יש לבחור לקוח');
            return;
        }

        setIsCreatingLink(true);
        try {
            const link = await onCreateLink(template.id, selectedLeadId);
            setGeneratedLink(link);
        } catch (error) {
            alert('שגיאה ביצירת הקישור: ' + error.message);
        } finally {
            setIsCreatingLink(false);
        }
    };

    const handleCopyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            alert('הקישור הועתק!');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
                <div className="p-4 sm:p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">שלח מסמך לחתימה</h3>
                        <Button variant="ghost" size="icon" onClick={onCancel}>
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">תבנית:</h4>
                        <p className="text-xs sm:text-sm text-blue-800">{template.name}</p>
                    </div>

                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium mb-2">בחר לקוח:</label>
                        <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                            <SelectTrigger>
                                <SelectValue placeholder="בחר לקוח מהרשימה" />
                            </SelectTrigger>
                            <SelectContent>
                                {leads.map(lead => (
                                    <SelectItem key={lead.id} value={lead.id}>
                                        {lead.first_name} {lead.last_name} ({lead.email || 'אין מייל'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {generatedLink ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4">
                            <p className="text-sm font-semibold text-green-900 mb-2">קישור נוצר בהצלחה!</p>
                            <div className="bg-white p-2 rounded border border-green-300 mb-3 break-all text-xs sm:text-sm">
                                {generatedLink}
                            </div>
                            <Button onClick={handleCopyLink} variant="outline" size="sm" className="w-full">
                                העתק קישור
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            <Button 
                                onClick={handleSendEmail}
                                disabled={isSending || !selectedLeadId}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 h-auto"
                            >
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 flex-shrink-0" />
                                <div className="text-right">
                                    <div className="font-semibold text-sm sm:text-base">
                                        {isSending ? 'שולח...' : 'שלח במייל'}
                                    </div>
                                    <div className="text-xs sm:text-sm opacity-90">שליחה אוטומטית למייל הלקוח</div>
                                </div>
                            </Button>

                            <Button 
                                onClick={handleCreateLink}
                                disabled={isCreatingLink || !selectedLeadId}
                                variant="outline"
                                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 py-3 sm:py-4 h-auto"
                            >
                                <Link2 className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 flex-shrink-0" />
                                <div className="text-right">
                                    <div className="font-semibold text-sm sm:text-base">
                                        {isCreatingLink ? 'יוצר קישור...' : 'צור קישור'}
                                    </div>
                                    <div className="text-xs sm:text-sm opacity-70">לשיתוף בווטסאפ או SMS</div>
                                </div>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-4 sm:p-6 border-t bg-gray-50">
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        סגור
                    </Button>
                </div>
            </div>
        </div>
    );
}