import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import AiUsagePage from './pages/AiUsagePage';
import ChatPatternPage from './pages/ChatPatternPage';
import UserVideoWordPage from './pages/UserVideoWordPage';
import { logoutAdmin } from './api/stats'; 
import UserSessionPage from './pages/UserSessionPage';
import VideoCurationPage from './pages/VideoCurationPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

const handleLogout = async () => {
  try {
    // 1. 백엔드에 로그아웃 요청 (토큰 블랙리스트 처리)
    await logoutAdmin();
    console.log('✅ 서버 로그아웃 성공');
  } catch (err) {
    // 토큰이 만료됐거나 네트워크 오류 등 - 무시하고 진행
    console.warn('⚠️ 서버 로그아웃 실패 (토큰 만료 가능):', err);
  } finally {
    // 2. 백엔드 응답과 무관하게 클라이언트는 무조건 로그아웃 처리
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  }
};

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isLoggedIn 
              ? <Navigate to="/" replace />
              : <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/" 
          element={
            isLoggedIn 
              ? <Layout onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="ai-usage" element={<AiUsagePage />} />
          <Route path="chat-pattern" element={<ChatPatternPage />} />
          <Route path="user-video-word" element={<UserVideoWordPage />} />
          <Route path="user-session" element={<UserSessionPage />} />
          <Route path="video-curation" element={<VideoCurationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;