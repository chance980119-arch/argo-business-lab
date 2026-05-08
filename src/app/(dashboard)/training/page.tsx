"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TrainingAttendance } from "@/types/database";
import {
  CheckCircle2,
  Clock,
  Loader2,
  UserPlus,
  Users,
  Zap,
  Terminal,
} from "lucide-react";

export default function TrainingPage() {
  const [participants, setParticipants] = useState<TrainingAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [github, setGithub] = useState("");

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/training");
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3초마다 폴링
  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 3000);
    return () => clearInterval(interval);
  }, [fetchParticipants]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setRegistering(true);
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          participant_name: name.trim(),
          github_username: github.trim() || null,
        }),
      });

      if (res.ok) {
        setName("");
        setGithub("");
        fetchParticipants();
      }
    } catch (error) {
      console.error("Failed to register:", error);
    } finally {
      setRegistering(false);
    }
  };

  const getStatusBadge = (status: TrainingAttendance["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            대기 중
          </Badge>
        );
      case "ready":
        return (
          <Badge className="gap-1 bg-blue-100 text-blue-800">
            <Zap className="h-3 w-3" />
            환경 준비됨
          </Badge>
        );
      case "completed":
        return (
          <Badge className="gap-1 bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            완료
          </Badge>
        );
    }
  };

  const stats = {
    total: participants.length,
    ready: participants.filter((p) => p.status === "ready").length,
    completed: participants.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">교육 현황</h1>
        <p className="text-muted-foreground">
          Argo Business Lab - AI 코딩 도구 교육
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 참가자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">환경 준비됨</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ready}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실습 완료</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* 참가자 등록 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            참가자 등록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="name" className="sr-only">
                이름
              </Label>
              <Input
                id="name"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="github" className="sr-only">
                GitHub 사용자명
              </Label>
              <Input
                id="github"
                placeholder="GitHub 사용자명 (선택)"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={registering || !name.trim()}>
              {registering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "등록"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 참가자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            참가자 현황
            <span className="text-sm font-normal text-muted-foreground">
              (3초마다 자동 갱신)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 등록된 참가자가 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                      {participant.participant_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {participant.participant_name}
                      </div>
                      {participant.github_username && (
                        <div className="text-sm text-muted-foreground">
                          @{participant.github_username}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(participant.status)}
                    <div className="text-xs text-muted-foreground">
                      {participant.events?.length || 0}개 이벤트
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent 사용법 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>Agent 출석체크 명령어</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Codex/Claude가 아래 curl 명령을 실행하면 참가자 상태가 자동으로 업데이트됩니다.
          </p>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`# 환경 준비 완료 알림
curl -X POST http://localhost:3000/api/training \\
  -H "Content-Type: application/json" \\
  -d '{"action":"event","participant_id":"<ID>","event_type":"env_ready","message":"개발환경 세팅 완료!"}'

# 첫 빌드 성공 알림
curl -X POST http://localhost:3000/api/training \\
  -H "Content-Type: application/json" \\
  -d '{"action":"event","participant_id":"<ID>","event_type":"first_build","message":"첫 빌드 성공!"}'`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
