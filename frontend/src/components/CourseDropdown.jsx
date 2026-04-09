import React, { useState, useEffect, useRef } from 'react';

export default function CourseDropdown({ courses, selected, onSelect, onAddClick, allowAdd = true }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--rs)', padding: '6px 10px', fontSize: 12.5, color: 'var(--text2)', cursor: 'pointer', userSelect: 'none', transition: 'border-color .15s', borderColor: open ? 'var(--border2)' : 'var(--border)' }}
      >
        <span>{selected ? `${selected.code} — ${selected.name}` : 'Select course'}</span>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Menu */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--shm)', minWidth: 220, zIndex: 200, overflow: 'hidden', animation: 'fadeUp .15s ease' }}>
          {courses.map(c => {
            const isSel = selected?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => { onSelect(c); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: isSel ? 'var(--accent)' : 'var(--text2)', fontWeight: isSel ? 500 : 400, background: isSel ? 'var(--accent-bg)' : 'transparent', transition: 'background .1s' }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ flex: 1 }}>{c.code} — {c.name}</span>
                {isSel && (
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
          {allowAdd && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <div
                onClick={() => { setOpen(false); onAddClick(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 14px', fontSize: 13, color: 'var(--accent)', fontWeight: 500, cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add new course
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
