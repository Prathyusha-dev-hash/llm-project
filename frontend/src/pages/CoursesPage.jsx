import React, { useState } from 'react';
import AddCourseModal from '../components/AddCourseModal';

export default function CoursesPage({ courses, setCourses, showToast }) {
  const [showModal, setShowModal] = useState(false);

  const addCourse = async (form) => {
    try {
      const res    = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const course = await res.json();
      setCourses(c => [...c, course]);
      setShowModal(false);
      showToast(`"${course.code} — ${course.name}" created`);
    } catch { showToast('Failed to create course'); }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 24px', borderBottom: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, letterSpacing: '-.01em', flex: 1 }}>
          Courses <em style={{ fontStyle: 'italic', color: 'var(--text2)' }}>— RAG Indexed</em>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--rs)', padding: '5px 12px', fontSize: 12.5, color: 'var(--text2)', cursor: 'pointer', fontFamily: "'Geist',sans-serif" }}>
          + New Course
        </button>
      </div>

      {/* Grid */}
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, overflowY: 'auto' }}>
        {courses.map(c => (
          <div key={c.id}
            style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = 'var(--shm)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ padding: '18px 18px 14px' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{c.emoji}</div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, letterSpacing: '-.01em', marginBottom: 3 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.code} · {c.level} · {c.students} students</div>
            </div>
            <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 10 }}>
                <div style={{ height: '100%', width: c.completion + '%', background: 'var(--accent)', borderRadius: 10 }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{c.completion}%</span>
              <span style={{ fontSize: 10.5, background: 'var(--accent-bg)', color: 'var(--accent)', padding: '2px 7px', borderRadius: 10, fontWeight: 500 }}>RAG ✓</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && <AddCourseModal onClose={() => setShowModal(false)} onSave={addCourse} />}
    </div>
  );
}
