import { useState } from 'react';
import { registerCuratedVideo, registerBatchVideos } from '../api/stats';

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
  success: '#52A878',
  successBg: '#E8F5E9',
  error: '#C53030',
  errorBg: '#FEF2F2',
};

// ===== Enum 옵션 =====
const LEARNING_GOALS = [
  { value: 'TRAVEL', label: '여행', icon: '✈️' },
  { value: 'BUSINESS', label: '비즈니스', icon: '💼' },
  { value: 'SELF_DEVELOPMENT', label: '자기계발', icon: '📚' },
  { value: 'EXAM', label: '영어시험', icon: '📝' },
  { value: 'DAILY', label: '일상', icon: '☕' },
  { value: 'NONE', label: '없음', icon: '🎯' },
];

const DIFFICULTIES = [
  { value: 'BEGINNER', label: '초급', stars: 1, color: '#52A878' },
  { value: 'INTERMEDIATE', label: '중급', stars: 2, color: '#D69E2E' },
  { value: 'ADVANCED', label: '고급', stars: 3, color: '#C53030' },
];

function VideoCurationPage() {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div style={pageStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>🎬 영상 큐레이션</h1>
        <p style={subtitleStyle}>YouTube 영상을 학습 콘텐츠로 등록합니다</p>
      </div>

      {/* 탭 */}
      <div style={tabContainerStyle}>
        <TabButton 
          active={activeTab === 'single'}
          onClick={() => setActiveTab('single')}
        >
          📝 단일 등록
        </TabButton>
        <TabButton 
          active={activeTab === 'batch'}
          onClick={() => setActiveTab('batch')}
        >
          📦 일괄 등록
        </TabButton>
      </div>

      {/* 컨텐츠 */}
      {activeTab === 'single' ? <SingleRegisterTab /> : <BatchRegisterTab />}
    </div>
  );
}

// ===== 탭 버튼 =====
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

// ===== 단일 등록 탭 =====
function SingleRegisterTab() {
  const [videoInput, setVideoInput] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success: true, message: '' }
  const [btnHover, setBtnHover] = useState(false);

  // YouTube URL에서 videoId 추출
  const extractVideoId = (input) => {
    if (!input) return '';
    
    // 이미 11자리 ID면 그대로 반환
    if (input.length === 11 && !input.includes('/')) {
      return input;
    }

    // URL에서 추출
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }

    return input; // 추출 실패시 입력값 그대로
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const videoId = extractVideoId(videoInput);

    if (!videoId || videoId.length !== 11) {
      setResult({ 
        success: false, 
        message: '올바른 YouTube Video ID 또는 URL을 입력해주세요.' 
      });
      return;
    }

    if (!learningGoal || !difficulty) {
      setResult({ 
        success: false, 
        message: '학습 목표와 난이도를 모두 선택해주세요.' 
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      await registerCuratedVideo({
        videoId,
        learningGoal,
        difficulty,
      });

      setResult({ 
        success: true, 
        message: `✅ 영상이 성공적으로 등록되었습니다! (ID: ${videoId})` 
      });

      // 폼 초기화
      setVideoInput('');
      setLearningGoal('');
      setDifficulty('');
    } catch (err) {
      console.error('영상 등록 에러:', err);
      const errorMsg = err.response?.data?.message || '영상 등록에 실패했습니다.';
      setResult({ success: false, message: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const previewVideoId = extractVideoId(videoInput);
  const isValidVideoId = previewVideoId && previewVideoId.length === 11;

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {/* YouTube URL/ID 입력 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>
          YouTube URL 또는 Video ID
          <span style={requiredStyle}>*</span>
        </label>
        <input 
          type="text"
          value={videoInput}
          onChange={(e) => setVideoInput(e.target.value)}
          placeholder="https://youtube.com/watch?v=... 또는 dQw4w9WgXcQ"
          style={inputStyle}
        />
        <p style={hintStyle}>
          💡 YouTube URL 전체 또는 11자리 비디오 ID를 입력하세요
        </p>
        
        {/* 추출된 ID 미리보기 */}
        {videoInput && (
          <div style={previewBoxStyle(isValidVideoId)}>
            {isValidVideoId ? (
              <>
                <span style={{ color: colors.success }}>✓</span>
                <span>추출된 Video ID: <strong>{previewVideoId}</strong></span>
              </>
            ) : (
              <>
                <span style={{ color: colors.error }}>✗</span>
                <span>올바른 ID가 아닙니다 (11자리여야 함)</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 학습 목표 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>
          학습 목표
          <span style={requiredStyle}>*</span>
        </label>
        <div style={goalGridStyle}>
          {LEARNING_GOALS.map(goal => (
            <GoalCard
              key={goal.value}
              goal={goal}
              selected={learningGoal === goal.value}
              onClick={() => setLearningGoal(goal.value)}
            />
          ))}
        </div>
      </div>

      {/* 난이도 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>
          난이도
          <span style={requiredStyle}>*</span>
        </label>
        <div style={difficultyGridStyle}>
          {DIFFICULTIES.map(diff => (
            <DifficultyCard
              key={diff.value}
              difficulty={diff}
              selected={difficulty === diff.value}
              onClick={() => setDifficulty(diff.value)}
            />
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <button 
        type="submit"
        disabled={loading}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={submitBtnStyle(loading, btnHover)}
      >
        {loading ? '⏳ 등록 중...' : '+ 영상 등록하기'}
      </button>

      {/* 결과 메시지 */}
      {result && (
        <div style={resultBoxStyle(result.success)}>
          {result.message}
        </div>
      )}
    </form>
  );
}

// ===== 학습 목표 카드 =====
function GoalCard({ goal, selected, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={goalCardStyle(selected, hover)}
    >
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{goal.icon}</div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
        {goal.label}
      </div>
    </div>
  );
}

// ===== 난이도 카드 =====
function DifficultyCard({ difficulty, selected, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={difficultyCardStyle(selected, hover, difficulty.color)}
    >
      <div style={{ fontSize: '20px', marginBottom: '8px' }}>
        {'⭐'.repeat(difficulty.stars)}
      </div>
      <div style={{ fontSize: '16px', fontWeight: '700', color: colors.textDark }}>
        {difficulty.label}
      </div>
      <div style={{ fontSize: '11px', color: colors.textLight, marginTop: '4px' }}>
        Level {difficulty.stars}
      </div>
    </div>
  );
}

// ===== 일괄 등록 탭 =====
function BatchRegisterTab() {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [btnHover, setBtnHover] = useState(false);
  const [exampleHover, setExampleHover] = useState(false);

  const exampleJson = JSON.stringify([
    {
      videoId: "dQw4w9WgXcQ",
      learningGoal: "DAILY",
      difficulty: "BEGINNER"
    },
    {
      videoId: "jNQXAC9IVRw",
      learningGoal: "BUSINESS",
      difficulty: "INTERMEDIATE"
    },
    {
      videoId: "kJQP7kiw5Fk",
      learningGoal: "TRAVEL",
      difficulty: "ADVANCED"
    }
  ], null, 2);

  const handleLoadExample = () => {
    setJsonInput(exampleJson);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jsonInput.trim()) {
      setResult({ 
        success: false, 
        message: 'JSON 데이터를 입력해주세요.' 
      });
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (err) {
      setResult({ 
        success: false, 
        message: '❌ JSON 형식이 올바르지 않습니다. 문법을 확인해주세요.' 
      });
      return;
    }

    if (!Array.isArray(parsedData)) {
      setResult({ 
        success: false, 
        message: '❌ 데이터는 배열 형식이어야 합니다. [ {...}, {...} ]' 
      });
      return;
    }

    if (parsedData.length === 0) {
      setResult({ 
        success: false, 
        message: '❌ 등록할 영상이 없습니다.' 
      });
      return;
    }

    // 각 항목 유효성 검사
    const invalidItems = [];
    parsedData.forEach((item, idx) => {
      if (!item.videoId || !item.learningGoal || !item.difficulty) {
        invalidItems.push(idx + 1);
      }
    });

    if (invalidItems.length > 0) {
      setResult({ 
        success: false, 
        message: `❌ ${invalidItems.join(', ')}번째 항목에 필수 필드(videoId, learningGoal, difficulty)가 빠졌습니다.` 
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      await registerBatchVideos(parsedData);

      setResult({ 
        success: true, 
        message: `✅ ${parsedData.length}개의 영상이 성공적으로 등록되었습니다!` 
      });
      setJsonInput('');
    } catch (err) {
      console.error('일괄 등록 에러:', err);
      const errorMsg = err.response?.data?.message || '일괄 등록에 실패했습니다.';
      setResult({ success: false, message: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  // JSON 미리보기 (몇 개인지)
  const previewCount = (() => {
    if (!jsonInput.trim()) return 0;
    try {
      const parsed = JSON.parse(jsonInput);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return -1; // 파싱 에러
    }
  })();

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {/* 안내 박스 */}
      <div style={infoBoxStyle}>
        <h4 style={infoTitleStyle}>📋 일괄 등록 사용법</h4>
        <ul style={infoListStyle}>
          <li>JSON 배열 형식으로 여러 영상을 한 번에 등록할 수 있습니다</li>
          <li>각 영상은 <strong>videoId</strong>, <strong>learningGoal</strong>, <strong>difficulty</strong> 3개 필드가 필수입니다</li>
          <li>학습 목표: <code>TRAVEL, BUSINESS, SELF_DEVELOPMENT, EXAM, DAILY, NONE</code></li>
          <li>난이도: <code>BEGINNER, INTERMEDIATE, ADVANCED</code></li>
        </ul>
      </div>

      {/* JSON 입력 */}
      <div style={fieldStyle}>
        <div style={labelRowStyle}>
          <label style={labelStyle}>
            영상 JSON 데이터
            <span style={requiredStyle}>*</span>
          </label>
          <button 
            type="button"
            onClick={handleLoadExample}
            onMouseEnter={() => setExampleHover(true)}
            onMouseLeave={() => setExampleHover(false)}
            style={exampleBtnStyle(exampleHover)}
          >
            📋 예시 불러오기
          </button>
        </div>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`[\n  {\n    "videoId": "dQw4w9WgXcQ",\n    "learningGoal": "DAILY",\n    "difficulty": "BEGINNER"\n  }\n]`}
          rows={15}
          style={textareaStyle}
        />

        {/* 미리보기 */}
        {jsonInput && (
          <div style={previewBoxStyle(previewCount > 0)}>
            {previewCount > 0 ? (
              <>
                <span style={{ color: colors.success }}>✓</span>
                <span>총 <strong>{previewCount}개</strong>의 영상이 등록 대기 중</span>
              </>
            ) : previewCount === -1 ? (
              <>
                <span style={{ color: colors.error }}>✗</span>
                <span>JSON 형식 오류</span>
              </>
            ) : (
              <>
                <span style={{ color: colors.error }}>✗</span>
                <span>유효한 데이터가 없습니다</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      <button 
        type="submit"
        disabled={loading}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={submitBtnStyle(loading, btnHover)}
      >
        {loading 
          ? `⏳ 등록 중... (${previewCount}개 처리 중)` 
          : `📦 ${previewCount > 0 ? `${previewCount}개 영상` : ''} 일괄 등록`
        }
      </button>

      {/* 결과 메시지 */}
      {result && (
        <div style={resultBoxStyle(result.success)}>
          {result.message}
        </div>
      )}
    </form>
  );
}

export default VideoCurationPage;

// ===== 페이지 스타일 =====
const pageStyle = {
  padding: '32px',
  fontFamily: "'Inter', system-ui, sans-serif",
  backgroundColor: colors.beige100,
  minHeight: '100vh',
};

const headerStyle = {
  marginBottom: '24px',
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

// ===== 탭 =====
const tabContainerStyle = {
  display: 'flex',
  gap: '8px',
  marginBottom: '24px',
  padding: '6px',
  backgroundColor: colors.white,
  borderRadius: '12px',
  border: `1px solid ${colors.beige300}`,
  width: 'fit-content',
};

const tabBtnStyle = (active, hover) => ({
  padding: '10px 24px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: active 
    ? colors.brown 
    : hover 
      ? colors.beige200 
      : 'transparent',
  color: active ? colors.white : colors.textDark,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: active ? '700' : '500',
  transition: 'all 0.2s ease',
});

// ===== 폼 =====
const formStyle = {
  backgroundColor: colors.white,
  padding: '32px',
  borderRadius: '16px',
  border: `1px solid ${colors.beige300}`,
  boxShadow: '0 2px 8px rgba(139, 115, 85, 0.06)',
};

const fieldStyle = {
  marginBottom: '24px',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: colors.textDark,
  marginBottom: '8px',
};

const labelRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const requiredStyle = {
  color: colors.error,
  marginLeft: '4px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: `2px solid ${colors.beige300}`,
  borderRadius: '10px',
  fontSize: '14px',
  color: colors.textDark,
  backgroundColor: colors.beige100,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
  fontFamily: 'monospace',
};

const textareaStyle = {
  width: '100%',
  padding: '12px 16px',
  border: `2px solid ${colors.beige300}`,
  borderRadius: '10px',
  fontSize: '13px',
  color: colors.textDark,
  backgroundColor: colors.beige100,
  outline: 'none',
  boxSizing: 'border-box',
  resize: 'vertical',
  fontFamily: 'monospace',
  lineHeight: '1.5',
};

const hintStyle = {
  margin: '6px 0 0 0',
  fontSize: '12px',
  color: colors.textMid,
};

const previewBoxStyle = (success) => ({
  marginTop: '10px',
  padding: '10px 14px',
  backgroundColor: success ? colors.successBg : colors.errorBg,
  borderRadius: '8px',
  fontSize: '13px',
  color: success ? colors.success : colors.error,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: '500',
});

// ===== 학습 목표 카드 그리드 =====
const goalGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '12px',
};

const goalCardStyle = (selected, hover) => ({
  padding: '16px 8px',
  textAlign: 'center',
  border: `2px solid ${selected ? colors.brown : hover ? colors.beige500 : colors.beige300}`,
  borderRadius: '12px',
  backgroundColor: selected 
    ? `${colors.brown}15` 
    : hover 
      ? colors.beige100 
      : colors.white,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  transform: hover && !selected ? 'translateY(-2px)' : 'translateY(0)',
  boxShadow: selected 
    ? `0 4px 12px ${colors.brown}30` 
    : hover 
      ? '0 4px 12px rgba(139, 115, 85, 0.1)' 
      : 'none',
});

// ===== 난이도 카드 그리드 =====
const difficultyGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '14px',
};

const difficultyCardStyle = (selected, hover, accentColor) => ({
  padding: '20px',
  textAlign: 'center',
  border: `2px solid ${selected ? accentColor : hover ? colors.beige500 : colors.beige300}`,
  borderRadius: '12px',
  backgroundColor: selected 
    ? `${accentColor}15` 
    : hover 
      ? colors.beige100 
      : colors.white,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  transform: hover && !selected ? 'translateY(-2px)' : 'translateY(0)',
  boxShadow: selected 
    ? `0 6px 16px ${accentColor}30` 
    : hover 
      ? '0 4px 12px rgba(139, 115, 85, 0.1)' 
      : 'none',
});

// ===== 안내 박스 =====
const infoBoxStyle = {
  marginBottom: '24px',
  padding: '16px 20px',
  backgroundColor: colors.beige200,
  borderRadius: '12px',
  border: `1px solid ${colors.beige300}`,
};

const infoTitleStyle = {
  margin: '0 0 10px 0',
  fontSize: '14px',
  fontWeight: '700',
  color: colors.textDark,
};

const infoListStyle = {
  margin: 0,
  paddingLeft: '20px',
  fontSize: '13px',
  color: colors.textMid,
  lineHeight: '1.8',
};

// ===== 예시 버튼 =====
const exampleBtnStyle = (hover) => ({
  padding: '6px 14px',
  backgroundColor: hover ? colors.brown : colors.beige300,
  color: hover ? colors.white : colors.textDark,
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

// ===== 제출 버튼 =====
const submitBtnStyle = (loading, hover) => ({
  width: '100%',
  padding: '16px',
  backgroundColor: loading 
    ? colors.beige600 
    : hover 
      ? colors.brownDark 
      : colors.brown,
  color: colors.white,
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: '700',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  marginTop: '8px',
  transform: hover && !loading ? 'translateY(-1px)' : 'translateY(0)',
  boxShadow: hover && !loading 
    ? `0 8px 20px ${colors.brown}50` 
    : `0 4px 12px ${colors.brown}30`,
});

// ===== 결과 박스 =====
const resultBoxStyle = (success) => ({
  marginTop: '20px',
  padding: '16px 20px',
  backgroundColor: success ? colors.successBg : colors.errorBg,
  border: `1px solid ${success ? colors.success : colors.error}`,
  borderRadius: '10px',
  color: success ? colors.success : colors.error,
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.5',
});