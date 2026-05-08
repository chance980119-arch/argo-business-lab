import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 타입은 types/database.ts에서 별도로 정의하고 사용
// 실제 DB 스키마는 Supabase에서 SQL 실행 후 맞춰짐
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
