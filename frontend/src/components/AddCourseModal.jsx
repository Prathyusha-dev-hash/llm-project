import React, { useState } from 'react';

export default function AddCourseModal({ onClose, onSave }) {
  const [form, setForm] = useState({ code: '', name: '', level: 'Beginner', description: '' });
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.code.trim() || !form.name.trim()) { setErr('Course code and name are required.'); return; }
    onSave(form);
  };

  const inp = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--rs)', padding: '9px 12px', fontFamily: "'Geist',sans-serif", fontSize: 13.5, color: 'var(--text)', outline: 'none', background: 'var(--bg)', transition: 'border-color .15s' };
  const lbl = { fontSize: 11.5, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(2px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .2s ease' }}
    >
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, maxWidth: '92vw', boxShadow: '0 16px 48px rgba(0,0,0,.14)', animation: 'fadeUp .2s ease' }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, letterSpacing: '-.01em', marginBottom: 20 }}>Add New Course</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Course Code</label>
              <input style={inp} placeholder="e.g. CV401" value={form.code} onChange={e => set('code', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'rgba(45,91,227,.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={lbl}>Level</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.level} onChange={e => set('level', e.target.value)}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Course Name</label>
            <input style={inp} placeholder="e.g. Computer Vision" value={form.name} onChange={e => set('name', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(45,91,227,.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, resize: 'none' }} rows={3} placeholder="Short description for AI context…" value={form.description} onChange={e => set('description', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(45,91,227,.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={lbl}>Upload Materials (RAG Index)</label>
            <div style={{ border: '1.5px dashed var(--border2)', borderRadius: 'var(--rs)', padding: 16, textAlign: 'center', cursor: 'pointer', color: 'var(--text3)', fontSize: 13 }}>
              📄 Drop PDFs, slides, or notes — or click to upload
            </div>
          </div>
          {err && <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(185,28,28,.2)', borderRadius: 6, padding: '8px 12px', fontSize: 12.5, color: 'var(--red)' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 'var(--rs)', border: '1px solid var(--border)', background: '#fff', fontFamily: "'Geist',sans-serif", fontSize: 13.5, color: 'var(--text2)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={submit} style={{ padding: '9px 18px', borderRadius: 'var(--rs)', border: 'none', background: 'var(--text)', fontFamily: "'Geist',sans-serif", fontSize: 13.5, color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Create Course</button>
          </div>
        </div>
      </div>
    </div>
  );
}
