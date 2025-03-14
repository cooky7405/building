"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  FormDescription,
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
import { AlertCircle, FileUp, Table, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { processCSV } from "../_actions/process-csv";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "제목은 최소 2자 이상이어야 합니다.",
  }),
  type: z.string({
    required_error: "영수증 유형을 선택해주세요.",
  }),
  dueDate: z.string(),
  csvData: z.string().min(1, {
    message: "CSV 데이터를 입력하거나 파일을 업로드해주세요.",
  }),
});

export default function BulkCreateInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: `${new Date().getMonth() + 1}월 관리비`,
      type: "관리비",
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25)
        .toISOString()
        .substring(0, 10),
      csvData: "",
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      form.setValue("csvData", content);
      previewCSV(content);
    };
    reader.readAsText(file);
  };

  const previewCSV = (csvContent: string) => {
    const lines = csvContent.split("\n");
    const parsedData = lines.map((line) =>
      line.split(",").map((cell) => cell.trim())
    );
    setCsvPreview(parsedData.slice(0, 10)); // 처음 10줄만 미리보기로 표시
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // 서버 액션을 호출하여 CSV 데이터 처리
      const result = await processCSV({
        buildingId: params.id,
        title: values.title,
        type: values.type,
        dueDate: values.dueDate,
        csvData: values.csvData,
      });

      if (result.success) {
        toast.success("영수증이 일괄 생성되었습니다", {
          description: `${result.count}개의 영수증이 성공적으로 생성되었습니다.`,
        });

        // 생성된 영수증 목록 페이지로 이동
        setTimeout(() => {
          router.push(`/buildings/${params.id}/invoices/bulk-view`);
        }, 1500);
      } else {
        toast.error("영수증 생성 실패", {
          description: result.error || "영수증 생성 중 오류가 발생했습니다.",
        });
      }
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("영수증 생성 실패", {
        description: "영수증 생성 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">관리비 일괄 생성</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>CSV 파일로 관리비 일괄 생성</CardTitle>
          <CardDescription>
            CSV 파일을 업로드하여 여러 세대의 관리비 고지서를 한 번에 생성할 수
            있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upload">파일 업로드</TabsTrigger>
              <TabsTrigger value="paste">데이터 붙여넣기</TabsTrigger>
              {csvPreview.length > 0 && (
                <TabsTrigger value="preview">미리보기</TabsTrigger>
              )}
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제목</FormLabel>
                        <FormControl>
                          <Input placeholder="관리비 고지서 제목" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                  control={form.control}
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

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      CSV 파일 업로드
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      CSV 파일을 드래그하여 놓거나 아래 버튼을 클릭하여
                      업로드하세요.
                    </p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      파일 선택
                    </Button>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>CSV 파일 형식 안내</AlertTitle>
                    <AlertDescription>
                      CSV 파일의 첫 번째 행은 헤더여야 하며, 다음 열을 포함해야
                      합니다:
                      <ul className="list-disc list-inside mt-2 ml-2 text-sm">
                        <li>unit (세대 정보, 예: 101동 101호)</li>
                        <li>area (면적, 제곱미터)</li>
                        <li>residentName (입주자 이름)</li>
                        <li>general (일반관리비)</li>
                        <li>securityGuard (경비비)</li>
                        <li>cleaning (청소비)</li>
                        <li>water (수도료)</li>
                        <li>heating (난방비)</li>
                        <li>electricity (전기료)</li>
                        <li>기타 필요한 항목들...</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="paste">
                  <FormField
                    control={form.control}
                    name="csvData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CSV 데이터</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="CSV 데이터를 붙여넣으세요"
                            className="min-h-[300px] font-mono text-sm"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              previewCSV(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          스프레드시트에서 복사한 데이터를 붙여넣으세요.
                          쉼표(,)로 구분된 CSV 형식이어야 합니다.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {csvPreview.length > 0 && (
                  <TabsContent value="preview">
                    <div className="border rounded-lg overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            {csvPreview[0]?.map((header, index) => (
                              <th
                                key={index}
                                className="px-4 py-2 text-left font-medium"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      처음 {csvPreview.length - 1}개 행만 표시됩니다. 전체
                      데이터는 처리 시 사용됩니다.
                    </p>
                  </TabsContent>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "처리 중..." : "영수증 일괄 생성"}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Table className="mr-2 h-4 w-4" />
            <span>
              CSV 데이터를 확인하고 싶으신가요?{" "}
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() =>
                  router.push(`/buildings/${params.id}/invoices/csv-viewer`)
                }
              >
                CSV 뷰어로 이동
              </Button>
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
