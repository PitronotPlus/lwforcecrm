import React, { useState, useEffect } from "react";
import { ClientActivityLog } from "@/entities/ClientActivityLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight } from "lucide-react";

export default function ClientActivityLogComponent({ client }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [client.id]);

    const loadActivities = async () => {
        try {
            const data = await ClientActivityLog.filter({ client_id: client.id });
            setActivities(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error("שגיאה בטעינת לוג פעילות:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityColor = (type) => {
        const colors = {
            'נוצר': 'bg-green-100 text-green-800',
            'עודכן': 'bg-blue-100 text-blue-800',
            'שינוי סטטוס': 'bg-purple-100 text-purple-800',
            'משימה נוספה': 'bg-yellow-100 text-yellow-800',
            'אינטרקציה': 'bg-orange-100 text-orange-800',
            'מסמך הועלה': 'bg-pink-100 text-pink-800',
            'תשלום': 'bg-emerald-100 text-emerald-800',
            'פגישה נקבעה': 'bg-indigo-100 text-indigo-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Heebo' }}>
                    <Activity className="w-5 h-5" />
                    לוג פעילות ({activities.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>טוען היסטוריה...</p>
                ) : activities.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {activities.map(activity => (
                            <div key={activity.id} className="p-3 bg-gray-50 rounded-lg border-r-2 border-gray-300">
                                <div className="flex items-start justify-between mb-1">
                                    <Badge className={getActivityColor(activity.activity_type)}>
                                        {activity.activity_type}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                        {new Date(activity.created_date).toLocaleString('he-IL')}
                                    </span>
                                </div>
                                <p className="text-sm mb-1">{activity.description}</p>
                                {activity.field_changed && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded">
                                        <span className="font-medium">{activity.field_changed}:</span>
                                        <span className="line-through">{activity.old_value}</span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span className="font-medium text-blue-600">{activity.new_value}</span>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    בוצע על ידי: {activity.performed_by}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">אין פעילות מתועדת</p>
                )}
            </CardContent>
        </Card>
    );
}