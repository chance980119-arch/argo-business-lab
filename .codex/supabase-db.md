# Supabase Database Skill

이 스킬을 사용하면 Supabase 데이터베이스에 직접 접근할 수 있습니다.

## 환경 설정

교육 진행자에게 받은 토큰을 환경 변수로 설정:

```bash
export SUPABASE_ACCESS_TOKEN="<교육_진행자에게_받은_토큰>"
```

## 데이터베이스 쿼리 실행

환경 변수가 설정되어 있으면:

```bash
supabase db query --linked "<SQL 쿼리>"
```

### 예시

```bash
# 셀러 목록 조회
supabase db query --linked "SELECT id, company_name, status FROM sellers"

# 새 셀러 추가
supabase db query --linked "INSERT INTO sellers (company_name, contact_name, status) VALUES ('Test Corp', '테스트', 'lead')"

# 셀러 수정
supabase db query --linked "UPDATE sellers SET status = 'active' WHERE company_name = 'Test Corp'"
```

## 테이블 스키마

### sellers
- id (UUID, PK)
- company_name (TEXT, 필수)
- contact_name (TEXT, 필수)
- email (TEXT)
- phone (TEXT)
- status (TEXT): lead, contacted, negotiating, active, churned
- sales_channels (TEXT[])
- selling_countries (TEXT[])
- monthly_volume (INTEGER)
- sku_count (INTEGER)
- notes (TEXT)

### sales_history
- id (UUID, PK)
- seller_id (UUID, FK)
- activity_type (TEXT): call, email, meeting, demo, proposal, contract, other
- activity_date (DATE)
- summary (TEXT)
- details (TEXT)
- outcome (TEXT): positive, neutral, negative

### contacts
- id (UUID, PK)
- seller_id (UUID, FK)
- type (TEXT): email, phone, kakao, line, whatsapp, other
- value (TEXT)
- label (TEXT)
- is_primary (BOOLEAN)

### training_attendance
- id (UUID, PK)
- participant_name (TEXT)
- github_username (TEXT)
- status (TEXT): pending, ready, completed
- events (JSONB)

## 새 테이블 생성 템플릿

```sql
CREATE TABLE IF NOT EXISTS my_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  -- 추가 컬럼...
);

ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for my_table" ON my_table FOR ALL USING (true) WITH CHECK (true);
```

## 금지 사항

1. **DROP TABLE 절대 금지** - 모든 참가자 데이터 삭제됨
2. **WHERE 없는 DELETE 금지** - 전체 데이터 삭제됨
3. **WHERE 없는 UPDATE 금지** - 전체 데이터 변경됨

실수로 데이터를 삭제하면 복구할 수 없습니다.
