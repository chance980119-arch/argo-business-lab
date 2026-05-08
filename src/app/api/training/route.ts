import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - 전체 참가자 목록 조회
export async function GET() {
  const { data, error } = await supabase
    .from("training_attendance")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ participants: data });
}

// POST - 새 참가자 등록 또는 이벤트 추가
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  // 새 참가자 등록
  if (action === "register") {
    const { participant_name, github_username } = body;

    if (!participant_name) {
      return NextResponse.json(
        { error: "participant_name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("training_attendance")
      .insert({
        participant_name,
        github_username: github_username || null,
        status: "pending",
        events: [
          {
            type: "joined",
            message: "교육에 참가했습니다",
            timestamp: new Date().toISOString(),
          },
        ],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ participant: data });
  }

  // 이벤트 추가 (Agent가 호출)
  if (action === "event") {
    const { participant_id, event_type, message } = body;

    if (!participant_id || !event_type || !message) {
      return NextResponse.json(
        { error: "participant_id, event_type, message are required" },
        { status: 400 }
      );
    }

    // 현재 이벤트 가져오기
    const { data: current, error: fetchError } = await supabase
      .from("training_attendance")
      .select("events, status")
      .eq("id", participant_id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const events = current.events || [];
    events.push({
      type: event_type,
      message,
      timestamp: new Date().toISOString(),
    });

    // 상태 자동 업데이트
    let newStatus = current.status;
    if (event_type === "env_ready") {
      newStatus = "ready";
    } else if (event_type === "first_build") {
      newStatus = "completed";
    }

    const { data, error } = await supabase
      .from("training_attendance")
      .update({
        events,
        status: newStatus,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", participant_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ participant: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
