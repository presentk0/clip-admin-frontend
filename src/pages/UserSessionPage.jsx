import { useState, useEffect, useCallback } from 'react';
import { getUserSessionStats } from '../api/stats';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, PieChart, Pie, Legend  
} from 'recharts';


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

function UserSessionPage() {
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
      const response = await getUserSessionStats(startDate, endDate);
      setData(response.data);
    } catch (err) {
      console.error('세션 통계 로딩 에러:', err);
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

  // 시간대별 차트 데이터 가공
  const hourlyChartData = data?.hourlyDistribution?.map(item => ({
    hour: `${item.hour}시`,
    count: item.count,
    rawHour: item.hour,
  })) ?? [];
  const dailyTrendData = data?.dailyTrend?.map(item => ({
    date: formatDate(item.date),
    count: item.count,
  })) ?? [];

  // 체류 시간 분포 데이터
  const durationData = data?.durationDistribution ? [
    { name: '5분 미만', value: data.durationDistribution.under5min, color: colors.beige500 },
    { name: '5-15분', value: data.durationDistribution.min5to15, color: colors.beige700 },
    { name: '15-30분', value: data.durationDistribution.min15to30, color: colors.brownLight },
    { name: '30분 이상', value: data.durationDistribution.over30min, color: colors.brown },
  ] : [];

  const totalDurationCount = durationData.reduce((sum, item) => sum + item.value, 0);

  // 요일별 패턴 데이터
  const dayOfWeekData = data?.dayOfWeekPattern?.map(item => ({
    day: item.dayName,
    count: item.count,
    isWeekend: item.dayOfWeek === 1 || item.dayOfWeek === 7,
  })) ?? [];

  
  // 피크 요일 찾기
  const peakDay = dayOfWeekData.reduce(
    (max, curr) => curr.count > max.count ? curr : max,
    { day: '-', count: 0 }
  );

  // 피크 타임 찾기 (가장 많이 접속한 시간대)
  const peakHour = hourlyChartData.reduce(
    (max, curr) => curr.count > max.count ? curr : max,
    { hour: '-', count: 0, rawHour: 0 }
  );

  // 시간대별 색상 (피크 시간 강조)
  const getBarColor = (hour) => {
    if (hour === peakHour.rawHour) return colors.brown;
    if (Math.abs(hour - peakHour.rawHour) <= 2) return colors.brownLight;
    return colors.beige600;
  };

  if (loading) return <div style={loadingStyle}>📊 데이터 로딩 중...</div>;
  if (error) return <div style={errorStyle}>⚠️ {error}</div>;

  return (
    <div style={pageStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>👥 사용자 활동 분석</h1>
        <p style={subtitleStyle}>유저들의 로그인 패턴과 체류 시간을 분석합니다</p>
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

{/* 📊 핵심 지표 카드 4개 */}
      <div style={cardGridStyle}>
        <StatCard
          icon="🔢"
          label="전체 세션 수"
          value={(data?.totalSessions ?? 0).toLocaleString()}
          unit="개"
          color={colors.brown}
          subtext="기간 내 로그인 횟수"
        />
        <StatCard
          icon="👤"
          label="활성 유저 수"
          value={(data?.activeUsers ?? 0).toLocaleString()}
          unit="명"
          color={colors.brownLight}
          subtext="실제 접속한 유저"
        />
        <StatCard
          icon="⏱"
          label="평균 체류 시간"
          value={(data?.averageDurationMinutes ?? 0).toFixed(1)}
          unit="분"
          color={colors.beige700}
          subtext={getDurationLabel(data?.averageDurationMinutes ?? 0)}
        />
        <StatCard
          icon="🏆"
          label="최장 체류 시간"
          value={(data?.maxDurationMinutes ?? 0).toLocaleString()}
          unit="분"
          color={colors.beige600}
          subtext={`${((data?.maxDurationMinutes ?? 0) / 60).toFixed(1)}시간`}
        />
      </div>

      {/* 🕐 시간대별 로그인 분포 차트 */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h3 style={panelTitleStyle}>🕐 시간대별 로그인 분포</h3>
            <p style={panelSubtitleStyle}>
              각 시간대에 발생한 로그인 횟수
            </p>
          </div>
          {peakHour.count > 0 && (
            <span style={panelBadgeStyle}>
              피크 타임: {peakHour.hour} ({peakHour.count.toLocaleString()}회)
            </span>
          )}
        </div>
        
        {(data?.totalSessions ?? 0) > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart 
                data={hourlyChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.beige300} />
                <XAxis 
                  dataKey="hour" 
                  stroke={colors.textMid}
                  style={{ fontSize: '12px' }}
                  interval={1}
                  label={{ 
                    value: '시간대 (시)', 
                    position: 'insideBottom', 
                    offset: -10,
                    style: { fontSize: '13px', fill: colors.textMid, fontWeight: '600' }
                  }}
                />
                <YAxis 
                  stroke={colors.textMid}
                  allowDecimals={false}
                  label={{ 
                    value: '접속 수 (회)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: '13px', fill: colors.textMid, fontWeight: '600', textAnchor: 'middle' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.beige300}`,
                    borderRadius: '8px',
                    padding: '10px 14px',
                  }}
                  formatter={(value) => [`${value}회`, '접속 수']}
                  labelFormatter={(label) => `시간대: ${label}`}
                  cursor={{ fill: colors.beige200 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {hourlyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rawHour)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* 시간대 범례 */}
            <div style={legendContainerStyle}>
              <div style={legendItemStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.brown }}></span>
                <span>피크 타임</span>
              </div>
              <div style={legendItemStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.brownLight }}></span>
                <span>피크 인근 (±2시간)</span>
              </div>
              <div style={legendItemStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.beige600 }}></span>
                <span>일반 시간대</span>
              </div>
            </div>
          </>
        ) : (
          <div style={emptyStyle}>데이터가 없습니다</div>
        )}
      </div>
{/* 🆕 옵션 A: 일별 로그인 추이 */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h3 style={panelTitleStyle}>📅 일별 로그인 추이</h3>
            <p style={panelSubtitleStyle}>
              날짜별 로그인 횟수 변화 추세
            </p>
          </div>
          {dailyTrendData.length > 0 && (
            <span style={panelBadgeStyle}>
              {dailyTrendData.length}일간 데이터
            </span>
          )}
        </div>

        {dailyTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={dailyTrendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.beige300} />
              <XAxis 
                dataKey="date" 
                stroke={colors.textMid}
                style={{ fontSize: '12px' }}
                label={{ 
                  value: '날짜', 
                  position: 'insideBottom', 
                  offset: -5,
                  style: { fontSize: '13px', fill: colors.textMid, fontWeight: '600' }
                }}
              />
              <YAxis 
                stroke={colors.textMid}
                allowDecimals={false}
                label={{ 
                  value: '접속 수 (회)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: '13px', fill: colors.textMid, fontWeight: '600', textAnchor: 'middle' }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.beige300}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                }}
                formatter={(value) => [`${value}회`, '접속 수']}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={colors.brown}
                strokeWidth={3}
                dot={{ fill: colors.brown, r: 5 }}
                activeDot={{ r: 7, fill: colors.brownDark }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={emptyStyle}>데이터가 없습니다</div>
        )}
      </div>

      {/* 🆕 옵션 B + C: 체류 시간 분포 + 요일별 패턴 */}
      <div style={chartGridStyle}>
        
        {/* 옵션 B: 체류 시간 분포 (도넛 차트) */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h3 style={panelTitleStyle}>⏱ 체류 시간 분포</h3>
              <p style={panelSubtitleStyle}>
                유저가 얼마나 머무는지
              </p>
            </div>
            {totalDurationCount > 0 && (
              <span style={panelBadgeStyle}>
                총 {totalDurationCount.toLocaleString()}건
              </span>
            )}
          </div>

          {totalDurationCount > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={durationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {durationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}건`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* 범례 */}
              <div style={durationLegendStyle}>
                {durationData.map((item, idx) => (
                  <div key={idx} style={durationLegendItemStyle}>
                    <span style={{ ...dotStyle, backgroundColor: item.color }}></span>
                    <span style={{ flex: 1, fontSize: '13px', color: colors.textDark }}>
                      {item.name}
                    </span>
                    <strong style={{ fontSize: '13px', color: colors.textDark }}>
                      {item.value.toLocaleString()}건
                    </strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={emptyStyle}>데이터가 없습니다</div>
          )}
        </div>

        {/* 옵션 C: 요일별 패턴 (막대 차트) */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h3 style={panelTitleStyle}>📆 요일별 로그인 패턴</h3>
              <p style={panelSubtitleStyle}>
                어떤 요일에 가장 활발한지
              </p>
            </div>
            {peakDay.count > 0 && (
              <span style={panelBadgeStyle}>
                피크: {peakDay.day}요일
              </span>
            )}
          </div>

          {dayOfWeekData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={dayOfWeekData}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.beige300} />
                <XAxis 
                  dataKey="day" 
                  stroke={colors.textMid}
                  style={{ fontSize: '13px', fontWeight: '600' }}
                />
                <YAxis 
                  stroke={colors.textMid}
                  allowDecimals={false}
                  label={{ 
                    value: '접속 수 (회)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: '12px', fill: colors.textMid, fontWeight: '600', textAnchor: 'middle' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.beige300}`,
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value}회`, '접속 수']}
                  labelFormatter={(label) => `${label}요일`}
                  cursor={{ fill: colors.beige200 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {dayOfWeekData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.day === peakDay.day ? colors.brown :
                        entry.isWeekend ? colors.brownLight : colors.beige600
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={emptyStyle}>데이터가 없습니다</div>
          )}

          {/* 요일별 범례 */}
          {dayOfWeekData.some(d => d.count > 0) && (
            <div style={legendContainerStyle}>
              <div style={legendItemStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.brown }}></span>
                <span>피크 요일</span>
              </div>
              <div style={legendItemStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.brownLight }}></span>
                <span>주말</span>
              </div>
              <div style={legendItemStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.beige600 }}></span>
                <span>평일</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 📊 인사이트 + 시간대 분류 */}
      <div style={chartGridStyle}>
        {/* 시간대 그룹별 분포 */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>📊 시간대 그룹별 접속</h3>
          </div>
          
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableThStyle}>시간대</th>
                <th style={{ ...tableThStyle, textAlign: 'right' }}>접속 수</th>
                <th style={{ ...tableThStyle, textAlign: 'right' }}>비율</th>
              </tr>
            </thead>
            <tbody>
              {getTimeGroups(hourlyChartData).map((group, idx) => {
                const total = hourlyChartData.reduce((sum, h) => sum + h.count, 0);
                const percent = total > 0 ? ((group.count / total) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={idx} style={tableRowStyle}>
                    <td style={tableTdStyle}>
                      <span style={{ ...dotStyle, backgroundColor: group.color }}></span>
                      <strong>{group.icon}</strong> {group.label}
                      <div style={{ fontSize: '11px', color: colors.textLight, marginLeft: '18px' }}>
                        {group.range}
                      </div>
                    </td>
                    <td style={{ ...tableTdStyle, textAlign: 'right', fontWeight: '600' }}>
                      {group.count.toLocaleString()}
                    </td>
                    <td style={{ ...tableTdStyle, textAlign: 'right' }}>
                      <span style={percentBadgeStyle(group.color)}>{percent}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 인사이트 패널 */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>💡 활동 인사이트</h3>
          </div>
          
          <div style={insightContainerStyle}>
            <InsightCard
              icon="🏆"
              title="피크 타임"
              value={peakHour.hour}
              description={`이 시간대에 ${peakHour.count.toLocaleString()}회 접속이 있었어요`}
              color={colors.brown}
            />
            
            <InsightCard
              icon="⏱"
              title="평균 체류 시간"
              value={`${(data?.averageDurationMinutes ?? 0).toFixed(0)}분`}
              description={getDurationLabel(data?.averageDurationMinutes ?? 0)}
              color={colors.brownLight}
            />
            
            <InsightCard
              icon="👥"
              title="유저당 평균 세션"
              value={data?.activeUsers > 0 
                ? (data.totalSessions / data.activeUsers).toFixed(1) 
                : '0'}
              description="유저 1명당 평균 접속 횟수"
              color={colors.beige700}
            />
            
            <InsightCard
              icon="🎯"
              title="가장 활발한 요일"
              value={getMostActiveTime(hourlyChartData)}
              description="유저 활동이 집중된 시간대"
              color={colors.beige600}
            />
          </div>
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

function InsightCard({ icon, title, value, description, color }) {
  return (
    <div style={insightCardStyle}>
      <div style={insightIconStyle(color)}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={insightTitleStyle}>{title}</div>
        <div style={insightValueStyle}>{value}</div>
        <div style={insightDescStyle}>{description}</div>
      </div>
    </div>
  );
}

// ===== 헬퍼 함수 =====
const getDurationLabel = (minutes) => {
  if (minutes >= 60) return `${(minutes / 60).toFixed(1)}시간 - 매우 활발`;
  if (minutes >= 30) return '오래 머무름';
  if (minutes >= 10) return '꾸준한 사용';
  if (minutes >= 5) return '짧은 방문';
  if (minutes > 0) return '잠깐 둘러봄';
  return '데이터 부족';
};

const getTimeGroups = (hourlyData) => {
  const groups = [
    { label: '새벽', range: '0-6시', icon: '🌙', color: '#9B9388', hours: [0, 1, 2, 3, 4, 5] },
    { label: '오전', range: '6-12시', icon: '🌅', color: '#CCC3B4', hours: [6, 7, 8, 9, 10, 11] },
    { label: '오후', range: '12-18시', icon: '☀️', color: '#A89177', hours: [12, 13, 14, 15, 16, 17] },
    { label: '저녁', range: '18-24시', icon: '🌆', color: '#8B7355', hours: [18, 19, 20, 21, 22, 23] },
  ];

  return groups.map(group => ({
    ...group,
    count: hourlyData
      .filter(h => group.hours.includes(h.rawHour))
      .reduce((sum, h) => sum + h.count, 0),
  }));
};

const getMostActiveTime = (hourlyData) => {
  if (!hourlyData || hourlyData.length === 0) return '-';
  
  const groups = getTimeGroups(hourlyData);
  const mostActive = groups.reduce(
    (max, curr) => curr.count > max.count ? curr : max,
    { label: '-', count: 0 }
  );
  
  return mostActive.count > 0 ? `${mostActive.label} (${mostActive.range})` : '-';
};

// 날짜 포맷 (2024-12-01 → 12/01)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateStr;
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
  marginBottom: '24px',
};

const panelSubtitleStyle = {
  margin: '4px 0 0 0',
  fontSize: '12px',
  color: colors.textMid,
  fontWeight: '400',
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
  padding: '6px 14px',
  backgroundColor: colors.beige200,
  color: colors.brown,
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
};

// ===== 범례 =====
const legendContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '24px',
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: `1px solid ${colors.beige200}`,
  fontSize: '12px',
  color: colors.textMid,
};

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

// ===== 인사이트 카드 =====
const insightContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const insightCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '14px 16px',
  backgroundColor: colors.beige100,
  borderRadius: '12px',
  border: `1px solid ${colors.beige200}`,
};

const insightIconStyle = (color) => ({
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: `${color}25`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  flexShrink: 0,
});

const insightTitleStyle = {
  fontSize: '12px',
  color: colors.textMid,
  fontWeight: '500',
  marginBottom: '2px',
};

const insightValueStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: colors.textDark,
  marginBottom: '2px',
};

const insightDescStyle = {
  fontSize: '11px',
  color: colors.textLight,
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
  verticalAlign: 'middle',
};

const percentBadgeStyle = (color) => ({
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '12px',
  backgroundColor: `${color}20`,
  color: color,
  fontSize: '12px',
  fontWeight: '700',
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

const durationLegendStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: `1px solid ${colors.beige200}`,
};

const durationLegendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  backgroundColor: colors.beige100,
  borderRadius: '8px',
};

export default UserSessionPage;