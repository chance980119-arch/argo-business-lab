import { redirect } from "next/navigation";

export default function Home() {
  // 홈페이지 접속 시 CRM으로 리다이렉트
  redirect("/crm");
}
