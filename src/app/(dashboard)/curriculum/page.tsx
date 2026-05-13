"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  PlayCircle,
  Loader2,
  Clock,
  Target,
  MessageSquare,
  Gift,
} from "lucide-react";

interface CurriculumDay {
  id: string;
  day_number: number;
  phase: string;
  title: string;
  description: string | null;
  mission_content: string | null;
  agent_prompt: string | null;
  clear_criteria: string[] | null;
  bonus_mission: string | null;
  estimated_minutes: number;
}

const PHASE_COLORS: Record<string, string> = {
  "Git 기초": "bg-green-100 text-green-800",
  "터미널 & 환경": "bg-blue-100 text-blue-800",
  "DB 기초": "bg-purple-100 text-purple-800",
  "API 이해": "bg-orange-100 text-orange-800",
  "프론트엔드 기초": "bg-pink-100 text-pink-800",
  "Argo 구조": "bg-red-100 text-red-800",
  "AWS 기초": "bg-yellow-100 text-yellow-800",
  "실전 프로젝트": "bg-indigo-100 text-indigo-800",
};

export default function CurriculumPage() {
  const [curriculum, setCurriculum] = useState<CurriculumDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CurriculumDay | null>(null);

  useEffect(() => {
    async function fetchCurriculum() {
      try {
        const res = await fetch("/api/curriculum");
        const data = await res.json();
        setCurriculum(data.curriculum || []);
      } catch (error) {
        console.error("Failed to fetch curriculum:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCurriculum();
  }, []);

  // Phase별로 그룹핑
  const groupedByPhase = curriculum.reduce((acc, day) => {
    if (!acc[day.phase]) {
      acc[day.phase] = [];
    }
    acc[day.phase].push(day);
    return acc;
  }, {} as Record<string, CurriculumDay[]>);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          Daily Dev Mission
        </h1>
        <p className="text-muted-foreground">
          매일 하나씩, AI Agent와 함께 개발 역량을 키워보세요
        </p>
      </div>

      {/* 진행 현황 요약 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">전체 진행률</p>
              <p className="text-2xl font-bold">0 / {curriculum.length} 완료</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <Circle className="h-5 w-5 text-gray-300 mx-auto" />
                <p className="text-xs text-muted-foreground mt-1">대기</p>
              </div>
              <div className="text-center">
                <PlayCircle className="h-5 w-5 text-blue-500 mx-auto" />
                <p className="text-xs text-muted-foreground mt-1">진행중</p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                <p className="text-xs text-muted-foreground mt-1">완료</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 커리큘럼 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByPhase).map(([phase, days]) => (
            <div key={phase}>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={PHASE_COLORS[phase] || "bg-gray-100 text-gray-800"}>
                  {phase}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {days.length}개 미션
                </span>
              </div>

              <div className="grid gap-3">
                {days.map((day) => (
                  <Card
                    key={day.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedDay(day)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        {/* 상태 아이콘 */}
                        <div className="flex-shrink-0">
                          <Circle className="h-6 w-6 text-gray-300" />
                        </div>

                        {/* Day 번호 */}
                        <div className="w-12 text-center">
                          <span className="text-lg font-bold text-muted-foreground">
                            D{day.day_number}
                          </span>
                        </div>

                        {/* 제목 & 설명 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{day.title}</h3>
                          {day.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {day.description}
                            </p>
                          )}
                        </div>

                        {/* 예상 시간 */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {day.estimated_minutes}분
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 미션 상세 다이얼로그 */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedDay && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className={PHASE_COLORS[selectedDay.phase] || "bg-gray-100"}>
                    {selectedDay.phase}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Day {selectedDay.day_number}
                  </span>
                </div>
                <DialogTitle className="text-xl mt-2">
                  {selectedDay.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* 설명 */}
                {selectedDay.description && (
                  <p className="text-muted-foreground">
                    {selectedDay.description}
                  </p>
                )}

                {/* 미션 내용 */}
                {selectedDay.mission_content && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      미션
                    </h4>
                    <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                      {selectedDay.mission_content}
                    </div>
                  </div>
                )}

                {/* Agent 프롬프트 */}
                {selectedDay.agent_prompt && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4" />
                      Agent에게 이렇게 물어봐
                    </h4>
                    <code className="block bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                      &quot;{selectedDay.agent_prompt}&quot;
                    </code>
                  </div>
                )}

                {/* 클리어 조건 */}
                {selectedDay.clear_criteria && selectedDay.clear_criteria.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      클리어 조건
                    </h4>
                    <ul className="space-y-2">
                      {selectedDay.clear_criteria.map((criteria, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Circle className="h-4 w-4 text-gray-300" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 보너스 미션 */}
                {selectedDay.bonus_mission && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-1 text-yellow-800">
                      <Gift className="h-4 w-4" />
                      보너스 미션
                    </h4>
                    <p className="text-sm text-yellow-700">
                      {selectedDay.bonus_mission}
                    </p>
                  </div>
                )}

                {/* 예상 시간 */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                  <Clock className="h-4 w-4" />
                  예상 소요 시간: {selectedDay.estimated_minutes}분
                </div>

                {/* 시작 버튼 */}
                <Button className="w-full" size="lg">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  미션 시작하기
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
