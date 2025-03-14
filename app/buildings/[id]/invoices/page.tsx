import { Button } from "@/components/ui/button";
import { Eye, FileUp, Plus } from "lucide-react";
import Link from "next/link";

interface Props {
  params: {
    id: string;
  };
}

export default function Page({ params }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link href={`/buildings/${params.id}/invoices/bulk-view`}>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          전체 세대 관리비 보기
        </Button>
      </Link>
      <Link href={`/buildings/${params.id}/invoices/csv-upload`}>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          CSV 업로드
        </Button>
      </Link>
      <Link href={`/buildings/${params.id}/invoices/create`}>
        <Button>
          <Plus className="mr-2 h-4 w-4" />새 관리비 고지서 작성
        </Button>
      </Link>
    </div>
  );
}
