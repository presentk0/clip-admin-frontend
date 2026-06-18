import { useState, useEffect, useCallback } from 'react';
import { getAiUsageStats, getChatPatternStats, getUserVideoWordStats } from '../api/stats';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function DashboardPage() {
  const [aiUsage, setAiUsage] = useState(null);
  const [chatPattern, setChatPattern] = useState(null);
  const [wordStats, setWordStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshHover, setRefreshHover] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usageRes, patternRes, wordRes] = await Promise.all([
        getAiUsageStats('', ''),
        getChatPatternStats('', ''),
        getUserVideoWordStats('', '', 100),
      ]);

      setAiUsage(usageRes.data);
      setChatPattern(patternRes.data);
      setWordStats(wordRes.data ?? []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('대시보드 로딩 에러:', err);
      setError('백엔드 서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return <div style={loadingStyle}>📊 데이터 집계 중...</div>;
  if (error) return <div style={errorStyle}>⚠️ {error}</div>;

  // ===== 데이터 가공 =====
  const aiChartData = [
    { name: 'AI 챗봇', value: aiUsage?.chatBotCallCount ?? 0, color: colors.brown },
    { name: '퀴즈 해설', value: aiUsage?.quizExplanationCount ?? 0, color: colors.beige600 },
  ];

  const chatChartData = [
    { name: '진행 중', count: chatPattern?.activeRoomsCount ?? 0, color: colors.brown },
    { name: '완료됨', count: chatPattern?.completedRoomsCount ?? 0, color: colors.beige600 },
  ];

  const uniqueUsers = new Set(wordStats.map(item => item.userId)).size;
  const totalRooms = (chatPattern?.activeRoomsCount ?? 0) + (chatPattern?.completedRoomsCount ?? 0);
  const completionRate = totalRooms > 0 
    ? ((chatPattern?.completedRoomsCount ?? 0) / totalRooms * 100).toFixed(0) 
    : 0;

  return (
    <div style={pageStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>📊 대시보드</h1>
          <p style={subtitleStyle}>
            안녕하세요, 관리자님 👋
            {lastUpdate && (
              <span style={{ marginLeft: '12px', color: colors.textMid }}>
                · 마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          onMouseEnter={() => setRefreshHover(true)}
          onMouseLeave={() => setRefreshHover(false)}
          style={refreshBtnStyle(refreshHover)}
        >
          🔄 새로고침
        </button>
      </div>

      {/* 핵심 지표 카드 4개 */}
      <div style={cardGridStyle}>
        <StatCard
          icon="🤖"
          label="총 AI 호출"
          value={(aiUsage?.totalCallCount ?? 0).toLocaleString()}
          unit="회"
          color={colors.brown}
        />
        <StatCard
          icon="💬"
          label="전체 채팅방"
          value={totalRooms.toLocaleString()}
          unit="개"
          color={colors.brownLight}
          subtext={`완료율 ${completionRate}%`}
        />
        <StatCard
          icon="🎯"
          label="평균 발음 점수"
          value={(chatPattern?.averagePronunciationScore ?? 0).toFixed(1)}
          unit="점"
          color={colors.beige700}
        />
        <StatCard
          icon="👥"
          label="활성 유저"
          value={uniqueUsers.toLocaleString()}
          unit="명"
          color={colors.beige600}
          subtext="단어 수집 중"
        />
      </div>

      {/* 차트 영역 */}
      <div style={chartGridStyle}>
        {/* AI 호출 비율 도넛 */}
        <div style={chartPanelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>📈 AI 호출 비율</h3>
            <span style={panelBadgeStyle}>
              총 {(aiUsage?.totalCallCount ?? 0).toLocaleString()}회
            </span>
          </div>
          {(aiUsage?.totalCallCount ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={aiChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {aiChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={emptyStyle}>아직 데이터가 없습니다</div>
          )}
        </div>

        {/* 채팅방 상태 막대 차트 */}
        <div style={chartPanelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>📊 채팅방 현황</h3>
            <span style={panelBadgeStyle}>
              총 {totalRooms.toLocaleString()}개
            </span>
          </div>
          {totalRooms > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chatChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.beige300} />
                <XAxis dataKey="name" stroke={colors.textMid} />
                <YAxis stroke={colors.textMid} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {chatChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={emptyStyle}>아직 데이터가 없습니다</div>
          )}
        </div>
      </div>

      {/* 활동 요약 패널 */}
      <div style={summaryPanelStyle}>
        <h3 style={panelTitleStyle}>📋 서비스 활동 요약</h3>
        <div style={summaryGridStyle}>
          <SummaryItem
            icon="🤖"
            label="AI 채팅 메시지 발화"
            value={`${(aiUsage?.chatBotCallCount ?? 0).toLocaleString()}회`}
            description="유저들과 AI 챗봇 간의 대화량"
          />
          <SummaryItem
            icon="💡"
            label="퀴즈 해설 생성"
            value={`${(aiUsage?.quizExplanationCount ?? 0).toLocaleString()}회`}
            description="AI가 생성한 퀴즈 해설 횟수"
          />
          <SummaryItem
            icon="💬"
            label="평균 대화 마디 수"
            value={`${(chatPattern?.averageTurnsPerRoom ?? 0).toFixed(1)}마디`}
            description="채팅방당 평균 대화 횟수"
          />
          <SummaryItem
            icon="📚"
            label="단어 수집 활동"
            value={`${wordStats.length}건`}
            description="유저-영상별 단어 수집 기록"
          />
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
      style={statCardStyle(color, hover)}
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

function SummaryItem({ icon, label, value, description }) {
  return (
    <div style={summaryItemStyle}>
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div>
        <div style={summaryItemLabelStyle}>{label}</div>
        <div style={summaryItemValueStyle}>{value}</div>
        <div style={summaryItemDescStyle}>{description}</div>
      </div>
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
  flexWrap: 'wrap',
  gap: '16px',
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

const refreshBtnStyle = (hover) => ({
  padding: '10px 20px',
  backgroundColor: hover ? colors.brownDark : colors.brown,
  color: colors.white,
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  transform: hover ? 'translateY(-2px)' : 'translateY(0)',
  boxShadow: hover 
    ? `0 8px 20px ${colors.brown}50` 
    : `0 4px 12px ${colors.brown}30`,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

// ===== 통계 카드 그리드 =====
const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '20px',
  marginBottom: '24px',
};

const statCardStyle = (color, hover) => ({
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
  backgroundColor: `${color}20`,
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
};

// ===== 차트 그리드 =====
const chartGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginBottom: '24px',
};

const chartPanelStyle = {
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
  marginBottom: '16px',
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

// ===== 활동 요약 패널 =====
const summaryPanelStyle = {
  backgroundColor: colors.white,
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${colors.beige300}`,
  boxShadow: '0 2px 8px rgba(139, 115, 85, 0.06)',
};

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '20px',
  marginTop: '16px',
};

const summaryItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '16px',
  backgroundColor: colors.beige100,
  borderRadius: '12px',
  border: `1px solid ${colors.beige200}`,
};

const summaryItemLabelStyle = {
  fontSize: '13px',
  color: colors.textMid,
  fontWeight: '500',
  marginBottom: '4px',
};

const summaryItemValueStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: colors.textDark,
  marginBottom: '4px',
};

const summaryItemDescStyle = {
  fontSize: '12px',
  color: colors.textLight,
};

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
  height: '280px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textLight,
  fontSize: '14px',
};

export default DashboardPage;