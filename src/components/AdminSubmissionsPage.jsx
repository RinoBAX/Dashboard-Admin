import React, { useState, useEffect, useCallback } from 'react';

const LoadingComponent = () => (
    <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading Submissions...</p>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-400">User</p>
                            <p className="font-semibold">{submission.user?.nama || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Project</p>
                            <p className="font-semibold">{submission.project?.namaProyek || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mt-4 mb-2">Submitted Data:</h4>
                        <div className="p-4 rounded-lg bg-black bg-opacity-20 space-y-3 max-h-64 overflow-y-auto">
                            {submission.values && submission.values.length > 0 ? (
                                submission.values.map(value => (
                                    <div key={value.id} className="border-b border-gray-700 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                                        <p className="font-semibold text-cyan-400 mb-1">{value.projectField?.label || 'Unknown Field'}</p>
                                        {value.projectField?.fieldType === 'IMAGE' ? (
                                            <a href={value.value} target="_blank" rel="noopener noreferrer" title="Click to open in new tab">
                                                <img src={value.value} alt="Submission preview" className="max-w-full h-auto rounded-md mt-1 border-2 border-gray-600 hover:border-cyan-400 transition" />
                                            </a>
                                        ) : value.projectField?.fieldType === 'FILE' ? (
                                            <a href={value.value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                                View File: {value.value}
                                            </a>
                                        ) : (
                                            <p className="text-white whitespace-pre-wrap break-words bg-gray-800 p-2 rounded-md">{value.value}</p>
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
const AdminSubmissionsPage = ({ request }) => {
    const [submissions, setSubmissions] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const fetchSubmissions = useCallback(async (pageToFetch) => {
        setIsLoading(true);
        try {
            const endpoint = `/admin/submissions?status=${filter}&page=${pageToFetch}&pageSize=10`;
            const response = await request(endpoint);
            setSubmissions(response.data || []);
            setPagination(response.pagination || null);
        } catch (error) {
            console.error("Failed to fetch submissions", error);
            alert(`Failed to fetch submissions: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [request, filter]);

    useEffect(() => {
        setCurrentPage(1);
        fetchSubmissions(1);
    }, [filter]); 

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchSubmissions(newPage);
    };

    const handleApprove = async (submissionId) => {
        if (window.confirm(`Are you sure you want to approve submission ID: ${submissionId}?`)) {
            try {
                await request(`/admin/submissions/${submissionId}/approve`, 'PUT');
                fetchSubmissions(currentPage);
                setSelectedSubmission(null);
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
                fetchSubmissions(currentPage);
                setSelectedSubmission(null);
            } catch (error) {
                alert(`Failed to reject submission: ${error.message}`);
            }
        }
    };
    
    const handleReviewClick = async (submission) => {
        try {
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
                            <tr><td colSpan="5" className="text-center p-8"><div className="loader mx-auto"></div></td></tr>
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
            {pagination && <Pagination {...pagination} onPageChange={handlePageChange} />}
        </div>
    );
};

export default AdminSubmissionsPage;
