# Supabase DB 조회/관리

Supabase 데이터베이스에 직접 접근하여 조회, 추가, 수정, 삭제를 수행합니다.

## 사용법

```
/db <명령>
```

## 명령 예시

- `/db 셀러 목록 보여줘`
- `/db 새 테이블 만들어줘: tasks (id, title, done)`
- `/db sellers 테이블에 company_name이 'test'인 데이터 삭제해줘`

## 실행 방법

### 1. 환경 변수 설정 (최초 1회)

교육 진행자에게 받은 `SUPABASE_ACCESS_TOKEN`을 설정:

```bash
export SUPABASE_ACCESS_TOKEN="<교육_진행자에게_받은_토큰>"
```

### 2. 프로젝트 링크 (최초 1회)

```bash
cd ~/Desktop/argo-business-lab
supabase link --project-ref himudvxagttouysgsoqm
```

### 3. 쿼리 실행

```bash
supabase db query --linked "<SQL>"
```

> 환경 변수가 설정되어 있으면 자동으로 인증됨

## 테이블 구조

### sellers (셀러/고객)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| company_name | TEXT | 회사명 |
| contact_name | TEXT | 담당자명 |
| email | TEXT | 이메일 |
| phone | TEXT | 전화번호 |
| status | TEXT | lead/contacted/negotiating/active/churned |
| sales_channels | TEXT[] | 판매채널 배열 |
| selling_countries | TEXT[] | 판매국가 배열 |
| monthly_volume | INTEGER | 월 물동량 |
| sku_count | INTEGER | SKU 수 |

### sales_history (영업활동)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| seller_id | UUID | FK → sellers |
| activity_type | TEXT | call/email/meeting/demo/proposal/contract/other |
| activity_date | DATE | 활동일 |
| summary | TEXT | 요약 |
| outcome | TEXT | positive/neutral/negative |

### contacts (추가 연락처)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| seller_id | UUID | FK → sellers |
| type | TEXT | email/phone/kakao/line/whatsapp/other |
| value | TEXT | 연락처 값 |

### training_attendance (교육 출석)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| participant_name | TEXT | 참가자명 |
| github_username | TEXT | GitHub 계정 |
| status | TEXT | pending/ready/completed |
| events | JSONB | 이벤트 로그 |

## 자주 쓰는 쿼리

### 조회
```sql
-- 전체 셀러 목록
SELECT * FROM sellers ORDER BY created_at DESC;

-- 특정 상태 셀러
SELECT * FROM sellers WHERE status = 'active';

-- 셀러별 영업활동 수
SELECT s.company_name, COUNT(h.id) as activity_count
FROM sellers s
LEFT JOIN sales_history h ON s.id = h.seller_id
GROUP BY s.id;
```

### 추가
```sql
INSERT INTO sellers (company_name, contact_name, status)
VALUES ('새 회사', '홍길동', 'lead');
```

### 수정
```sql
UPDATE sellers SET status = 'active' WHERE company_name = '새 회사';
```

### 삭제
```sql
DELETE FROM sellers WHERE company_name = 'test';
```

## 새 테이블 생성

```sql
CREATE TABLE IF NOT EXISTS 테이블명 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 컬럼들...
);

-- RLS 활성화 (필수)
ALTER TABLE 테이블명 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for 테이블명" ON 테이블명 FOR ALL USING (true) WITH CHECK (true);
```

## 주의사항

- **DROP TABLE 금지** - 다른 참가자 데이터도 날아감
- **WHERE 없는 DELETE/UPDATE 금지** - 전체 데이터 영향
- 스키마 변경 전 다른 참가자에게 공유
