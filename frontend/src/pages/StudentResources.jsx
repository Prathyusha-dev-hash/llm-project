import React, { useState, useEffect } from 'react';

const FILE_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export default function StudentResources({ studentCourses = [] }) {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const courseIds = studentCourses.map(c => c.courseId).join(',');
        const url = courseIds ? `/api/resources?courseId=${encodeURIComponent(courseIds)}` : '/api/resources';
        const res = await fetch(url);
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadResources();
  }, [studentCourses]);

  return (
    <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: '32px', marginBottom: '8px', fontWeight: 400 }}>
        Course Resources
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: '15px', marginBottom: '32px' }}>
        Download presentation slides, PDFs, and reading materials uploaded by your instructors.
      </p>

      {resources.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--sh)' }}>
          <p style={{ color: 'var(--text2)' }}>No resources available right now. Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {resources.map(r => (
            <div key={r._id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--sh)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--green-bg)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.3 }}>{r.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                 Added {new Date(r.uploadedAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                 Course: {r.courseId || 'Global'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', background: r.resourceType === 'assignment' ? 'var(--amber-bg)' : 'var(--green-bg)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                 {r.resourceType === 'assignment' ? 'Assignment' : 'Study Material'}
              </div>

              <a 
                href={`${FILE_BASE_URL}${r.url}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ marginTop: 'auto', textAlign: 'center', padding: '8px 16px', background: 'var(--text)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 500, fontSize: '13px', textDecoration: 'none', display: 'block' }}
              >
                Download File
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
