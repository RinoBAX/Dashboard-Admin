import React, { useState, useEffect, useCallback, useMemo } from 'react';

const ICONS = {
    plus: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
};

const ProjectModal = ({ isOpen, onClose, onSuccess, request, existingProject }) => {
    const [namaProyek, setNamaProyek] = useState('');
    const [nilaiProyek, setNilaiProyek] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [fields, setFields] = useState([{ label: '', fieldType: 'TEXT' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isEditMode = Boolean(existingProject);

    useEffect(() => {
        if (isEditMode && existingProject) {
            setNamaProyek(existingProject.namaProyek || '');
            setNilaiProyek(existingProject.nilaiProyek?.toString() || '');
            setProjectUrl(existingProject.projectUrl || '');
            setIconUrl(existingProject.iconUrl || '');
            setFields(existingProject.fields?.length > 0 ? existingProject.fields.map(f => ({label: f.label, fieldType: f.fieldType})) : [{ label: '', fieldType: 'TEXT' }]);
        } else {
            setNamaProyek('');
            setNilaiProyek('');
            setProjectUrl('');
            setIconUrl('');
            setFields([{ label: '', fieldType: 'TEXT' }]);
        }
    }, [isOpen, existingProject, isEditMode]);


    const handleFieldChange = (index, event) => {
        const newFields = [...fields];
        newFields[index][event.target.name] = event.target.value;
        setFields(newFields);
    };

    const addField = () => setFields([...fields, { label: '', fieldType: 'TEXT' }]);
    const removeField = (index) => setFields(fields.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            namaProyek,
            nilaiProyek: parseFloat(nilaiProyek),
            projectUrl,
            iconUrl,
            fields: fields.filter(f => f.label.trim() !== ''),
        };

        const endpoint = isEditMode ? `/admin/projects/${existingProject.id}` : '/admin/projects';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            await request(endpoint, method, payload);
            alert(`Proyek berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
            onSuccess();
        } catch (error) {
            alert(`Gagal: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>{isEditMode ? 'Edit Project' : 'Add New Project'}</h2>
                    <button onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="iconUrl">Project Icon URL (Opsional)</label>
                        <input id="iconUrl" type="text" value={iconUrl} onChange={e => setIconUrl(e.target.value)} placeholder="https://example.com/icon.png" className="form-input" />
                    </div>
                    <div className="form-grid mt-4">
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
                        <label htmlFor="projectUrl">Project URL (Opsional)</label>
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
                            {isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Project' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectsPage = ({ request }) => { 
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    
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

    const handleAddClick = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleModalSuccess = () => {
        handleModalClose();
        fetchProjects();
    };

    const handleRemoveProject = async (projectId) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus proyek dengan ID: ${projectId}?`)) {
            try {
                await request(`/admin/projects/${projectId}`, 'DELETE');
                fetchProjects(); 
            } catch (error) {
                alert(`Gagal menghapus proyek: ${error.message}`);
            }
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <ProjectModal 
                isOpen={isModalOpen} 
                onClose={handleModalClose} 
                onSuccess={handleModalSuccess}
                request={request}
                existingProject={editingProject}
            />
            <div className="page-header">
                <div>
                    <h1>Projects</h1>
                    <p>Manage all projects and view their submission statistics.</p>
                </div>
                <button onClick={handleAddClick} className="button button-primary">
                    Add Project
                </button>
            </div>
            <div className="table-container glass-panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Icon</th>
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
                                <td>
                                    <img src={project.iconUrl || `https://placehold.co/40x40/1f2937/a0aec0?text=ICON`} alt={project.namaProyek} className="project-icon"/>
                                </td>
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
                                    <button onClick={() => handleEditClick(project)} className="button button-sm button-secondary">Edit</button>
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

export default ProjectsPage;
