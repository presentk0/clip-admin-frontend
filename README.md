# 🎬 CLIPZY Admin Frontend

> CLIPZY 서비스 운영을 위한 관리자 대시보드

YouTube 영상 학습 플랫폼 **CLIPZY**의 데이터를 시각화하고, 콘텐츠를 관리하는 어드민 페이지입니다.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.10-FF6B6B)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel)

---

## 📖 프로젝트 소개

CLIPZY 관리자가 다음 작업을 수행할 수 있는 웹 어드민입니다:

- 📊 **통계 분석**: AI 호출, 채팅 세션, 사용자 활동 등 핵심 지표 모니터링
- 🎬 **콘텐츠 관리**: YouTube 영상 큐레이션 및 라벨링
- 👥 **사용자 인사이트**: 시간대별/요일별 사용 패턴 분석

---

## 🛠 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19 | UI 라이브러리 |
| Vite | 5.0 | 빌드 도구 |
| React Router | 6 | 페이지 라우팅 |
| Axios | 1.6 | HTTP 클라이언트 |
| Recharts | 2.10 | 차트 시각화 |

### Deployment
- **Vercel**: 자동 CI/CD 배포
- **GitHub**: 소스 코드 관리

---

## 🏗 프로젝트 구조

```
clip-admin-frontend/
├── public/
├── src/
│   ├── api/                    # API 함수
│   │   ├── index.js           # axios 인스턴스 + 인터셉터
│   │   └── stats.js           # 통계 API 함수
│   │
│   ├── assets/                # 이미지, 아이콘
│   │   └── icons/
│   │       └── frog.png       # 로고
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.jsx     # 전체 레이아웃
│   │       └── Sidebar.jsx    # 사이드바 메뉴
│   │
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── LoginPage.jsx           # 로그인
│   │   ├── DashboardPage.jsx       # 대시보드
│   │   ├── AiUsagePage.jsx         # AI 호출 통계
│   │   ├── ChatPatternPage.jsx     # 채팅 패턴 통계
│   │   ├── UserVideoWordPage.jsx   # 단어 수집 분석
│   │   ├── UserSessionPage.jsx     # 사용자 활동 분석
│   │   └── VideoCurationPage.jsx   # 영상 큐레이션
│   │
│   ├── App.jsx                # 라우터 설정
│   └── main.jsx               # 진입점
│
├── .env                       # 환경변수 (Git 제외)
├── .env.example               # 환경변수 예시
├── .gitignore
├── vercel.json                # Vercel 배포 설정 (SPA 라우팅)
├── package.json
└── vite.config.js
```

---

## 🚀 시작하기

### 1. 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 2. 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/clip-admin-frontend.git
cd clip-admin-frontend

# 의존성 설치
npm install
```

### 3. 환경변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
# 백엔드 서버 URL
VITE_API_URL=http://localhost:8080
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

### 5. 빌드

```bash
npm run build
```

---

## 🔐 로그인

관리자 계정으로 로그인:

- **ID**: `admin`
- **PW**: 환경에 따라 다름 (DB 관리자에게 문의)

> ⚠️ 관리자 계정은 `admin_user` 테이블에서 관리됩니다.

---

## 📄 주요 페이지

### 1. 📊 대시보드
전체 서비스 핵심 지표 요약

### 2. 🤖 AI 호출 통계
- AI 챗봇 발화 횟수
- 퀴즈 AI 해설 생성 횟수
- 호출 비율 시각화

### 3. 💬 채팅 세션 통계
- 진행 중/완료된 채팅방 수
- 방당 평균 대화 수
- 평균 발음 점수

### 4. 📚 단어 수집 분석
- 사용자별 수집 단어 통계
- 인기 단어 Top 10

### 5. 👥 사용자 활동 분석
- **시간대별 로그인 분포** (0~23시)
- **일별 추이** (꺾은선 차트)
- **체류 시간 분포** (도넛 차트)
- **요일별 패턴** (월~일)
- **인사이트**: 피크 타임, 평균 체류 시간 등

### 6. 🎬 영상 큐레이션
- **단일 등록**: YouTube URL/ID로 영상 라벨링
- **일괄 등록**: JSON 형식으로 다수 영상 한 번에 등록
- 학습 목표 6종 (여행/비즈니스/자기계발/시험/일상/없음)
- 난이도 3단계 (초급/중급/고급)

---

## 🚢 배포

### Vercel 자동 배포

GitHub `main` 브랜치 푸시 시 자동 배포됩니다.

#### 환경별 분리

| 환경 | 브랜치 | URL | 백엔드 |
|------|--------|-----|--------|
| **Production** | `main` | `clip-admin-frontend.vercel.app` | `clip-server.com` |
| **Preview** | `dev` | `*-git-dev-*.vercel.app` | `dev.clip-server.com` |

#### Vercel 환경변수

| Key | Production | Preview |
|-----|------------|---------|
| `VITE_API_URL` | `https://clip-server.com` | `https://dev.clip-server.com` |

### SPA 라우팅 설정

`vercel.json`에서 모든 경로를 `index.html`로 리다이렉트:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 🔄 백엔드 연동

### Base URL
환경변수 `VITE_API_URL`로 설정

### 인증
- JWT 토큰 기반
- `localStorage`의 `admin_token`에 저장
- Axios 인터셉터로 자동 헤더 추가

```javascript
// src/api/index.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 토큰 만료 처리
401 응답 시 자동 로그아웃 → 로그인 페이지로 리다이렉트

---

## 🎨 디자인 시스템

### 색상 팔레트 (베이지/브라운 톤)

| 이름 | HEX | 용도 |
|------|-----|------|
| beige100 | `#F9F8F1` | 배경 |
| beige300 | `#EEEADF` | 보더 |
| brown | `#8B7355` | 강조 |
| brownDark | `#6B5640` | hover |
| textDark | `#3A3530` | 본문 |

### 컴포넌트 스타일
- **카드 hover**: `translateY(-4px)` + shadow
- **버튼 transition**: `0.2s ease`
- **둥근 모서리**: `borderRadius: 12-16px`

---

## 🛡 보안

### 토큰 관리
- 어드민 토큰은 `admin_token` 키로 분리 저장
- 일반 사용자 토큰과 충돌 방지

### CORS
- 백엔드에서 Vercel 도메인 허용 필요
- 와일드카드 패턴 지원 (`*.vercel.app`)

---

## 📝 개발 가이드

### 새 페이지 추가

1. `src/pages/NewPage.jsx` 생성
2. `src/App.jsx`에 라우트 추가:
   ```jsx
   <Route path="new-page" element={<NewPage />} />
   ```
3. `src/components/layout/Sidebar.jsx`의 `menuItems`에 추가:
   ```jsx
   { path: '/new-page', label: '새 페이지', icon: '✨' }
   ```

### API 함수 추가

`src/api/stats.js`에 함수 추가:

```javascript
export const getNewData = async (params) => {
  const response = await api.get('/api/admin/new-endpoint', { params });
  return response.data;
};
```

---

## 🐛 트러블슈팅

### Q. 새로고침 시 404 에러 (배포 환경)
**A.** `vercel.json` 설정 확인. SPA rewrites 필수.

### Q. 로컬 개발 중 API 호출 실패
**A.** `.env`의 `VITE_API_URL`이 백엔드 주소와 일치하는지 확인. 서버 재시작 필요.

### Q. 환경변수가 적용 안 됨
**A.** Vite는 `VITE_` 접두사 필수. `.env` 수정 후 개발 서버 재시작.

### Q. CORS 에러
**A.** 백엔드 `application.yml`의 `cors.allowed-origins`에 현재 도메인 추가 후 재배포.