import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function UserCharts({ users = [] }) {
    const planDistribution = users.reduce((acc, user) => {
        const plan = user.subscription_plan || 'לא ידוע';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
    }, {});

    const planData = Object.keys(planDistribution).map(key => ({
        name: key,
        value: planDistribution[key]
    }));

    const COLORS = ['#3568AE', '#67BF91', '#F7B84B', '#A9A9A9', '#8884d8'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>התפלגות מנויים</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={planData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {planData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}