import React, { useState, useEffect } from "react";
import { Financial } from "@/entities/Financial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, TrendingDown, DollarSign, BarChart3, Edit, Trash2 } from 'lucide-react';
import CreateFinancialRecordModal from "../components/finances/CreateFinancialRecordModal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Finances() {
    const [records, setRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const { base44 } = await import("@/api/base44Client");
            const user = await base44.auth.me();
            
            // Admin רואה הכל, אחרים רואים רק מהמשרד שלהם
            let data;
            if (user.role === 'admin') {
                data = await Financial.list('-date');
            } else if (user.sub_account_id) {
                data = await Financial.filter({ sub_account_id: user.sub_account_id }, '-date');
            } else {
                // עצמאי - רואה רק שלו
                data = await Financial.filter({ created_by: user.email }, '-date');
            }
            
            setRecords(data);
        } catch (error) {
            console.error('שגיאה בטעינת רישומים כספיים:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(record =>
        record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // חישובי סטטיסטיקות
    const totalIncome = records.filter(r => r.type === 'הכנסה').reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records.filter(r => r.type === 'הוצאה').reduce((sum, r) => sum + r.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // נתונים לגרפים
    const categoryData = records.reduce((acc, record) => {
        const key = record.category;
        if (!acc[key]) {
            acc[key] = { income: 0, expenses: 0 };
        }
        if (record.type === 'הכנסה') {
            acc[key].income += record.amount;
        } else {
            acc[key].expenses += record.amount;
        }
        return acc;
    }, {});

    const chartData = Object.entries(categoryData).map(([category, data]) => ({
        name: category,
        הכנסות: data.income,
        הוצאות: data.expenses
    }));

    const pieData = Object.entries(categoryData)
        .filter(([_, data]) => data.income > 0)
        .map(([category, data]) => ({
            name: category,
            value: data.income
        }));

    const COLORS = ['#3568AE', '#67BF91', '#F7B84B', '#E74C3C', '#9B59B6'];

    const getTypeColor = (type) => {
        return type === 'הכנסה' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
                <div className="max-w-6xl mx-auto text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                    <p style={{ fontFamily: 'Heebo', color: '#858C94' }}>טוען נתונים כספיים...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-full md:max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
                    <h1 
                        className="text-2xl md:text-[32px] font-bold"
                        style={{ 
                            color: '#3568AE',
                            fontFamily: 'Heebo'
                        }}
                    >
                        ניהול כספים
                    </h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:max-w-sm">
                            <Input
                                placeholder="חיפוש לפי תיאור, לקוח, קטגוריה"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <CreateFinancialRecordModal onRecordCreated={loadRecords} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">סך הכנסות</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ₪{totalIncome.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">סך הוצאות</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                ₪{totalExpenses.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">רווח נקי</CardTitle>
                            <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₪{netProfit.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">סך רישומים</CardTitle>
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {records.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>הכנסות ויוצאות לפי קטגוריה</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₪${value.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="הכנסות" fill="#67BF91" />
                                    <Bar dataKey="הוצאות" fill="#E74C3C" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>חלוקת הכנסות</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie 
                                        data={pieData} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={100} 
                                        fill="#8884d8" 
                                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₪${value.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Records Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>רישומים כספיים</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right min-w-[800px]">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2 md:p-4 font-medium text-sm md:text-base">תאריך</th>
                                        <th className="p-2 md:p-4 font-medium text-sm md:text-base">תיאור</th>
                                        <th className="p-2 md:p-4 font-medium text-sm md:text-base">סוג</th>
                                        <th className="p-2 md:p-4 font-medium text-sm md:text-base hidden md:table-cell">קטגוריה</th>
                                        <th className="p-2 md:p-4 font-medium text-sm md:text-base">סכום</th>
                                        <th className="p-2 md:p-4 font-medium text-sm md:text-base hidden sm:table-cell">לקוח</th>
                                        <th className="p-2 md:p-4 font-medium text-sm md:text-base">פעולות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map(record => (
                                        <tr key={record.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2 md:p-4 text-xs md:text-sm">
                                                {new Date(record.date).toLocaleDateString('he-IL')}
                                            </td>
                                            <td className="p-2 md:p-4 text-sm md:text-base">{record.description}</td>
                                            <td className="p-2 md:p-4">
                                                <Badge className={getTypeColor(record.type)}>
                                                    {record.type}
                                                </Badge>
                                            </td>
                                            <td className="p-2 md:p-4 text-sm md:text-base hidden md:table-cell">{record.category}</td>
                                            <td className={`p-2 md:p-4 font-bold text-sm md:text-base ${record.type === 'הכנסה' ? 'text-green-600' : 'text-red-600'}`}>
                                                {record.type === 'הכנסה' ? '+' : '-'}₪{record.amount.toLocaleString()}
                                            </td>
                                            <td className="p-2 md:p-4 text-sm md:text-base hidden sm:table-cell">{record.client_name || '-'}</td>
                                            <td className="p-2 md:p-4">
                                                <div className="flex gap-1">
                                                    <CreateFinancialRecordModal 
                                                        onRecordCreated={loadRecords} 
                                                        recordToEdit={record}
                                                        trigger={
                                                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        }
                                                    />
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={async () => {
                                                            if (window.confirm('האם אתה בטוח שברצונך למחוק רישום זה?')) {
                                                                await Financial.delete(record.id);
                                                                loadRecords();
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredRecords.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">לא נמצאו רישומים כספיים.</p>
                                <CreateFinancialRecordModal onRecordCreated={loadRecords} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}