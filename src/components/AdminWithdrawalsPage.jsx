import React, { useState, useEffect, useCallback } from 'react';

// Komponen Tambahan (bisa dipisah ke file sendiri)
const LoadingComponent = () => (
    <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading Withdrawals...</p>
    </div>
);

// Komponen Utama Halaman Review Penarikan Dana
const AdminWithdrawalsPage = ({ token }) => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Hook kustom untuk melakukan panggilan API
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

    // Fungsi untuk mengambil data penarikan yang pending
    const fetchWithdrawals = useCallback(async () => {
        setIsLoading(true);
        try {
            // CATATAN: Pastikan Anda sudah membuat endpoint GET /api/superadmin/withdrawals di backend
            const data = await request('/superadmin/withdrawals?status=PENDING');
            setWithdrawals(data || []);
        } catch (error) {
            console.error("Failed to fetch withdrawals", error);
            alert(`Failed to fetch withdrawals: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    // Ambil data saat komponen pertama kali dimuat
    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    // Fungsi untuk menyetujui penarikan
    const handleApprove = async (withdrawalId) => {
        if (window.confirm(`Are you sure you want to approve withdrawal ID: ${withdrawalId}?`)) {
            try {
                await request(`/superadmin/withdrawals/${withdrawalId}/approve`, 'PUT');
                fetchWithdrawals(); // Muat ulang daftar
            } catch (error) {
                alert(`Failed to approve withdrawal: ${error.message}`);
            }
        }
    };

    // Fungsi untuk menolak penarikan
    const handleReject = async (withdrawalId) => {
        const reason = prompt("Please provide a reason for rejection (optional):");
        if (reason !== null) { // Lanjutkan jika pengguna menekan OK (bahkan jika alasan kosong)
            try {
                // CATATAN: Pastikan Anda sudah membuat endpoint PUT /api/superadmin/withdrawals/{id}/reject di backend
                await request(`/superadmin/withdrawals/${withdrawalId}/reject`, 'PUT', { reason });
                fetchWithdrawals(); // Muat ulang daftar
            } catch (error) {
                alert(`Failed to reject withdrawal: ${error.message}`);
            }
        }
    };

    if (isLoading) return <LoadingComponent />;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Withdrawal Review</h1>
                    <p>Approve or reject user withdrawal requests.</p>
                </div>
            </div>
            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Requested At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {withdrawals.length > 0 ? withdrawals.map(withdrawal => (
                            <tr key={withdrawal.id}>
                                <td>{withdrawal.user?.nama || 'N/A'}</td>
                                <td>Rp {Number(withdrawal.totalWithdrawal).toLocaleString('id-ID')}</td>
                                <td>{new Date(withdrawal.tglDiajukan).toLocaleString()}</td>
                                <td className="table-actions">
                                    <button onClick={() => handleApprove(withdrawal.id)} className="button button-sm button-approve">Approve</button>
                                    <button onClick={() => handleReject(withdrawal.id)} className="button button-sm button-reject">Reject</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem' }}>No pending withdrawals to review.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminWithdrawalsPage;
