import api from './index';

/**
 * 1. AI 서비스 사용량(호출 횟수) 통계 조회
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
export const getAiUsageStats = async (startDate, endDate) => {
  const response = await api.get('/api/admin/stats/ai-usage', {
    params: { startDate, endDate }
  });
  return response.data;
};

/**
 * 2. AI 채팅 세션 사용 패턴 통계 조회
 */
export const getChatPatternStats = async (startDate, endDate) => {
  const response = await api.get('/api/admin/stats/chat-patterns', {
    params: { startDate, endDate }
  });
  return response.data;
};

/**
 * 3. 유저-영상별 단어 수집 통계 조회 🆕
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @param {number} limit - 최대 조회 건수 (기본 30)
 */
export const getUserVideoWordStats = async (startDate, endDate, limit = 30) => {
  const response = await api.get('/api/admin/stats/user-video/words', {
    params: { startDate, endDate, limit }
  });
  return response.data;
};

/**
 * 4. 관리자 로그인 요청
 * @param {string} username - 관리자 ID
 * @param {string} password - 관리자 비밀번호
 */
export const loginAdmin = async (username, password) => {
  const response = await api.post('/api/admin/auth/login', { username, password });
  return response.data;
};

/**
 * 5. 관리자 로그아웃 🆕
 */
export const logoutAdmin = async () => {
  const response = await api.post('/api/admin/auth/logout');
  return response.data;
};

/**
 * 6. 사용자 세션 통계 🆕
 */
export const getUserSessionStats = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await api.get('/api/admin/stats/user-sessions', { params });
  return response.data;
};

/**
 * 7. 영상 큐레이션 🆕
 */

// 7-1. 단일 영상 등록
export const registerCuratedVideo = async (videoData) => {
  const response = await api.post('/api/admin/videos', videoData);
  return response.data;
};

// 7-2. 일괄 영상 등록
export const registerBatchVideos = async (videoList) => {
  const response = await api.post('/api/admin/videos/batch', videoList);
  return response.data;
};