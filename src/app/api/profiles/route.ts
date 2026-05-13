import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - 전체 프로필 목록
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (userId) {
    // 특정 사용자 프로필 조회
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ profile: data });
  }

  // 전체 프로필 목록
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profiles: data });
}

// POST - 프로필 생성/수정
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, user_id, ...profileData } = body;

  if (action === "upsert") {
    // 기존 프로필 확인
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (existing) {
      // 수정
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ profile: data, action: "updated" });
    } else {
      // 생성
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id,
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ profile: data, action: "created" });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
