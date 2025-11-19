import { useState, useEffect } from "react";
import { Client } from "@/entities/Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend as PieLegend } from 'recharts';
import { Users, Target, BarChart3, Mail } from 'lucide-react';

export default function Marketing() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await Client.list();
            setClients(data);
        } catch (error) {
            console.error("Failed to load clients:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // Prepare data for charts
    const sourceData = clients.reduce((acc, client) => {
        const source = client.source || "לא ידוע";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {});

    const chartSourceData = Object.keys(sourceData).map(key => ({ name: key, value: sourceData[key] }));

    const COLORS = ['#3568AE', '#67BF91', '#F7B84B', '#A9A9A9', '#8884d8'];

    const campaignData = clients.reduce((acc, client) => {
        const campaign = client.utm_campaign || "לא ידוע";
        acc[campaign] = (acc[campaign] || 0) + 1;
        return acc;
    }, {});
    
    const chartCampaignData = Object.keys(campaignData).map(key => ({ name: key, leads: campaignData[key] }));

    if (loading) return <div className="p-8">טוען נתונים...</div>;

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-[1315px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                     <h1 
                        className="text-[32px] font-bold"
                        style={{ 
                            color: '#3568AE',
                            fontFamily: 'Heebo'
                        }}
                    >
                        שיווק ומכירות
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">סך הכל לידים</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{clients.length}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">לידים מפייסבוק</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sourceData['שיווק פייסבוק'] || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">לידים מגוגל</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sourceData['שיווק גוגל'] || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">יחס המרה (דמו)</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">15.2%</div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>מקורות הגעה</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={chartSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {chartSourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <PieLegend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>ביצועי קמפיינים</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartCampaignData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="leads" fill="#3568AE" name="לידים" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}