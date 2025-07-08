import React, { useState, useEffect, useCallback } from 'react';

// Komponen Tambahan (bisa dipisah ke file sendiri)
const LoadingComponent = () => (
    <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading Submissions...</p>
    </div>
);

// Komponen Utama Halaman Review Submission
const AdminSubmissionsPage = ({ token }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null); // Untuk menampilkan detail di modal

    // Hook kustom untuk melakukan panggilan API
    const useApi = (token) => {
        return useCallback(async (endpoint, method = 'GET', body = null) => {
            const API_BASE_URL = 'http://localhost:3000/api';
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

    // Fungsi untuk mengambil data submission yang pending
    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            // CATATAN: Pastikan Anda sudah membuat endpoint GET /api/admin/submissions di backend
            const data = await request('/admin/submissions?status=PENDING');
            setSubmissions(data || []);
        } catch (error) {
            console.error("Failed to fetch submissions", error);
            alert(`Failed to fetch submissions: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    // Ambil data saat komponen pertama kali dimuat
    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    // Fungsi untuk menyetujui submission
    const handleApprove = async (submissionId) => {
        if (window.confirm(`Are you sure you want to approve submission ID: ${submissionId}?`)) {
            try {
                await request(`/admin/submissions/${submissionId}/approve`, 'PUT');
                fetchSubmissions(); // Muat ulang daftar
            } catch (error) {
                alert(`Failed to approve submission: ${error.message}`);
            }
        }
    };

    // Fungsi untuk menolak submission
    const handleReject = async (submissionId) => {
        const reason = prompt("Please provide a reason for rejection:");
        if (reason) {
            try {
                await request(`/admin/submissions/${submissionId}/reject`, 'PUT', { catatanAdmin: reason });
                fetchSubmissions(); // Muat ulang daftar
            } catch (error) {
                alert(`Failed to reject submission: ${error.message}`);
            }
        }
    };
    
    // Fungsi untuk melihat detail submission
    const viewDetails = (submission) => {
        // CATATAN: Anda perlu membuat endpoint GET /api/admin/submissions/{id}
        // yang mengembalikan submission beserta `values` dan `project.fields`
        // Untuk saat ini, kita akan asumsikan data sudah ada jika di-klik
        setSelectedSubmission(submission);
    };

    if (isLoading) return <LoadingComponent />;

    return (
        <div>
            {/* Modal untuk menampilkan detail submission */}
            {selectedSubmission && (
                <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
                    <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Submission Details (ID: {selectedSubmission.id})</h2>
                            <button onClick={() => setSelectedSubmission(null)}>&times;</button>
                        </div>
                        <div>
                            <p><strong>User:</strong> {selectedSubmission.user?.nama}</p>
                            <p><strong>Project:</strong> {selectedSubmission.project?.namaProyek}</p>
                            <h4 className="text-lg font-semibold mt-4 mb-2">Submitted Values:</h4>
                            <ul className="fields-list">
                                {selectedSubmission.values?.map(value => (
                                    <li key={value.id}>
                                        <span>{value.projectField?.label || 'Unknown Field'}:</span>
                                        {value.projectField?.fieldType === 'IMAGE' ? (
                                            <a href={value.value} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View Image</a>
                                        ) : (
                                            <span className="text-white">{value.value}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1>Submission Review</h1>
                    <p>Approve or reject user submissions for projects.</p>
                </div>
            </div>
            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Project</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length > 0 ? submissions.map(submission => (
                            <tr key={submission.id}>
                                <td>{submission.user?.nama || 'N/A'}</td>
                                <td>{submission.project?.namaProyek || 'N/A'}</td>
                                <td>{new Date(submission.tglDibuat).toLocaleString()}</td>
                                <td className="table-actions">
                                    <button onClick={() => viewDetails(submission)} className="button button-sm button-secondary">Details</button>
                                    <button onClick={() => handleApprove(submission.id)} className="button button-sm button-approve">Approve</button>
                                    <button onClick={() => handleReject(submission.id)} className="button button-sm button-reject">Reject</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem' }}>No pending submissions to review.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSubmissionsPage;
