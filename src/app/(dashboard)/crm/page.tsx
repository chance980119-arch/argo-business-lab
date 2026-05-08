"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Seller } from "@/types/database";
import { SELLER_STATUS_OPTIONS } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Building2 } from "lucide-react";
import Link from "next/link";
import { SellerDialog } from "./seller-dialog";

export default function CRMPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);

  const fetchSellers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sellers:", error);
    } else {
      setSellers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Seller["status"]) => {
    const statusOption = SELLER_STATUS_OPTIONS.find((s) => s.value === status);
    if (!statusOption) return null;

    const colorMap: Record<string, string> = {
      lead: "bg-gray-100 text-gray-800",
      contacted: "bg-blue-100 text-blue-800",
      negotiating: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      churned: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colorMap[status]} variant="secondary">
        {statusOption.label}
      </Badge>
    );
  };

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingSeller(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("sellers").delete().eq("id", id);

    if (error) {
      alert("삭제 중 오류가 발생했습니다: " + error.message);
    } else {
      fetchSellers();
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">
            고객(셀러) 정보를 관리합니다
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          셀러 추가
        </Button>
      </div>

      {/* 검색 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="회사명, 담당자, 이메일로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredSellers.length}개 결과</Badge>
      </div>

      {/* 테이블 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "검색 결과가 없습니다" : "등록된 셀러가 없습니다"}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              첫 셀러 추가하기
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회사명</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>판매채널</TableHead>
                <TableHead>판매국가</TableHead>
                <TableHead>월 물동량</TableHead>
                <TableHead>SKU 수</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <Link
                      href={`/crm/${seller.id}`}
                      className="font-medium hover:underline"
                    >
                      {seller.company_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{seller.contact_name}</div>
                      {seller.email && (
                        <div className="text-xs text-muted-foreground">
                          {seller.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(seller.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {seller.sales_channels?.slice(0, 2).map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                      {(seller.sales_channels?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(seller.sales_channels?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {seller.selling_countries?.slice(0, 3).map((country) => (
                        <Badge key={country} variant="secondary" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                      {(seller.selling_countries?.length || 0) > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(seller.selling_countries?.length || 0) - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {seller.monthly_volume?.toLocaleString() || "-"}
                  </TableCell>
                  <TableCell>
                    {seller.sku_count?.toLocaleString() || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/crm/${seller.id}`} className="w-full">상세 보기</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(seller)}>
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(seller.id)}
                          className="text-red-600"
                        >
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 셀러 추가/수정 다이얼로그 */}
      <SellerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        seller={editingSeller}
        onSuccess={fetchSellers}
      />
    </div>
  );
}
