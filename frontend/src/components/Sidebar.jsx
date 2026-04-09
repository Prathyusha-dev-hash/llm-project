import React from 'react';

const NAV_ITEMS = [
  {
    id: 'students', label: 'Students',
    icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
  },
  {
    id: 'courses', label: 'Courses',
    icon: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>,
  },
  {
    id: 'analytics', label: 'Analytics',
    icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
  },
  {
    id: 'resources', label: 'Resources',
    icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  },
];

export default function Sidebar({ page, setPage, onLogout }) {
  return (
    <aside style={{ width: 210, flexShrink: 0, background: 'var(--sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Logo */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2z" />
            <path d="M9 8H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2h-4" />
            <circle cx="9" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" />
          </svg>
        </div>
        <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 17, letterSpacing: '-.02em' }}>
          track<em style={{ fontStyle: 'italic', color: 'var(--text2)' }}>ED</em>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = page === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 'var(--rs)',
                cursor: 'pointer', fontSize: 13.5, marginBottom: 1,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--text)' : 'var(--text2)',
                background: active ? '#fff' : 'transparent',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,.06)' : 'none',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0, opacity: active ? 1 : .7 }}>
                {item.icon}
              </svg>
              {item.label}
              {item.live && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginLeft: 'auto' }} />}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--green-bg)', border: '1px solid rgba(26,122,74,.2)', borderRadius: 20, padding: '5px 10px', fontSize: 11.5, color: 'var(--green)', fontWeight: 500 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulseDot 2s infinite', flexShrink: 0 }} />
          Agent Online · RAG Active
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            style={{
              padding: '6px 10px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: '6px',
              cursor: 'pointer', fontSize: '12px', color: 'var(--text2)', transition: 'all 0.2s', width: '100%'
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
          >
            Log Out
          </button>
        )}
      </div>

    </aside>
  );
}
