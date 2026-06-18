import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout({ onLogout }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f3f5' }}>
      {/* 좌측 사이드바 */}
      <Sidebar onLogout={onLogout} />

      {/* 우측 메인 컨텐츠 */}
      <main style={{ 
        flex: 1, 
        backgroundColor: '#f8f9fa', 
        overflow: 'auto',
        minWidth: 0,  // grid/flex 자식 overflow 방지
      }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;