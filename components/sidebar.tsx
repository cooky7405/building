"use client";

// 이 코드는 기존 파일의 일부만 수정하는 것입니다
// 사이드바의 영수증 관련 메뉴 아래에 다음 항목을 추가합니다

import { FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Sidebar() {
  const { buildingId } = useParams();

  return (
    <Link href={`/buildings/${buildingId}/invoices/bulk-view`}>
      <Button variant="ghost" className="w-full justify-start">
        <FileText className="mr-2 h-4 w-4" />
        전체 세대 관리비 보기
      </Button>
    </Link>
  );
}
