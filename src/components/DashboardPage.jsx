import React from 'react';

const DashboardPage = () => {
    const stats = [
        { name: 'Total Users', value: '1,204', change: '+12%', changeType: 'positive' },
        { name: 'Pending Submissions', value: '82', change: '+5.4%', changeType: 'positive' },
        { name: 'Pending Withdrawals', value: '12', change: '-2.1%', changeType: 'negative' },
        { name: 'Projects Active', value: '25', change: '+2', changeType: 'positive' }
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's a summary of the platform.</p>
                </div>
            </div>
            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.name} className="stat-card glass-panel">
                        <div>
                            <p className="text-gray-400">{stat.name}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className={`stat-change stat-change--${stat.changeType}`}>{stat.change} vs last month</div>
                    </div>
                ))}
            </div>
            <div className="mt-8 p-6 glass-panel">
                <h3 className="text-xl font-semibold text-white mb-4">Activity Placeholder</h3>
                <p className="text-gray-400">Area ini dapat diisi dengan grafik atau data penting lainnya di masa mendatang, seperti grafik pertumbuhan pengguna atau aktivitas submission harian.</p>
            </div>
        </div>
    );
};

export default DashboardPage;
