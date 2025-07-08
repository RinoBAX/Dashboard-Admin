import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardPage from './components/DashboardPage';
import * as THREE from 'three';

// --- Helper Functions & Constants ---
// Pastikan URL ini sesuai dengan tempat backend Anda berjalan
const API_BASE_URL = 'http://localhost:6969/api'; 

const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    projects: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    submissions: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    withdrawals: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    eye: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    eyeOff: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
};

// --- STYLING --- (Ditempatkan di sini agar mandiri)
const GlobalStyles = () => (
    <style>{`
        :root { --bg-color: #1a1a2e; --panel-color: rgba(255, 255, 255, 0.05); --text-color: #e0e0e0; --primary-color: #00f6ff; --secondary-color: #ff007f; }
        body { background-color: var(--bg-color); color: var(--text-color); font-family: 'Inter', sans-serif; }
        .glass-panel { background: var(--panel-color); backdrop-filter: blur(10px); border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); }
        .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; flex-direction: column; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; }
        .loading-overlay p { margin-top: 1rem; font-size: 1.2rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .login-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .login-container { padding: 2rem; width: 100%; max-width: 400px; text-align: center; }
        .login-header h2 { font-size: 2rem; font-weight: bold; color: var(--primary-color); }
        .login-header p { margin-top: 0.5rem; color: #a0a0a0; }
        .login-form { margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }
        .input-wrapper { position: relative; }
        .form-input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; padding: 0.75rem 1rem; color: white; }
        .password-toggle { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #a0a0a0; cursor: pointer; }
        .button { padding: 0.75rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: bold; transition: all 0.3s; }
        .button-sm { padding: 0.25rem 0.75rem; font-size: 0.8rem; }
        .button-primary { background-color: var(--primary-color); color: var(--bg-color); }
        .button-secondary { background-color: rgba(255,255,255,0.1); color: var(--text-color); }
        .button:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-message { color: var(--secondary-color); background: rgba(255,0,127,0.1); padding: 0.5rem; border-radius: 0.5rem; }
        .app-layout { display: flex; }
        .sidebar { width: 250px; height: 100vh; padding: 1.5rem; display: flex; flex-direction: column; }
        .sidebar-header { font-size: 1.5rem; font-weight: bold; text-align: center; }
        .sidebar-profile { text-align: center; margin-top: 2rem; }
        .sidebar-profile img { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto; border: 2px solid var(--primary-color); }
        .sidebar-profile h4 { margin-top: 0.5rem; font-weight: bold; }
        .sidebar-profile p { font-size: 0.8rem; color: #a0a0a0; }
        .sidebar-nav { margin-top: 2rem; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 0.5rem; background: none; border: none; color: var(--text-color); width: 100%; text-align: left; cursor: pointer; transition: background 0.2s; }
        .nav-item:hover { background: rgba(255,255,255,0.1); }
        .nav-item-active { background: var(--primary-color); color: var(--bg-color); }
        .main-content { flex: 1; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .page-header h1 { font-size: 2.5rem; font-weight: bold; }
        .page-header p { color: #a0a0a0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 2rem; }
        .stat-card { padding: 1.5rem; }
        .stat-card p:first-child { color: #a0a0a0; }
        .stat-card p:nth-child(2) { font-size: 2rem; font-weight: bold; }
        .stat-change { margin-top: 0.5rem; font-size: 0.9rem; }
        .stat-change--positive { color: #4ade80; }
        .stat-change--negative { color: #f87171; }
        .table-container { margin-top: 2rem; padding: 1.5rem; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); vertical-align: middle; }
        .data-table th { font-weight: bold; color: #a0a0a0; }
        .data-table th.text-center, .data-table td.text-center { text-align: center; }
        .table-actions { display: flex; gap: 0.5rem; }
        .button-approve { background-color: #22c55e; color: white; }
        .button-reject { background-color: #ef4444; color: white; }
        .fields-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
        .fields-list li { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
        .field-type { background-color: rgba(255, 255, 255, 0.1); color: var(--primary-color); padding: 0.1rem 0.4rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 500; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 50; }
        .modal-content { width: 100%; max-width: 600px; padding: 2rem; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h2 { font-size: 1.5rem; font-weight: bold; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { margin-bottom: 0.5rem; font-size: 0.9rem; color: #a0a0a0; }
        .form-select { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; padding: 0.75rem 1rem; color: white; }
        .dynamic-field { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    `}</style>
);


// --- API HOOK ---
const useApi = (token) => {
    const request = useCallback(async (endpoint, method = 'GET', body = null) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const options = { method, headers };
        if (body) { options.body = JSON.stringify(body); }

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }
            return data;
        } catch (error) {
            console.error(`API Error on ${method} ${endpoint}:`, error);
            throw error;
        }
    }, [token]);
    return { request };
};

// --- COMPONENTS ---
const LoadingComponent = () => (
    <div className="loading-overlay">
        <div className="loader"></div>
        <p>Loading Data...</p>
    </div>
);

const LoginPage = ({ setToken, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // Panggil hook di level atas, tanpa token awal.
    const { request } = useApi();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Step 1: Login untuk mendapatkan token
            const loginData = await request('/auth/login', 'POST', { email, password });
            
            if (loginData.accessToken) {
                // Step 2: Gunakan token baru untuk mengambil profil pengguna.
                // Panggilan fetch standar digunakan di sini untuk menghindari pelanggaran aturan hook.
                const profileResponse = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${loginData.accessToken}` }
                });
                const profileData = await profileResponse.json();
                
                if (!profileResponse.ok) {
                    throw new Error(profileData.message || "Gagal mengambil data profil setelah login.");
                }

                // Step 3: Periksa peran dari profil yang baru diambil
                if (profileData && (profileData.role === 'ADMIN' || profileData.role === 'SUPER_ADMIN')) {
                    setToken(loginData.accessToken);
                    setUser(profileData);
                } else {
                    setError('Login berhasil, tetapi Anda tidak memiliki hak akses ke panel admin.');
                }
            } else {
                setError('Login gagal. Token tidak diterima.');
            }
        } catch (err) {
            setError(err.message || 'Login gagal. Silakan periksa kembali kredensial Anda.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="login-page">
            <div className="login-container glass-panel">
                <div className="login-header"><h2>Admin TheBaxLancer</h2></div>
                <form className="login-form" onSubmit={handleLogin}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="input-wrapper">
                        <input id="email-address" type="email" required className="form-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="input-wrapper">
                        <input id="password" type={showPassword ? 'text' : 'password'} required className="form-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                            {showPassword ? ICONS.eyeOff : ICONS.eye}
                        </button>
                    </div>
                    <button type="submit" disabled={isLoading} className="button button-primary">
                        {isLoading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Sidebar = ({ user, setPage, currentPage, handleLogout }) => {
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
                <img src={user.picture || `https://ui-avatars.com/api/?name=${user.nama}&background=0d0c38&color=00f6ff`} alt="avatar" />
                <h4>{user.nama}</h4>
                <p>{user.role}</p>
            </div>
            <div className="sidebar-nav">
                <nav>
                    {navItems.filter(item => item.roles.includes(user.role)).map(item => (
                        <button key={item.name} onClick={() => setPage(item.page)} className={`nav-item ${currentPage === item.page ? 'nav-item-active' : ''}`}>
                            {item.icon}<span>{item.name}</span>
                        </button>
                    ))}
                </nav>
                <button onClick={handleLogout} className="nav-item logout-button">
                    {ICONS.logout}<span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

const DashboardPage = () => { <DashboardPage />; };
const UsersPage = () => { /* No changes needed here */ return (<div>User Management Content</div>); };

const AddProjectModal = ({ isOpen, onClose, onProjectAdded, token }) => {
    const [namaProyek, setNamaProyek] = useState('');
    const [nilaiProyek, setNilaiProyek] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [fields, setFields] = useState([{ label: '', fieldType: 'TEXT' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { request } = useApi(token);

    const handleFieldChange = (index, event) => {
        const newFields = [...fields];
        newFields[index][event.target.name] = event.target.value;
        setFields(newFields);
    };

    const addField = () => {
        setFields([...fields, { label: '', fieldType: 'TEXT' }]);
    };

    const removeField = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            namaProyek,
            nilaiProyek: parseFloat(nilaiProyek),
            projectUrl,
            fields: fields.filter(f => f.label.trim() !== '') // Hanya kirim field yang labelnya diisi
        };

        try {
            await request('/admin/projects', 'POST', payload);
            alert('Proyek berhasil ditambahkan!');
            onProjectAdded(); // Panggil callback untuk menutup modal dan refresh list
        } catch (error) {
            alert(`Gagal menambahkan proyek: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>Add New Project</h2>
                    <button onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="namaProyek">Project Name</label>
                            <input id="namaProyek" type="text" value={namaProyek} onChange={e => setNamaProyek(e.target.value)} required className="form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nilaiProyek">Project Value (Rp)</label>
                            <input id="nilaiProyek" type="number" value={nilaiProyek} onChange={e => setNilaiProyek(e.target.value)} required className="form-input" />
                        </div>
                    </div>
                    <div className="form-group mt-4">
                        <label htmlFor="projectUrl">Project URL (Optional)</label>
                        <input id="projectUrl" type="text" value={projectUrl} onChange={e => setProjectUrl(e.target.value)} className="form-input" />
                    </div>
                    
                    <h3 className="text-lg font-semibold mt-6 mb-2">Required Fields</h3>
                    {fields.map((field, index) => (
                        <div key={index} className="dynamic-field">
                            <input type="text" name="label" placeholder="Label Field" value={field.label} onChange={e => handleFieldChange(index, e)} required className="form-input flex-grow" />
                            <select name="fieldType" value={field.fieldType} onChange={e => handleFieldChange(index, e)} className="form-select">
                                <option value="TEXT">Text Input</option>
                                <option value="TEXTAREA">Text Area</option>
                                <option value="IMAGE">Image (jpg/png)</option>
                                <option value="FILE">File (docx/pdf)</option>
                            </select>
                            <button type="button" onClick={() => removeField(index)} className="button button-reject p-2">{ICONS.trash}</button>
                        </div>
                    ))}
                    <button type="button" onClick={addField} className="button button-secondary mt-2 flex items-center gap-2">
                        {ICONS.plus} Add Field
                    </button>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="button button-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="button button-primary">
                            {isSubmitting ? 'Submitting...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectsPage = ({ token }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { request } = useApi(token);

    const processedProjects = useMemo(() => {
        return projects.map(project => ({
            ...project,
            approvedCount: project.submissions?.filter(s => s.status === 'APPROVED').length || 0,
            rejectedCount: project.submissions?.filter(s => s.status === 'REJECTED').length || 0,
            pendingCount: project.submissions?.filter(s => s.status === 'PENDING').length || 0,
        }));
    }, [projects]);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await request('/projects');
            setProjects(data);
        } catch (error) { console.error("Failed to fetch projects", error); }
        finally { setIsLoading(false); }
    }, [request]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleProjectAdded = () => {
        setIsModalOpen(false);
        fetchProjects(); // Refresh project list
    };

    const handleEditProject = (projectId) => {
        alert(`Mengedit proyek dengan ID: ${projectId}`);
    };

    const handleRemoveProject = async (projectId) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus proyek dengan ID: ${projectId}?`)) {
            try {
                // Asumsi ada endpoint DELETE /api/admin/projects/{id}
                await request(`/admin/projects/${projectId}`, 'DELETE');
                fetchProjects(); 
            } catch (error) {
                alert(`Gagal menghapus proyek: ${error.message}`);
            }
        }
    };

    if (isLoading) return <LoadingComponent />;

    return (
        <div>
            <AddProjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onProjectAdded={handleProjectAdded}
                token={token}
            />
            <div className="page-header">
                <div>
                    <h1>Projects</h1>
                    <p>Manage all projects and view their submission statistics.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="button button-primary">
                    Add Project
                </button>
            </div>
            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Value</th>
                            <th>Project Link</th>
                            <th>Required Fields</th>
                            <th className="text-center">Approved</th>
                            <th className="text-center">Rejected</th>
                            <th className="text-center">Pending</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedProjects.map(project => (
                            <tr key={project.id}>
                                <td className="font-semibold text-white">{project.namaProyek}</td>
                                <td>Rp {Number(project.nilaiProyek).toLocaleString('id-ID')}</td>
                                <td>
                                    {project.projectUrl ? (
                                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                            Visit Link
                                        </a>
                                    ) : (
                                        <span className="text-gray-500">N/A</span>
                                    )}
                                </td>
                                <td>
                                    <ul className="fields-list">
                                        {project.fields?.map(field => (
                                            <li key={field.id}>
                                                <span>{field.label}</span>
                                                <span className="field-type">{field.fieldType}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="text-green-400 font-bold text-center text-lg">{project.approvedCount}</td>
                                <td className="text-red-400 font-bold text-center text-lg">{project.rejectedCount}</td>
                                <td className="text-yellow-400 font-bold text-center text-lg">{project.pendingCount}</td>
                                <td className="table-actions">
                                    <button onClick={() => handleEditProject(project.id)} className="button button-sm button-secondary">Edit</button>
                                    <button onClick={() => handleRemoveProject(project.id)} className="button button-sm button-reject">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminSubmissionsPage = ({ token }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { request } = useApi(token);

    // FIX: Backend Anda belum memiliki endpoint /admin/submissions. Mari kita asumsikan Anda membuatnya.
    // Untuk sementara, kita akan fetch semua dan filter di frontend.
    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const allSubmissions = await request('/submissions'); // Asumsi endpoint ini ada
            setSubmissions(allSubmissions.filter(s => s.status === 'PENDING') || []);
        } catch (error) { console.error("Failed to fetch submissions", error); } 
        finally { setIsLoading(false); }
    }, [request]);

    useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

    const handleReview = async (id, status, note = null) => {
        try {
            const endpoint = status === 'APPROVED' 
                ? `/admin/submissions/${id}/approve` 
                : `/admin/submissions/${id}/reject`;
            const body = status === 'REJECTED' ? { catatanAdmin: note || "Submission ditolak." } : {};
            await request(endpoint, 'PUT', body);
            fetchSubmissions();
        } catch (error) { alert(`Failed to review submission: ${error.message}`); }
    };
    
    if (isLoading) return <LoadingComponent />;

    return (
        <div>
            <div className="page-header"><h1>Review Submissions</h1></div>
            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead><tr><th>User</th><th>Project</th><th>Submitted At</th><th>Actions</th></tr></thead>
                    <tbody>
                        {submissions.length > 0 ? submissions.map(sub => (
                             <tr key={sub.id}>
                                <td>{sub.user?.nama || 'N/A'}</td>
                                <td>{sub.project?.namaProyek || 'N/A'}</td>
                                <td>{new Date(sub.tglDibuat).toLocaleString()}</td>
                                <td className="table-actions">
                                    <button onClick={() => handleReview(sub.id, 'APPROVED')} className="button button-approve">Approve</button>
                                    <button onClick={() => handleReview(sub.id, 'REJECTED')} className="button button-reject">Reject</button>
                                </td>
                            </tr>
                        )) : ( <tr><td colSpan="4" style={{textAlign: 'center', padding: '1rem'}}>No pending submissions found.</td></tr> )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminWithdrawalsPage = ({ token }) => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { request } = useApi(token);

    // FIX: Backend Anda belum memiliki endpoint /superadmin/withdrawals. Mari kita asumsikan Anda membuatnya.
    const fetchWithdrawals = useCallback(async () => {
        setIsLoading(true);
        try {
            const allWithdrawals = await request('/withdrawals'); // Asumsi endpoint ini ada
            setWithdrawals(allWithdrawals.filter(w => w.status === 'PENDING') || []);
        } catch (error) { console.error("Failed to fetch withdrawals", error); } 
        finally { setIsLoading(false); }
    }, [request]);
    
    useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

    const handleApprove = async (id) => {
        try {
            await request(`/superadmin/withdrawals/${id}/approve`, 'PUT');
            fetchWithdrawals(); 
        } catch (error) { alert(`Failed to review withdrawal: ${error.message}`); }
    };

    if (isLoading) return <LoadingComponent />;

    return (
       <div>
            <div className="page-header"><h1>Review Withdrawals</h1></div>
            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead><tr><th>User</th><th>Amount</th><th>Requested At</th><th>Actions</th></tr></thead>
                    <tbody>
                        {withdrawals.length > 0 ? withdrawals.map(w => (
                            <tr key={w.id}>
                                <td>{w.user?.nama || 'N/A'}</td>
                                <td>Rp {Number(w.totalWithdrawal).toLocaleString('id-ID')}</td>
                                <td>{new Date(w.tglDiajukan).toLocaleString()}</td>
                                <td className="table-actions">
                                    <button onClick={() => handleApprove(w.id)} className="button button-approve">Approve</button>
                                </td>
                            </tr>
                        )) : ( <tr><td colSpan="4" style={{textAlign: 'center', padding: '1rem'}}>No pending withdrawals found.</td></tr> )}
                    </tbody>
                </table>
            </div>
        </div>
    )
};


// --- MAIN APP COMPONENT ---
function App() {
    const [token, setTokenState] = useState(() => localStorage.getItem('adminToken'));
    const [user, setUserState] = useState(() => {
        const savedUser = localStorage.getItem('adminUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [page, setPage] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    
    const { request } = useApi(token);

    const setToken = (newToken) => {
        if (newToken) localStorage.setItem('adminToken', newToken);
        else localStorage.removeItem('adminToken');
        setTokenState(newToken);
    };

    const setUser = (newUser) => {
        if (newUser) localStorage.setItem('adminUser', JSON.stringify(newUser));
        else localStorage.removeItem('adminUser');
        setUserState(newUser);
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
    };
    
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const profileData = await request('/users/me');
                    if (profileData && (profileData.role === 'ADMIN' || profileData.role === 'SUPER_ADMIN')) {
                       setUser(profileData);
                    } else { handleLogout(); }
                } catch (error) {
                    console.error("Token verification failed", error);
                    handleLogout();
                }
            }
            setIsLoading(false);
        };
        verifyToken();
    }, [token, request]);

    // Background Animation Effect (Tidak diubah)
    useEffect(() => {
        let scene, camera, renderer, crystal;
        const canvas = document.getElementById('bg-canvas');

        // Hindari error jika canvas tidak ditemukan (misalnya saat komponen unmount)
        if (!canvas) return;

        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);

            const geometry = new THREE.IcosahedronGeometry(2, 0);
            const material = new THREE.MeshStandardMaterial({
                color: 0x8A2BE2,
                transparent: true,
                opacity: 0.3,
                roughness: 0.1,
                metalness: 0.8,
            });
            crystal = new THREE.Mesh(geometry, material);
            scene.add(crystal);

            const pointLight = new THREE.PointLight(0x00f6ff, 2, 100);
            pointLight.position.set(10, 10, 10);
            scene.add(pointLight);
            
            const ambientLight = new THREE.AmbientLight(0xff007f, 0.5);
            scene.add(ambientLight);

            camera.position.z = 5;

            animate();
        }

        let animationFrameId;
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            if(crystal) {
                crystal.rotation.x += 0.001;
                crystal.rotation.y += 0.001;
            }
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize, false);
        init();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            cancelAnimationFrame(animationFrameId);
            // Bersihkan resource Three.js jika perlu
        };
    }, []);
    
    const renderPage = () => {
        switch (page) {
            case 'dashboard': return <DashboardPage />;
            case 'projects': return <ProjectsPage token={token} />;
            case 'users': return <UsersPage />;
            case 'submissions': return <AdminSubmissionsPage token={token} />;
            case 'withdrawals': return <AdminWithdrawalsPage token={token} />;
            default: return <DashboardPage />;
        }
    };
    
    if (isLoading) { return <LoadingComponent />; }
    if (!token || !user) { return <LoginPage setToken={setToken} setUser={setUser} />; }

    return (
        <div className="app-layout">
            <canvas id="bg-canvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}></canvas>
            <GlobalStyles />
            <Sidebar user={user} setPage={setPage} currentPage={page} handleLogout={handleLogout} />
            <main className="main-content">{renderPage()}</main>
        </div>
    );
}

export default App;
