import React, { useMemo } from 'react';

// Ikon yang dibutuhkan untuk navigasi
const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    projects: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    submissions: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    withdrawals: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
};

const Sidebar = ({ user, setPage, currentPage, handleLogout }) => {
    // Daftar item navigasi beserta peran yang diizinkan
    const navItems = useMemo(() => [
        { name: 'Dashboard', icon: ICONS.dashboard, page: 'dashboard', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Projects', icon: ICONS.projects, page: 'projects', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Users', icon: ICONS.users, page: 'users', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Submissions', icon: ICONS.submissions, page: 'submissions', roles: ['ADMIN'] },
        { name: 'Withdrawals', icon: ICONS.withdrawals, page: 'withdrawals', roles: ['SUPER_ADMIN'] },
    ], []);

    return (
        <aside className="sidebar glass-panel">
            <h2 className="sidebar-header">TheBaxLancer</h2>
            <div className="sidebar-profile">
                <img 
                    src={user.picture || `https://ui-avatars.com/api/?name=${user.nama}&background=0d0c38&color=00f6ff`} 
                    alt="avatar" 
                />
                <h4>{user.nama}</h4>
                <p>{user.role}</p>
            </div>
            <div className="sidebar-nav">
                <nav>
                    {navItems
                        // Filter item navigasi berdasarkan peran pengguna
                        .filter(item => item.roles.includes(user.role))
                        // Tampilkan item yang sudah difilter
                        .map(item => (
                            <button 
                                key={item.name} 
                                onClick={() => setPage(item.page)} 
                                className={`nav-item ${currentPage === item.page ? 'nav-item-active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </button>
                        ))}
                </nav>
                <button onClick={handleLogout} className="nav-item logout-button">
                    {ICONS.logout}
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
