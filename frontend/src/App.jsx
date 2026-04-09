import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import StudentPanel from './pages/StudentPanel';

export default function App() {
  const [userState, setUserState] = useState({
    isAuthenticated: false,
    role: null, // 'admin' | 'student'
    data: null  // student data if applicable
  });

  const handleLogin = (loginData) => {
    setUserState({
      isAuthenticated: true,
      role: loginData.role,
      data: loginData.role === 'admin' ? loginData.adminData : loginData.studentData
    });
  };

  const handleLogout = () => {
    setUserState({
      isAuthenticated: false,
      role: null,
      data: null
    });
  };

  if (!userState.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (userState.role === 'admin') {
    return <AdminPanel adminData={userState.data} onLogout={handleLogout} />;
  }

  if (userState.role === 'student') {
    return <StudentPanel studentData={userState.data} onLogout={handleLogout} />;
  }

  return null;
}
