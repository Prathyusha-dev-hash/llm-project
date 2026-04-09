import React, { useEffect } from 'react';

export default function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2950);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--text)', color: '#fff',
      padding: '9px 20px', borderRadius: 20,
      fontSize: 13, fontWeight: 500, zIndex: 999,
      boxShadow: 'var(--shm)',
      animation: 'toastLife 2.95s ease forwards',
      pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  );
}
