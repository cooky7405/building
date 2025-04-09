import type { Building } from "@/types/building";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// 임시 데이터 - 실제 구현에서는 데이터베이스에서 가져올 것입니다
const buildings: Building[] = [
  {
    id: "1",
    name: "그랜드 빌딩",
    address: "서울시 강남구 테헤란로 123",
    units: 45,
    floors: 15,
    imageUrl: "/1320866.svg",
  },
  {
    id: "2",
    name: "파크 타워",
    address: "서울시 서초구 서초대로 456",
    units: 30,
    floors: 10,
    imageUrl: "/1320866.svg",
  },
  {
    id: "3",
    name: "블루 스퀘어",
    address: "서울시 용산구 이태원로 789",
    units: 25,
    floors: 8,
    imageUrl: "/1320866.svg",
  },
];

export default function Home() {
  return (
    <main className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">빌딩 관리 시스템</h1>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="빌딩 이름 또는 주소로 검색"
          className="w-full pl-8 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((building) => (
          <Card key={building.id} className="overflow-hidden">
            <div className="h-[200px] w-full overflow-hidden relative">
              <Image
                src={building.imageUrl || "/placeholder.svg"}
                alt={building.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle>{building.name}</CardTitle>
              <CardDescription>{building.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>총 세대수: {building.units}세대</p>
              <p>총 층수: {building.floors}층</p>
            </CardContent>
            <CardFooter>
              <Link href={`/buildings/${building.id}`} className="w-full">
                <Button className="w-full">관리하기</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
