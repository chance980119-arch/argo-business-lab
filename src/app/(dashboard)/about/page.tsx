"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface Profile {
  id: string;
  created_at: string;
  display_name: string;
  team: string | null;
  role: string | null;
  bio: string | null;
  github_username: string | null;
  avatar_url: string | null;
  skills: string[] | null;
  fun_fact: string | null;
}

// 팀별 색상
const TEAM_COLORS: Record<string, string> = {
  "BD": "bg-blue-100 text-blue-800",
  "AM": "bg-green-100 text-green-800",
  "물류": "bg-purple-100 text-purple-800",
  "개발": "bg-orange-100 text-orange-800",
  "운영": "bg-pink-100 text-pink-800",
};

function getTeamColor(team: string | null): string {
  if (!team) return "bg-gray-100 text-gray-800";
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (team.includes(key)) return color;
  }
  return "bg-gray-100 text-gray-800";
}

export default function AboutPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await fetch("/api/profiles");
        const data = await res.json();
        setProfiles(data.profiles || []);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" />
          팀원 소개
        </h1>
        <p className="text-muted-foreground">
          Argo Business Lab 참가자들을 소개합니다
        </p>
      </div>

      {/* Day 1 미션 안내 */}
      <Card className="border-dashed border-2 border-blue-300 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Day 1 미션</h3>
              <p className="text-sm text-blue-700 mt-1">
                이 페이지에 본인 프로필 카드를 추가하세요! Agent에게 요청하세요:
              </p>
              <code className="block mt-2 p-2 bg-white rounded text-sm text-blue-800">
                &quot;자기소개 페이지에 내 프로필 카드 추가해줘. 이름은 OOO, 팀은 OOO, 소개는 OOO로 해줘.&quot;
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 프로필 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 등록된 프로필이 없습니다</p>
            <p className="text-sm text-muted-foreground mt-1">
              첫 번째로 프로필을 추가해보세요!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* 아바타 */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {profile.display_name?.charAt(0) || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 이름 & 팀 */}
                    <h3 className="font-semibold text-lg truncate">
                      {profile.display_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {profile.team && (
                        <Badge className={getTeamColor(profile.team)}>
                          {profile.team}
                        </Badge>
                      )}
                      {profile.role && (
                        <span className="text-sm text-muted-foreground">
                          {profile.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 소개 */}
                {profile.bio && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {profile.bio}
                  </p>
                )}

                {/* 스킬 */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {profile.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 재미있는 사실 */}
                {profile.fun_fact && (
                  <p className="mt-3 text-xs text-muted-foreground italic">
                    &quot;{profile.fun_fact}&quot;
                  </p>
                )}

                {/* GitHub */}
                {profile.github_username && (
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    @{profile.github_username}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
