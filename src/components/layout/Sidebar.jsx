import { NavLink } from 'react-router-dom';
import { useState } from 'react';

function Sidebar({ onLogout }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [logoutHover, setLogoutHover] = useState(false);

  const menuItems = [
    { path: '/', label: '대시보드', icon: '📊', end: true },
    { path: '/ai-usage', label: 'AI 호출 통계', icon: '🤖' },
    { path: '/chat-pattern', label: '채팅 세션 통계', icon: '💬' },
    { path: '/user-video-word', label: '단어 수집 분석', icon: '📚' },
  ];

  // ===== 색상 팔레트 =====
  const colors = {
    bgMain: '#3A3530',          // 메인 배경 (다크 브라운)
    bgHover: '#4A4239',         // 호버 배경
    bgActive: '#8B7355',        // 활성 메뉴 (브라운)
    textActive: '#FFFFFF',      // 활성 텍스트
    textMuted: '#C9BFB1',       // 비활성 텍스트 (베이지)
    textLabel: '#8A7E6F',       // MENU 라벨
    border: '#4A4239',          // 구분선
    danger: '#A85850',          // 로그아웃 버튼
    dangerHover: '#8B453E',     // 로그아웃 호버
  };

  // ===== 스타일 =====
  const sidebarStyle = {
    width: '260px',
    backgroundColor: colors.bgMain,
    color: colors.textMuted,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 20px rgba(58, 53, 48, 0.15)',
    minHeight: '100vh',
  };

  const logoStyle = {
    padding: '24px 24px 20px 24px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    letterSpacing: '-0.3px',
  };

  const navStyle = {
    flex: 1,
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const menuLabelStyle = {
    fontSize: '11px',
    color: colors.textLabel,
    padding: '8px 16px 4px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
  };

  const menuItemStyle = ({ isActive }, isHovered) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: isActive ? colors.textActive : isHovered ? '#FFFFFF' : colors.textMuted,
    backgroundColor: isActive 
      ? colors.bgActive 
      : isHovered 
        ? colors.bgHover 
        : 'transparent',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxShadow: isActive ? '0 4px 12px rgba(139, 115, 85, 0.4)' : 'none',
  });

  const iconStyle = {
    fontSize: '18px',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const logoutBtnStyle = {
    margin: '12px',
    padding: '12px',
    backgroundColor: logoutHover ? colors.dangerHover : colors.danger,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transform: logoutHover ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: logoutHover 
      ? `0 6px 16px ${colors.danger}50` 
      : 'none',
  };

  const dividerStyle = {
    height: '1px',
    backgroundColor: colors.border,
    margin: '4px 16px',
  };

  return (
    <aside style={sidebarStyle}>
      {/* 로고 */}
      <div style={logoStyle}>
        <span style={{ fontSize: '24px' }}>🎬</span>
        <span>CLIP Admin</span>
      </div>

      {/* 메뉴 */}
      <nav style={navStyle}>
        <div style={menuLabelStyle}>MENU</div>

        {menuItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            end={item.end}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
            style={(props) => menuItemStyle(props, hoveredItem === item.path)}
          >
            <span style={iconStyle}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={dividerStyle}></div>

      {/* 로그아웃 버튼 */}
      <button 
        onClick={onLogout}
        onMouseEnter={() => setLogoutHover(true)}
        onMouseLeave={() => setLogoutHover(false)}
        style={logoutBtnStyle}
      >
        <span>🚪</span>
        <span>로그아웃</span>
      </button>
    </aside>
  );
}

export default Sidebar;