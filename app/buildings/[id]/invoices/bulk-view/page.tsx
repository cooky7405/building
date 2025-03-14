"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, FileUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// 파일 상단에 다음 인터페이스를 추가합니다 (import 문 아래에 위치시키세요)

interface InvoiceFees {
  general: number;
  securityGuard: number;
  cleaning: number;
  disinfection: number;
  elevator: number;
  electricity: {
    common: number;
    elevator: number;
  };
  water: number;
  heating: number;
  hotWater: number;
  insurance: number;
  repairs: number;
  longTermRepairs: number;
  expenses: number;
}

// 임시 데이터 - 실제 구현에서는 API에서 데이터를 가져옵니다
const generateInvoiceData = (
  unitNumber: string,
  floor: number,
  unit: number
) => {
  // 현재 월 계산
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  // 면적 계산 (예: 1층은 84.5㎡, 2층은 76.8㎡, 3층은 59.8㎡, 4층은 114.2㎡, 5층은 149.3㎡)
  const areaByFloor = {
    1: 84.5,
    2: 76.8,
    3: 59.8,
    4: 114.2,
    5: 149.3,
  };
  const area = areaByFloor[floor as keyof typeof areaByFloor];

  // 기본 관리비 (면적에 비례)
  const baseAmount = Math.round(area * 1200);

  // 층별로 다른 사용량 패턴 (예시)
  const usageMultiplier = {
    1: { water: 1.2, heating: 0.9, hotWater: 1.1, electricity: 1.0 },
    2: { water: 0.9, heating: 1.0, hotWater: 0.8, electricity: 1.1 },
    3: { water: 0.8, heating: 0.7, hotWater: 0.9, electricity: 0.8 },
    4: { water: 1.3, heating: 1.2, hotWater: 1.3, electricity: 1.4 },
    5: { water: 1.5, heating: 1.4, hotWater: 1.5, electricity: 1.6 },
  };
  const multiplier = usageMultiplier[floor as keyof typeof usageMultiplier];

  // 세대별 랜덤 변동 (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2;

  return {
    id: `${floor}${unit.toString().padStart(2, "0")}`,
    title: `${monthNames[month]} 관리비`,
    type: "관리비",
    dueDate: new Date(year, month, 25).toISOString().split("T")[0],
    buildingId: "1",
    createdAt: new Date(year, month, 5).toISOString().split("T")[0],
    buildingName: "그랜드 빌딩",
    buildingAddress: "서울시 강남구 테헤란로 123",
    unit: unitNumber,
    area: area,
    residentName: `입주자${floor}${unit.toString().padStart(2, "0")}`,

    // 관리비 항목
    fees: {
      general: Math.round(baseAmount * 0.3 * randomFactor),
      securityGuard: Math.round(baseAmount * 0.15 * randomFactor),
      cleaning: Math.round(baseAmount * 0.1 * randomFactor),
      disinfection: Math.round(baseAmount * 0.03 * randomFactor),
      elevator: Math.round(baseAmount * 0.05 * randomFactor),
      electricity: {
        common: Math.round(baseAmount * 0.07 * randomFactor),
        elevator: Math.round(baseAmount * 0.02 * randomFactor),
      },
      water: Math.round(baseAmount * 0.1 * multiplier.water * randomFactor),
      heating: Math.round(baseAmount * 0.2 * multiplier.heating * randomFactor),
      hotWater: Math.round(
        baseAmount * 0.1 * multiplier.hotWater * randomFactor
      ),
      insurance: Math.round(baseAmount * 0.02 * randomFactor),
      repairs: Math.round(baseAmount * 0.1 * randomFactor),
      longTermRepairs: Math.round(baseAmount * 0.15 * randomFactor),
      expenses: Math.round(baseAmount * 0.03 * randomFactor),
    },

    // 전월 사용량
    usage: {
      water: Math.round(15 * multiplier.water * randomFactor * 10) / 10,
      heating: Math.round(5 * multiplier.heating * randomFactor * 10) / 10,
      hotWater: Math.round(25 * multiplier.hotWater * randomFactor * 10) / 10,
      electricity: Math.round(250 * multiplier.electricity * randomFactor),
    },

    // 납부 정보
    payment: {
      bank: "국민은행",
      account: "123-456-789012",
      accountHolder: "그랜드빌딩관리사무소",
      virtualAccount: `123-456-789012-${floor}${unit
        .toString()
        .padStart(2, "0")}`,
    },

    // 관리사무소 정보
    office: {
      name: "그랜드빌딩 관리사무소",
      tel: "02-123-4567",
      manager: "김관리",
      address: "서울시 강남구 테헤란로 123 지하 1층",
    },
  };
};

// 금액 포맷 함수
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("ko-KR") + "원";
};

// 그리고 calculateTotal 함수를 다음과 같이 수정합니다:

const calculateTotal = (fees: InvoiceFees) => {
  return (
    fees.general +
    fees.securityGuard +
    fees.cleaning +
    fees.disinfection +
    fees.elevator +
    fees.electricity.common +
    fees.electricity.elevator +
    fees.water +
    fees.heating +
    fees.hotWater +
    fees.insurance +
    fees.repairs +
    fees.longTermRepairs +
    fees.expenses
  );
};

export default function BulkViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // 5층 건물, 각 층 4세대 가정
  const floors = 5;
  const unitsPerFloor = 4;

  // 모든 세대의 영수증 데이터 생성
  const allInvoices = [];
  for (let floor = 1; floor <= floors; floor++) {
    for (let unit = 1; unit <= unitsPerFloor; unit++) {
      const unitNumber = `${floor}0${unit}호`;
      allInvoices.push(generateInvoiceData(unitNumber, floor, unit));
    }
  }

  // 프린트 기능
  const handlePrint = () => {
    window.print();
  };

  // PDF 다운로드 기능
  const handleDownload = () => {
    toast.info("PDF로 저장하기", {
      description:
        "프린트 다이얼로그에서 '대상'을 'PDF로 저장'으로 선택하세요.",
      action: {
        label: "프린트",
        onClick: handlePrint,
      },
    });
  };

  return (
    <>
      <div className="container mx-auto p-4 py-8 print:p-0">
        {/* 헤더 (인쇄 시 숨김) */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">전체 세대 관리비 고지서</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/buildings/${params.id}/invoices/csv-upload`}>
              <Button variant="outline">
                <FileUp className="mr-2 h-4 w-4" />
                CSV 업로드
              </Button>
            </Link>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              PDF 저장
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              인쇄
            </Button>
          </div>
        </div>

        {/* 탭 (인쇄 시 숨김) */}
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="print:hidden"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="all">전체 세대</TabsTrigger>
            {Array.from({ length: floors }, (_, i) => i + 1).map((floor) => (
              <TabsTrigger key={floor} value={`floor-${floor}`}>
                {floor}층
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* 인쇄 가능한 관리비 고지서 모음 */}
        <div ref={printRef} className="space-y-8">
          {allInvoices
            .filter((invoice) => {
              if (activeTab === "all") return true;
              const floor = Number.parseInt(invoice.unit.charAt(0));
              return activeTab === `floor-${floor}`;
            })
            .map((invoice, index) => (
              <div
                key={index}
                className="max-w-4xl mx-auto bg-white mb-8 page-break-after-always"
              >
                <div className="border-2 border-gray-300 print:border-gray-300">
                  {/* 고지서 헤더 */}
                  <div className="grid grid-cols-2 border-b-2 border-gray-300">
                    <div className="p-4 border-r-2 border-gray-300">
                      <h2 className="text-center text-xl font-bold mb-4">
                        관 리 비 영 수 증
                      </h2>
                      <div className="text-sm space-y-1">
                        <p>아파트명: {invoice.buildingName}</p>
                        <p>세대정보: {invoice.unit}</p>
                        <p>면적: {invoice.area}㎡</p>
                        <p>납부자: {invoice.residentName}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-right mb-2">
                        <p className="text-sm">
                          {new Date(invoice.createdAt).getFullYear()}년{" "}
                          {new Date(invoice.createdAt).getMonth() + 1}월분
                          관리비 청구서
                        </p>
                        <p className="text-sm">
                          납부기한: {new Date(invoice.dueDate).getFullYear()}년{" "}
                          {new Date(invoice.dueDate).getMonth() + 1}월{" "}
                          {new Date(invoice.dueDate).getDate()}일
                        </p>
                      </div>
                      <div className="flex justify-end items-center mt-4">
                        <div className="text-right">
                          <p className="text-sm">{invoice.office.name}</p>
                          <p className="text-sm">☎ {invoice.office.tel}</p>
                        </div>
                        <div className="ml-2 w-16 h-16 border border-gray-300 flex items-center justify-center text-xs">
                          (인)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 납부금액 요약 */}
                  <div className="border-b-2 border-gray-300 p-4">
                    <h3 className="text-center font-bold mb-2 bg-gray-100 py-1">
                      납부금액 안내
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm font-medium">당월 부과액</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(calculateTotal(invoice.fees))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">미납액</p>
                        <p className="text-lg font-bold">0원</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">납부 총액</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(calculateTotal(invoice.fees))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 관리비 내역 */}
                  <div className="grid grid-cols-2 border-b-2 border-gray-300">
                    {/* 좌측: 관리비 항목별 금액 */}
                    <div className="p-4 border-r-2 border-gray-300">
                      <h3 className="text-center font-bold mb-2 bg-gray-100 py-1">
                        관리비 내역
                      </h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-1">항목</th>
                            <th className="text-right py-1">금액</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">일반관리비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.general)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">경비비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.securityGuard)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">청소비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.cleaning)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">소독비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.disinfection)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">승강기유지비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.elevator)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">공용전기료</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.electricity.common)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">승강기전기료</td>
                            <td className="text-right">
                              {formatCurrency(
                                invoice.fees.electricity.elevator
                              )}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">수도료</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.water)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">난방비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.heating)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">온수비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.hotWater)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">화재보험료</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.insurance)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">수선유지비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.repairs)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">장기수선충당금</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.longTermRepairs)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1">운영비</td>
                            <td className="text-right">
                              {formatCurrency(invoice.fees.expenses)}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-300 font-bold">
                            <td className="py-2">합계</td>
                            <td className="text-right">
                              {formatCurrency(calculateTotal(invoice.fees))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* 우측: 사용량 및 납부 정보 */}
                    <div className="p-4">
                      <h3 className="text-center font-bold mb-2 bg-gray-100 py-1">
                        사용량 정보
                      </h3>
                      <table className="w-full text-sm mb-6">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-1">항목</th>
                            <th className="text-right py-1">사용량</th>
                            <th className="text-right py-1">단가</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">수도</td>
                            <td className="text-right">
                              {invoice.usage.water}톤
                            </td>
                            <td className="text-right">
                              {formatCurrency(
                                Math.round(
                                  invoice.fees.water / invoice.usage.water
                                )
                              )}
                              /톤
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">난방</td>
                            <td className="text-right">
                              {invoice.usage.heating}Gcal
                            </td>
                            <td className="text-right">
                              {formatCurrency(
                                Math.round(
                                  invoice.fees.heating / invoice.usage.heating
                                )
                              )}
                              /Gcal
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-1">온수</td>
                            <td className="text-right">
                              {invoice.usage.hotWater}톤
                            </td>
                            <td className="text-right">
                              {formatCurrency(
                                Math.round(
                                  invoice.fees.hotWater / invoice.usage.hotWater
                                )
                              )}
                              /톤
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1">전기</td>
                            <td className="text-right">
                              {invoice.usage.electricity}kWh
                            </td>
                            <td className="text-right">-</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3 className="text-center font-bold mb-2 bg-gray-100 py-1">
                        납부 안내
                      </h3>
                      <div className="text-sm space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                          <div className="font-medium">납부 기한</div>
                          <div className="col-span-2">
                            {new Date(invoice.dueDate).getFullYear()}년{" "}
                            {new Date(invoice.dueDate).getMonth() + 1}월{" "}
                            {new Date(invoice.dueDate).getDate()}일까지
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="font-medium">납부 계좌</div>
                          <div className="col-span-2">
                            {invoice.payment.bank} {invoice.payment.account}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="font-medium">예금주</div>
                          <div className="col-span-2">
                            {invoice.payment.accountHolder}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="font-medium">가상계좌</div>
                          <div className="col-span-2">
                            {invoice.payment.virtualAccount}
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          <p>
                            ※ 납부기한 내 미납 시 가산금이 부과될 수 있습니다.
                          </p>
                          <p>※ 관리비 관련 문의: {invoice.office.tel}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 고지서 푸터 */}
                  <div className="p-4 text-center text-sm">
                    <p className="font-bold">{invoice.office.name}</p>
                    <p>
                      주소: {invoice.office.address} | 전화:{" "}
                      {invoice.office.tel} | 관리소장: {invoice.office.manager}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* 하단 네비게이션 (인쇄 시 숨김) */}
        <div className="mt-6 flex justify-between print:hidden">
          <Link href={`/buildings/${params.id}/invoices`}>
            <Button variant="outline">목록으로</Button>
          </Link>
          <Link href={`/buildings/${params.id}/invoices/create`}>
            <Button>새 관리비 고지서 작성</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
