import React, { useState, useEffect } from 'react';

const barColor = p => p > 70 ? 'var(--green)' : p > 50 ? '#F59E0B' : 'var(--red)';
const badge    = m => m === 'High' ? { bg: 'var(--green-bg)', color: 'var(--green)' } : m === 'Medium' ? { bg: 'var(--amber-bg)', color: 'var(--amber)' } : { bg: 'var(--red-bg)', color: 'var(--red)' };
const COLS = '1.8fr 1fr 1.2fr 1.8fr 80px 100px';

export default function StudentsPage({ adminCourseId, onChatWith, showToast }) {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const courseQuery = adminCourseId ? `?adminCourseId=${adminCourseId}` : '';
    fetch(`/api/students${courseQuery}`).then(r => r.json()).then(d => { setStudents(d); setLoading(false); });
  }, [adminCourseId]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 24px', borderBottom: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, letterSpacing: '-.01em', flex: 1 }}>
          Students <em style={{ fontStyle: 'italic', color: 'var(--text2)' }}>— State Tracking</em>
        </div>
        <Btn onClick={() => showToast('AI gap report generated')}>🤖 AI Report</Btn>
        <Btn onClick={() => showToast('Export ready')}>↓ Export</Btn>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {loading
          ? <div style={{ color: 'var(--text3)', padding: 20 }}>Loading students…</div>
          : (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
              {/* Head */}
              <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '9px 16px', borderBottom: '1px solid var(--border)', fontSize: 10.5, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)' }}>
                <span>Student</span><span>Course</span><span>Progress</span><span>Breakdown</span><span>Mastery</span><span>Action</span>
              </div>
              {/* Rows */}
              {students.map((s, i) => {
                const b = badge(s.mastery);
                return (
                  <div key={s.id}
                    style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '11px 16px', alignItems: 'center', fontSize: 13, borderBottom: i < students.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.015)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.color + '18', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{s.initials}</div>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                    </div>
                    <span style={{ color: 'var(--text2)' }}>{s.course}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 10 }}>
                        <div style={{ height: '100%', width: s.progress + '%', background: barColor(s.progress), borderRadius: 10 }} />
                      </div>
                      <span style={{ fontSize: 11.5, color: 'var(--text2)', width: 28 }}>{s.progress}%</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.45 }}>
                      <div>{s.assignmentReviewScore}% review • {s.averageScore}% coursework</div>
                      <div>{s.assignmentReviewCount}/{s.expectedAssignments} submissions • {s.submissionCoverage}% coverage</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: b.bg, color: b.color }}>{s.mastery}</span>
                    <button onClick={() => onChatWith(s.name)}
                      style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', fontSize: 11.5, cursor: 'pointer', fontFamily: "'Geist',sans-serif", color: 'var(--text2)', transition: 'border-color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >Chat AI</button>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}

function Btn({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--rs)', padding: '5px 12px', fontSize: 12.5, color: 'var(--text2)', cursor: 'pointer', fontFamily: "'Geist',sans-serif", transition: 'all .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
    >{children}</button>
  );
}

function submissionPlural(count) {
  return count === 1 ? '' : 's';
}
