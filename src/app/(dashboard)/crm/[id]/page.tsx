"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Seller, SalesHistory, Contact } from "@/types/database";
import { SELLER_STATUS_OPTIONS, ACTIVITY_TYPE_OPTIONS } from "@/types/database";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Package,
  TrendingUp,
  Plus,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { SellerDialog } from "../seller-dialog";
import { ActivityDialog } from "./activity-dialog";

export default function SellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [activities, setActivities] = useState<SalesHistory[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    // 셀러 정보
    const { data: sellerData } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", sellerId)
      .single();

    if (sellerData) {
      setSeller(sellerData);
    }

    // 영업 활동
    const { data: activitiesData } = await supabase
      .from("sales_history")
      .select("*")
      .eq("seller_id", sellerId)
      .order("activity_date", { ascending: false });

    setActivities(activitiesData || []);

    // 연락처
    const { data: contactsData } = await supabase
      .from("contacts")
      .select("*")
      .eq("seller_id", sellerId)
      .order("is_primary", { ascending: false });

    setContacts(contactsData || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">셀러를 찾을 수 없습니다</p>
        <Link href="/crm" className={buttonVariants()}>
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const statusOption = SELLER_STATUS_OPTIONS.find(
    (s) => s.value === seller.status
  );

  const getStatusColor = (status: Seller["status"]) => {
    const colorMap: Record<string, string> = {
      lead: "bg-gray-100 text-gray-800",
      contacted: "bg-blue-100 text-blue-800",
      negotiating: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      churned: "bg-red-100 text-red-800",
    };
    return colorMap[status];
  };

  const getOutcomeColor = (outcome: SalesHistory["outcome"]) => {
    if (outcome === "positive") return "text-green-600";
    if (outcome === "negative") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/crm" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{seller.company_name}</h1>
              <Badge className={getStatusColor(seller.status)}>
                {statusOption?.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {seller.contact_name}
              {seller.main_category && ` · ${seller.main_category}`}
            </p>
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)}>정보 수정</Button>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월 물동량</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seller.monthly_volume?.toLocaleString() || "-"}
            </div>
            <p className="text-xs text-muted-foreground">건/월</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SKU 수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seller.sku_count?.toLocaleString() || "-"}
            </div>
            <p className="text-xs text-muted-foreground">개</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 주문금액</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${seller.avg_order_value?.toLocaleString() || "-"}
            </div>
            <p className="text-xs text-muted-foreground">USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">영업 활동</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">건</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="activities">영업 활동</TabsTrigger>
          <TabsTrigger value="contacts">연락처</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>연락처 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {seller.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${seller.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {seller.email}
                  </a>
                </div>
              )}
              {seller.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{seller.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>판매 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">판매 채널</div>
                <div className="flex flex-wrap gap-2">
                  {seller.sales_channels?.map((channel) => (
                    <Badge key={channel} variant="outline">
                      {channel}
                    </Badge>
                  )) || (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">판매 국가</div>
                <div className="flex flex-wrap gap-2">
                  {seller.selling_countries?.map((country) => (
                    <Badge key={country} variant="secondary">
                      {country}
                    </Badge>
                  )) || (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">비즈니스 유형</div>
                <span>{seller.business_type || "-"}</span>
              </div>
            </CardContent>
          </Card>

          {seller.notes && (
            <Card>
              <CardHeader>
                <CardTitle>메모</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{seller.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">영업 활동 기록</h3>
            <Button size="sm" onClick={() => setActivityDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              활동 추가
            </Button>
          </div>

          {activities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  아직 영업 활동 기록이 없습니다
                </p>
                <Button onClick={() => setActivityDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  첫 활동 추가하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const typeOption = ACTIVITY_TYPE_OPTIONS.find(
                  (t) => t.value === activity.activity_type
                );
                return (
                  <Card key={activity.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline">{typeOption?.label}</Badge>
                          <div>
                            <p className="font-medium">{activity.summary}</p>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.details}
                              </p>
                            )}
                            {activity.next_action && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">다음 액션:</span>{" "}
                                {activity.next_action}
                                {activity.next_action_date && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    ({activity.next_action_date})
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {activity.activity_date}
                          </div>
                          {activity.outcome && (
                            <div
                              className={`text-sm font-medium ${getOutcomeColor(activity.outcome)}`}
                            >
                              {activity.outcome === "positive"
                                ? "긍정적"
                                : activity.outcome === "negative"
                                  ? "부정적"
                                  : "중립"}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">연락처 목록</h3>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              연락처 추가
            </Button>
          </div>

          {contacts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  추가 연락처가 없습니다
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{contact.type}</Badge>
                      <span>{contact.value}</span>
                      {contact.label && (
                        <span className="text-sm text-muted-foreground">
                          ({contact.label})
                        </span>
                      )}
                    </div>
                    {contact.is_primary && (
                      <Badge variant="secondary">기본</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 다이얼로그 */}
      <SellerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        seller={seller}
        onSuccess={fetchData}
      />

      <ActivityDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        sellerId={sellerId}
        onSuccess={fetchData}
      />
    </div>
  );
}
