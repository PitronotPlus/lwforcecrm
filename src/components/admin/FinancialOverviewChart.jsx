import { useState, useEffect } from 'react';
import { CreditTransaction } from '@/entities/CreditTransaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function FinancialOverviewChart() {
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const transactions = await CreditTransaction.filter({ type: 'purchase' });
                const revenueByMonth = transactions.reduce((acc, transaction) => {
                    const month = format(new Date(transaction.created_date), 'yyyy-MM');
                    const revenue = transaction.cost_usd || 0;
                    if (!acc[month]) {
                        acc[month] = 0;
                    }
                    acc[month] += revenue;
                    return acc;
                }, {});

                const chartData = Object.keys(revenueByMonth)
                    .map(month => ({
                        name: month,
                        revenue: revenueByMonth[month].toFixed(2),
                    }))
                    .sort((a, b) => new Date(a.name) - new Date(b.name));

                setMonthlyRevenue(chartData);
            } catch (error) {
                console.error("Failed to fetch revenue data:", error);
            }
        };

        fetchRevenueData();
    }, []);

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>סקירת הכנסות חודשית (ממכירת קרדיטים)</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip formatter={(value) => [`$${value}`, 'הכנסה']} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3568AE" name="הכנסה (USD)" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}