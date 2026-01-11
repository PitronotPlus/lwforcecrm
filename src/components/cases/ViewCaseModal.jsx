import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ExternalLink } from "lucide-react";

export default function ViewCaseModal({ caseItem, children }) {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            'פעיל': 'bg-green-100 text-green-800',
            'סגור': 'bg-red-100 text-red-800',
            'בהמתנה': 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        פרטי תיק
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* סטטוס */}
                    <div className="flex items-center gap-2 pb-4 border-b">
                        <div className="text-sm font-medium text-gray-700">סטטוס:</div>
                        <Badge className={getStatusColor(caseItem.status)}>
                            {caseItem.status}
                        </Badge>
                    </div>

                    {/* פרטים בסיסיים */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">כותרת התיק</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {caseItem.title || '-'}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">לקוח</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                <Link 
                                    to={`${createPageUrl('ClientDetails')}?id=${caseItem.client_id}`}
                                    className="text-[#3B7CDF] hover:underline flex items-center gap-1"
                                >
                                    {caseItem.client_name}
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">מספר תיק</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {caseItem.case_number || '-'}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">סוג התיק</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {caseItem.case_type || '-'}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">תאריך פתיחה</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {caseItem.opening_date ? new Date(caseItem.opening_date).toLocaleDateString('he-IL') : '-'}
                            </div>
                        </div>
                        
                        {caseItem.google_drive_link && (
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-700">קישור Google Drive</div>
                                <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                    <a 
                                        href={caseItem.google_drive_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[#3B7CDF] hover:underline flex items-center gap-1"
                                    >
                                        פתח ב-Drive
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* הערות */}
                    {caseItem.notes && (
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">הערות</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg whitespace-pre-wrap" style={{ fontFamily: 'Heebo' }}>
                                {caseItem.notes}
                            </div>
                        </div>
                    )}

                    {/* תאריך יצירה */}
                    <div className="space-y-1 pt-4 border-t">
                        <div className="text-sm font-medium text-gray-700">נוצר בתאריך</div>
                        <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                            {new Date(caseItem.created_date).toLocaleDateString('he-IL')} {new Date(caseItem.created_date).toLocaleTimeString('he-IL')}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}