import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "argo-business-lab-secret-key-2024"
);

// 6자리 인증 코드 생성
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// JWT 생성
async function createToken(userId: string, email: string): Promise<string> {
  return await new jose.SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// JWT 검증
async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  // 인증 코드 발송
  if (action === "send-code") {
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    // 기존 사용자 확인 또는 생성
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      // 기존 사용자 - 코드 업데이트
      await supabase
        .from("users")
        .update({
          verification_code: code,
          code_expires_at: expiresAt.toISOString(),
        })
        .eq("email", email);
    } else {
      // 새 사용자 생성
      await supabase.from("users").insert({
        email,
        verification_code: code,
        code_expires_at: expiresAt.toISOString(),
      });
    }

    // TODO: 실제 이메일 발송 (Resend, SendGrid 등)
    // 현재는 콘솔에 출력 (개발용)
    console.log(`\n========================================`);
    console.log(`인증 코드 발송: ${email}`);
    console.log(`코드: ${code}`);
    console.log(`========================================\n`);

    return NextResponse.json({
      success: true,
      message: "인증 코드가 발송되었습니다",
      // 개발 모드에서만 코드 반환 (프로덕션에서는 제거)
      ...(process.env.NODE_ENV === "development" && { code }),
    });
  }

  // 인증 코드 확인
  if (action === "verify-code") {
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("verification_code", code)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    // 코드 만료 확인
    if (new Date(user.code_expires_at) < new Date()) {
      return NextResponse.json({ error: "Code expired" }, { status: 401 });
    }

    // 인증 완료 처리
    await supabase
      .from("users")
      .update({
        is_verified: true,
        verification_code: null,
        code_expires_at: null,
        last_login_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // JWT 발급
    const token = await createToken(user.id, user.email);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
      },
    });
  }

  // 현재 사용자 정보 (토큰으로)
  if (action === "me") {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, email, display_name, created_at")
      .eq("id", payload.userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 프로필도 함께 조회
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({ user, profile });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
