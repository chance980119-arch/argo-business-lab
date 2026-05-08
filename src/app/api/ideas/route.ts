import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - 전체 아이디어 목록
export async function GET() {
  const { data, error } = await supabase
    .from("team_ideas")
    .select("*")
    .order("votes", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ideas: data });
}

// POST - 새 아이디어 등록 또는 투표
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  // 새 아이디어 등록
  if (action === "submit") {
    const { team_name, idea_title, description, category } = body;

    if (!team_name || !idea_title) {
      return NextResponse.json(
        { error: "team_name and idea_title are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("team_ideas")
      .insert({
        team_name,
        idea_title,
        description: description || null,
        category: category || "other",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ idea: data });
  }

  // 투표
  if (action === "vote") {
    const { idea_id } = body;

    if (!idea_id) {
      return NextResponse.json({ error: "idea_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("increment_votes", {
      row_id: idea_id,
    });

    // RPC 없으면 직접 업데이트
    if (error) {
      const { data: current } = await supabase
        .from("team_ideas")
        .select("votes")
        .eq("id", idea_id)
        .single();

      const { data: updated, error: updateError } = await supabase
        .from("team_ideas")
        .update({ votes: (current?.votes || 0) + 1 })
        .eq("id", idea_id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ idea: updated });
    }

    return NextResponse.json({ success: true });
  }

  // 상태 변경
  if (action === "update_status") {
    const { idea_id, status } = body;

    const { data, error } = await supabase
      .from("team_ideas")
      .update({ status })
      .eq("id", idea_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ idea: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
