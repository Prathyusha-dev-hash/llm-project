import React, { useState } from 'react';
import ChatPage from './ChatPage';
import StudentResources from './StudentResources';

const DBOARD_ICON = <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />;
const CHAT_ICON = <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />;
const RES_ICON = <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>;

function StudentSidebar({ page, setPage, studentData, onLogout }) {
  const NAV = [
    { id: 'dashboard', label: 'My Progress', icon: DBOARD_ICON },
    { id: 'chat', label: 'AI Instructor', icon: CHAT_ICON },
    { id: 'resources', label: 'Resources', icon: RES_ICON },
  ];

  return (
    <aside style={{ width: 210, flexShrink: 0, background: 'var(--sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
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

      <nav style={{ padding: '10px 8px', flex: 1 }}>
        <div style={{ padding: '0 8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Student Tools
        </div>
        {NAV.map(item => {
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
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ background: 'var(--panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{studentData.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>Student • {studentData.courses?.length || 0} Enrolled</div>
        </div>
        <button 
          onClick={onLogout}
          style={{
            padding: '8px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: '6px',
            cursor: 'pointer', fontSize: '12.5px', color: 'var(--text2)', transition: 'all 0.2s', width: '100%'
          }}
          onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function StudentDashboard({ student }) {
  const courses = student.courses || [];
  const overallProgress = courses.length
    ? Math.round(courses.reduce((sum, course) => sum + (course.progress || 0), 0) / courses.length)
    : 0;
  
  return (
    <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: '32px', marginBottom: '8px', fontWeight: 400 }}>
        Welcome back, {student.name.split(' ')[0]}
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: '15px', marginBottom: '32px' }}>
        Here is an overview of your progress across <strong>{courses.length} enrolled courses</strong>.
      </p>

      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--sh)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Progress</div>
            <div style={{ fontSize: '30px', fontWeight: 600, letterSpacing: '-0.03em', marginTop: 6 }}>{overallProgress}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {courses.map(c => {
           const isHigh = c.mastery === 'High';
           const isLow = c.mastery === 'Low';
           const masteryColor = isHigh ? 'var(--green)' : (isLow ? 'var(--red)' : 'var(--amber)');
           const masteryBg = isHigh ? 'var(--green-bg)' : (isLow ? 'var(--red-bg)' : 'var(--amber-bg)');
           
           return (
             <div key={c.courseId} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--sh)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course</div>
                     <div style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>{c.courseId}</div>
                   </div>
                   <div style={{ background: masteryBg, color: masteryColor, padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, border: `1px solid ${masteryColor}33` }}>
                     {c.mastery}
                   </div>
                </div>

                <div style={{ marginTop: 16 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: 6, fontWeight: 500 }}>
                     <span>Progress</span>
                     <span style={{ color: 'var(--accent)' }}>{c.progress}%</span>
                   </div>
                   <div style={{ width: '100%', background: 'var(--border)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                     <div style={{ height: '100%', background: 'var(--accent)', width: `${c.progress}%`, borderRadius: '4px' }} />
                   </div>
                </div>

                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Assignment Review</div>
                    <div style={{ fontSize: '20px', fontWeight: 600, marginTop: 4 }}>{c.assignmentReviewScore}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: 2 }}>{c.assignmentReviewCount} review{submissionPlural(c.assignmentReviewCount)}</div>
                  </div>
                  <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Average Score</div>
                    <div style={{ fontSize: '30px', fontWeight: 600, marginTop: 4 }}>{c.averageScore}%</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Submission Coverage</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, marginTop: 4 }}>{c.submissionCoverage}%</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: 2 }}>{c.assignmentReviewCount}/{c.expectedAssignments} assignments reviewed</div>
                </div>

             </div>
           );
        })}
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', marginTop: '32px', boxShadow: 'var(--sh)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Need help?</h2>
        <p style={{ color: 'var(--text2)', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '600px' }}>
          Your AI instructor is available 24/7 to answer questions, explain difficult concepts from your connected courses, and provide personalized quizzes. Use the AI Instructor tool to get started!
        </p>
      </div>
    </div>
  );
}

function submissionPlural(count) {
  return count === 1 ? '' : 's';
}

export default function StudentPanel({ studentData, onLogout }) {
  const [page, setPage] = useState('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <StudentSidebar page={page} setPage={setPage} studentData={studentData} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--bg)' }}>
        {page === 'dashboard' && <StudentDashboard student={studentData} />}
        {page === 'chat' && <ChatPage courses={(studentData.courses || []).map(c => ({ code: c.courseId, name: c.courseId }))} setCourses={()=>{}} showToast={()=>{}} student={studentData} allowCourseCreation={false} />}
        {page === 'resources' && <StudentResources studentCourses={studentData.courses} />}
      </div>
    </div>
  );
}
