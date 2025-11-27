import React, { useState, useEffect } from "react";
import { ClientInteraction } from "@/entities/ClientInteraction";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MessageCircle, Phone, Mail, User as UserIcon } from "lucide-react";
import { logClientActivity } from './activityLogger';

export default function ClientInteractions({ client }) {
    const [interactions, setInteractions] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newInteraction, setNewInteraction] = useState({
        interaction_type: 'שיחה',
        summary: '',
        notes: ''
    });

    useEffect(() => {
        loadInteractions();
        loadUser();
    }, [client.id]);

    const loadUser = async () => {
        try {
            const user = await base44.auth.me();
            setCurrentUser(user);
        } catch (error) {
            console.error("שגיאה בטעינת משתמש:", error);
        }
    };

    const loadInteractions = async () => {
        try {
            const data = await ClientInteraction.filter({ client_id: client.id });
            setInteractions(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error("שגיאה בטעינת אינטרקציות:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const performedBy = currentUser?.full_name || currentUser?.email || 'לא ידוע';
        try {
            await ClientInteraction.create({
                client_id: client.id,
                client_name: client.full_name,
                ...newInteraction,
                recorded_by: performedBy,
                interaction_date: new Date().toISOString()
            });

            // תיעוד בלוג פעילות
            await logClientActivity(
                client.id,
                'אינטרקציה',
                `תועדה אינטרקציה מסוג ${newInteraction.interaction_type}: ${newInteraction.summary}`,
                performedBy
            );

            setNewInteraction({ interaction_type: 'שיחה', summary: '', notes: '' });
            setShowForm(false);
            loadInteractions();
        } catch (error) {
            console.error("שגיאה בהוספת אינטרקציה:", error);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'שיחה': return <Phone className="w-4 h-4" />;
            case 'פגישה': return <UserIcon className="w-4 h-4" />;
            case 'אימייל': return <Mail className="w-4 h-4" />;
            default: return <MessageCircle className="w-4 h-4" />;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ fontFamily: 'Heebo' }}>תיעוד אינטרקציות ({interactions.length})</CardTitle>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                >
                    <Plus className="ml-2 w-4 h-4" />
                    {showForm ? 'ביטול' : 'תעד אינטרקציה'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {showForm && (
                    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-blue-50 rounded-lg">
                        <Select
                            value={newInteraction.interaction_type}
                            onValueChange={(value) => setNewInteraction({...newInteraction, interaction_type: value})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="שיחה">שיחה</SelectItem>
                                <SelectItem value="פגישה">פגישה</SelectItem>
                                <SelectItem value="אימייל">אימייל</SelectItem>
                                <SelectItem value="הודעה">הודעה</SelectItem>
                                <SelectItem value="אחר">אחר</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Input
                            placeholder="תקציר האינטרקציה"
                            value={newInteraction.summary}
                            onChange={(e) => setNewInteraction({...newInteraction, summary: e.target.value})}
                            required
                        />
                        
                        <Textarea
                            placeholder="הערות מפורטות (אופציונלי)"
                            value={newInteraction.notes}
                            onChange={(e) => setNewInteraction({...newInteraction, notes: e.target.value})}
                            rows={3}
                        />
                        
                        <div className="flex gap-2">
                            <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880]">שמור</Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>ביטול</Button>
                        </div>
                    </form>
                )}

                {interactions.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {interactions.map(interaction => (
                            <div key={interaction.id} className="p-4 bg-gray-50 rounded-lg border-r-4 border-blue-500">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getIcon(interaction.interaction_type)}
                                        <span className="font-medium">{interaction.interaction_type}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(interaction.interaction_date || interaction.created_date).toLocaleString('he-IL')}
                                    </span>
                                </div>
                                <p className="font-medium mb-2">{interaction.summary}</p>
                                {interaction.notes && (
                                    <p className="text-sm text-gray-600 mb-2">{interaction.notes}</p>
                                )}
                                <p className="text-xs text-gray-500">נרשם על ידי: {interaction.recorded_by}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">אין תיעודי אינטרקציות</p>
                )}
            </CardContent>
        </Card>
    );
}