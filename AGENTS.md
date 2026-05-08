# AI Agent 가이드 (Codex / Claude / etc.)

이 문서는 AI 코딩 도구가 이 프로젝트를 세팅하고 사용할 때 참고하는 가이드입니다.

## 빠른 시작: 원클릭 세팅

사용자가 `.env.local` 내용을 제공하면, 아래 명령 하나로 모든 설정을 완료합니다:

```bash
# 프로젝트 폴더로 이동 (또는 아무 곳에서나)
cd ~/Desktop

# setup.sh 다운로드 및 실행
curl -fsSL https://raw.githubusercontent.com/chance980119-arch/argo-business-lab/main/setup.sh | bash -s -- "NEXT_PUBLIC_SUPABASE_URL=https://himudvxagttouysgsoqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<사용자가_제공한_키>"
```

또는 이미 프로젝트가 클론되어 있다면:

```bash
cd ~/Desktop/argo-business-lab
./setup.sh "NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
```

## setup.sh가 하는 일

1. **도구 설치** - Homebrew, Node.js 22, pnpm, Git, GitHub CLI
2. **GitHub 인증** - `gh auth login` (필요시)
3. **프로젝트 클론** - `~/Desktop/argo-business-lab`
4. **의존성 설치** - `pnpm install`
5. **환경 변수 생성** - `.env.local` 파일 생성
6. **개발 서버 시작** - `pnpm dev`

## 수동 세팅 (단계별)

setup.sh 없이 수동으로 하려면:

```bash
# 1. 도구 설치
brew install node@22 gh git
npm install -g pnpm

# 2. GitHub 로그인
gh auth login

# 3. 클론
git clone https://github.com/chance980119-arch/argo-business-lab.git
cd argo-business-lab

# 4. 의존성 설치
pnpm install

# 5. 환경 변수 (사용자가 제공한 내용으로)
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://himudvxagttouysgsoqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<키>
EOF

# 6. 실행
pnpm dev
```

## 출석체크 API

참가자 환경이 준비되면 교육 현황 페이지에 알릴 수 있습니다:

```bash
# 1. 참가자 등록 (이름으로)
curl -X POST http://localhost:3000/api/training \
  -H "Content-Type: application/json" \
  -d '{"action":"register","participant_name":"홍길동","github_username":"hong"}'

# 응답에서 participant.id 확인

# 2. 환경 준비 완료 알림
curl -X POST http://localhost:3000/api/training \
  -H "Content-Type: application/json" \
  -d '{"action":"event","participant_id":"<ID>","event_type":"env_ready","message":"환경 세팅 완료!"}'

# 3. 첫 기능 구현 완료 알림
curl -X POST http://localhost:3000/api/training \
  -H "Content-Type: application/json" \
  -d '{"action":"event","participant_id":"<ID>","event_type":"first_build","message":"첫 커밋 성공!"}'
```

## 첫 커밋하기

```bash
# 1. 변경사항 확인
git status

# 2. 스테이징
git add .

# 3. 커밋
git commit -m "feat: 내 첫 번째 기능 추가"

# 4. 푸시
git push origin main
```

## 프로젝트 구조

```
argo-business-lab/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # 대시보드 레이아웃
│   │   │   ├── crm/            # CRM 페이지
│   │   │   └── training/       # 교육 현황 페이지
│   │   └── api/                # API 라우트
│   │       └── training/       # 출석체크 API
│   ├── components/             # 컴포넌트
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   └── layout/             # 레이아웃 컴포넌트
│   ├── lib/                    # 유틸리티
│   │   └── supabase.ts         # Supabase 클라이언트
│   └── types/                  # 타입 정의
│       └── database.ts         # DB 스키마 타입
├── setup.sh                    # 원클릭 세팅 스크립트
├── bootstrap.sh                # 도구만 설치하는 스크립트
└── supabase-schema.sql         # DB 스키마
```

## 새 기능 추가 예시

### 사이드바에 메뉴 추가

`src/components/layout/app-sidebar.tsx`:

```typescript
const menuItems = [
  { title: "CRM", icon: Users, href: "/crm" },
  { title: "교육", icon: GraduationCap, href: "/training" },
  // 여기에 추가:
  { title: "새메뉴", icon: Package, href: "/new-menu" },
];
```

### 새 페이지 추가

`src/app/(dashboard)/new-menu/page.tsx` 파일 생성:

```typescript
export default function NewMenuPage() {
  return (
    <div>
      <h1>새 메뉴</h1>
    </div>
  );
}
```

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI**: shadcn/ui (base-ui 기반)
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: pnpm

## 주의사항

- shadcn/ui v4는 `asChild` prop을 지원하지 않음. `render` prop 또는 `buttonVariants()` 사용
- Next.js 16은 훈련 데이터와 다를 수 있음. `node_modules/next/dist/docs/` 참고

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
