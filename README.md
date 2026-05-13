# Argo Business Lab

비개발자가 AI 코딩 도구를 활용하여 개발 역량을 키우는 실습 프로젝트입니다.

## 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/makitt-techtaka/argo-business-lab.git
cd argo-business-lab
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 파일을 만들고 값을 채워주세요.

```bash
cp .env.example .env.local
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

http://localhost:3000 에서 앱을 확인할 수 있습니다.

## Daily Dev Mission

매일 하나의 미션을 AI 코딩 도구와 함께 수행하며 개발 역량을 키웁니다.

| Day | 미션 | 가이드 |
|-----|------|--------|
| 1 | 자기소개 프로필 만들기 | [바로가기](docs/missions/day-01-self-introduction.md) |
| 2 | 터미널 기초 (예정) | - |
| 3 | 파일 구조 이해 (예정) | - |

## 주요 페이지

- `/` - 대시보드
- `/about` - 팀원 소개
- `/curriculum` - 커리큘럼
- `/ideas` - 아이디어 보드
- `/attendance` - 출석 체크

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Deployment**: Vercel

## 배포

main 브랜치에 머지되면 Vercel에서 자동으로 배포됩니다.

## 기여하기

1. 새 브랜치 생성: `git checkout -b feature/my-feature`
2. 변경사항 커밋: `git commit -m "feat: 기능 설명"`
3. 브랜치 푸시: `git push origin feature/my-feature`
4. Pull Request 생성

---

Made with AI by Techtaka Business Lab Team
