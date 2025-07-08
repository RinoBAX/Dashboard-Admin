import React, { useState, useEffect, useCallback } from 'react';

// Komponen Tambahan
const LoadingComponent = () => (
    <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading Submissions...</p>
    </div>
);

const SubmissionDetailModal = ({ submission, onClose, onApprove, onReject }) => {
    if (!submission) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Review Submission (ID: {submission.id})</h2>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-400">User</p>
                        <p className="font-semibold">{submission.user?.nama || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Project</p>
                        <p className="font-semibold">{submission.project?.namaProyek || 'N/A'}</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mt-4 mb-2">Submitted Data:</h4>
                        <div className="p-4 rounded-lg bg-black bg-opacity-20 space-y-2">
                            {submission.values && submission.values.length > 0 ? (
                                submission.values.map(value => (
                                    <div key={value.id} className="border-b border-gray-700 pb-2 mb-2">
                                        <p className="font-semibold text-cyan-400">{value.projectField?.label || 'Unknown Field'}</p>
                                        {value.projectField?.fieldType === 'IMAGE' || value.projectField?.fieldType === 'FILE' ? (
                                            <a href={value.value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                                View File: {value.value}
                                            </a>
                                        ) : (
                                            <p className="text-white whitespace-pre-wrap break-words">{value.value}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No submitted data found.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="button button-secondary">Close</button>
                    <button onClick={() => onReject(submission.id)} className="button button-reject">Reject</button>
                    <button onClick={() => onApprove(submission.id)} className="button button-approve">Approve</button>
                </div>
            </div>
        </div>
    );
};


// Komponen Utama Halaman Review Submission
const AdminSubmissionsPage = ({ token }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // Default filter
    const [selectedSubmission, setSelectedSubmission] = useState(null);

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

    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = filter === 'ALL' ? '/admin/submissions' : `/admin/submissions?status=${filter}`;
            const data = await request(endpoint);
            setSubmissions(data || []);
        } catch (error) {
            console.error("Failed to fetch submissions", error);
            alert(`Failed to fetch submissions: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [request, filter]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleApprove = async (submissionId) => {
        if (window.confirm(`Are you sure you want to approve submission ID: ${submissionId}?`)) {
            try {
                await request(`/admin/submissions/${submissionId}/approve`, 'PUT');
                fetchSubmissions();
                setSelectedSubmission(null); // Tutup modal setelah aksi
            } catch (error) {
                alert(`Failed to approve submission: ${error.message}`);
            }
        }
    };

    const handleReject = async (submissionId) => {
        const reason = prompt("Please provide a reason for rejection:");
        if (reason) {
            try {
                await request(`/admin/submissions/${submissionId}/reject`, 'PUT', { catatanAdmin: reason });
                fetchSubmissions();
                setSelectedSubmission(null); // Tutup modal setelah aksi
            } catch (error) {
                alert(`Failed to reject submission: ${error.message}`);
            }
        }
    };
    
    const handleReviewClick = async (submission) => {
        try {
            // Panggil API untuk mendapatkan detail lengkap submission
            // CATATAN: Pastikan endpoint GET /api/admin/submissions/:id ada di backend
            const detailedSubmission = await request(`/admin/submissions/${submission.id}`);
            setSelectedSubmission(detailedSubmission);
        } catch (error) {
            alert(`Could not fetch submission details: ${error.message}`);
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
            <SubmissionDetailModal 
                submission={selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
                onApprove={handleApprove}
                onReject={handleReject}
            />

            <div className="page-header">
                <div>
                    <h1>Submission Review</h1>
                    <p>Approve or reject user submissions for projects.</p>
                </div>
                <div className="form-group">
                    <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                    <select 
                        id="status-filter"
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
                            <th>Project</th>
                            <th>Data Submitted (ID)</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5"><LoadingComponent /></td></tr>
                        ) : submissions.length > 0 ? submissions.map(submission => (
                            <tr key={submission.id}>
                                <td>{submission.user?.nama || 'N/A'}</td>
                                <td>{submission.project?.namaProyek || 'N/A'}</td>
                                <td className="font-mono text-cyan-400">{submission.id}</td>
                                <td>{new Date(submission.tglDibuat).toLocaleString()}</td>
                                <td className="table-actions">
                                    {submission.status === 'PENDING' ? (
                                        <button onClick={() => handleReviewClick(submission)} className="button button-sm button-primary">Review</button>
                                    ) : (
                                        renderStatusBadge(submission.status)
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem' }}>No submissions found for this filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSubmissionsPage;
