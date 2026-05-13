# Day 1: 자기소개 프로필 만들기

## 미션 개요

오늘의 미션은 **팀원 소개 페이지에 나의 프로필 카드를 추가**하는 것입니다.

이 미션을 통해 배우게 될 것:
- Git 브랜치 생성 및 전환
- 코드 수정 후 커밋
- Pull Request(PR) 생성
- 코드 리뷰 및 머지
- 자동 배포 확인

---

## 사전 준비

### 1. 필요한 도구 설치

AI 코딩 도구(Claude, Cursor 등)에게 아래를 요청하세요:

```
내 컴퓨터에 개발 환경을 설정해줘.
필요한 것: Node.js, pnpm, Git
```

### 2. 프로젝트 클론

```
argo-business-lab 저장소를 내 컴퓨터에 클론해줘.
저장소 주소: https://github.com/makitt-techtaka/argo-business-lab
```

### 3. 의존성 설치 및 실행

```
프로젝트 폴더로 이동해서 pnpm install 실행하고,
개발 서버를 실행해줘.
```

브라우저에서 http://localhost:3000 접속하면 앱이 보입니다.

---

## 미션 수행

### Step 1: 새 브랜치 만들기

AI에게 요청:

```
새 브랜치를 만들어줘.
브랜치 이름: feature/profile-{내이름}
예: feature/profile-amy
```

### Step 2: 프로필 데이터 확인

`/about` 페이지로 이동하면 프로필 카드들이 보입니다.
현재는 Supabase DB에 등록된 프로필만 표시됩니다.

### Step 3: 인증 및 프로필 등록

1. 앱에서 로그인 (이메일 인증 코드 방식)
2. `/about` 페이지에서 "내 프로필 등록" 버튼 클릭
3. 프로필 정보 입력:
   - 이름
   - 팀/역할
   - 자기소개
   - 스킬 태그
   - GitHub 사용자명

### Step 4: 변경사항 커밋

AI에게 요청:

```
지금까지의 변경사항을 커밋해줘.
커밋 메시지: "feat: {내이름} 프로필 추가"
```

### Step 5: 원격 저장소에 푸시

AI에게 요청:

```
내 브랜치를 GitHub에 푸시해줘.
```

### Step 6: Pull Request 생성

AI에게 요청:

```
GitHub에서 Pull Request를 만들어줘.
제목: "[Day 1] {내이름} 프로필 추가"
설명: 팀원 소개 페이지에 제 프로필을 추가했습니다.
```

또는 GitHub 웹사이트에서 직접:
1. https://github.com/makitt-techtaka/argo-business-lab 접속
2. "Pull requests" 탭 클릭
3. "New pull request" 버튼 클릭
4. 내 브랜치 선택 → "Create pull request"

### Step 7: 코드 리뷰 요청

Slack 채널에 PR 링크를 공유하고 리뷰를 요청하세요.

### Step 8: 머지 및 배포 확인

리뷰가 승인되면:
1. "Merge pull request" 클릭
2. main 브랜치에 머지되면 자동으로 Vercel 배포 시작
3. 1-2분 후 배포 완료
4. 라이브 사이트에서 내 프로필 확인!

---

## 인수 조건 (Acceptance Criteria)

다음을 모두 완료해야 Day 1 미션 완료입니다:

- [ ] Git 브랜치를 생성했다
- [ ] 프로필을 등록/수정했다
- [ ] 변경사항을 커밋했다
- [ ] GitHub에 푸시했다
- [ ] Pull Request를 생성했다
- [ ] PR이 머지되었다
- [ ] 라이브 사이트에서 내 프로필이 보인다

---

## 문제가 생겼을 때

### "permission denied" 오류

GitHub 계정이 collaborator로 추가되어 있는지 확인하세요.
관리자에게 초대를 요청하세요.

### 커밋/푸시가 안 될 때

AI에게 요청:

```
git status 실행해서 현재 상태 알려줘.
문제가 있으면 해결해줘.
```

### 충돌(conflict)이 발생했을 때

AI에게 요청:

```
main 브랜치의 최신 변경사항을 가져와서
내 브랜치에 머지해줘. 충돌이 있으면 해결해줘.
```

---

## 다음 단계

Day 1을 완료했다면, Day 2에서는:
- 터미널 기본 명령어 익히기
- 파일 구조 이해하기
- 간단한 UI 수정 해보기

수고하셨습니다!
