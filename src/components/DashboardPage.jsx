import React from 'react';

// Komponen ini sekarang berada di file terpisah.
// Semua logika dan tampilan untuk halaman dashboard ada di sini.

const DashboardPage = () => {
    // Data statis untuk contoh tampilan
    const stats = [
        { name: 'Total Users', value: '1,204', change: '+12%', changeType: 'positive' },
        { name: 'Pending Submissions', value: '82', change: '+5.4%', changeType: 'positive' },
        { name: 'Pending Withdrawals', value: '12', change: '-2.1%', changeType: 'negative' },
        { name: 'Projects Active', value: '25', change: '+2', changeType: 'positive' }
    ];

    return (
        <div>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Welcome back! Here's a summary of the platform.</p>
            </div>
            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.name} className="stat-card glass-panel">
                        <div>
                            <p>{stat.name}</p>
                            <p>{stat.value}</p>
                        </div>
                        <div className={`stat-change stat-change--${stat.changeType}`}>{stat.change} vs last month</div>
                    </div>
                ))}
            </div>
            <div className="placeholder-notice glass-panel mt-8">
                <p>Area ini dapat diisi dengan grafik atau data penting lainnya di masa mendatang.</p>
            </div>
        </div>
    );
};

export default DashboardPage;
