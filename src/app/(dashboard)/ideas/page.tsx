"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lightbulb,
  ThumbsUp,
  Loader2,
  Sparkles,
  Bot,
  LayoutDashboard,
  Wrench,
  HelpCircle,
  Clock,
  User,
} from "lucide-react";

interface TeamIdea {
  id: string;
  created_at: string;
  team_name: string;
  idea_title: string;
  description: string | null;
  category: "automation" | "dashboard" | "tool" | "other";
  votes: number;
  status: "submitted" | "in_progress" | "done";
}

const CATEGORY_CONFIG = {
  automation: { label: "자동화", icon: Bot, color: "bg-purple-100 text-purple-800" },
  dashboard: { label: "대시보드", icon: LayoutDashboard, color: "bg-blue-100 text-blue-800" },
  tool: { label: "도구", icon: Wrench, color: "bg-green-100 text-green-800" },
  other: { label: "기타", icon: HelpCircle, color: "bg-gray-100 text-gray-800" },
};

const STATUS_CONFIG = {
  submitted: { label: "제출됨", color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "진행중", color: "bg-blue-100 text-blue-800" },
  done: { label: "완료", color: "bg-green-100 text-green-800" },
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<TeamIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<TeamIdea | null>(null);

  // Form state
  const [teamName, setTeamName] = useState("");
  const [ideaTitle, setIdeaTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("automation");

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch("/api/ideas");
      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 5초마다 폴링
  useEffect(() => {
    fetchIdeas();
    const interval = setInterval(fetchIdeas, 5000);
    return () => clearInterval(interval);
  }, [fetchIdeas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !ideaTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          team_name: teamName.trim(),
          idea_title: ideaTitle.trim(),
          description: description.trim() || null,
          category,
        }),
      });

      if (res.ok) {
        setTeamName("");
        setIdeaTitle("");
        setDescription("");
        setCategory("automation");
        fetchIdeas();
      }
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (ideaId: string) => {
    try {
      await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vote", idea_id: ideaId }),
      });
      fetchIdeas();
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          아이디어 보드
        </h1>
        <p className="text-muted-foreground">
          팀별로 만들고 싶은 자동화/대시보드/도구를 제안하세요!
        </p>
      </div>

      {/* 제출 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            새 아이디어 제출
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="team">팀 이름</Label>
                <Input
                  id="team"
                  placeholder="예: A팀, 물류팀, ..."
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automation">자동화</SelectItem>
                    <SelectItem value="dashboard">대시보드</SelectItem>
                    <SelectItem value="tool">도구</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">아이디어 제목</Label>
              <Input
                id="title"
                placeholder="예: 일일 매출 리포트 자동 생성"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">설명 (선택)</Label>
              <Textarea
                id="desc"
                placeholder="어떤 기능인지 자세히 설명해주세요..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={submitting || !teamName.trim() || !ideaTitle.trim()}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              제출하기
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 아이디어 목록 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          제출된 아이디어 ({ideas.length}개)
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (5초마다 자동 갱신)
          </span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ideas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 제출된 아이디어가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ideas.map((idea) => {
              const categoryConfig = CATEGORY_CONFIG[idea.category];
              const statusConfig = STATUS_CONFIG[idea.status];
              const CategoryIcon = categoryConfig.icon;

              return (
                <Card
                  key={idea.id}
                  className="relative cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedIdea(idea)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={categoryConfig.color}>
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {categoryConfig.label}
                        </Badge>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(idea.id);
                        }}
                        className="gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {idea.votes}
                      </Button>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{idea.idea_title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      by <span className="font-medium">{idea.team_name}</span>
                    </p>
                    {idea.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {idea.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      클릭하여 상세 보기
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 상세 보기 다이얼로그 */}
      <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
        <DialogContent className="max-w-lg">
          {selectedIdea && (() => {
            const categoryConfig = CATEGORY_CONFIG[selectedIdea.category];
            const statusConfig = STATUS_CONFIG[selectedIdea.status];
            const CategoryIcon = categoryConfig.icon;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedIdea.idea_title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* 배지 */}
                  <div className="flex items-center gap-2">
                    <Badge className={categoryConfig.color}>
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {categoryConfig.label}
                    </Badge>
                    <Badge className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* 팀 정보 */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedIdea.team_name}</span>
                  </div>

                  {/* 등록 시간 */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(selectedIdea.created_at).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* 설명 */}
                  {selectedIdea.description ? (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedIdea.description}</p>
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">설명이 없습니다</p>
                    </div>
                  )}

                  {/* 투표 */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">이 아이디어에 투표하기</span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleVote(selectedIdea.id);
                        setSelectedIdea({
                          ...selectedIdea,
                          votes: selectedIdea.votes + 1,
                        });
                      }}
                      className="gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {selectedIdea.votes}표
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
