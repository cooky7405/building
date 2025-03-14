"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 임시 데이터 - 실제 구현에서는 API에서 데이터를 가져옵니다
const getInvoiceData = (id: string) => {
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

  return {
    id,
    title: `${monthNames[month]} 관리비`,
    type: "관리비",
    dueDate: new Date(year, month, 25).toISOString().split("T")[0],
    buildingId: "1",
    createdAt: new Date(year, month, 5).toISOString().split("T")[0],
    buildingName: "그랜드 빌딩",
    buildingAddress: "서울시 강남구 테헤란로 123",
    unit: "101동 1001호",
    area: 84.5, // 제곱미터
    residentName: "홍길동",

    // 관리비 항목
    fees: {
      general: 120000, // 일반관리비
      securityGuard: 50000, // 경비비
      cleaning: 30000, // 청소비
      disinfection: 10000, // 소독비
      elevator: 15000, // 승강기유지비
      electricity: {
        common: 20000, // 공용전기료
        elevator: 5000, // 승강기전기료
      },
      water: 35000, // 수도료
      heating: 80000, // 난방비
      hotWater: 40000, // 온수비
      insurance: 5000, // 화재보험료
      repairs: 30000, // 수선유지비
      longTermRepairs: 50000, // 장기수선충당금
      expenses: 10000, // 운영비
    },

    // 전월 사용량
    usage: {
      water: 15, // 수도 사용량 (톤)
      heating: 0.5, // 난방 사용량 (Gcal)
      hotWater: 2.5, // 온수 사용량 (톤)
      electricity: 250, // 전기 사용량 (kWh)
    },

    // 납부 정보
    payment: {
      bank: "국민은행",
      account: "123-456-789012",
      accountHolder: "그랜드빌딩관리사무소",
      virtualAccount: "123-456-789012-01001",
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

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const router = useRouter();
  const [invoice] = useState(getInvoiceData(params.invoiceId));
  const printRef = useRef<HTMLDivElement>(null);

  // 총액 계산
  const calculateTotal = () => {
    const fees = invoice.fees;
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

  const total = calculateTotal();

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

  // 공유 기능
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: invoice.title,
          text: `${invoice.buildingName} - ${invoice.title}`,
          url: window.location.href,
        });
      } catch {
        toast.error("공유에 실패했습니다");
      }
    } else {
      // 공유 API를 지원하지 않는 브라우저의 경우
      navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 클립보드에 복사되었습니다");
    }
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
            <h1 className="text-3xl font-bold">관리비 고지서</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              공유
            </Button>
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

        {/* 인쇄 가능한 관리비 고지서 */}
        <div ref={printRef} className="max-w-4xl mx-auto bg-white">
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
                    {new Date(invoice.createdAt).getMonth() + 1}월분 관리비
                    청구서
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
                  <p className="text-lg font-bold">{formatCurrency(total)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">미납액</p>
                  <p className="text-lg font-bold">0원</p>
                </div>
                <div>
                  <p className="text-sm font-medium">납부 총액</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(total)}
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
                        {formatCurrency(invoice.fees.electricity.elevator)}
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
                      <td className="text-right">{formatCurrency(total)}</td>
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
                      <td className="text-right">{invoice.usage.water}톤</td>
                      <td className="text-right">
                        {formatCurrency(
                          Math.round(invoice.fees.water / invoice.usage.water)
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
                      <td className="text-right">{invoice.usage.hotWater}톤</td>
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
                    <p>※ 납부기한 내 미납 시 가산금이 부과될 수 있습니다.</p>
                    <p>※ 관리비 관련 문의: {invoice.office.tel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 고지서 푸터 */}
            <div className="p-4 text-center text-sm">
              <p className="font-bold">{invoice.office.name}</p>
              <p>
                주소: {invoice.office.address} | 전화: {invoice.office.tel} |
                관리소장: {invoice.office.manager}
              </p>
            </div>
          </div>
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
