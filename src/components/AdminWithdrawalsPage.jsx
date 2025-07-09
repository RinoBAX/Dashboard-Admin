import React, { useState, useEffect, useCallback } from 'react';

const LoadingComponent = () => (
    <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading Withdrawals...</p>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={handlePrev} disabled={currentPage === 1} className="button button-secondary disabled:opacity-50">
                Previous
            </button>
            <span className="text-gray-400">
                Page {currentPage} of {totalPages}
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages} className="button button-secondary disabled:opacity-50">
                Next
            </button>
        </div>
    );
};

const AdminWithdrawalsPage = ({ request }) => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchWithdrawals = useCallback(async (pageToFetch) => {
        setIsLoading(true);
        try {
            const endpoint = `/superadmin/withdrawals?status=${filter}&page=${pageToFetch}&pageSize=10`;
            const response = await request(endpoint);
            setWithdrawals(response.data || []);
            setPagination(response.pagination || null);
        } catch (error) {
            console.error("Failed to fetch withdrawals", error);
            alert(`Failed to fetch withdrawals: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [request, filter]);

    useEffect(() => {
        setCurrentPage(1);
        fetchWithdrawals(1);
    }, [filter]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchWithdrawals(newPage);
    };

    const handleApprove = async (withdrawalId) => {
        if (window.confirm(`Are you sure you want to approve withdrawal ID: ${withdrawalId}?`)) {
            try {
                await request(`/superadmin/withdrawals/${withdrawalId}/approve`, 'PUT');
                fetchWithdrawals(currentPage);
            } catch (error) {
                alert(`Failed to approve withdrawal: ${error.message}`);
            }
        }
    };

    const handleReject = async (withdrawalId) => {
        const reason = prompt("Please provide a reason for rejection (optional):");
        if (reason !== null) {
            try {
                await request(`/superadmin/withdrawals/${withdrawalId}/reject`, 'PUT', { reason });
                fetchWithdrawals(currentPage);
            } catch (error) {
                alert(`Failed to reject withdrawal: ${error.message}`);
            }
        }
    };

    const renderStatusBadge = (status) => {
        const statusMap = {
            APPROVED: 'bg-green-500',
            REJECTED: 'bg-red-500',
            PENDING: 'bg-yellow-500',
        };
        return <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${statusMap[status]}`}>{status}</span>;
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Withdrawal Review</h1>
                    <p>Approve or reject user withdrawal requests.</p>
                </div>
                <div className="form-group">
                    <label htmlFor="withdrawal-status-filter" className="sr-only">Filter by status</label>
                    <select 
                        id="withdrawal-status-filter"
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)} 
                        className="form-select"
                    >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>
            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Requested At</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="text-center p-8"><div className="loader mx-auto"></div></td></tr>
                        ) : withdrawals.length > 0 ? withdrawals.map(withdrawal => (
                            <tr key={withdrawal.id}>
                                <td>{withdrawal.user?.nama || 'N/A'}</td>
                                <td>Rp {Number(withdrawal.totalWithdrawal).toLocaleString('id-ID')}</td>
                                <td>{new Date(withdrawal.tglDiajukan).toLocaleString()}</td>
                                <td>{renderStatusBadge(withdrawal.status)}</td>
                                <td className="table-actions">
                                    {withdrawal.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleApprove(withdrawal.id)} className="button button-sm button-approve">Approve</button>
                                            <button onClick={() => handleReject(withdrawal.id)} className="button button-sm button-reject">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem' }}>No withdrawals found for this filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {pagination && <Pagination {...pagination} onPageChange={handlePageChange} />}
        </div>
    );
};

export default AdminWithdrawalsPage;
