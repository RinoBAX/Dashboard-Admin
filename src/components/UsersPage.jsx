import React, { useState, useEffect, useCallback } from 'react';


const LoadingComponent = () => (
    <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading Users...</p>
    </div>
);
const UsersPage = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const useApi = (token) => {
        return useCallback(async (endpoint, method = 'GET', body = null) => {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const url = `${API_BASE_URL}${endpoint}`;
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const options = { method, headers, ...(body && { body: JSON.stringify(body) }) };
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'An error occurred');
            return data;
        }, [token]);
    };
    const request = useApi(token);
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await request('/admin/users');
            setUsers(data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
            alert(`Failed to fetch users: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [request]);
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    const handleApprove = async (userId) => {
        if (window.confirm(`Are you sure you want to approve user ID: ${userId}?`)) {
            try {
                await request(`/admin/users/${userId}/approve`, 'PUT');
                fetchUsers();
            } catch (error) {
                alert(`Failed to approve user: ${error.message}`);
            }
        }
    };
    const handleReject = async (userId) => {
        if (window.confirm(`Are you sure you want to reject user ID: ${userId}? This action might be irreversible.`)) {
            try {
                await request(`/admin/users/${userId}/reject`, 'PUT');
                fetchUsers();
            } catch (error) {
                alert(`Failed to reject user: ${error.message}`);
            }
        }
    };
    const filteredUsers = users.filter(user => {
        if (filter === 'ALL') return true;
        return user.statusRegistrasi === filter;
    });

    if (isLoading) return <LoadingComponent />;

    return (
        <div>
            <style>{`
                .filter-buttons { display: flex; gap: 0.5rem; }
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 500; text-transform: uppercase; }
                .status-pending { background-color: #f59e0b; color: white; }
                .status-approved { background-color: #22c55e; color: white; }
                .status-rejected { background-color: #ef4444; color: white; }
            `}</style>

            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Approve, reject, and manage all registered users.</p>
                </div>
                <div className="filter-buttons">
                    <button onClick={() => setFilter('ALL')} className={`button ${filter === 'ALL' ? 'button-primary' : 'button-secondary'}`}>All</button>
                    <button onClick={() => setFilter('PENDING')} className={`button ${filter === 'PENDING' ? 'button-primary' : 'button-secondary'}`}>Pending</button>
                    <button onClick={() => setFilter('APPROVED')} className={`button ${filter === 'APPROVED' ? 'button-primary' : 'button-secondary'}`}>Approved</button>
                    <button onClick={() => setFilter('REJECTED')} className={`button ${filter === 'REJECTED' ? 'button-primary' : 'button-secondary'}`}>Rejected</button>
                </div>
            </div>
            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Balance</th>
                            <th className="text-center">Total Submissions</th>
                            <th>Registration Status</th>
                            <th>Registered At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <img src={user.picture || `https://ui-avatars.com/api/?name=${user.nama}&background=1a1a2e&color=00f6ff`} alt={user.nama} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                        <div>
                                            <p className="font-semibold text-white">{user.nama}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.role}</td>
                                <td>Rp {Number(user.balance).toLocaleString('id-ID')}</td>
                                <td className="text-center font-bold text-lg">
                                    {user.submissions?.length || 0}
                                </td>
                                <td>
                                    <span className={`status-badge status-${user.statusRegistrasi?.toLowerCase()}`}>
                                        {user.statusRegistrasi}
                                    </span>
                                </td>
                                <td>{new Date(user.tglDibuat).toLocaleDateString()}</td>
                                <td className="table-actions">
                                    {user.statusRegistrasi === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleApprove(user.id)} className="button button-sm button-approve">Approve</button>
                                            <button onClick={() => handleReject(user.id)} className="button button-sm button-reject">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem' }}>No users found for this filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;
