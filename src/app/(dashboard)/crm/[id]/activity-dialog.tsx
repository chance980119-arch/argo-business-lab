"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SalesHistoryInsert } from "@/types/database";
import { ACTIVITY_TYPE_OPTIONS } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId: string;
  onSuccess: () => void;
}

export function ActivityDialog({
  open,
  onOpenChange,
  sellerId,
  onSuccess,
}: ActivityDialogProps) {
  const [formData, setFormData] = useState<SalesHistoryInsert>({
    seller_id: sellerId,
    activity_type: "call",
    activity_date: new Date().toISOString().split("T")[0],
    summary: "",
    details: "",
    outcome: null,
    next_action: "",
    next_action_date: "",
    handled_by: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("sales_history").insert(formData);

      if (error) throw error;

      onSuccess();
      onOpenChange(false);

      // 폼 초기화
      setFormData({
        seller_id: sellerId,
        activity_type: "call",
        activity_date: new Date().toISOString().split("T")[0],
        summary: "",
        details: "",
        outcome: null,
        next_action: "",
        next_action_date: "",
        handled_by: "",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      alert("저장 중 오류가 발생했습니다: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>영업 활동 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>활동 유형</Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    activity_type: value as SalesHistoryInsert["activity_type"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity_date">활동 일자</Label>
              <Input
                id="activity_date"
                type="date"
                value={formData.activity_date}
                onChange={(e) =>
                  setFormData({ ...formData, activity_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">요약 *</Label>
            <Input
              id="summary"
              required
              placeholder="예: 첫 미팅 진행, 서비스 소개 완료"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">상세 내용</Label>
            <Textarea
              id="details"
              rows={3}
              placeholder="상세 내용을 입력하세요..."
              value={formData.details || ""}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>결과</Label>
            <Select
              value={formData.outcome || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  outcome:
                    value === "none"
                      ? null
                      : (value as SalesHistoryInsert["outcome"]),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="결과 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 안 함</SelectItem>
                <SelectItem value="positive">긍정적</SelectItem>
                <SelectItem value="neutral">중립</SelectItem>
                <SelectItem value="negative">부정적</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="next_action">다음 액션</Label>
              <Input
                id="next_action"
                placeholder="예: 견적서 발송"
                value={formData.next_action || ""}
                onChange={(e) =>
                  setFormData({ ...formData, next_action: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_action_date">다음 액션 예정일</Label>
              <Input
                id="next_action_date"
                type="date"
                value={formData.next_action_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, next_action_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="handled_by">담당자</Label>
            <Input
              id="handled_by"
              placeholder="담당자 이름"
              value={formData.handled_by || ""}
              onChange={(e) =>
                setFormData({ ...formData, handled_by: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "저장 중..." : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
