import React, { useState, useRef, useEffect } from 'react';
import CourseDropdown from '../components/CourseDropdown';
import AddCourseModal from '../components/AddCourseModal';

const getStarters = (courseCode) => [
  { label: '📋 Generate Quiz',  text: `Make a 5-question quiz for ${courseCode}` },
  { label: '🎯 Gap Analysis',   text: `Which students are struggling in ${courseCode}?` },
  { label: '💡 Explain Topic',  text: `Explain a key concept from ${courseCode}` },
  { label: '📚 Study Plan',     text: `Create a study plan for at-risk students in ${courseCode}` },
];

const CHIPS = [
  { label: '📋 Quiz',       prefix: 'Generate a quiz on ' },
  { label: '💡 Explain',    prefix: 'Explain this concept: ' },
  { label: '🎯 Gap',        prefix: 'Which students struggle with ' },
  { label: '✏️ Feedback',   prefix: 'Give feedback on: ' },
  { label: '📚 Study Plan', prefix: 'Create a study plan for ' },
];

// simple markdown → html
function md(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em style="color:var(--accent);font-style:normal;font-size:10.5px;font-family:\'Geist Mono\',monospace;background:rgba(45,91,227,.08);padding:2px 6px;border-radius:4px">📎 $1</em>')
    .replace(/\n/g, '<br/>');
}

export default function ChatPage({ courses, setCourses, showToast, student, allowCourseCreation = true }) {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [uploadingAssignment, setUploadingAssignment] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [selected, setSelected]     = useState(courses[0] || null);
  const [showModal, setShowModal]   = useState(false);
  const endRef = useRef(null);
  const taRef  = useRef(null);
  const fileRef = useRef(null);
  const selectedCourse = selected ?? courses[0] ?? null;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    if (!student?.id) return;
    const params = new URLSearchParams({ studentId: student.id });
    if (selectedCourse?.code) params.set('courseId', selectedCourse.code);
    fetch(`/api/assignments/history?${params.toString()}`)
      .then(res => res.json())
      .then(setAssignmentHistory)
      .catch(() => setAssignmentHistory([]));
  }, [student?.id, selectedCourse?.code]);

  const sendMsg = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    if (taRef.current) { taRef.current.style.height = 'auto'; }
    const time = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { role: 'user', text: msg, time }]);
    setLoading(true);
    try {
      const res  = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, courseId: selectedCourse?.code || '' }) });
      const data = await res.json();
      const t2   = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
      setMessages(m => [...m, { role: 'agent', text: data.reply, time: t2 }]);
    } catch {
      setMessages(m => [...m, { role: 'agent', text: 'Could not reach the server. Make sure the API is running on port 4000.', time: '' }]);
    }
    setLoading(false);
  };

  const addCourse = async (form) => {
    try {
      const res    = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const course = await res.json();
      setCourses(c => [...c, course]);
      setSelected(course);
      setShowModal(false);
      showToast(`"${course.code} — ${course.name}" created`);
    } catch { showToast('Failed to create course'); }
  };

  const evaluateAssignment = async () => {
    if (!assignmentFile) {
      showToast('Choose a text or code file first');
      return;
    }

    const startedAt = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, {
      role: 'user',
      text: `Evaluate my assignment for **${selectedCourse?.code || 'this course'}**.\n\nFile: ${assignmentFile.name}${assignmentNotes.trim() ? `\nNotes: ${assignmentNotes.trim()}` : ''}`,
      time: startedAt
    }]);

    setUploadingAssignment(true);
    try {
      const formData = new FormData();
      formData.append('file', assignmentFile);
      formData.append('courseId', selectedCourse?.code || '');
      formData.append('notes', assignmentNotes.trim());
      formData.append('studentId', student?.id || '');
      formData.append('studentName', student?.name || '');

      const res = await fetch('/api/chat/evaluate-assignment', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      const completedAt = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

      if (!res.ok) {
        throw new Error(data.error || 'Assignment evaluation failed');
      }

      setMessages(m => [...m, {
        role: 'agent',
        text: `Assessment for **${data.fileName}**\n\n${data.reply}`,
        time: completedAt
      }]);
      setAssignmentHistory(history => data.review ? [data.review, ...history].slice(0, 10) : history);

      setAssignmentFile(null);
      setAssignmentNotes('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      const failedAt = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
      setMessages(m => [...m, {
        role: 'agent',
        text: err.message || 'Assignment evaluation failed.',
        time: failedAt
      }]);
    } finally {
      setUploadingAssignment(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--panel)', overflow: 'hidden' }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 24px', borderBottom: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, letterSpacing: '-.01em', flex: 1 }}>
          AI Instructor <em style={{ fontStyle: 'italic', color: 'var(--text2)' }}>— trackED</em>
        </div>
        <CourseDropdown
          courses={courses}
          selected={selectedCourse}
          onSelect={setSelected}
          onAddClick={() => setShowModal(true)}
          allowAdd={allowCourseCreation}
        />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 10% 16px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Welcome screen */}
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', animation: 'fadeUp .4s ease' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2z" />
                <path d="M9 8H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2h-4" />
                <circle cx="9" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" />
              </svg>
            </div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, letterSpacing: '-.02em', marginBottom: 6 }}>
              Hello
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, maxWidth: 380, marginBottom: 28 }}>
              I'm your AI instructor assistant — ask me to generate quizzes, explain topics,
              find student knowledge gaps, write personalized feedback, or review an uploaded assignment against your course materials.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 480 }}>
              {getStarters(selectedCourse?.code || 'the course').map((s, i) => {
                const text = s.text;
                return (
                  <div key={i} onClick={() => sendMsg(text)}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '13px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = 'var(--sh)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text2)', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, animation: 'fadeUp .25s ease', maxWidth: 780, width: '100%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, background: m.role === 'agent' ? 'var(--text)' : 'var(--accent-bg)', color: m.role === 'agent' ? '#fff' : 'var(--accent)' }}>
              {m.role === 'agent' ? 'AI' : 'DR'}
            </div>
            <div style={{ maxWidth: '86%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                dangerouslySetInnerHTML={{ __html: md(m.text) }}
                style={{ padding: '11px 15px', borderRadius: 14, fontSize: 13.5, lineHeight: 1.7, ...(m.role === 'agent' ? { background: 'var(--bg)', border: '1px solid var(--border)', borderTopLeftRadius: 4 } : { background: 'var(--accent)', color: '#fff', borderTopRightRadius: 4 }) }}
              />
              {m.time && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.time}</div>}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 10, maxWidth: 780, animation: 'fadeUp .25s ease' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0, marginTop: 2 }}>AI</div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, borderTopLeftRadius: 4, padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', animation: `typingBounce 1.2s ${delay}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 10% 20px', flexShrink: 0 }}>
        {assignmentHistory.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--sh)', padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Recent Assignment Reviews</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {assignmentHistory.slice(0, 4).map(review => (
                <div key={review.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{review.fileName}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text2)', marginTop: 3 }}>{review.courseId || 'Course not set'} • {new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{review.predictedPercentage}%</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text2)' }}>{review.letterGrade}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--r)', background: '#fff', boxShadow: 'var(--sh)', transition: 'border-color .2s' }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(45,91,227,.4)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {/* Chips */}
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px 0', flexWrap: 'wrap' }}>
            {CHIPS.map((c, i) => (
              <div key={i} onClick={() => { setInput(c.prefix); taRef.current?.focus(); }}
                style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', color: 'var(--text2)', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
              >{c.label}</div>
            ))}
          </div>
          {assignmentFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px 0', flexWrap: 'wrap' }}>
              <div style={{ padding: '5px 10px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text2)' }}>
                {assignmentFile.name}
              </div>
              <input
                value={assignmentNotes}
                onChange={e => setAssignmentNotes(e.target.value)}
                placeholder={`Optional notes for ${selectedCourse?.code || 'this course'} assignment`}
                style={{ flex: 1, minWidth: 220, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', fontFamily: "'Geist',sans-serif", fontSize: 12.5, color: 'var(--text)', background: 'var(--bg)' }}
              />
              <button
                onClick={() => {
                  setAssignmentFile(null);
                  setAssignmentNotes('');
                  if (fileRef.current) fileRef.current.value = '';
                }}
                style={{ padding: '7px 10px', borderRadius: 10, border: '1px solid var(--border)', background: '#fff', color: 'var(--text2)', cursor: 'pointer', fontSize: 12 }}
              >
                Remove
              </button>
            </div>
          )}
          {/* Textarea + send */}
          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '8px 12px 10px', gap: 8 }}>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.js,.jsx,.ts,.tsx,.json,.csv,.py,.java,.c,.cpp,.h,.hpp,.sql,.html,.css,text/*,application/json,application/javascript"
              onChange={e => setAssignmentFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading || uploadingAssignment}
              title="Upload assignment for review"
              style={{ width: 32, height: 32, borderRadius: 'var(--rs)', flexShrink: 0, background: assignmentFile ? 'var(--accent-bg)' : 'var(--bg)', border: '1px solid var(--border)', cursor: loading || uploadingAssignment ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: assignmentFile ? 'var(--accent)' : 'var(--text2)', transition: 'all .15s' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              placeholder="Ask trackED anything…"
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontFamily: "'Geist',sans-serif", fontSize: 14, color: 'var(--text)', background: 'none', lineHeight: 1.5, maxHeight: 120, minHeight: 22 }}
            />
            <button
              onClick={evaluateAssignment}
              disabled={uploadingAssignment || !assignmentFile}
              title="Review uploaded assignment"
              style={{ padding: '0 10px', height: 32, borderRadius: 'var(--rs)', flexShrink: 0, background: uploadingAssignment ? 'var(--border2)' : assignmentFile ? 'var(--text)' : 'var(--bg)', border: assignmentFile ? 'none' : '1px solid var(--border)', cursor: uploadingAssignment || !assignmentFile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: assignmentFile ? '#fff' : 'var(--text3)', transition: 'background .15s', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              {uploadingAssignment ? 'Reviewing...' : 'Review'}
            </button>
            <button onClick={() => sendMsg()} disabled={loading}
              style={{ width: 32, height: 32, borderRadius: 'var(--rs)', flexShrink: 0, background: loading ? 'var(--border2)' : 'var(--text)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background .15s' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showModal && allowCourseCreation && <AddCourseModal onClose={() => setShowModal(false)} onSave={addCourse} />}
    </div>
  );
}
