# 🔬 물리 퀴즈 앱

물리 대회 중급 문제의 영역별 분포를 분석하여, 동일한 비율로 120문제를 출제한 퀴즈 앱입니다.

## 🎯 기능 소개

### 📊 문제 구성 (총 120문제)
| 영역 | 문제 수 | 비율 |
|------|---------|------|
| 역학 | 63문제 | 52.7% |
| 전자기학 | 26문제 | 21.8% |
| 열역학 | 17문제 | 14.5% |
| 광학 | 9문제 | 7.3% |
| 파동 | 5문제 | 3.6% |

### ✨ 주요 기능
- **시작 화면**: 영역별 문제 분포 시각화, 퀴즈 모드/문제 수 선택
- **퀴즈 진행**: 5지 선지, 정답 피드백, 해설 제공
- **결과 화면**: 점수/정답률, 영역별 성과 분석, 틀린 문제 복습

## 🚀 GitHub Pages 배포 방법

### 1️⃣ GitHub 저장소 생성
1. GitHub에서 새 저장소 생성
2. 저장소 이름은 `physics-quiz`로 권장 (다른 이름 사용 시 설정 변경 필요)

### 2️⃣ 저장소 이름 변경 (필요한 경우)
저장소 이름이 `physics-quiz`가 아닌 경우, `next.config.ts` 파일에서 `basePath`를 수정하세요:

```typescript
basePath: process.env.GITHUB_PAGES ? "/your-repo-name" : "",
```

### 3️⃣ GitHub Pages 활성화
1. 저장소 Settings → Pages
2. Source를 "GitHub Actions"로 설정

### 4️⃣ 코드 푸시
```bash
git init
git add .
git commit -m "Initial commit: Physics Quiz App"
git branch -M main
git remote add origin https://github.com/your-username/physics-quiz.git
git push -u origin main
```

### 5️⃣ 자동 배포
GitHub Actions가 자동으로 실행되어 GitHub Pages에 배포됩니다.

## 🏃 로컬 실행

```bash
# 의존성 설치
bun install

# 개발 서버 실행
bun run dev

# 정적 빌드
bun run build
```

## 🛠 기술 스택

- **Next.js 15** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **Zustand** - 상태 관리
- **Recharts** - 차트 라이브러리
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트
- **Lucide Icons** - 아이콘

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx         # 메인 퀴즈 앱
│   ├── layout.tsx       # 레이아웃
│   └── globals.css      # 전역 스타일
├── components/
│   └── ui/              # shadcn/ui 컴포넌트
├── data/
│   └── questions.json   # 120개 물리 문제
└── hooks/               # 커스텀 훅
```

## 📝 문제 출처

물리 대회 중급 문제 모음 PDF를 분석하여 영역별 분포를 파악하고, AI를 활용해 유사한 수준의 문제를 출제했습니다.

---

Built with ❤️ for physics learners
