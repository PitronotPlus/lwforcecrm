import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileText, AlertCircle } from "lucide-react";

export default function ObjectStudio() {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEntities();
    }, []);

    const loadEntities = async () => {
        try {
            // נקבל רשימת כל ה-entities שקיימות במערכת
            const entityNames = [
                'Client', 'Case', 'Task', 'Appointment', 'Financial',
                'Integration', 'Lead', 'ClientInteraction', 'ClientDocument',
                'ClientActivityLog', 'Permission', 'SubAccount', 'User'
            ];
            
            const entityList = entityNames.map(name => ({
                name,
                type: 'מובנה',
                canEdit: !['User'].includes(name)
            }));
            
            setEntities(entityList);
        } catch (error) {
            console.error("שגיאה בטעינת entities:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">טוען...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Heebo' }}>
                        <Database className="w-6 h-6 text-[#3568AE]" />
                        הגדרת רשומות מערכת
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold mb-2" style={{ fontFamily: 'Heebo' }}>
                                    תכונה מתקדמת בפיתוח
                                </h3>
                                <p className="text-sm text-gray-700 mb-2">
                                    עריכת מבנה הרשומות (Entities) תהיה זמינה בגרסה הבאה.
                                </p>
                                <p className="text-sm text-gray-600">
                                    כרגע, ניתן לערוך את הגדרות הרשומות דרך קבצי ה-JSON שנמצאים בתיקיית entities/
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-right p-4 font-bold text-sm">שם רשומה</th>
                                    <th className="text-right p-4 font-bold text-sm">סוג</th>
                                    <th className="text-right p-4 font-bold text-sm">ניתן לעריכה</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entities.map((entity, index) => (
                                    <tr key={index} className="border-t hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium">{entity.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-600">{entity.type}</span>
                                        </td>
                                        <td className="p-4">
                                            {entity.canEdit ? (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    כן
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    לא
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle style={{ fontFamily: 'Heebo' }}>
                        📖 מדריך מהיר - עריכת Entities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-bold mb-2">איך מוסיפים שדה חדש לרשומה קיימת:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-gray-700 mr-4">
                                <li>פתח את הקובץ המתאים בתיקיית entities/ (למשל: entities/Client.json)</li>
                                <li>הוסף את השדה החדש בתוך ה-properties</li>
                                <li>הגדר את הסוג (type), תיאור (description) ואם השדה חובה (required)</li>
                                <li>שמור את הקובץ - השינוי ייכנס לתוקף מיד</li>
                            </ol>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-bold mb-2">דוגמה:</h4>
                            <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto" style={{ direction: 'ltr', textAlign: 'left' }}>
{`"new_field": {
  "type": "string",
  "description": "תיאור השדה החדש"
}`}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}