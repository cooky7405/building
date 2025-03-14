"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { parseCSV } from "@/components/csv-parser";

// CSV 파일에서 읽어온 데이터 타입
interface CSVData {
  unit: string;
  area: string;
  residentName: string;
  water: string;
  heating: string;
  hotWater: string;
  electricity: string;
  [key: string]: string; // 추가 속성을 허용하는 인덱스 시그니처
}

export default function CSVUploadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCSVData] = useState<CSVData[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // CSV 파일 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);

      // 필수 헤더 확인
      const requiredHeaders = [
        "unit",
        "area",
        "residentName",
        "water",
        "heating",
        "hotWater",
        "electricity",
      ];
      const headers = Object.keys(parsedData[0] || {});

      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `CSV 파일에 필수 헤더가 누락되었습니다: ${missingHeaders.join(", ")}`
        );
      }

      // Record<string, string>[]를 CSVData[]로 타입 변환
      const typedData = parsedData as CSVData[];

      setCSVData(typedData);
      toast.success("CSV 파일이 성공적으로 업로드되었습니다.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "CSV 파일 처리 중 오류가 발생했습니다."
      );
      toast.error("CSV 파일 처리 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 영수증 생성 처리
  const handleGenerateInvoices = () => {
    if (csvData.length === 0) {
      toast.error("처리할 데이터가 없습니다.");
      return;
    }

    setIsProcessing(true);

    // 실제로는 API 호출을 통해 영수증을 생성할 것입니다
    setTimeout(() => {
      toast.success(`${csvData.length}개의 관리비 고지서가 생성되었습니다.`, {
        description: "생성된 고지서를 확인하려면 '고지서 보기'를 클릭하세요.",
        action: {
          label: "고지서 보기",
          onClick: () =>
            router.push(`/buildings/${params.id}/invoices/bulk-view`),
        },
      });

      setIsProcessing(false);

      // 성공 후 bulk-view 페이지로 이동
      setTimeout(() => {
        router.push(`/buildings/${params.id}/invoices/bulk-view`);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">CSV 파일 업로드</h1>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>관리비 데이터 업로드</CardTitle>
          <CardDescription>
            CSV 파일을 업로드하여 여러 세대의 관리비 고지서를 한 번에 생성할 수
            있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full"
                disabled={isUploading}
              />
              {fileName && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{fileName}</span>
                  {isUploading ? (
                    <span className="text-muted-foreground">
                      (업로드 중...)
                    </span>
                  ) : (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                CSV 파일 선택
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {csvData.length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(csvData[0]).map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>{value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {csvData.length > 5 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  외 {csvData.length - 5}개 행이 더 있습니다.
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button
            onClick={handleGenerateInvoices}
            disabled={csvData.length === 0 || isProcessing}
          >
            {isProcessing ? "처리 중..." : "관리비 고지서 생성"}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">CSV 파일 형식 안내</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">
              CSV 파일은 다음과 같은 형식으로 작성해야 합니다:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>첫 번째 행은 헤더로 사용됩니다.</li>
              <li>
                필수 헤더: unit(세대), area(면적), residentName(입주자명),
                water(수도 사용량), heating(난방 사용량), hotWater(온수 사용량),
                electricity(전기 사용량)
              </li>
              <li>
                추가 헤더를 포함할 수 있으며, 이는 추가 정보로 사용됩니다.
              </li>
            </ul>
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-sm overflow-x-auto">
                unit,area,residentName,water,heating,hotWater,electricity
                <br />
                101호,84.5,홍길동,15.2,0.5,2.5,250
                <br />
                102호,84.5,김철수,14.8,0.6,2.3,240
                <br />
                103호,84.5,이영희,16.1,0.4,2.7,260
                <br />
                ...
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
