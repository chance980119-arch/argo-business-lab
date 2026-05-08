-- Argo Business Lab - Supabase Schema
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. sellers 테이블 (셀러/고객 정보)
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 기본 정보
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- 상태 (lead, contacted, negotiating, active, churned)
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'contacted', 'negotiating', 'active', 'churned')),

  -- 비즈니스 정보
  business_type TEXT,          -- B2B, B2C, D2C 등
  main_category TEXT,          -- K-Beauty, Fashion 등

  -- 판매 정보
  sales_channels TEXT[],       -- ["Amazon", "Shopify", "Own Website"]
  selling_countries TEXT[],    -- ["US", "JP", "KR"]

  -- 물류 정보
  monthly_volume INTEGER,      -- 월 물동량 (건)
  sku_count INTEGER,           -- SKU 수
  avg_order_value DECIMAL,     -- 평균 주문금액 (USD)

  -- 메모
  notes TEXT,

  -- 추가 데이터 (확장용 JSON)
  metadata JSONB
);

-- 2. contacts 테이블 (추가 연락처)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,

  -- 연락처 정보
  type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'kakao', 'line', 'whatsapp', 'other')),
  value TEXT NOT NULL,
  label TEXT,                  -- "업무용", "개인" 등
  is_primary BOOLEAN DEFAULT FALSE
);

-- 3. sales_history 테이블 (영업 활동 기록)
CREATE TABLE IF NOT EXISTS sales_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,

  -- 영업 활동
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'contract', 'other')),
  activity_date DATE NOT NULL,
  summary TEXT NOT NULL,
  details TEXT,

  -- 결과
  outcome TEXT CHECK (outcome IN ('positive', 'neutral', 'negative')),
  next_action TEXT,
  next_action_date DATE,

  -- 담당자
  handled_by TEXT
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
CREATE INDEX IF NOT EXISTS idx_sellers_created_at ON sellers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_seller_id ON contacts(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_history_seller_id ON sales_history(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_history_activity_date ON sales_history(activity_date DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sellers_updated_at ON sellers;
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - 공개 접근 허용 (교육용)
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_history ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기/쓰기 권한 부여 (교육용 - 실제 프로덕션에서는 더 엄격하게)
CREATE POLICY "Allow all for sellers" ON sellers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sales_history" ON sales_history FOR ALL USING (true) WITH CHECK (true);

-- 샘플 데이터 (선택)
INSERT INTO sellers (company_name, contact_name, email, status, business_type, main_category, sales_channels, selling_countries, monthly_volume, sku_count, notes)
VALUES
  ('Beauty Corp', '김영업', 'sales@beautycorp.com', 'active', 'B2C', 'K-Beauty', ARRAY['Amazon', 'Own Website'], ARRAY['US', 'JP'], 5000, 150, '주요 고객사. 아마존 FBA 활용 중'),
  ('Fashion Plus', '이마케팅', 'lee@fashionplus.kr', 'negotiating', 'D2C', 'Fashion', ARRAY['Shopify'], ARRAY['US', 'UK'], 2000, 80, '계약 협상 진행 중'),
  ('Skincare Lab', '박대표', 'park@skincarelab.com', 'lead', 'B2B', 'K-Beauty', NULL, ARRAY['KR'], NULL, NULL, '인바운드 문의')
ON CONFLICT DO NOTHING;

-- 4. training_attendance 테이블 (교육 출석체크)
CREATE TABLE IF NOT EXISTS training_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 참가자 정보
  participant_name TEXT NOT NULL,
  github_username TEXT,

  -- 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'completed')),

  -- Agent가 기록하는 이벤트 로그
  events JSONB DEFAULT '[]'::jsonb,

  -- 마지막 활동 시간
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_attendance_status ON training_attendance(status);

ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for training_attendance" ON training_attendance FOR ALL USING (true) WITH CHECK (true);
