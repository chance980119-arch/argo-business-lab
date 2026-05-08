// Supabase Database Types
// 이 파일은 Supabase 테이블 구조와 매칭됩니다

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sellers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          // 기본 정보
          company_name: string;
          contact_name: string;
          email: string | null;
          phone: string | null;
          // 상태
          status: "lead" | "contacted" | "negotiating" | "active" | "churned";
          // 비즈니스 정보
          business_type: string | null; // B2B, B2C, D2C 등
          main_category: string | null; // K-Beauty, Fashion 등
          // 판매 정보
          sales_channels: string[] | null; // ["amazon", "shopify", "own_site"]
          selling_countries: string[] | null; // ["US", "JP", "KR"]
          // 물류 정보
          monthly_volume: number | null; // 월 물동량 (건)
          sku_count: number | null; // SKU 수
          avg_order_value: number | null; // 평균 주문금액 (USD)
          // 메모
          notes: string | null;
          // 추가 데이터 (확장용)
          metadata: Json | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["sellers"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["sellers"]["Insert"]>;
      };
      contacts: {
        Row: {
          id: string;
          created_at: string;
          seller_id: string;
          // 연락처 정보
          type: "email" | "phone" | "kakao" | "line" | "whatsapp" | "other";
          value: string;
          label: string | null; // "업무용", "개인" 등
          is_primary: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["contacts"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
      };
      sales_history: {
        Row: {
          id: string;
          created_at: string;
          seller_id: string;
          // 영업 활동
          activity_type:
            | "call"
            | "email"
            | "meeting"
            | "demo"
            | "proposal"
            | "contract"
            | "other";
          activity_date: string;
          summary: string;
          details: string | null;
          // 결과
          outcome: "positive" | "neutral" | "negative" | null;
          next_action: string | null;
          next_action_date: string | null;
          // 담당자
          handled_by: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["sales_history"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["sales_history"]["Insert"]
        >;
      };
    };
  };
}

// 편의 타입
export type Seller = Database["public"]["Tables"]["sellers"]["Row"];
export type SellerInsert = Database["public"]["Tables"]["sellers"]["Insert"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
export type SalesHistory = Database["public"]["Tables"]["sales_history"]["Row"];
export type SalesHistoryInsert =
  Database["public"]["Tables"]["sales_history"]["Insert"];

// Status 옵션
export const SELLER_STATUS_OPTIONS = [
  { value: "lead", label: "리드", color: "bg-gray-500" },
  { value: "contacted", label: "컨택 완료", color: "bg-blue-500" },
  { value: "negotiating", label: "협상 중", color: "bg-yellow-500" },
  { value: "active", label: "활성", color: "bg-green-500" },
  { value: "churned", label: "이탈", color: "bg-red-500" },
] as const;

// 판매 채널 옵션
export const SALES_CHANNEL_OPTIONS = [
  "Amazon",
  "Shopify",
  "Own Website",
  "Coupang",
  "Rakuten",
  "eBay",
  "Walmart",
  "Target",
  "Olive Young",
  "기타",
] as const;

// 판매 국가 옵션
export const COUNTRY_OPTIONS = [
  { code: "US", name: "미국" },
  { code: "JP", name: "일본" },
  { code: "KR", name: "한국" },
  { code: "CN", name: "중국" },
  { code: "UK", name: "영국" },
  { code: "DE", name: "독일" },
  { code: "FR", name: "프랑스" },
  { code: "AU", name: "호주" },
  { code: "CA", name: "캐나다" },
  { code: "SG", name: "싱가포르" },
] as const;

// Activity 타입 옵션
export const ACTIVITY_TYPE_OPTIONS = [
  { value: "call", label: "전화" },
  { value: "email", label: "이메일" },
  { value: "meeting", label: "미팅" },
  { value: "demo", label: "데모" },
  { value: "proposal", label: "제안서" },
  { value: "contract", label: "계약" },
  { value: "other", label: "기타" },
] as const;

// Training Attendance (교육 출석)
export interface TrainingAttendance {
  id: string;
  created_at: string;
  participant_name: string;
  github_username: string | null;
  status: "pending" | "ready" | "completed";
  events: TrainingEvent[];
  last_active_at: string;
}

export interface TrainingEvent {
  type: "joined" | "env_ready" | "first_build" | "custom";
  message: string;
  timestamp: string;
}

export type TrainingAttendanceInsert = Omit<TrainingAttendance, "id" | "created_at" | "last_active_at" | "events"> & {
  events?: TrainingEvent[];
};
