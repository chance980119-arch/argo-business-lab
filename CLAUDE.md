# CLAUDE.md - Argo Business Lab

> 비개발자가 Claude Code로 이 프로젝트를 확장하기 위한 가이드

## 이 프로젝트가 뭔가요?

Argo 팀이 업무에 필요한 도구들을 직접 만들어 쓰는 공간입니다.
AI(Claude Code)에게 "이런 기능 만들어줘"라고 말하면 코드를 짜줍니다.

## 프로젝트 구조

```
argo-business-lab/
├── src/
│   ├── app/                    # 페이지들
│   │   ├── (dashboard)/        # 대시보드 레이아웃
│   │   │   ├── crm/            # CRM (고객 관리)
│   │   │   ├── [새기능]/       # 여기에 새 메뉴 추가
│   │   │   └── layout.tsx      # 사이드바 포함된 레이아웃
│   │   ├── layout.tsx          # 전체 앱 레이아웃
│   │   └── page.tsx            # 홈페이지
│   ├── components/
│   │   └── ui/                 # shadcn/ui 컴포넌트들
│   ├── lib/
│   │   ├── supabase.ts         # DB 연결
│   │   └── utils.ts            # 유틸리티
│   └── types/
│       └── database.ts         # DB 타입 정의
├── .env.local                  # 환경 변수 (DB 접속 정보)
└── package.json
```

## 새 기능 추가하는 법

### 1. 새 메뉴 추가하기

Claude에게 이렇게 말하세요:
> "crm 옆에 '재고 관리' 메뉴 추가해줘"

또는 더 구체적으로:
> "src/app/(dashboard)/ 아래에 inventory 폴더 만들고, 상품 목록 보여주는 페이지 만들어줘"

### 2. 새 테이블(DB) 추가하기

Claude에게 이렇게 말하세요:
> "재고 관리를 위한 테이블 만들어줘. 상품명, SKU, 수량, 위치 저장해야 해"

그러면 Claude가:
1. `src/types/database.ts`에 타입 추가
2. Supabase에서 실행할 SQL 알려줌
3. 관련 페이지 코드 작성

### 3. 기존 기능 수정하기

Claude에게 이렇게 말하세요:
> "CRM 테이블에 '담당자' 컬럼 추가해줘"
> "셀러 상태를 색깔로 구분해서 보여줘"
> "검색 기능 추가해줘"

## 자주 쓰는 명령어

```bash
# 개발 서버 실행
pnpm dev

# 새 컴포넌트 추가 (버튼, 모달 등)
npx shadcn@latest add [컴포넌트명]

# 예시: 달력 컴포넌트 추가
npx shadcn@latest add calendar
```

## DB (Supabase) 사용법

### 테이블 만들기

Supabase 대시보드에서 SQL 실행:
1. [supabase.com](https://supabase.com) 로그인
2. 프로젝트 선택
3. SQL Editor 클릭
4. Claude가 알려준 SQL 붙여넣고 Run

### 데이터 보기

Supabase 대시보드 → Table Editor에서 직접 확인 가능

## 기술 스택 (참고용)

| 기술 | 용도 |
|------|------|
| Next.js 15 | 웹 프레임워크 |
| TypeScript | 프로그래밍 언어 |
| Tailwind CSS | 스타일링 |
| shadcn/ui | UI 컴포넌트 |
| Supabase | 데이터베이스 |
| Lucide | 아이콘 |

## 도움이 필요하면

1. Claude에게 "이 파일 설명해줘" 라고 물어보기
2. 에러 나면 에러 메시지 그대로 복사해서 Claude에게 주기
3. "이거 왜 안 돼?" 라고 물어보기

## 주의사항

- `.env.local` 파일은 절대 GitHub에 올리지 마세요 (DB 비밀번호 포함)
- 큰 변경 전에는 git commit 해두세요 (되돌리기 쉬움)
- 모르면 물어보세요. Claude는 지치지 않습니다.
