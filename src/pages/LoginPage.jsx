import { useState } from 'react';
import { loginAdmin } from '../api/stats';
import frogImage from '../assets/icons/frog.png';


function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [btnHover, setBtnHover] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await loginAdmin(username, password);
      const token = response?.data?.accessToken;

      if (token) {
        localStorage.setItem('admin_token', token);
        onLoginSuccess();
      } else {
        setError('인증 토큰을 받지 못했습니다.');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      setError('로그인 실패. 아이디 및 비밀번호를 확인하거나 서버 상태를 점검하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* 배경 장식 */}
      <div style={bgDecoration1}></div>
      <div style={bgDecoration2}></div>
      <div style={bgDecoration3}></div>

      {/* 로그인 카드 */}
      <div style={cardStyle}>
        {/* 헤더 영역 */}
        <div style={headerStyle}>
          <div style={headerStyle}>
            <img 
              src={frogImage} 
              alt="CLIPZY Logo"
              style={logoImgStyle}
            />
          </div>
          <h1 style={titleStyle}>CLIPZY</h1>
          <p style={subtitleStyle}>관리자 대시보드에 로그인하세요</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} style={formStyle}>
          {/* 에러 메시지 */}
          {error && (
            <div style={errorBoxStyle}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              {error}
            </div>
          )}

          {/* 아이디 입력 */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>관리자 계정</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameFocus(true)}
              onBlur={() => setUsernameFocus(false)}
              placeholder="아이디를 입력하세요"
              required
              style={inputStyle(usernameFocus)}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>비밀번호</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              placeholder="비밀번호를 입력하세요"
              required
              style={inputStyle(passwordFocus)}
            />
          </div>

          {/* 로그인 버튼 */}
          <button 
            type="submit"
            disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={buttonStyle(loading, btnHover)}
          >
            {loading ? (
              <>
                <span style={spinnerStyle}></span>
                인증 중...
              </>
            ) : (
              <>
                로그인
              </>
            )}
          </button>

          {/* 푸터 */}
          <div style={footerStyle}>
            <span>© 2026 CLIPZY. All rights reserved.</span>
          </div>
        </form>
      </div>

      {/* 애니메이션 keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -30px) rotate(10deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 30px) rotate(-15deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ===== 색상 팔레트 =====
const colors = {
  beige100: '#F9F8F1',
  beige200: '#F7F3E7',
  beige300: '#EEEADF',
  beige400: '#E5E0D2',
  beige500: '#DCD6C6',
  beige600: '#CCC3B4',
  textDark: '#3A3530',      // 진한 갈색 (텍스트)
  textMid: '#6B6259',       // 중간 갈색 (서브 텍스트)
  brown: '#8B7355',         // 메인 액센트 (버튼)
  brownDark: '#6B5640',     // 호버용
  white: '#FFFFFF',
  errorBg: '#FEF2F2',
  errorBorder: '#FCA5A5',
  errorText: '#991B1B',
};

// ===== 스타일 =====
const containerStyle = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: `linear-gradient(135deg, $${colors.beige200} 0%, $${colors.beige400} 100%)`,
  fontFamily: "'Inter', system-ui, sans-serif",
  position: 'relative',
  overflow: 'hidden',
  padding: '20px',
};

const logoImgStyle = {
  width: '110px',
  height: '110px',
  margin: '0 auto 20px',
  display: 'block',
  objectFit: 'contain',
  // 부드러운 그림자
  filter: 'drop-shadow(0 8px 16px rgba(139, 115, 85, 0.2))',
  // 떠다니는 애니메이션
  animation: 'logoFloat 3s ease-in-out infinite',
};

// 배경 장식 - 원형 도형들
const bgDecoration1 = {
  position: 'absolute',
  top: '-200px',
  right: '-150px',
  width: '500px',
  height: '500px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${colors.beige500}80 0%, transparent 70%)`,
  animation: 'float1 8s ease-in-out infinite',
};

const bgDecoration2 = {
  position: 'absolute',
  bottom: '-150px',
  left: '-100px',
  width: '400px',
  height: '400px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${colors.beige600}60 0%, transparent 70%)`,
  animation: 'float2 10s ease-in-out infinite',
};

const bgDecoration3 = {
  position: 'absolute',
  top: '40%',
  left: '10%',
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${colors.beige300}80 0%, transparent 70%)`,
  animation: 'float3 6s ease-in-out infinite',
};

const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: '20px',
  padding: '48px 40px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 20px 60px rgba(139, 115, 85, 0.15), 0 4px 20px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  zIndex: 1,
  animation: 'fadeIn 0.6s ease-out',
  border: `1px solid ${colors.beige300}`,
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '36px',
};

const iconWrapperStyle = {
  width: '72px',
  height: '72px',
  margin: '0 auto 20px',
  background: `linear-gradient(135deg, $${colors.beige400} 0%, $${colors.beige600} 100%)`,
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 8px 24px ${colors.beige500}80`,
};

const titleStyle = {
  margin: '0 0 8px 0',
  fontSize: '30px',
  fontWeight: '700',
  color: colors.textDark,
  letterSpacing: '-0.5px',
};

const subtitleStyle = {
  margin: 0,
  fontSize: '14px',
  color: colors.textMid,
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const errorBoxStyle = {
  padding: '12px 16px',
  backgroundColor: colors.errorBg,
  border: `1px solid ${colors.errorBorder}`,
  borderRadius: '10px',
  color: colors.errorText,
  fontSize: '13px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle = {
  fontSize: '13px',
  color: colors.textDark,
  fontWeight: '600',
  marginLeft: '2px',
};

const inputStyle = (focused) => ({
  width: '100%',
  padding: '14px 16px',
  fontSize: '14px',
  border: focused ? `2px solid $${colors.brown}` : `2px solid $${colors.beige300}`,
  borderRadius: '10px',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  backgroundColor: focused ? colors.white : colors.beige100,
  color: colors.textDark,
});

const buttonStyle = (loading, hover) => ({
  width: '100%',
  padding: '15px',
  fontSize: '15px',
  fontWeight: '600',
  color: colors.white,
  background: loading 
    ? colors.beige600 
    : hover 
      ? colors.brownDark 
      : colors.brown,
  border: 'none',
  borderRadius: '10px',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  marginTop: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transform: hover && !loading ? 'translateY(-2px)' : 'translateY(0)',
  boxShadow: hover && !loading 
    ? `0 8px 20px ${colors.brown}60` 
    : `0 4px 12px ${colors.brown}30`,
  letterSpacing: '0.5px',
});

const spinnerStyle = {
  display: 'inline-block',
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTopColor: '#fff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const footerStyle = {
  textAlign: 'center',
  fontSize: '12px',
  color: colors.textMid,
  marginTop: '12px',
  paddingTop: '20px',
  borderTop: `1px solid ${colors.beige300}`,
};

export default LoginPage;