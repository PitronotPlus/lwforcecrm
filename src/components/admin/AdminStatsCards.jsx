import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';

export default function AdminStatsCards({ users = [] }) {
    const activeUsers = users.filter(user => user.is_active).length;
    const inactiveUsers = users.filter(user => !user.is_active).length;
    const premiumUsers = users.filter(user => user.subscription_plan === 'premium').length;
    
    const stats = [
        {
            title: 'סך המשתמשים',
            value: users.length,
            icon: Users,
            color: '#3568AE',
            bgColor: '#E6F3FF'
        },
        {
            title: 'משתמשים פעילים',
            value: activeUsers,
            icon: UserCheck,
            color: '#67BF91',
            bgColor: '#E8F5E8'
        },
        {
            title: 'משתמשים לא פעילים', 
            value: inactiveUsers,
            icon: UserX,
            color: '#EF4444',
            bgColor: '#FEF2F2'
        },
        {
            title: 'מנויי פרימיום',
            value: premiumUsers,
            icon: TrendingUp,
            color: '#F59E0B',
            bgColor: '#FFFBEB'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div 
                    key={index}
                    className="bg-white rounded-[20px] p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: stat.bgColor }}
                        >
                            <stat.icon 
                                className="w-6 h-6"
                                style={{ color: stat.color }}
                            />
                        </div>
                        <div className="text-right">
                            <div 
                                className="text-[24px] font-bold"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                {stat.value}
                            </div>
                        </div>
                    </div>
                    <h3 
                        className="text-[14px] text-right"
                        style={{ 
                            color: '#858C94',
                            fontFamily: 'Heebo'
                        }}
                    >
                        {stat.title}
                    </h3>
                </div>
            ))}
        </div>
    );
}