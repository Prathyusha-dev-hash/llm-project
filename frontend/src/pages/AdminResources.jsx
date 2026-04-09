import React, { useState, useEffect, useRef } from 'react';

const FILE_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export default function AdminResources({ adminCourseId, courses = [], showToast }) {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [resourceType, setResourceType] = useState('study-material');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (adminCourseId) setCourseId(adminCourseId);

    const loadResources = async () => {
      try {
        const courseQuery = adminCourseId ? `?courseId=${adminCourseId}` : '';
        const res = await fetch(`/api/resources${courseQuery}`);
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error(err);
        if (showToast) showToast('Failed to load resources');
      }
    };

    loadResources();
  }, [adminCourseId, showToast]);

  const refreshResources = async () => {
    try {
      const courseQuery = adminCourseId ? `?courseId=${adminCourseId}` : '';
      const res = await fetch(`/api/resources${courseQuery}`);
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to load resources');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      if (showToast) showToast('Please select a file');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('resourceType', resourceType);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        if (showToast) showToast('Resource uploaded successfully!');
        setTitle('');
        setResourceType('study-material');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        refreshResources();
      } else {
        const err = await res.json();
        if (showToast) showToast(`Upload failed: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (showToast) showToast('Resource deleted successfully!');
        refreshResources();
      } else {
        const err = await res.json();
        if (showToast) showToast(`Delete failed: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error during deletion');
    }
  };

  return (
    <div style={{ flex: 1, padding: '48px', overflowY: 'auto', background: 'var(--bg)' }}>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: '32px', marginBottom: '32px', fontWeight: 400 }}>
        Resource Management
      </h1>
      
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--sh)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Upload New Resource</h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
             <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text2)' }}>Assign to Course</label>
             <select
               value={courseId}
               onChange={(e) => setCourseId(e.target.value)}
               disabled={!!adminCourseId}
               style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)', opacity: adminCourseId ? 0.6 : 1 }}
             >
               {!adminCourseId && <option value="">Global (All courses)</option>}
               {courses.map(c => (
                 <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
               ))}
             </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text2)' }}>Resource Title</label>
            <input 
              type="text" 
              placeholder="e.g. Machine Learning Basics PPT"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text2)' }}>Resource Type</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)' }}
            >
              <option value="study-material">Study Material</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
             <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text2)' }}>Select File</label>
             <input 
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              ref={fileInputRef}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={uploading}
            style={{ padding: '10px 24px', background: 'var(--text)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: uploading ? 'not-allowed' : 'pointer', height: '42px' }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--sh)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Available Resources</h2>
        {resources.length === 0 ? (
          <p style={{ color: 'var(--text2)' }}>No resources uploaded yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {resources.map(r => (
              <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '15px' }}>{r.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
                    Course: <strong style={{color: 'var(--text2)'}}>{r.courseId || 'Global'}</strong> • Type: <strong style={{color: 'var(--text2)'}}>{formatResourceType(r.resourceType)}</strong> • Uploaded: {new Date(r.uploadedAt).toLocaleDateString()} • {(r.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a 
                    href={`${FILE_BASE_URL}${r.url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ padding: '6px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(r._id)}
                    style={{ padding: '6px 16px', background: 'var(--red-bg)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '6px', fontSize: '13px', color: 'var(--red)', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatResourceType(resourceType) {
  return resourceType === 'assignment' ? 'Assignment' : 'Study Material';
}
