import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        onLogin(data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred during login.');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', height: '100vh', width: '100vw' }}>
      <div style={{ padding: '40px', background: 'var(--panel)', borderRadius: '24px', boxShadow: 'var(--sh)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2z" />
              <path d="M9 8H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2h-4" />
              <circle cx="9" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, letterSpacing: '-.02em', color: 'var(--text)' }}>
            track<em style={{ fontStyle: 'italic', color: 'var(--text2)' }}>ED</em>
          </span>
        </div>

        <div style={{ display: 'flex', background: 'var(--sidebar)', borderRadius: '12px', padding: '4px' }}>
          <button
            onClick={() => { setRole('student'); setError(''); }}
            style={{
              flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: role === 'student' ? 'white' : 'transparent',
              boxShadow: role === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              color: role === 'student' ? 'var(--text)' : 'var(--text2)',
              fontWeight: role === 'student' ? 500 : 400,
              transition: 'all 0.2s', fontSize: '14px'
            }}
          >
            Student Panel
          </button>
          <button
            onClick={() => { setRole('admin'); setError(''); }}
            style={{
              flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: role === 'admin' ? 'white' : 'transparent',
              boxShadow: role === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              color: role === 'admin' ? 'var(--text)' : 'var(--text2)',
              fontWeight: role === 'admin' ? 500 : 400,
              transition: 'all 0.2s', fontSize: '14px'
            }}
          >
            Admin Panel
          </button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {role === 'admin' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>Username</label>
                <input 
                  type="text" 
                  value={username} onChange={e => setUsername(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border2)', fontSize: '15px', outline: 'none' }}
                  placeholder="Enter admin username"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>Password</label>
                <input 
                  type="password" 
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border2)', fontSize: '15px', outline: 'none' }}
                  placeholder="Enter password"
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>Student ID</label>
                <input 
                  type="text" 
                  value={username} onChange={e => setUsername(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border2)', fontSize: '15px', outline: 'none' }}
                  placeholder="Enter Student ID (e.g. Aisha Patel)"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>Password</label>
                <input 
                  type="password" 
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border2)', fontSize: '15px', outline: 'none' }}
                  placeholder="Enter any password"
                />
              </div>
            </>
          )}

          {error && <div style={{ color: 'var(--red)', fontSize: '14px', padding: '8px 12px', background: 'var(--red-bg)', borderRadius: '6px', textAlign: 'center' }}>{error}</div>}

          <button 
            type="submit"
            style={{
              padding: '12px', background: 'var(--text)', color: 'white', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 500, fontSize: '15px', marginTop: '8px', transition: 'opacity 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.9}
            onMouseOut={e => e.currentTarget.style.opacity = 1}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
