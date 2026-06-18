import { useState, useEffect, useCallback } from 'react';
import { getAiUsageStats } from '../api/stats';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function AiUsagePage() {
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
      const response = await getAiUsageStats(startDate, endDate);
      setData(response.data);
    } catch (err) {
      console.error('AI 통계 로딩 에러:', err);
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

  const chartData = data ? [
    { name: 'AI 챗봇 발화', value: data.chatBotCallCount ?? 0, color: colors.brown },
    { name: '퀴즈 AI 해설', value: data.quizExplanationCount ?? 0, color: colors.beige600 },
  ] : [];

  const totalCount = data?.totalCallCount ?? 0;

  const getPercent = (value) => {
    if (!totalCount) return 0;
    return ((value / totalCount) * 100).toFixed(1);
  };

  if (loading) return <div style={loadingStyle}>📊 데이터 로딩 중...</div>;
  if (error) return <div style={errorStyle}>⚠️ {error}</div>;

  return (
    <div style={pageStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>🤖 AI 호출 통계</h1>
        <p style={subtitleStyle}>AI API 호출 현황과 비용을 모니터링합니다</p>
      </div>

      {/* 📅 날짜 필터 영역 */}
      <div style={filterBoxStyle}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <QuickDateBtn onClick={() => setQuickDate(null)}>전체</QuickDateBtn>
          <QuickDateBtn onClick={() => setQuickDate(0)}>오늘</QuickDateBtn>
          <QuickDateBtn onClick={() => setQuickDate(7)}>7일</QuickDateBtn>
          <QuickDateBtn onClick={() => setQuickDate(30)}>30일</QuickDateBtn>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            style={dateInputStyle}
          />
          <span style={{ color: colors.textMid }}>~</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            style={dateInputStyle}
          />
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

      {/* 📊 카드 요약 */}
      <div style={cardGridStyle}>
        <StatCard
          icon="🤖"
          label="총 AI 호출 건수"
          value={totalCount.toLocaleString()}
          unit="회"
          color={colors.brown}
        />
        <StatCard
          icon="💬"
          label="AI 채팅 메시지 발화"
          value={(data?.chatBotCallCount ?? 0).toLocaleString()}
          unit="회"
          color={colors.brownLight}
          subtext={`${getPercent(data?.chatBotCallCount ?? 0)}%`}
        />
        <StatCard
          icon="💡"
          label="퀴즈 AI 해설 생성"
          value={(data?.quizExplanationCount ?? 0).toLocaleString()}
          unit="회"
          color={colors.beige700}
          subtext={`${getPercent(data?.quizExplanationCount ?? 0)}%`}
        />
      </div>

      {/* 📈 차트 + 표 영역 */}
      <div style={chartGridStyle}>
        {/* 도넛 차트 */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>📊 호출 비율</h3>
            <span style={panelBadgeStyle}>총 {totalCount.toLocaleString()}회</span>
          </div>
          {totalCount > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={emptyStyle}>데이터가 없습니다</div>
          )}
        </div>

        {/* 상세 표 */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>📋 상세 내역</h3>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableThStyle}>구분</th>
                <th style={{ ...tableThStyle, textAlign: 'right' }}>호출 횟수</th>
                <th style={{ ...tableThStyle, textAlign: 'right' }}>비율</th>
              </tr>
            </thead>
            <tbody>
              <tr style={tableRowStyle}>
                <td style={tableTdStyle}>
                  <span style={{ ...dotStyle, backgroundColor: colors.brown }}></span>
                  AI 채팅 봇 발화
                </td>
                <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '600' }}>
                  {(data?.chatBotCallCount ?? 0).toLocaleString()} 회
                </td>
                <td style={{ ...tableTdStyle, textAlign: 'right' }}>
                  <span style={percentBadgeStyle(colors.brown)}>
                    {getPercent(data?.chatBotCallCount ?? 0)}%
                  </span>
                </td>
              </tr>
              <tr style={tableRowStyle}>
                <td style={tableTdStyle}>
                  <span style={{ ...dotStyle, backgroundColor: colors.beige600 }}></span>
                  퀴즈 AI 해설 생성
                </td>
                <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '600' }}>
                  {(data?.quizExplanationCount ?? 0).toLocaleString()} 회
                </td>
                <td style={{ ...tableTdStyle, textAlign: 'right' }}>
                  <span style={percentBadgeStyle(colors.beige600)}>
                    {getPercent(data?.quizExplanationCount ?? 0)}%
                  </span>
                </td>
              </tr>
              <tr style={tableTotalRowStyle}>
                <td style={{ ...tableTdStyle, fontWeight: '700' }}>합계</td>
                <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '700' }}>
                  {totalCount.toLocaleString()} 회
                </td>
                <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '700' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
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

// ===== 스타일 =====
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
  gridTemplateColumns: 'repeat(3, 1fr)',
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
  fontSize: '28px',
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

// ===== 차트/표 그리드 =====
const chartGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
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
  height: '320px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textLight,
  fontSize: '14px',
};

export default AiUsagePage;