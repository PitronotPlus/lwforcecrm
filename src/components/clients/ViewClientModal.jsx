import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ViewClientModal({ client, children }) {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            'ליד': 'bg-blue-100 text-blue-800',
            'פולואפ': 'bg-yellow-100 text-yellow-800',
            'לקוח': 'bg-green-100 text-green-800',
            'לא נסגר': 'bg-red-100 text-red-800',
            'יקר עבורו': 'bg-orange-100 text-orange-800',
            'נתפס לפני שטופל': 'bg-purple-100 text-purple-800',
            'לא רלוונטי': 'bg-gray-100 text-gray-800'
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
                        פרטי לקוח
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* סטטוס */}
                    <div className="flex items-center gap-2 pb-4 border-b">
                        <div className="text-sm font-medium text-gray-700">סטטוס:</div>
                        <Badge className={getStatusColor(client.status)}>
                            {client.status}
                        </Badge>
                    </div>

                    {/* פרטים בסיסיים */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">שם מלא</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {client.full_name || '-'}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">טלפון</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {client.phone || '-'}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">אימייל</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {client.email || '-'}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">סוג שירות</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {client.service_type || '-'}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">צורך ראשוני</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {client.initial_need || '-'}
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">מקור הגעה</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                {client.source || '-'}
                            </div>
                        </div>
                    </div>

                    {/* הערות */}
                    {client.notes && (
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">הערות</div>
                            <div className="text-base p-3 bg-gray-50 rounded-lg whitespace-pre-wrap" style={{ fontFamily: 'Heebo' }}>
                                {client.notes}
                            </div>
                        </div>
                    )}

                    {/* תאריך יצירה */}
                    <div className="space-y-1 pt-4 border-t">
                        <div className="text-sm font-medium text-gray-700">תאריך יצירה</div>
                        <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                            {new Date(client.created_date).toLocaleDateString('he-IL')} {new Date(client.created_date).toLocaleTimeString('he-IL')}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}