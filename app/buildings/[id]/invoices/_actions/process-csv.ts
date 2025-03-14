"use server";

import { revalidatePath } from "next/cache";

type ProcessCSVParams = {
  buildingId: string;
  title: string;
  type: string;
  dueDate: string;
  csvData: string;
};

type InvoiceData = {
  id: string;
  unit: string;
  area: number;
  residentName: string;
  fees: {
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
  };
  usage: {
    water: number;
    heating: number;
    hotWater: number;
    electricity: number;
  };
};

// 임시 저장소 (실제 구현에서는 데이터베이스를 사용할 것입니다)
let generatedInvoices: InvoiceData[] = [];

export async function processCSV(params: ProcessCSVParams) {
  try {
    const { buildingId, title, type, dueDate, csvData } = params;

    // CSV 데이터 파싱
    const lines = csvData.split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());

    // 필수 헤더 확인
    const requiredHeaders = ["unit", "area", "residentName"];
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `필수 헤더가 누락되었습니다: ${missingHeaders.join(", ")}`,
      };
    }

    // 데이터 행 처리
    const invoices: InvoiceData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // 빈 줄 건너뛰기

      const values = line.split(",").map((value) => value.trim());
      const rowData: Record<string, string> = {};

      // 헤더와 값을 매핑
      headers.forEach((header, index) => {
        rowData[header] = values[index] || "";
      });

      // 필수 필드 확인
      if (!rowData.unit || !rowData.area || !rowData.residentName) {
        continue; // 필수 필드가 없는 행은 건너뛰기
      }

      // 영수증 데이터 생성
      const invoice: InvoiceData = {
        id: Date.now() + i.toString(), // 임시 ID 생성
        unit: rowData.unit,
        area: parseFloat(rowData.area) || 0,
        residentName: rowData.residentName,
        fees: {
          general: parseInt(rowData.general) || 0,
          securityGuard: parseInt(rowData.securityGuard) || 0,
          cleaning: parseInt(rowData.cleaning) || 0,
          disinfection: parseInt(rowData.disinfection) || 0,
          elevator: parseInt(rowData.elevator) || 0,
          electricity: {
            common: parseInt(rowData.electricityCommon) || 0,
            elevator: parseInt(rowData.electricityElevator) || 0,
          },
          water: parseInt(rowData.water) || 0,
          heating: parseInt(rowData.heating) || 0,
          hotWater: parseInt(rowData.hotWater) || 0,
          insurance: parseInt(rowData.insurance) || 0,
          repairs: parseInt(rowData.repairs) || 0,
          longTermRepairs: parseInt(rowData.longTermRepairs) || 0,
          expenses: parseInt(rowData.expenses) || 0,
        },
        usage: {
          water: parseFloat(rowData.waterUsage) || 0,
          heating: parseFloat(rowData.heatingUsage) || 0,
          hotWater: parseFloat(rowData.hotWaterUsage) || 0,
          electricity: parseFloat(rowData.electricityUsage) || 0,
        },
      };

      invoices.push(invoice);
    }

    // 임시 저장소에 저장 (실제 구현에서는 데이터베이스에 저장)
    generatedInvoices = invoices;

    // 캐시 무효화
    revalidatePath(`/buildings/${buildingId}/invoices/bulk-view`);

    return {
      success: true,
      count: invoices.length,
    };
  } catch (error) {
    console.error("CSV 처리 오류:", error);
    return {
      success: false,
      error: "데이터 처리 중 오류가 발생했습니다.",
    };
  }
}

// 생성된 영수증 데이터 가져오기 (임시 구현)
export async function getGeneratedInvoices() {
  return generatedInvoices;
}
