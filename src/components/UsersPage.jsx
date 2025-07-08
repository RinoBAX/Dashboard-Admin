import React, { useState, useEffect, useCallback } from 'react';

const LoadingComponent = () => (
    <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading Users...</p>
    </div>
);

const EditUserModal = ({ isOpen, onClose, onSuccess, token, user }) => {
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        role: 'USER',
        balance: 0,
    });
    const [pictureFile, setPictureFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                nama: user.nama || '',
                email: user.email || '',
                role: user.role || 'USER',
                balance: user.balance?.toString() || '0',
            });
            setPictureFile(null);
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setPictureFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = new FormData();
        payload.append('nama', formData.nama);
        payload.append('email', formData.email);
        payload.append('role', formData.role);
        payload.append('balance', formData.balance);
        if (pictureFile) {
            payload.append('picture', pictureFile);
        }

        try {
            const API_BASE_URL = 'http://localhost:6969/api';
            const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: payload,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }
            
            alert('User data updated successfully!');
            onSuccess();
        } catch (error) {
            alert(`Failed to update user: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>Edit User: {user.nama}</h2>
                    <button onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="picture">Profile Picture</label>
                        {user.picture && !pictureFile && <img src={user.picture} alt="Current" className="w-20 h-20 rounded-full my-2 object-cover" />}
                        {pictureFile && <img src={URL.createObjectURL(pictureFile)} alt="Preview" className="w-20 h-20 rounded-full my-2 object-cover" />}
                        <input id="picture" name="picture" type="file" onChange={handleFileChange} accept="image/*" className="form-input" />
                    </div>
                    <div className="form-group mt-4">
                        <label htmlFor="nama">Name</label>
                        <input id="nama" name="nama" type="text" value={formData.nama} onChange={handleChange} required className="form-input" />
                    </div>
                    <div className="form-group mt-4">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="form-input" />
                    </div>
                    <div className="form-grid mt-4">
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select id="role" name="role" value={formData.role} onChange={handleChange} className="form-select">
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="balance">Balance</label>
                            <input id="balance" name="balance" type="number" value={formData.balance} onChange={handleChange} required className="form-input" />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="button button-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="button button-primary">
                            {isSubmitting ? 'Updating...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UsersPage = ({ request, token }) => { 
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = filter === 'ALL' ? '/admin/users' : `/admin/users?status=${filter}`;
            const data = await request(endpoint);
            setUsers(data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
            alert(`Failed to fetch users: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [request, filter]);

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
         if (window.confirm(`Are you sure you want to reject user ID: ${userId}?`)) {
            try {
                await request(`/admin/users/${userId}/reject`, 'PUT');
                fetchUsers();
            } catch (error) {
                alert(`Failed to reject user: ${error.message}`);
            }
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleRemoveClick = async (userId) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE user ID: ${userId}? This action cannot be undone.`)) {
            try {
                await request(`/admin/users/${userId}`, 'DELETE');
                alert('User deleted successfully.');
                fetchUsers();
            } catch (error) {
                alert(`Failed to delete user: ${error.message}`);
            }
        }
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleModalSuccess = () => {
        handleModalClose();
        fetchUsers();
    };

    const filteredUsers = users;

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
            
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                token={token}
                user={editingUser}
            />

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
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                        <img src={user.picture || `https://ui-avatars.com/api/?name=${user.nama}&background=1a1a2e&color=00f6ff`} alt={user.nama} style={{width: '40px', height: '40px', borderRadius: '50%'}} />
                                        <div>
                                            <p className="font-semibold text-white">{user.nama}</p>
                                            <p style={{fontSize: '0.8rem', color: '#a0a0a0'}}>{user.email}</p>
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
                                    {user.statusRegistrasi === 'PENDING' ? (
                                        <>
                                            <button onClick={() => handleApprove(user.id)} className="button button-sm button-approve">Approve</button>
                                            <button onClick={() => handleReject(user.id)} className="button button-sm button-reject">Reject</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEditClick(user)} className="button button-sm button-secondary">Edit</button>
                                            <button onClick={() => handleRemoveClick(user.id)} className="button button-sm button-reject">Remove</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{textAlign: 'center', padding: '1.5rem'}}>No users found for this filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;
