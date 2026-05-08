"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Seller, SellerInsert } from "@/types/database";
import {
  SELLER_STATUS_OPTIONS,
  SALES_CHANNEL_OPTIONS,
  COUNTRY_OPTIONS,
} from "@/types/database";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seller: Seller | null;
  onSuccess: () => void;
}

export function SellerDialog({
  open,
  onOpenChange,
  seller,
  onSuccess,
}: SellerDialogProps) {
  const isEditing = !!seller;

  const [formData, setFormData] = useState<SellerInsert>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    status: "lead",
    business_type: "",
    main_category: "",
    sales_channels: [],
    selling_countries: [],
    monthly_volume: null,
    sku_count: null,
    avg_order_value: null,
    notes: "",
    metadata: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seller) {
      setFormData({
        company_name: seller.company_name,
        contact_name: seller.contact_name,
        email: seller.email || "",
        phone: seller.phone || "",
        status: seller.status,
        business_type: seller.business_type || "",
        main_category: seller.main_category || "",
        sales_channels: seller.sales_channels || [],
        selling_countries: seller.selling_countries || [],
        monthly_volume: seller.monthly_volume,
        sku_count: seller.sku_count,
        avg_order_value: seller.avg_order_value,
        notes: seller.notes || "",
        metadata: seller.metadata,
      });
    } else {
      setFormData({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        status: "lead",
        business_type: "",
        main_category: "",
        sales_channels: [],
        selling_countries: [],
        monthly_volume: null,
        sku_count: null,
        avg_order_value: null,
        notes: "",
        metadata: null,
      });
    }
  }, [seller, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("sellers")
          .update(formData)
          .eq("id", seller.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("sellers").insert(formData);

        if (error) throw error;
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      alert("저장 중 오류가 발생했습니다: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (channel: string) => {
    const current = formData.sales_channels || [];
    if (current.includes(channel)) {
      setFormData({
        ...formData,
        sales_channels: current.filter((c) => c !== channel),
      });
    } else {
      setFormData({
        ...formData,
        sales_channels: [...current, channel],
      });
    }
  };

  const toggleCountry = (code: string) => {
    const current = formData.selling_countries || [];
    if (current.includes(code)) {
      setFormData({
        ...formData,
        selling_countries: current.filter((c) => c !== code),
      });
    } else {
      setFormData({
        ...formData,
        selling_countries: [...current, code],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "셀러 정보 수정" : "새 셀러 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">회사명 *</Label>
                <Input
                  id="company_name"
                  required
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">담당자명 *</Label>
                <Input
                  id="contact_name"
                  required
                  value={formData.contact_name}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 상태 */}
          <div className="space-y-2">
            <Label>상태</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as Seller["status"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SELLER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 비즈니스 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium">비즈니스 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_type">비즈니스 유형</Label>
                <Input
                  id="business_type"
                  placeholder="예: B2C, D2C, B2B"
                  value={formData.business_type || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, business_type: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="main_category">주요 카테고리</Label>
                <Input
                  id="main_category"
                  placeholder="예: K-Beauty, Fashion"
                  value={formData.main_category || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, main_category: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 판매 채널 */}
          <div className="space-y-2">
            <Label>판매 채널</Label>
            <div className="flex flex-wrap gap-2">
              {SALES_CHANNEL_OPTIONS.map((channel) => {
                const isSelected = formData.sales_channels?.includes(channel);
                return (
                  <Badge
                    key={channel}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleChannel(channel)}
                  >
                    {channel}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* 판매 국가 */}
          <div className="space-y-2">
            <Label>판매 국가</Label>
            <div className="flex flex-wrap gap-2">
              {COUNTRY_OPTIONS.map((country) => {
                const isSelected = formData.selling_countries?.includes(
                  country.code
                );
                return (
                  <Badge
                    key={country.code}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCountry(country.code)}
                  >
                    {country.name}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* 물류 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium">물류 정보</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_volume">월 물동량 (건)</Label>
                <Input
                  id="monthly_volume"
                  type="number"
                  value={formData.monthly_volume ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_volume: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku_count">SKU 수</Label>
                <Input
                  id="sku_count"
                  type="number"
                  value={formData.sku_count ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sku_count: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avg_order_value">평균 주문금액 (USD)</Label>
                <Input
                  id="avg_order_value"
                  type="number"
                  value={formData.avg_order_value ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      avg_order_value: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "저장 중..." : isEditing ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
