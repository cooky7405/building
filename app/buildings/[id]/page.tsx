import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Building } from "@/types/building";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BuildingIcon,
  FileText,
  BellRing,
  ParkingSquare,
  Droplets,
} from "lucide-react";

// 임시 데이터 - 실제 구현에서는 데이터베이스에서 가져올 것입니다
const buildings: Building[] = [
  {
    id: "1",
    name: "그랜드 빌딩",
    address: "서울시 강남구 테헤란로 123",
    units: 45,
    floors: 15,
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    name: "파크 타워",
    address: "서울시 서초구 서초대로 456",
    units: 30,
    floors: 10,
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    name: "블루 스퀘어",
    address: "서울시 용산구 이태원로 789",
    units: 25,
    floors: 8,
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
];

export const metadata: Metadata = {
  title: "빌딩 상세 - 빌딩 관리 시스템",
  description: "빌딩 상세 정보 및 관리 기능",
};

export default function BuildingPage({ params }: { params: { id: string } }) {
  const building = buildings.find((b) => b.id === params.id);

  if (!building) {
    notFound();
  }

  const invoiceTypes = [
    { label: "관리비", icon: BuildingIcon },
    { label: "수도세", icon: Droplets },
    { label: "주차비", icon: ParkingSquare },
  ];

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{building.name}</h1>
          <p className="text-muted-foreground">{building.address}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link href={`/buildings/${building.id}/edit`}>
            <Button variant="outline">빌딩 정보 수정</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="invoices">영수증</TabsTrigger>
          <TabsTrigger value="notices">공지사항</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>빌딩 정보</CardTitle>
                <CardDescription>빌딩의 기본 정보입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      총 세대수
                    </p>
                    <p className="text-lg font-medium">{building.units}세대</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      총 층수
                    </p>
                    <p className="text-lg font-medium">{building.floors}층</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      주소
                    </p>
                    <p className="text-base">{building.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>
                  빌딩과 관련된 최근 활동입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">5월 관리비 청구서 생성</p>
                      <p className="text-sm text-muted-foreground">
                        2023년 5월 31일
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <BellRing className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">화재 경보기 점검 공지</p>
                      <p className="text-sm text-muted-foreground">
                        2023년 5월 25일
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {invoiceTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {type.label}
                  </CardTitle>
                  <type.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    영수증 발행, 관리, 조회
                  </p>
                  <Link
                    href={`/buildings/${building.id}/invoices/create?type=${type.label}`}
                  >
                    <Button className="mt-4 w-full">영수증 생성</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>최근 발행된 영수증</CardTitle>
              <CardDescription>
                최근에 발행된 영수증 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b p-3 font-medium">
                  <div>유형</div>
                  <div className="col-span-2">제목</div>
                  <div>발행일</div>
                  <div className="text-right">금액</div>
                </div>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 p-3 hover:bg-muted"
                  >
                    <div>관리비</div>
                    <div className="col-span-2">
                      <Link
                        href={`/buildings/${params.id}/invoices/${index + 1}`}
                        className="text-blue-600 hover:underline"
                      >
                        5월 관리비 청구서
                      </Link>
                    </div>
                    <div>2023-05-31</div>
                    <div className="text-right">₩1,500,000</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link href={`/buildings/${building.id}/invoices`}>
                  <Button variant="outline">모든 영수증 보기</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notices" className="space-y-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">공지사항</h2>
            <Link href={`/buildings/${building.id}/notices/create`}>
              <Button>새 공지 작성</Button>
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="grid grid-cols-6 border-b p-3 font-medium">
                  <div className="col-span-3">제목</div>
                  <div>작성일</div>
                  <div>확인율</div>
                  <div>작업완료율</div>
                </div>
                <div className="grid grid-cols-6 p-3 hover:bg-muted">
                  <div className="col-span-3">
                    <Link
                      href={`/buildings/${building.id}/notices/1`}
                      className="text-blue-600 hover:underline"
                    >
                      화재 경보기 점검 안내
                    </Link>
                  </div>
                  <div>2023-05-25</div>
                  <div>80%</div>
                  <div>50%</div>
                </div>
                <div className="grid grid-cols-6 p-3 hover:bg-muted">
                  <div className="col-span-3">
                    <Link
                      href={`/buildings/${building.id}/notices/2`}
                      className="text-blue-600 hover:underline"
                    >
                      주차장 청소 안내
                    </Link>
                  </div>
                  <div>2023-05-15</div>
                  <div>95%</div>
                  <div>100%</div>
                </div>
                <div className="grid grid-cols-6 p-3 hover:bg-muted">
                  <div className="col-span-3">
                    <Link
                      href={`/buildings/${building.id}/notices/3`}
                      className="text-blue-600 hover:underline"
                    >
                      여름철 에어컨 사용 관련 안내
                    </Link>
                  </div>
                  <div>2023-05-10</div>
                  <div>75%</div>
                  <div>N/A</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
