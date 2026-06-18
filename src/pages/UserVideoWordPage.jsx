import { useState, useEffect, useCallback } from 'react';
import { getUserVideoWordStats } from '../api/stats';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function UserVideoWordPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(50);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('user');
  const [searchHover, setSearchHover] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserVideoWordStats(startDate, endDate, limit);
      setData(response.data ?? []);
    } catch (err) {
      console.error('단어 수집 통계 로딩 에러:', err);
      setError('데이터 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, limit]);

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

  // ===== 데이터 가공 =====
  const uniqueUsers = new Set(data.map(item => item.userId)).size;
  const uniqueVideos = new Set(data.map(item => item.videoId)).size;
  const totalCollected = data.reduce((sum, item) => sum + (item.totalCollected ?? 0), 0);
  const totalCollectType = data.reduce((sum, item) => sum + (item.collectTypeCount ?? 0), 0);
  const totalPopupType = data.reduce((sum, item) => sum + (item.popupTypeCount ?? 0), 0);
  const avgPerUser = uniqueUsers > 0 ? (totalCollected / uniqueUsers).toFixed(1) : 0;
  const avgPerVideo = uniqueVideos > 0 ? (totalCollected / uniqueVideos).toFixed(1) : 0;

  const userAggregated = Object.values(
    data.reduce((acc, item) => {
      const key = item.userId;
      if (!acc[key]) {
        acc[key] = {
          userId: item.userId,
          userName: item.userName,
          videoCount: new Set(),
          collectTypeCount: 0,
          popupTypeCount: 0,
          totalCollected: 0,
        };
      }
      acc[key].videoCount.add(item.videoId);
      acc[key].collectTypeCount += item.collectTypeCount ?? 0;
      acc[key].popupTypeCount += item.popupTypeCount ?? 0;
      acc[key].totalCollected += item.totalCollected ?? 0;
      return acc;
    }, {})
  ).map(user => ({
    ...user,
    videoCount: user.videoCount.size,
  })).sort((a, b) => b.totalCollected - a.totalCollected);

  // 활용도 분포 (베이지 톤 컬러로 변경)
  const distributionData = [
    { range: '체험 (1-5)', count: userAggregated.filter(u => u.totalCollected >= 1 && u.totalCollected <= 5).length, color: colors.beige500 },
    { range: '꾸준 (6-10)', count: userAggregated.filter(u => u.totalCollected >= 6 && u.totalCollected <= 10).length, color: colors.brownLight },
    { range: '활발 (11-30)', count: userAggregated.filter(u => u.totalCollected >= 11 && u.totalCollected <= 30).length, color: colors.brown },
    { range: '파워 (30+)', count: userAggregated.filter(u => u.totalCollected > 30).length, color: colors.brownDark },
  ];

  // 도넛 차트 데이터
  const methodChartData = [
    { name: 'COLLECT', value: totalCollectType, color: colors.brown },
    { name: 'POPUP', value: totalPopupType, color: colors.beige600 },
  ];

  const filteredUserData = userAggregated.filter(item => {
    if (!searchKeyword) return true;
    return item.userName?.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  const filteredDetailData = data.filter(item => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      item.userName?.toLowerCase().includes(keyword) ||
      item.videoTitle?.toLowerCase().includes(keyword)
    );
  });

  if (loading) return <div style={loadingStyle}>📊 데이터 로딩 중...</div>;
  if (error) return <div style={errorStyle}>⚠️ {error}</div>;

  return (
    <div style={pageStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>📚 단어 수집 기능 활용도 분석</h1>
        <p style={subtitleStyle}>유저들이 단어 수집 기능을 얼마나 활발하게 사용하는지 분석합니다</p>
      </div>

      {/* 📅 필터 */}
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
          
          <span style={{ marginLeft: '15px', fontSize: '14px', color: colors.textMid, fontWeight: '500' }}>최대 조회:</span>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={dateInputStyle}>
            <option value={10}>10개</option>
            <option value={30}>30개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
          
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

      {/* 📊 핵심 지표 카드 */}
      <div style={cardGridStyle}>
        <StatCard
          icon="👥"
          label="활성 유저 수"
          value={uniqueUsers.toLocaleString()}
          unit="명"
          color={colors.brown}
          subtext="기능을 사용한 유저"
        />
        <StatCard
          icon="📚"
          label="총 수집 단어"
          value={totalCollected.toLocaleString()}
          unit="개"
          color={colors.brownLight}
          subtext="전체 수집 횟수"
        />
        <StatCard
          icon="📊"
          label="유저당 평균"
          value={avgPerUser}
          unit="개"
          color={colors.beige700}
          subtext="1인당 평균 수집"
        />
        <StatCard
          icon="🎬"
          label="영상당 평균"
          value={avgPerVideo}
          unit="개"
          color={colors.beige600}
          subtext="영상 1개당 평균"
        />
      </div>
{/* 🎯 차트 영역 */}
      <div style={chartGridStyle}>
        
        {/* 도넛 차트 - 수집 방식 비율 */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>🎯 수집 방식 비율</h3>
            <span style={panelBadgeStyle}>총 {totalCollected.toLocaleString()}회</span>
          </div>
          {totalCollected > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={methodChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, value }) => `$${name}: $${value}`}
                  >
                    {methodChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* 비율 텍스트 */}
              <div style={ratioRowStyle}>
                <div style={ratioItemStyle}>
                  <span style={{ ...dotStyle, backgroundColor: colors.brown }}></span>
                  <strong style={{ color: colors.textDark }}>COLLECT</strong>
                  <div style={ratioPercentStyle}>
                    {totalCollected > 0 ? ((totalCollectType / totalCollected) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div style={ratioItemStyle}>
                  <span style={{ ...dotStyle, backgroundColor: colors.beige600 }}></span>
                  <strong style={{ color: colors.textDark }}>POPUP</strong>
                  <div style={ratioPercentStyle}>
                    {totalCollected > 0 ? ((totalPopupType / totalCollected) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={emptyStyle}>데이터가 없습니다</div>
          )}
        </div>

        {/* 막대 차트 - 활용도 분포 */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>📈 유저 활용도 분포</h3>
            <span style={panelBadgeStyle}>총 {uniqueUsers.toLocaleString()}명</span>
          </div>
          {uniqueUsers > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.beige300} />
                  <XAxis dataKey="range" style={{ fontSize: '12px' }} stroke={colors.textMid} />
                  <YAxis allowDecimals={false} stroke={colors.textMid} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* 분포 설명 */}
              <div style={distributionLegendStyle}>
                <span style={{ ...dotStyle, backgroundColor: colors.beige500 }}></span>
                <span style={legendTextStyle}>체험</span>
                <span style={{ ...dotStyle, backgroundColor: colors.brownLight, marginLeft: '12px' }}></span>
                <span style={legendTextStyle}>꾸준</span>
                <span style={{ ...dotStyle, backgroundColor: colors.brown, marginLeft: '12px' }}></span>
                <span style={legendTextStyle}>활발</span>
                <span style={{ ...dotStyle, backgroundColor: colors.brownDark, marginLeft: '12px' }}></span>
                <span style={legendTextStyle}>파워</span>
              </div>
            </>
          ) : (
            <div style={emptyStyle}>데이터가 없습니다</div>
          )}
        </div>
      </div>

      {/* 📋 상세 데이터 (탭으로 전환) */}
      <div style={panelStyle}>
        <div style={tabHeaderStyle}>
          {/* 탭 버튼 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <TabButton 
              active={activeTab === 'user'}
              onClick={() => setActiveTab('user')}
            >
              👤 유저별 합산
            </TabButton>
            <TabButton 
              active={activeTab === 'detail'}
              onClick={() => setActiveTab('detail')}
            >
              🎬 유저-영상별 상세
            </TabButton>
          </div>

          {/* 검색 */}
          <input 
            type="text"
            placeholder={activeTab === 'user' ? '🔍 유저명 검색...' : '🔍 유저명/영상명 검색...'}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {/* 탭 1: 유저별 합산 표 */}
        {activeTab === 'user' && (
          <>
            <div style={tabDescStyle}>
              💡 한 유저가 여러 영상에서 수집한 단어를 모두 합산하여 표시 ({filteredUserData.length}명)
            </div>

            {filteredUserData.length === 0 ? (
              <div style={emptyStyle}>데이터가 없습니다</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={{ ...tableThStyle, width: '80px' }}>순위</th>
                      <th style={tableThStyle}>유저</th>
                      <th style={{ ...tableThStyle, textAlign: 'center' }}>영상 수</th>
                      <th style={{ ...tableThStyle, textAlign: 'center' }}>COLLECT</th>
                      <th style={{ ...tableThStyle, textAlign: 'center' }}>POPUP</th>
                      <th style={{ ...tableThStyle, textAlign: 'center' }}>총 수집</th>
                      <th style={tableThStyle}>선호 방식</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserData.map((user, index) => {
                      const rank = index + 1;
                      const collectRatio = user.totalCollected > 0 
                        ? (user.collectTypeCount / user.totalCollected * 100) 
                        : 0;
                      const preferMethod = collectRatio >= 50 ? 'COLLECT' : 'POPUP';
                      const preferColor = collectRatio >= 50 ? colors.brown : colors.beige700;

                      return (
                        <tr key={user.userId} style={tableRowStyle}>
                          <td style={tableTdStyle}>
                            <span style={getRankBadgeStyle(rank)}>
                              {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `${rank}`}
                            </span>
                          </td>
                          <td style={tableTdStyle}>
                            <div style={{ fontWeight: '600', color: colors.textDark }}>
                              {user.userName ?? '-'}
                            </div>
                            <div style={{ fontSize: '11px', color: colors.textLight }}>
                              ID: {user.userId}
                            </div>
                          </td>
                          <td style={{ ...tableTdStyle, textAlign: 'center' }}>{user.videoCount}개</td>
                          <td style={{ ...tableTdStyle, textAlign: 'center', color: colors.brown, fontWeight: '700' }}>
                            {user.collectTypeCount.toLocaleString()}
                          </td>
                          <td style={{ ...tableTdStyle, textAlign: 'center', color: colors.beige700, fontWeight: '700' }}>
                            {user.popupTypeCount.toLocaleString()}
                          </td>
                          <td style={{ ...tableTdStyle, textAlign: 'center' }}>
                            <strong style={{ fontSize: '15px', color: colors.textDark }}>
                              {user.totalCollected.toLocaleString()}
                            </strong>
                          </td>
                          <td style={tableTdStyle}>
                            <span style={preferBadgeStyle(preferColor)}>
                              {preferMethod} ({collectRatio.toFixed(0)}%)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* 탭 2: 유저-영상별 상세 표 */}
        {activeTab === 'detail' && (
          <>
            <div style={tabDescStyle}>
              💡 (유저, 영상) 단위로 상세 내역 표시 ({filteredDetailData.length}건)
            </div>

            {filteredDetailData.length === 0 ? (
              <div style={emptyStyle}>데이터가 없습니다</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={{ ...tableThStyle, width: '60px' }}>#</th>
                      <th style={tableThStyle}>유저</th>
                      <th style={tableThStyle}>영상</th>
                      <th style={{ ...tableThStyle, textAlign: 'center' }}>COLLECT</th>
                      <th style={{ ...tableThStyle, textAlign: 'center' }}>POPUP</th>
                      <th style={{ ...tableThStyle, textAlign: 'center' }}>합계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDetailData.map((item, index) => (
                      <tr key={`$${item.userId}-$${item.videoId}-${index}`} style={tableRowStyle}>
                        <td style={tableTdStyle}>{index + 1}</td>
                        <td style={tableTdStyle}>
                          <div style={{ fontWeight: '600', color: colors.textDark }}>
                            {item.userName ?? '-'}
                          </div>
                          <div style={{ fontSize: '11px', color: colors.textLight }}>
                            ID: {item.userId}
                          </div>
                        </td>
                        <td style={tableTdStyle}>
                          <div style={{ color: colors.textDark }}>{item.videoTitle ?? '-'}</div>
                          <div style={{ fontSize: '11px', color: colors.textLight }}>
                            ID: {item.videoId}
                          </div>
                        </td>
<td style={{ ...tableTdStyle, textAlign: 'center', color: colors.brown, fontWeight: '700' }}>
                          {(item.collectTypeCount ?? 0).toLocaleString()}
                        </td>
                        <td style={{ ...tableTdStyle, textAlign: 'center', color: colors.beige700, fontWeight: '700' }}>
                          {(item.popupTypeCount ?? 0).toLocaleString()}
                        </td>
                        <td style={{ ...tableTdStyle, textAlign: 'center' }}>
                          <strong style={{ fontSize: '15px', color: colors.textDark }}>
                            {(item.totalCollected ?? 0).toLocaleString()}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
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

function TabButton({ active, onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={tabBtnStyle(active, hover)}
    >
      {children}
    </button>
  );
}

// ===== 헬퍼 함수 =====
const getRankBadgeStyle = (rank) => {
  let color = colors.textLight;
  let bgColor = colors.beige200;
  
  if (rank === 1) { color = '#D4A574'; bgColor = '#FFF4E0'; }
  else if (rank === 2) { color = '#9C9396'; bgColor = '#F5F5F5'; }
  else if (rank === 3) { color = '#B87C4A'; bgColor = '#FFE8D6'; }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: bgColor,
    color: color,
    fontSize: rank <= 3 ? '20px' : '13px',
    fontWeight: '700',
  };
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

// ===== 도넛 차트 비율 표시 =====
const ratioRowStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: '15px',
  fontSize: '13px',
  paddingTop: '15px',
  borderTop: `1px solid ${colors.beige200}`,
};

const ratioItemStyle = {
  textAlign: 'center',
};

const ratioPercentStyle = {
  color: colors.textMid,
  marginTop: '5px',
  fontSize: '14px',
  fontWeight: '600',
};

// ===== 활용도 분포 범례 =====
const distributionLegendStyle = {
  marginTop: '15px',
  fontSize: '12px',
  color: colors.textMid,
  textAlign: 'center',
  paddingTop: '15px',
  borderTop: `1px solid ${colors.beige200}`,
};

const legendTextStyle = {
  color: colors.textDark,
  fontWeight: '500',
};

// ===== 탭 헤더 =====
const tabHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  flexWrap: 'wrap',
  gap: '10px',
};

const tabBtnStyle = (active, hover) => ({
  padding: '10px 20px',
  border: 'none',
  borderRadius: '10px',
  backgroundColor: active 
    ? colors.brown 
    : hover 
      ? colors.beige300 
      : colors.beige100,
  color: active ? colors.white : colors.textDark,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: active ? '700' : '500',
  transition: 'all 0.2s ease',
  boxShadow: active ? `0 4px 12px ${colors.brown}40` : 'none',
});

const tabDescStyle = {
  fontSize: '13px',
  color: colors.textMid,
  marginBottom: '15px',
  padding: '10px 14px',
  backgroundColor: colors.beige100,
  borderRadius: '8px',
};

const searchInputStyle = {
  padding: '10px 14px',
  border: `1px solid ${colors.beige400}`,
  borderRadius: '8px',
  fontSize: '14px',
  width: '280px',
  color: colors.textDark,
  backgroundColor: colors.white,
  outline: 'none',
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
  marginRight: '6px',
  verticalAlign: 'middle',
};

const preferBadgeStyle = (color) => ({
  display: 'inline-block',
  padding: '5px 12px',
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
  height: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textLight,
  fontSize: '14px',
};

export default UserVideoWordPage;