import React, { useState, useEffect } from "react";
import { Financial } from "@/entities/Financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import CreateFinancialRecordModal from "../finances/CreateFinancialRecordModal";

export default function ClientFinances({ client }) {
    const [finances, setFinances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFinances();
    }, [client.id]);

    const loadFinances = async () => {
        try {
            const allFinances = await Financial.list('-date');
            const clientFinances = allFinances.filter(f => 
                f.client_name === client.full_name
            );
            setFinances(clientFinances);
        } catch (error) {
            console.error("שגיאה בטעינת נתונים כספיים:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalIncome = finances
        .filter(f => f.type === 'הכנסה')
        .reduce((sum, f) => sum + (f.amount || 0), 0);

    const totalExpense = finances
        .filter(f => f.type === 'הוצאה')
        .reduce((sum, f) => sum + (f.amount || 0), 0);

    const balance = totalIncome - totalExpense;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ fontFamily: 'Heebo' }}>מידע כספי</CardTitle>
                <CreateFinancialRecordModal 
                    clientName={client.full_name}
                    onRecordCreated={loadFinances}
                >
                    <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                        <Plus className="ml-2 w-4 h-4" />
                        הוסף רשומה
                    </Button>
                </CreateFinancialRecordModal>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* סיכום כספי */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-600">הכנסות</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            ₪{totalIncome.toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-gray-600">הוצאות</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                            ₪{totalExpense.toLocaleString()}
                        </p>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className={`w-4 h-4 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                            <span className="text-sm text-gray-600">מאזן</span>
                        </div>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            ₪{balance.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* רשימת רשומות */}
                {loading ? (
                    <p>טוען נתונים...</p>
                ) : finances.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {finances.map(record => (
                            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium">{record.description}</p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline">{record.category}</Badge>
                                        <span className="text-xs text-gray-500">
                                            {new Date(record.date).toLocaleDateString('he-IL')}
                                        </span>
                                    </div>
                                </div>
                                <p className={`text-lg font-bold ${record.type === 'הכנסה' ? 'text-green-600' : 'text-red-600'}`}>
                                    {record.type === 'הכנסה' ? '+' : '-'}₪{record.amount.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">אין רשומות כספיות</p>
                )}
            </CardContent>
        </Card>
    );
}