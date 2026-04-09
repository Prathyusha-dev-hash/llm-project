import React, { useState, useEffect } from 'react';
import Sidebar      from '../components/Sidebar';
import Toast        from '../components/Toast';
import StudentsPage from './StudentsPage';
import CoursesPage  from './CoursesPage';
import AnalyticsPage from './AnalyticsPage';
import AdminResources from './AdminResources';

export default function AdminPanel({ adminData, onLogout }) {
  const [page,    setPage]    = useState('analytics');
  const [courses, setCourses] = useState([]);
  const [toast,   setToast]   = useState('');

  useEffect(() => {
    const courseQuery = adminData && adminData.courseId ? `?adminCourseId=${adminData.courseId}` : '';
    fetch(`/api/courses${courseQuery}`).then(r => r.json()).then(setCourses);
  }, [adminData]);

  const showToast = msg => setToast(msg);

  // When "Chat AI" is clicked on a student row (formerly switched to chat)
  const handleChatWith = (name) => {
    showToast(`AI Chat disabled for ${name}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar page={page} setPage={setPage} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {page === 'students'  && <StudentsPage  adminCourseId={adminData?.courseId} onChatWith={handleChatWith} showToast={showToast} />}
        {page === 'courses'   && <CoursesPage   courses={courses} setCourses={setCourses} showToast={showToast} />}
        {page === 'analytics' && <AnalyticsPage adminCourseId={adminData?.courseId} />}
        {page === 'resources' && <AdminResources adminCourseId={adminData?.courseId} courses={courses} showToast={showToast} />}
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
