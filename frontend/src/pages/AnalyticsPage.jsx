import React, { useState, useEffect } from 'react';

export default function AnalyticsPage({ adminCourseId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const courseQuery = adminCourseId ? `?adminCourseId=${adminCourseId}` : '';
    fetch(`/api/analytics${courseQuery}`).then(r => r.json()).then(setData);
  }, [adminCourseId]);

  if (!data) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>
      Loading analytics…
    </div>
  );

  const { activeStudents, activeStudentsDelta, avgMastery, avgMasteryDelta, days, weeklyEngagement, gaps } = data;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '13px 24px', borderBottom: '1px solid var(--border)', background: '#fff', flexShrink: 0, fontFamily: "'Instrument Serif',serif", fontSize: 16, letterSpacing: '-.01em' }}>
        Analytics <em style={{ fontStyle: 'italic', color: 'var(--text2)' }}>— Learning Intelligence</em>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[
            { label: 'Active Students', value: activeStudents.toLocaleString(), delta: activeStudentsDelta, green: true },
            { label: 'Avg. Mastery',    value: avgMastery + '%',               delta: avgMasteryDelta,    green: true },
          ].map((k, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '18px 20px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>{k.label}</div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, letterSpacing: '-.02em' }}>{k.value}</div>
              <div style={{ fontSize: 12, marginTop: 4, color: k.green ? 'var(--green)' : 'var(--text3)' }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Gap map */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '18px 20px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>Knowledge Gap Map</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {gaps.map((g, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text2)' }}>{g.topic}</span>
                  <span style={{ fontWeight: 600, color: 'var(--red)' }}>{g.mastery}% mastery</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 10 }}>
                  <div style={{ height: '100%', width: g.mastery + '%', background: 'var(--red)', borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly chart */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '18px 20px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>Weekly Engagement</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {weeklyEngagement.map((v, i) => (
              <div key={i} style={{ flex: 1, height: 70, background: 'var(--border)', borderRadius: 5, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: v + '%', background: i < 5 ? 'var(--accent)' : 'var(--border2)', borderRadius: 5, opacity: i < 5 ? 0.8 : 0.5 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {days.map(d => <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: 'var(--text3)' }}>{d}</div>)}
          </div>
        </div>

      </div>
    </div>
  );
}
