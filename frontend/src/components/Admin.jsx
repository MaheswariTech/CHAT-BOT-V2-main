import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Link as LinkIcon, Globe, Users } from 'lucide-react';

const Admin = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('file'); // 'file', 'url', or 'submissions'
    const [admissions, setAdmissions] = useState([]);
    const [systemStats, setSystemStats] = useState({ active_sessions: 0, status: 'checking' });

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:8000/status');
            setSystemStats(response.data);
        } catch (e) {
            setSystemStats({ active_sessions: 0, status: 'offline' });
        }
    };

    React.useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/admissions');
            setAdmissions(response.data);
        } catch (error) {
            console.error("Error fetching admissions:", error);
            setStatus({ type: 'error', message: 'Failed to fetch admissions.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a file first.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setStatus({ type: 'info', message: 'Uploading and processing...' });

        try {
            const response = await axios.post('http://localhost:8000/uploadknowledgebase', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: response.data.message });
            setFile(null);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.detail || 'Upload failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUrlTrain = async () => {
        if (!url) {
            setStatus({ type: 'error', message: 'Please enter a URL first.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Crawling and processing URL...' });

        try {
            const response = await axios.post('http://localhost:8000/trainurl', { url });
            setStatus({ type: 'success', message: response.data.message });
            setUrl('');
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.detail || 'URL training failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to completely RESET the AI Knowledge? This will delete all uploaded documents and training data.")) {
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Resetting AI Knowledge Base...' });

        try {
            const response = await axios.post('http://localhost:8000/resetknowledgebase');
            setStatus({ type: 'success', message: response.data.message });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.detail || 'Reset failed.' });
        } finally {
            setLoading(false);
        }
    };

    const tabStyle = (tab) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
        color: activeTab === tab ? 'var(--primary)' : '#666',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    });

    return (
        <div className="container" style={{ padding: '80px 0', maxWidth: '700px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '25px', boxShadow: 'var(--shadow)' }}>
                <h2 style={{ marginBottom: '10px', color: 'var(--primary)', textAlign: 'center' }}>AI Training Lab</h2>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    marginBottom: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    <div style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        background: systemStats.status === 'online' ? '#e6ffed' : '#fff1f0',
                        color: systemStats.status === 'online' ? '#28a745' : '#ff4d4f',
                        border: `1px solid ${systemStats.status === 'online' ? '#b7eb8f' : '#ffa39e'}`
                    }}>
                        ● Backend: {systemStats.status.toUpperCase()}
                    </div>
                    <div style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        background: '#f0f7ff',
                        color: '#0055ff',
                        border: '1px solid #adc6ff'
                    }}>
                        👥 Active Sessions: {systemStats.active_sessions}
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Expand the chatbot's knowledge by syncing files or web pages.</p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', overflowX: 'auto' }}>
                    <div style={tabStyle('file')} onClick={() => setActiveTab('file')}>
                        <FileText size={18} /> Documents
                    </div>
                    <div style={tabStyle('url')} onClick={() => setActiveTab('url')}>
                        <Globe size={18} /> Website / URLs
                    </div>
                    <div style={tabStyle('submissions')} onClick={() => {
                        setActiveTab('submissions');
                        fetchAdmissions();
                    }}>
                        <Users size={18} /> Submissions
                    </div>
                </div>

                {activeTab === 'file' ? (
                    <div className="upload-section">
                        <div style={{
                            border: '2px dashed #003366',
                            padding: '40px',
                            borderRadius: '15px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            marginBottom: '20px',
                            background: '#f9f9f9',
                            transition: 'background 0.3s'
                        }} onClick={() => document.getElementById('fileInput').click()}>
                            <Upload size={48} color="#003366" style={{ marginBottom: '10px' }} />
                            <p style={{ fontWeight: '500' }}>{file ? file.name : "Upload Training Data"}</p>
                            <p style={{ fontSize: '13px', color: '#666' }}>Supported formats: PDF, TXT, DOCX</p>
                            <input
                                id="fileInput"
                                type="file"
                                accept=".pdf,.txt,.docx"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: file && !loading ? 'pointer' : 'not-allowed',
                                opacity: file && !loading ? 1 : 0.5,
                                fontSize: '16px',
                                marginBottom: '10px'
                            }}
                        >
                            {loading ? "Syncing Knowledge..." : "Sync & Replace Knowledge Base"}
                        </button>
                        <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
                            Syncing a new file will automatically delete previous documents.
                        </p>
                    </div>
                ) : activeTab === 'url' ? (
                    <div className="url-section">
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Enter College Website URL or Resource Link:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#f5f5f5',
                                    borderRadius: '12px',
                                    padding: '0 15px',
                                    border: '1px solid #ddd'
                                }}>
                                    <LinkIcon size={18} color="#666" />
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://miet.edu/about..."
                                        style={{
                                            width: '100%',
                                            padding: '15px 10px',
                                            border: 'none',
                                            background: 'transparent',
                                            outline: 'none',
                                            fontSize: '15px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleUrlTrain}
                            disabled={loading || !url}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: url && !loading ? 'pointer' : 'not-allowed',
                                opacity: url && !loading ? 1 : 0.5,
                                fontSize: '16px'
                            }}
                        >
                            {loading ? "Crawling Data..." : "Sync Website to AI"}
                        </button>
                    </div>
                ) : (
                    <div className="submissions-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>Recent Applications</h3>
                            <button
                                onClick={fetchAdmissions}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    background: '#f0f0f0',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Refresh List
                            </button>
                        </div>
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '40px' }}>Loading submissions...</p>
                        ) : admissions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '15px' }}>
                                <Users size={40} color="#ccc" style={{ marginBottom: '10px' }} />
                                <p style={{ color: '#666' }}>No admission applications found yet.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                                {admissions.map((adm) => (
                                    <div key={adm.id} style={{
                                        padding: '20px',
                                        border: '1px solid #edf2f7',
                                        borderRadius: '16px',
                                        marginBottom: '15px',
                                        background: 'white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        transition: 'transform 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1a202c' }}>{adm.full_name}</h4>
                                                <span style={{
                                                    fontSize: '11px',
                                                    background: '#ebf8ff',
                                                    color: '#2b6cb0',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    fontWeight: '600'
                                                }}>
                                                    {adm.category}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#a0aec0' }}>{new Date(adm.submitted_at).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                                            <p style={{ margin: 0 }}><strong>Course:</strong> {adm.course}</p>
                                            <p style={{ margin: 0 }}><strong>Phone:</strong> {adm.phone}</p>
                                            <p style={{ margin: 0 }}><strong>Email:</strong> {adm.email}</p>
                                            <p style={{ margin: 0 }}><strong>Marks:</strong> {adm.marks}%</p>
                                        </div>
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f7fafc', fontSize: '13px', color: '#4a5568' }}>
                                            <p style={{ margin: '0 0 4px 0' }}><strong>Prev. Institution:</strong> {adm.prev_college}</p>
                                            <p style={{ margin: 0 }}><strong>Address:</strong> {adm.address}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={handleReset}
                        disabled={loading}
                        style={{
                            background: 'transparent',
                            color: '#ff4444',
                            border: '1px solid #ff4444',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => { e.target.style.background = '#ff4444'; e.target.style.color = 'white'; }}
                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff4444'; }}
                    >
                        Reset Entire Knowledge Base
                    </button>
                </div>

                {status.message && (
                    <div style={{
                        marginTop: '25px',
                        padding: '15px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: status.type === 'error' ? '#ffeeee' : status.type === 'success' ? '#eeffee' : '#f0f7ff',
                        color: status.type === 'error' ? '#cc0000' : status.type === 'success' ? '#007700' : '#0055ff',
                        border: `1px solid ${status.type === 'error' ? '#ffcccc' : status.type === 'success' ? '#ccffcc' : '#cce5ff'}`,
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{status.message}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
