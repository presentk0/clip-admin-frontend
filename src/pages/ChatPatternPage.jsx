import { useState, useEffect, useCallback } from 'react';
import { getChatPatternStats } from '../api/stats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ChatPatternPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchHover, setSearchHover] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getChatPatternStats(startDate, endDate);
      setData(response.data);
    } catch (err) {
      console.error('채팅 통계 로딩 에러:', err);
      setError('데이터 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setQuickDate = (days) => {
    if (days === null) {
      setStartDate('');
      setEndDate('');
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  // 막대 차트 데이터
  const barChartData = data ? [
    { name: '진행 중', count: data.activeRoomsCount ?? 0, color: colors.brown },
    { name: '완료됨', count: data.completedRoomsCount ?? 0, color: colors.beige600 },
  ] : [];

  const pronunciationScore = data?.averagePronunciationScore ?? 0;
  const totalRooms = (data?.activeRoomsCount ?? 0) + (data?.completedRoomsCount ?? 0);
  const completionRate = totalRooms > 0 
    ? ((data?.completedRoomsCount ?? 0) / totalRooms * 100).toFixed(1)
    : 0;

  if (loading) return <div style={loadingStyle}>📊 데이터 로딩 중...</div>;
  if (error) return <div style={errorStyle}>⚠️ {error}</div>;

  return (
    <div style={pageStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>💬 채팅 세션 통계</h1>
        <p style={subtitleStyle}>유저 채팅방 사용 패턴과 발음 성과를 분석합니다</p>
      </div>

      {/* 📅 날짜 필터 */}
      <div style={filterBoxStyle}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <QuickDateBtn onClick={() => setQuickDate(null)}>전체</QuickDateBtn>
          <QuickDateBtn onClick={() => setQuickDate(0)}>오늘</QuickDateBtn>
          <QuickDateBtn onClick={() => setQuickDate(7)}>7일</QuickDateBtn>
          <QuickDateBtn onClick={() => setQuickDate(30)}>30일</QuickDateBtn>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={dateInputStyle} />
          <span style={{ color: colors.textMid }}>~</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={dateInputStyle} />
          <button 
            onClick={fetchData}
            onMouseEnter={() => setSearchHover(true)}
            onMouseLeave={() => setSearchHover(false)}
            style={searchBtnStyle(searchHover)}
          >
            🔍 조회
          </button>
        </div>
      </div>

      {/* 📊 카드 요약 (4개) */}
      <div style={cardGridStyle}>
        <StatCard
          icon="🟢"
          label="진행 중인 채팅방"
          value={(data?.activeRoomsCount ?? 0).toLocaleString()}
          unit="개"
          color={colors.brown}
        />
        <StatCard
          icon="✅"
          label="완료된 채팅방"
          value={(data?.completedRoomsCount ?? 0).toLocaleString()}
          unit="개"
          color={colors.brownLight}
          subtext={`완료율 ${completionRate}%`}
        />
        <StatCard
          icon="💬"
          label="방당 평균 대화 수"
          value={(data?.averageTurnsPerRoom ?? 0).toFixed(1)}
          unit="마디"
          color={colors.beige700}
        />
        <StatCard
          icon="🎯"
          label="평균 발음 점수"
          value={(data?.averagePronunciationScore ?? 0).toFixed(1)}
          unit="점"
          color={getScoreColor(pronunciationScore)}
        />
      </div>

      {/* 📈 차트 + 게이지 */}
      <div style={chartGridStyle}>
        {/* 막대 차트 */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>📊 채팅방 상태 분포</h3>
            <span style={panelBadgeStyle}>총 {totalRooms.toLocaleString()}개</span>
          </div>
          {totalRooms > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.beige300} />
                <XAxis dataKey="name" stroke={colors.textMid} />
                <YAxis stroke={colors.textMid} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={emptyStyle}>데이터가 없습니다</div>
          )}
        </div>

        {/* 발음 점수 게이지 */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>🎯 평균 발음 점수</h3>
          </div>
          <div style={{ padding: '30px 0', textAlign: 'center' }}>
            <div style={{ 
              fontSize: '56px', 
              fontWeight: '700', 
              color: getScoreColor(pronunciationScore), 
              marginBottom: '24px',
              letterSpacing: '-1px',
            }}>
              {pronunciationScore.toFixed(1)}
              <span style={{ fontSize: '20px', color: colors.textMid, marginLeft: '8px', fontWeight: '500' }}>
                / 100
              </span>
            </div>
            
            <div style={gaugeContainerStyle}>
              <div style={{
                ...gaugeBarStyle,
                width: `${Math.min(pronunciationScore, 100)}%`,
                backgroundColor: getScoreColor(pronunciationScore),
              }}></div>
            </div>

            <div style={scoreLabelStyle}>
              {getScoreLabel(pronunciationScore)}
            </div>
          </div>
        </div>
      </div>

      {/* 📋 상세 표 */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h3 style={panelTitleStyle}>📋 채팅 세션 상세 지표</h3>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={tableThStyle}>지표</th>
              <th style={{ ...tableThStyle, textAlign: 'right' }}>값</th>
              <th style={tableThStyle}>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr style={tableRowStyle}>
              <td style={tableTdStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.brown }}></span>
                진행 중인 채팅방
              </td>
              <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '600' }}>
                {(data?.activeRoomsCount ?? 0).toLocaleString()} 개
              </td>
              <td style={{ ...tableTdStyle, color: colors.textMid }}>
                현재 활성 상태(IN_PROGRESS)인 채팅방 수
              </td>
            </tr>
            <tr style={tableRowStyle}>
              <td style={tableTdStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.beige600 }}></span>
                완료된 채팅방
              </td>
              <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '600' }}>
                {(data?.completedRoomsCount ?? 0).toLocaleString()} 개
              </td>
              <td style={{ ...tableTdStyle, color: colors.textMid }}>
                완료(COMPLETED) 처리된 채팅방 수
              </td>
            </tr>
            <tr style={tableRowStyle}>
              <td style={tableTdStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.brownLight }}></span>
                완료율
              </td>
              <td style={{ ...tableTdStyle, textAlign: 'right' }}>
                <span style={percentBadgeStyle(colors.brown)}>{completionRate}%</span>
              </td>
              <td style={{ ...tableTdStyle, color: colors.textMid }}>
                전체 방 중 완료된 비율
              </td>
            </tr>
            <tr style={tableRowStyle}>
              <td style={tableTdStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.beige700 }}></span>
                평균 대화 마디 수
              </td>
              <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '600' }}>
                {(data?.averageTurnsPerRoom ?? 0).toFixed(1)} 마디
              </td>
              <td style={{ ...tableTdStyle, color: colors.textMid }}>
                방 하나당 주고받은 평균 대화 횟수 (Turn)
              </td>
            </tr>
            <tr style={tableRowStyle}>
              <td style={tableTdStyle}>
                <span style={{ ...dotStyle, backgroundColor: getScoreColor(pronunciationScore) }}></span>
                평균 발음 점수
              </td>
              <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '600' }}>
                {(data?.averagePronunciationScore ?? 0).toFixed(1)} 점
              </td>
              <td style={{ ...tableTdStyle, color: colors.textMid }}>
                유저들의 발음 정확도 평균 점수 (0~100)
              </td>
            </tr>
            <tr style={tableTotalRowStyle}>
              <td style={{ ...tableTdStyle, fontWeight: '700' }}>
                전체 채팅방 합계
              </td>
              <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '700' }}>
                {totalRooms.toLocaleString()} 개
              </td>
              <td style={{ ...tableTdStyle, color: colors.textMid }}>
                진행 중 + 완료된 방 총합
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== 서브 컴포넌트 =====
function StatCard({ icon, label, value, unit, color, subtext }) {
  const [hover, setHover] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={statCardStyle(hover)}
    >
      <div style={statIconStyle(color)}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={statLabelStyle}>{label}</div>
        <div style={statValueRowStyle}>
          <span style={statValueStyle}>{value}</span>
          <span style={statUnitStyle}>{unit}</span>
        </div>
        {subtext && <div style={statSubtextStyle}>{subtext}</div>}
      </div>
    </div>
  );
}

function QuickDateBtn({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={quickBtnStyle(hover)}
    >
      {children}
    </button>
  );
}

// ===== 헬퍼 함수 =====
const getScoreColor = (score) => {
  if (score >= 80) return '#198754';   // 우수 - 초록
  if (score >= 60) return '#0d6efd';   // 양호 - 파랑
  if (score >= 40) return '#E8A33D';   // 보통 - 주황
  if (score > 0) return '#C85450';     // 미흡 - 테라코타
  return '#9B9388';                     // 데이터 없음 - 회색
};

const getScoreLabel = (score) => {
  if (score >= 80) return '🏆 우수한 발음 수준입니다';
  if (score >= 60) return '👍 양호한 발음 수준입니다';
  if (score >= 40) return '💪 더 연습하면 좋겠어요';
  if (score > 0) return '📚 꾸준한 연습이 필요해요';
  return '아직 데이터가 부족합니다';
};

// ===== 색상 팔레트 =====
const colors = {
  beige100: '#F9F8F1',
  beige200: '#F7F3E7',
  beige300: '#EEEADF',
  beige400: '#E5E0D2',
  beige500: '#DCD6C6',
  beige600: '#CCC3B4',
  beige700: '#B8AC97',
  brown: '#8B7355',
  brownLight: '#A89177',
  brownDark: '#6B5640',
  textDark: '#3A3530',
  textMid: '#6B6259',
  textLight: '#9B9388',
  white: '#FFFFFF',
};

// ===== 페이지 스타일 =====
const pageStyle = {
  padding: '32px',
  fontFamily: "'Inter', system-ui, sans-serif",
  backgroundColor: colors.beige100,
  minHeight: '100vh',
};

const headerStyle = {
  marginBottom: '32px',
};

const titleStyle = {
  margin: '0 0 8px 0',
  fontSize: '28px',
  fontWeight: '700',
  color: colors.textDark,
  letterSpacing: '-0.5px',
};

const subtitleStyle = {
  margin: 0,
  fontSize: '14px',
  color: colors.textMid,
};

// ===== 필터 박스 =====
const filterBoxStyle = {
  padding: '20px',
  backgroundColor: colors.white,
  borderRadius: '16px',
  marginBottom: '24px',
  border: `1px solid ${colors.beige300}`,
  boxShadow: '0 2px 8px rgba(139, 115, 85, 0.06)',
};

const quickBtnStyle = (hover) => ({
  padding: '8px 18px',
  backgroundColor: hover ? colors.beige300 : colors.beige100,
  border: `1px solid ${hover ? colors.brown : colors.beige400}`,
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '13px',
  color: colors.textDark,
  fontWeight: '500',
  transition: 'all 0.2s ease',
});

const dateInputStyle = {
  padding: '10px 14px',
  border: `1px solid ${colors.beige400}`,
  borderRadius: '8px',
  fontSize: '14px',
  color: colors.textDark,
  backgroundColor: colors.white,
  outline: 'none',
};

const searchBtnStyle = (hover) => ({
  padding: '10px 24px',
  backgroundColor: hover ? colors.brownDark : colors.brown,
  color: colors.white,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  transform: hover ? 'translateY(-1px)' : 'translateY(0)',
  boxShadow: hover 
    ? `0 6px 16px ${colors.brown}50` 
    : `0 2px 8px ${colors.brown}30`,
});

// ===== 카드 그리드 =====
const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '20px',
  marginBottom: '24px',
};

const statCardStyle = (hover) => ({
  backgroundColor: colors.white,
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${colors.beige300}`,
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  transition: 'all 0.2s ease',
  cursor: 'default',
  transform: hover ? 'translateY(-4px)' : 'translateY(0)',
  boxShadow: hover 
    ? '0 12px 24px rgba(139, 115, 85, 0.15)'
    : '0 2px 8px rgba(139, 115, 85, 0.08)',
});

const statIconStyle = (color) => ({
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  backgroundColor: `${color}25`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '26px',
  flexShrink: 0,
});

const statLabelStyle = {
  fontSize: '13px',
  color: colors.textMid,
  fontWeight: '500',
  marginBottom: '4px',
};

const statValueRowStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '4px',
};

const statValueStyle = {
  fontSize: '26px',
  fontWeight: '700',
  color: colors.textDark,
  letterSpacing: '-0.5px',
};

const statUnitStyle = {
  fontSize: '14px',
  color: colors.textMid,
  fontWeight: '500',
};

const statSubtextStyle = {
  fontSize: '12px',
  color: colors.textLight,
  marginTop: '4px',
  fontWeight: '500',
};

// ===== 차트/패널 =====
const chartGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginBottom: '24px',
};

const panelStyle = {
  backgroundColor: colors.white,
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${colors.beige300}`,
  boxShadow: '0 2px 8px rgba(139, 115, 85, 0.06)',
};

const panelHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const panelTitleStyle = {
  margin: 0,
  fontSize: '16px',
  fontWeight: '700',
  color: colors.textDark,
};

const panelBadgeStyle = {
  padding: '4px 12px',
  backgroundColor: colors.beige200,
  color: colors.brown,
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
};

// ===== 발음 점수 게이지 =====
const gaugeContainerStyle = {
  width: '100%',
  height: '24px',
  backgroundColor: colors.beige200,
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
};

const gaugeBarStyle = {
  height: '100%',
  borderRadius: '12px',
  transition: 'width 0.8s ease-in-out',
};

const scoreLabelStyle = {
  marginTop: '20px',
  fontSize: '14px',
  color: colors.textMid,
  fontWeight: '500',
};

// ===== 표 =====
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHeaderRowStyle = {
  borderBottom: `2px solid ${colors.beige300}`,
};

const tableThStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  fontSize: '12px',
  color: colors.textMid,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableRowStyle = {
  borderBottom: `1px solid ${colors.beige200}`,
};

const tableTotalRowStyle = {
  borderBottom: `1px solid ${colors.beige200}`,
  backgroundColor: colors.beige100,
};

const tableTdStyle = {
  padding: '14px 8px',
  fontSize: '14px',
  color: colors.textDark,
};

const dotStyle = {
  display: 'inline-block',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  marginRight: '8px',
};

const percentBadgeStyle = (color) => ({
  display: 'inline-block',
  padding: '4px 10px',
  backgroundColor: `${color}20`,
  color: color,
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
});

// ===== 기타 =====
// ===== 기타 =====
const loadingStyle = {
  padding: '60px',
  fontSize: '18px',
  color: colors.textMid,
  textAlign: 'center',
  backgroundColor: colors.beige100,
  minHeight: '100vh',
};

const errorStyle = {
  padding: '60px',
  fontSize: '16px',
  color: '#c53030',
  textAlign: 'center',
  fontWeight: 'bold',
  backgroundColor: colors.beige100,
  minHeight: '100vh',
};

const emptyStyle = {
  height: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textLight,
  fontSize: '14px',
};

export default ChatPatternPage;