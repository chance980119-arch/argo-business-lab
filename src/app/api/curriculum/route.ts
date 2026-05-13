import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - 커리큘럼 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dayNumber = searchParams.get("day");
  const userId = searchParams.get("user_id");

  // 특정 Day 조회
  if (dayNumber) {
    const { data, error } = await supabase
      .from("curriculum_days")
      .select("*")
      .eq("day_number", parseInt(dayNumber))
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // 사용자 진행 상황도 함께 조회
    let progress = null;
    if (userId) {
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("day_number", parseInt(dayNumber))
        .single();
      progress = progressData;
    }

    return NextResponse.json({ curriculum: data, progress });
  }

  // 전체 커리큘럼 목록
  const { data, error } = await supabase
    .from("curriculum_days")
    .select("*")
    .order("day_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 사용자 전체 진행 상황
  let progressMap: Record<number, unknown> = {};
  if (userId) {
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (progressData) {
      progressMap = progressData.reduce((acc, p) => {
        acc[p.day_number] = p;
        return acc;
      }, {} as Record<number, unknown>);
    }
  }

  return NextResponse.json({ curriculum: data, progress: progressMap });
}

// POST - 진행 상황 업데이트
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, user_id, day_number, ...data } = body;

  // 미션 시작
  if (action === "start") {
    const { data: existing } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", user_id)
      .eq("day_number", day_number)
      .single();

    if (existing) {
      // 이미 시작함
      const { data: updated, error } = await supabase
        .from("user_progress")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ progress: updated });
    }

    const { data: created, error } = await supabase
      .from("user_progress")
      .insert({
        user_id,
        day_number,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: created });
  }

  // 미션 완료
  if (action === "complete") {
    const { submission_url, notes } = data;

    const { data: updated, error } = await supabase
      .from("user_progress")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        submission_url,
        notes,
      })
      .eq("user_id", user_id)
      .eq("day_number", day_number)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
