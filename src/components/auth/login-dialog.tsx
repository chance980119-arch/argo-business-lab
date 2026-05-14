"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { LogIn, Mail, KeyRound, Loader2 } from "lucide-react";

type Step = "email" | "code";

export function LoginDialog() {
  const { login } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-code", email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("code");
      } else {
        setError(data.error || "인증 코드 발송 실패");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-code", email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        setOpen(false);
        resetForm();
      } else {
        setError(data.error || "인증 실패");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            로그인
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            이메일로 인증 코드를 받아 로그인하세요.
          </DialogDescription>
        </DialogHeader>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "인증 코드 받기"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label>이메일</Label>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">인증 코드</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder="6자리 코드"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                이메일로 발송된 6자리 코드를 입력하세요
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep("email")}
              >
                이메일 변경
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "확인"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
