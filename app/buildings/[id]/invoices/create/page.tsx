"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Printer, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const basicFormSchema = z.object({
  title: z.string().min(2, {
    message: "제목은 최소 2자 이상이어야 합니다.",
  }),
  type: z.string({
    required_error: "영수증 유형을 선택해주세요.",
  }),
  dueDate: z.string(),
  unit: z.string().min(1, {
    message: "세대 정보를 입력해주세요.",
  }),
  area: z.coerce.number().min(1, {
    message: "면적을 입력해주세요.",
  }),
  residentName: z.string().min(1, {
    message: "납부자 이름을 입력해주세요.",
  }),
});

const feesFormSchema = z.object({
  general: z.coerce.number().min(0),
  securityGuard: z.coerce.number().min(0),
  cleaning: z.coerce.number().min(0),
  disinfection: z.coerce.number().min(0),
  elevator: z.coerce.number().min(0),
  electricityCommon: z.coerce.number().min(0),
  electricityElevator: z.coerce.number().min(0),
  water: z.coerce.number().min(0),
  heating: z.coerce.number().min(0),
  hotWater: z.coerce.number().min(0),
  insurance: z.coerce.number().min(0),
  repairs: z.coerce.number().min(0),
  longTermRepairs: z.coerce.number().min(0),
  expenses: z.coerce.number().min(0),
});

const usageFormSchema = z.object({
  water: z.coerce.number().min(0),
  heating: z.coerce.number().min(0),
  hotWater: z.coerce.number().min(0),
  electricity: z.coerce.number().min(0),
});

const paymentFormSchema = z.object({
  bank: z.string().min(1, {
    message: "은행명을 입력해주세요.",
  }),
  account: z.string().min(1, {
    message: "계좌번호를 입력해주세요.",
  }),
  accountHolder: z.string().min(1, {
    message: "예금주를 입력해주세요.",
  }),
  virtualAccount: z.string().optional(),
});

export default function CreateInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = searchParams.get("type") || "관리비";

  // 기본 정보 폼
  const basicForm = useForm<z.infer<typeof basicFormSchema>>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      title: `${new Date().getMonth() + 1}월 관리비`,
      type: initialType,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25)
        .toISOString()
        .substring(0, 10),
      unit: "101동 1001호",
      area: 84.5,
      residentName: "홍길동",
    },
  });

  // 관리비 항목 폼
  const feesForm = useForm<z.infer<typeof feesFormSchema>>({
    resolver: zodResolver(feesFormSchema),
    defaultValues: {
      general: 120000,
      securityGuard: 50000,
      cleaning: 30000,
      disinfection: 10000,
      elevator: 15000,
      electricityCommon: 20000,
      electricityElevator: 5000,
      water: 35000,
      heating: 80000,
      hotWater: 40000,
      insurance: 5000,
      repairs: 30000,
      longTermRepairs: 50000,
      expenses: 10000,
    },
  });

  // 사용량 폼
  const usageForm = useForm<z.infer<typeof usageFormSchema>>({
    resolver: zodResolver(usageFormSchema),
    defaultValues: {
      water: 15,
      heating: 0.5,
      hotWater: 2.5,
      electricity: 250,
    },
  });

  // 납부 정보 폼
  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      bank: "국민은행",
      account: "123-456-789012",
      accountHolder: "그랜드빌딩관리사무소",
      virtualAccount: "123-456-789012-01001",
    },
  });

  // 총액 계산
  const calculateTotal = () => {
    const fees = feesForm.getValues();
    return (
      fees.general +
      fees.securityGuard +
      fees.cleaning +
      fees.disinfection +
      fees.elevator +
      fees.electricityCommon +
      fees.electricityElevator +
      fees.water +
      fees.heating +
      fees.hotWater +
      fees.insurance +
      fees.repairs +
      fees.longTermRepairs +
      fees.expenses
    );
  };

  // 폼 제출 처리
  function onSubmit() {
    setIsSubmitting(true);

    // 모든 폼의 유효성 검사
    const isBasicValid = basicForm.formState.isValid;
    const isFeesValid = feesForm.formState.isValid;
    const isUsageValid = usageForm.formState.isValid;
    const isPaymentValid = paymentForm.formState.isValid;

    if (!isBasicValid || !isFeesValid || !isUsageValid || !isPaymentValid) {
      toast.error("모든 필수 정보를 입력해주세요");
      setIsSubmitting(false);
      return;
    }

    // 모든 폼 데이터 수집
    const basicData = basicForm.getValues();
    const feesData = feesForm.getValues();
    const usageData = usageForm.getValues();
    const paymentData = paymentForm.getValues();

    // 여기서 실제로는 API에 데이터를 전송할 것입니다
    console.log({
      ...basicData,
      fees: {
        ...feesData,
        electricity: {
          common: feesData.electricityCommon,
          elevator: feesData.electricityElevator,
        },
      },
      usage: usageData,
      payment: paymentData,
    });

    // 임시 ID 생성 (실제로는 API 응답에서 받을 것입니다)
    const newInvoiceId = Date.now().toString();

    toast.success("관리비 고지서가 생성되었습니다", {
      description: "관리비 고지서가 성공적으로 생성되었습니다.",
    });

    // 폼 제출 후 생성된 영수증 상세 페이지로 이동
    setTimeout(() => {
      router.push(`/buildings/${params.id}/invoices/${newInvoiceId}`);
    }, 1000);
  }

  // 미리보기에서 인쇄하기
  const handlePrintPreview = () => {
    window.print();
  };

  // 금액 포맷 함수
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ko-KR") + "원";
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">관리비 고지서 생성</h1>
        <Button
          variant="outline"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
        >
          {isPreviewMode ? "편집으로 돌아가기" : "미리보기"}
        </Button>
      </div>

      {isPreviewMode ? (
        // 미리보기 모드
        <div className="max-w-4xl mx-auto bg-white">
          <div className="border-2 border-gray-300">
            {/* 고지서 헤더 */}
            <div className="grid grid-cols-2 border-b-2 border-gray-300">
              <div className="p-4 border-r-2 border-gray-300">
                <h2 className="text-center text-xl font-bold mb-4">
                  관 리 비 영 수 증
                </h2>
                <div className="text-sm space-y-1">
                  <p>아파트명: 그랜드 빌딩</p>
                  <p>세대정보: {basicForm.getValues("unit")}</p>
                  <p>면적: {basicForm.getValues("area")}㎡</p>
                  <p>납부자: {basicForm.getValues("residentName")}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="text-right mb-2">
                  <p className="text-sm">
                    {new Date().getFullYear()}년 {new Date().getMonth() + 1}월분
                    관리비 청구서
                  </p>
                  <p className="text-sm">
                    납부기한:{" "}
                    {new Date(basicForm.getValues("dueDate")).getFullYear()}년{" "}
                    {new Date(basicForm.getValues("dueDate")).getMonth() + 1}월{" "}
                    {new Date(basicForm.getValues("dueDate")).getDate()}일
                  </p>
                </div>
                <div className="flex justify-end items-center mt-4">
                  <div className="text-right">
                    <p className="text-sm">그랜드빌딩 관리사무소</p>
                    <p className="text-sm">☎ 02-123-4567</p>
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
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">미납액</p>
                  <p className="text-lg font-bold">0원</p>
                </div>
                <div>
                  <p className="text-sm font-medium">납부 총액</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(calculateTotal())}
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
                        {formatCurrency(feesForm.getValues("general"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">경비비</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("securityGuard"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">청소비</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("cleaning"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">소독비</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("disinfection"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">승강기유지비</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("elevator"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">공용전기료</td>
                      <td className="text-right">
                        {formatCurrency(
                          feesForm.getValues("electricityCommon")
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">승강기전기료</td>
                      <td className="text-right">
                        {formatCurrency(
                          feesForm.getValues("electricityElevator")
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">수도료</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("water"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">난방비</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("heating"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">온수비</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("hotWater"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">화재보험료</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("insurance"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">수선유지비</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("repairs"))}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">장기수선충당금</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("longTermRepairs"))}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">운영비</td>
                      <td className="text-right">
                        {formatCurrency(feesForm.getValues("expenses"))}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 font-bold">
                      <td className="py-2">합계</td>
                      <td className="text-right">
                        {formatCurrency(calculateTotal())}
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
                        {usageForm.getValues("water")}톤
                      </td>
                      <td className="text-right">
                        {formatCurrency(
                          Math.round(
                            feesForm.getValues("water") /
                              usageForm.getValues("water")
                          )
                        )}
                        /톤
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">난방</td>
                      <td className="text-right">
                        {usageForm.getValues("heating")}Gcal
                      </td>
                      <td className="text-right">
                        {formatCurrency(
                          Math.round(
                            feesForm.getValues("heating") /
                              usageForm.getValues("heating")
                          )
                        )}
                        /Gcal
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">온수</td>
                      <td className="text-right">
                        {usageForm.getValues("hotWater")}톤
                      </td>
                      <td className="text-right">
                        {formatCurrency(
                          Math.round(
                            feesForm.getValues("hotWater") /
                              usageForm.getValues("hotWater")
                          )
                        )}
                        /톤
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">전기</td>
                      <td className="text-right">
                        {usageForm.getValues("electricity")}kWh
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
                      {new Date(basicForm.getValues("dueDate")).getFullYear()}년{" "}
                      {new Date(basicForm.getValues("dueDate")).getMonth() + 1}
                      월 {new Date(basicForm.getValues("dueDate")).getDate()}
                      일까지
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-medium">납부 계좌</div>
                    <div className="col-span-2">
                      {paymentForm.getValues("bank")}{" "}
                      {paymentForm.getValues("account")}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-medium">예금주</div>
                    <div className="col-span-2">
                      {paymentForm.getValues("accountHolder")}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-medium">가상계좌</div>
                    <div className="col-span-2">
                      {paymentForm.getValues("virtualAccount") || "-"}
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-600">
                    <p>※ 납부기한 내 미납 시 가산금이 부과될 수 있습니다.</p>
                    <p>※ 관리비 관련 문의: 02-123-4567</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 고지서 푸터 */}
            <div className="p-4 text-center text-sm">
              <p className="font-bold">그랜드빌딩 관리사무소</p>
              <p>
                주소: 서울시 강남구 테헤란로 123 지하 1층 | 전화: 02-123-4567 |
                관리소장: 김관리
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={handlePrintPreview}>
              <Printer className="mr-2 h-4 w-4" />
              인쇄하기
            </Button>
            <Button onClick={onSubmit} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </div>
      ) : (
        // 편집 모드
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>관리비 고지서 정보</CardTitle>
            <CardDescription>
              관리비 고지서 생성을 위한 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="basic">기본 정보</TabsTrigger>
                <TabsTrigger value="fees">관리비 항목</TabsTrigger>
                <TabsTrigger value="usage">사용량</TabsTrigger>
                <TabsTrigger value="payment">납부 정보</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Form {...basicForm}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>제목</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="관리비 고지서 제목"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>유형</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="고지서 유형 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="관리비">관리비</SelectItem>
                                <SelectItem value="수도세">수도세</SelectItem>
                                <SelectItem value="주차비">주차비</SelectItem>
                                <SelectItem value="기타">기타</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={basicForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>납부 기한</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>세대 정보</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 101동 1001호"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicForm.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>면적 (㎡)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={basicForm.control}
                      name="residentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>납부자 이름</FormLabel>
                          <FormControl>
                            <Input placeholder="납부자 이름" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </TabsContent>

              <TabsContent value="fees">
                <Form {...feesForm}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={feesForm.control}
                        name="general"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>일반관리비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={feesForm.control}
                        name="securityGuard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>경비비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={feesForm.control}
                        name="cleaning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>청소비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={feesForm.control}
                        name="disinfection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>소독비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={feesForm.control}
                        name="elevator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>승강기유지비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={feesForm.control}
                        name="electricityCommon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>공용전기료</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={feesForm.control}
                        name="electricityElevator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>승강기전기료</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={feesForm.control}
                        name="water"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>수도료</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={feesForm.control}
                        name="heating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>난방비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={feesForm.control}
                        name="hotWater"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>온수비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={feesForm.control}
                        name="insurance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>화재보험료</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={feesForm.control}
                        name="repairs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>수선유지비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={feesForm.control}
                        name="longTermRepairs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>장기수선충당금</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={feesForm.control}
                        name="expenses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>운영비</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>총 금액</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                </Form>
              </TabsContent>

              <TabsContent value="usage">
                <Form {...usageForm}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={usageForm.control}
                        name="water"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>수도 사용량 (톤)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={usageForm.control}
                        name="heating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>난방 사용량 (Gcal)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={usageForm.control}
                        name="hotWater"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>온수 사용량 (톤)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={usageForm.control}
                        name="electricity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>전기 사용량 (kWh)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </TabsContent>

              <TabsContent value="payment">
                <Form {...paymentForm}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={paymentForm.control}
                        name="bank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>은행명</FormLabel>
                            <FormControl>
                              <Input placeholder="예: 국민은행" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={paymentForm.control}
                        name="account"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>계좌번호</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 123-456-789012"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={paymentForm.control}
                        name="accountHolder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>예금주</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 그랜드빌딩관리사무소"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={paymentForm.control}
                        name="virtualAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>가상계좌 (선택사항)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="예: 123-456-789012-01001"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const nextTab = {
                    basic: "fees",
                    fees: "usage",
                    usage: "payment",
                    payment: "basic",
                  }[activeTab as string] as string;
                  setActiveTab(nextTab);
                }}
              >
                다음 단계
              </Button>
              <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? "생성 중..." : "고지서 생성"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
