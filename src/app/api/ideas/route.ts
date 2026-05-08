import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - 전체 아이디어 목록 (댓글 수 포함)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get("idea_id");

  // 특정 아이디어의 댓글 조회
  if (ideaId) {
    const { data, error } = await supabase
      .from("idea_comments")
      .select("*")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: data });
  }

  // 전체 아이디어 목록
  const { data, error } = await supabase
    .from("team_ideas")
    .select("*")
    .order("votes", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 각 아이디어의 댓글 수 조회
  const ideasWithCommentCount = await Promise.all(
    (data || []).map(async (idea) => {
      const { count } = await supabase
        .from("idea_comments")
        .select("*", { count: "exact", head: true })
        .eq("idea_id", idea.id);
      return { ...idea, comment_count: count || 0 };
    })
  );

  return NextResponse.json({ ideas: ideasWithCommentCount });
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

  // 댓글 추가
  if (action === "comment") {
    const { idea_id, author_name, content } = body;

    if (!idea_id || !author_name || !content) {
      return NextResponse.json(
        { error: "idea_id, author_name, content are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("idea_comments")
      .insert({
        idea_id,
        author_name,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
