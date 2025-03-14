// CSV 데이터 값 타입 정의 (문자열, 숫자, 불리언, null, undefined 허용)
type CSVValue = string | number | boolean | null | undefined;

/**
 * CSV 파일을 파싱하는 유틸리티 함수
 * @param text CSV 텍스트 내용
 * @returns 파싱된 데이터 배열
 */
export function parseCSV(text: string): Record<string, string>[] {
  // 줄바꿈으로 행 분리
  const rows = text.split(/\r?\n/).filter((row) => row.trim() !== "");

  if (rows.length === 0) {
    throw new Error("CSV 파일이 비어있습니다.");
  }

  // 첫 번째 행은 헤더
  const headers = parseCSVRow(rows[0]);

  if (headers.length === 0) {
    throw new Error("CSV 헤더가 올바르지 않습니다.");
  }

  // 결과 배열
  const result: Record<string, string>[] = [];

  // 각 행을 처리
  for (let i = 1; i < rows.length; i++) {
    const row = parseCSVRow(rows[i]);

    // 행의 값 수가 헤더 수와 일치하는지 확인
    if (row.length !== headers.length) {
      console.warn(
        `행 ${i + 1}의 값 수(${row.length})가 헤더 수(${
          headers.length
        })와 일치하지 않습니다. 이 행은 건너뜁니다.`
      );
      continue;
    }

    // 객체로 변환
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }

    result.push(obj);
  }

  return result;
}

/**
 * CSV 행을 파싱하는 함수
 * 쉼표로 구분하되, 따옴표로 묶인 값 내의 쉼표는 무시
 * @param line CSV 행
 * @returns 파싱된 값 배열
 */
function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // 따옴표 내부에 있는 따옴표인 경우 (이스케이프된 따옴표)
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // 다음 따옴표 건너뛰기
      } else {
        // 따옴표 상태 토글
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // 따옴표 밖의 쉼표는 값 구분자
      result.push(current);
      current = "";
    } else {
      // 일반 문자
      current += char;
    }
  }

  // 마지막 값 추가
  result.push(current);

  return result;
}

/**
 * CSV 데이터를 문자열로 변환하는 함수
 * @param data 변환할 데이터 배열
 * @returns CSV 형식의 문자열
 */
export function convertToCSV(data: Record<string, CSVValue>[]): string {
  if (data.length === 0) {
    return "";
  }

  // 헤더 추출
  const headers = Object.keys(data[0]);

  // 헤더 행
  const headerRow = headers.join(",");

  // 데이터 행
  const rows = data.map((obj) => {
    return headers
      .map((header) => {
        const value = obj[header]?.toString() || "";

        // 쉼표, 따옴표, 줄바꿈이 포함된 경우 따옴표로 묶음
        if (
          value.includes(",") ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          // 따옴표는 두 개의 따옴표로 이스케이프
          return `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(",");
  });

  // 모든 행 합치기
  return [headerRow, ...rows].join("\n");
}
