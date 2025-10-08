# V-A 감정 공간 시각화 시스템

> **Valence-Arousal 2차원 감정 분석 및 시각화 웹 애플리케이션**
> Warriner 2013 × NRC VAD v2.1 병합 데이터 기반

---

## 🎯 프로젝트 개요

### 핵심 기능
- ✅ **54,893개 감정 어휘** V-A 2차원 공간 시각화
- ✅ **파스텔 톤 색상** 사분면별 구분
- ✅ **마우스 hover** 시 단어 정보 툴팁
- ✅ **실시간 검색** 기능
- ✅ **감정 프로토타입** 8개 기본 감정 표시
- ✅ **반응형 디자인** 웹/모바일 지원

### 기술 스택
- **Framework**: Next.js 14 (App Router)
- **언어**: TypeScript 5.x
- **스타일**: Tailwind CSS 3.x
- **시각화**: D3.js 7.x, SVG
- **애니메이션**: Framer Motion 10.x
- **상태관리**: React Hooks (커스텀 훅)

---

## 🏗️ 아키텍처 설계

### SOLID 원칙 준수
- **SRP**: 각 클래스/함수는 단일 책임만 가짐
- **OCP**: 인터페이스 기반 확장 가능
- **LSP**: 추상화 구현체 호환성 보장
- **ISP**: 작고 구체적인 인터페이스 분리
- **DIP**: 추상화에 의존

### 디자인 패턴
- **Singleton**: 데이터 로더, 캐시, 색상 매퍼
- **Factory**: 데이터 로더 생성
- **Strategy**: 가상화, 색상 매핑
- **Facade**: 유틸리티 함수 래퍼
- **Observer**: React Hooks

### 성능 최적화
- **O(1) 조회**: 룩업 테이블, LRU 캐시, 비트 연산
- **메모이제이션**: React.memo, useMemo, useCallback
- **가상화**: 뷰포트 기반 렌더링
- **디바운싱/스로틀링**: 검색, 뷰포트 업데이트
- **청크 처리**: 대용량 데이터 처리
- **캐싱**: API 응답, 색상 계산, 검색 결과
- **GPU 가속**: CSS transform, will-change
- **코드 스플리팅**: 동적 import

---

## 📁 프로젝트 구조

```
VA_space/va-visualization/
├─ app/
│  ├─ api/                      # API Routes
│  │  ├─ emotions/route.ts      # 감정 데이터 API
│  │  ├─ search/route.ts        # 검색 API
│  │  └─ statistics/route.ts    # 통계 API
│  ├─ components/               # React 컴포넌트
│  │  ├─ ScatterPlot.tsx        # 산점도
│  │  ├─ EmotionTooltip.tsx     # 툴팁
│  │  ├─ EmotionPrototypes.tsx  # 프로토타입
│  │  └─ VAPlane.tsx            # V-A 평면
│  ├─ layout.tsx                # 루트 레이아웃
│  ├─ page.tsx                  # 메인 페이지
│  └─ globals.css               # 글로벌 스타일
├─ lib/
│  ├─ types/                    # TypeScript 타입
│  │  └─ emotion.ts             # 감정 데이터 타입
│  ├─ constants/                # 상수 정의
│  │  ├─ colors.ts              # 색상 팔레트
│  │  └─ visualization.ts       # 시각화 설정
│  ├─ utils/                    # 유틸리티 함수
│  │  ├─ color.ts               # 색상 계산
│  │  ├─ performance.ts         # 성능 최적화
│  │  └─ geometry.ts            # 기하학 계산
│  ├─ services/                 # 서비스 레이어
│  │  └─ EmotionDataLoader.ts  # 데이터 로더
│  └─ hooks/                    # 커스텀 훅
│     ├─ useEmotionData.ts      # 데이터 로딩
│     └─ useVirtualization.ts   # 가상화
├─ public/
│  └─ data/                     # 정적 데이터
│     └─ sample_emotions.json   # 샘플 감정 데이터
├─ next.config.ts               # Next.js 설정
├─ tailwind.config.ts           # Tailwind 설정
└─ tsconfig.json                # TypeScript 설정
```

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 📊 성능 메트릭

### 목표 성능 지표
- ✅ **초기 로딩**: < 3초
- ✅ **FPS**: 60fps (애니메이션)
- ✅ **메모리**: < 100MB
- ✅ **API 응답**: < 100ms

### 최적화 기법
1. **데이터 로딩**: 캐싱, 압축, 스트리밍
2. **렌더링**: React.memo, 가상화, Canvas 옵션
3. **이벤트**: 디바운싱, 스로틀링
4. **네트워크**: HTTP/2, gzip, CDN
5. **메모리**: LRU 캐시, WeakMap

---

## 🎨 색상 시스템 (파스텔 톤)

### 사분면별 색상
- **Q1 (Joy)**: `#FFF2CC` → `#FFE6B3` (따뜻한 노랑)
- **Q2 (Anger)**: `#FFE6E6` → `#FFB3B3` (부드러운 빨강)
- **Q3 (Sadness)**: `#E6F3FF` → `#B3D9FF` (차분한 파랑)
- **Q4 (Calm)**: `#E6FFE6` → `#B3FFB3` (상쾌한 초록)

### 신뢰도별 색상
- **높음 (≥0.8)**: `#7CB342` (파스텔 그린)
- **중간 (0.7-0.8)**: `#FF8A65` (파스텔 오렌지)
- **낮음 (<0.7)**: `#E57373` (파스텔 레드)

---

## 🧪 테스트

```bash
# 유닛 테스트
npm test

# 커버리지
npm run test:coverage

# E2E 테스트
npm run test:e2e
```

---

## 📝 API 문서

### GET /api/emotions
감정 데이터 조회

**Response**:
```json
[
  {
    "id": "happy-0",
    "term": "happy",
    "valence": 0.8,
    "arousal": 0.5,
    "confidence": 0.9,
    "merge_strategy": "both_weighted"
  }
]
```

### GET /api/search?q={query}
감정 단어 검색

**Parameters**:
- `q`: 검색 쿼리 (필수)
- `limit`: 결과 개수 (기본: 50)
- `fuzzy`: 퍼지 매칭 여부 (기본: false)

### GET /api/statistics
통계 정보 조회

**Response**:
```json
{
  "total": 8,
  "byStrategy": {
    "both_weighted": 5,
    "warriner_only": 2,
    "nrc_only": 1
  },
  "averageConfidence": 0.88,
  "quadrantDistribution": {
    "q1": 3,
    "q2": 2,
    "q3": 1,
    "q4": 2
  }
}
```

---

## 🔧 환경 변수

```env
# 개발 환경
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# 프로덕션 환경
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://va-emotion-space.vercel.app
```

---

## 📦 배포

### Vercel 배포 (권장)

```bash
npm install -g vercel
vercel
```

### Docker 배포

```bash
docker build -t va-visualization .
docker run -p 3000:3000 va-visualization
```

---

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 데이터 소스에 따라 라이선스가 적용됩니다:
- **Warriner 2013**: 학술 연구용
- **NRC VAD v2.1**: NRC 라이선스

---

## 👥 팀

**VEATIC 연구팀** © 2025

---

## 📚 참고 문헌

1. Warriner, A. B., Kuperman, V., & Brysbaert, M. (2013). Norms of valence, arousal, and dominance for 13,915 English lemmas. *Behavior Research Methods*, 45(4), 1191-1207.

2. Mohammad, S. M. (2018). Obtaining reliable human ratings of valence, arousal, and dominance for 20,000 English words. *Proceedings of the 56th Annual Meeting of the Association for Computational Linguistics*.

---

**Built with ❤️ by VEATIC Research Team**

