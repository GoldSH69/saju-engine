/**
 * astronomy-engine 기반 절기 시각 계산기
 * 
 * 태양 황경이 특정 각도가 되는 정확한 시각을 계산
 * UTC → KST(+9시간) 변환 포함
 * 
 * 사용법:
 *   npx ts-node src/data/generateSolarTerms.ts
 */

import * as Astronomy from 'astronomy-engine';
import { SOLAR_TERM_DEFS, SolarTermDef } from './solarTermDefs';

// ============================================================
// 타입 정의
// ============================================================

export interface SolarTermEntry {
  year: number;           // 양력 연도
  termIndex: number;      // 절기 인덱스 (0~23)
  name: string;           // 한글명
  hanja: string;          // 한자명
  isJeol: boolean;        // 절기(節) 여부
  month: number;          // 양력 월
  longitude: number;      // 태양 황경
  utcDatetime: string;    // UTC 시각 (ISO 8601)
  kstDatetime: string;    // KST 시각 (YYYY-MM-DD HH:mm)
  kstYear: number;        // KST 기준 연도
  kstMonth: number;       // KST 기준 월
  kstDay: number;         // KST 기준 일
  kstHour: number;        // KST 기준 시
  kstMinute: number;      // KST 기준 분
}

export interface YearSolarTerms {
  year: number;
  terms: SolarTermEntry[];
}

// ============================================================
// 핵심 계산 함수
// ============================================================

/**
 * 태양 황경이 targetLongitude가 되는 시각을 찾는 함수
 * 
 * astronomy-engine의 SearchSunLongitude 사용
 * 이 함수는 주어진 시작 시각 이후 태양 황경이 목표값에 도달하는 시점을 반환
 */
function findSolarTermTime(
  targetLongitude: number,
  searchStartDate: Date
): Date {
  const astroTime = Astronomy.MakeTime(searchStartDate);

  // SearchSunLongitude: 태양의 황경이 targetLongitude가 되는 시각 검색
  // 검색 시작점부터 최대 365일 내에서 찾음
  const result = Astronomy.SearchSunLongitude(targetLongitude, astroTime, 365);

  if (!result) {
    throw new Error(
      `절기 시각을 찾을 수 없습니다: longitude=${targetLongitude}, ` +
      `searchStart=${searchStartDate.toISOString()}`
    );
  }

  return result.date;
}

/**
 * UTC Date → KST 변환 (UTC + 9시간)
 */
function utcToKst(utcDate: Date): Date {
  return new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
}

/**
 * Date → 포맷 문자열 (YYYY-MM-DD HH:mm)
 */
function formatDatetime(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

// ============================================================
// 특정 연도의 24절기 계산
// ============================================================

/**
 * 특정 연도의 24절기 절입 시각을 모두 계산
 * 
 * 주의: "2024년의 절기"란 양력 2024년에 속하는 절기를 의미
 *   - 소한(1월) ~ 동지(12월)
 *   - 검색 시작점은 해당 절기가 있을 것으로 예상되는 시점의 약간 전
 */
function calculateYearSolarTerms(year: number): SolarTermEntry[] {
  const entries: SolarTermEntry[] = [];

  for (const termDef of SOLAR_TERM_DEFS) {
    // 검색 시작일: 해당 절기 월의 1일에서 약간 앞 (안전 마진)
    // 예: 소한(1월) → 12월 15일부터 검색
    const searchMonth = termDef.month;
    const searchStartDate = new Date(Date.UTC(year, searchMonth - 2, 15));
    // month-2: JS Date의 month는 0-based이고, 한 달 전부터 검색

    try {
      const utcDate = findSolarTermTime(termDef.longitude, searchStartDate);
      const kstDate = utcToKst(utcDate);

      const entry: SolarTermEntry = {
        year: year,
        termIndex: termDef.index,
        name: termDef.name,
        hanja: termDef.hanja,
        isJeol: termDef.isJeol,
        month: termDef.month,
        longitude: termDef.longitude,
        utcDatetime: utcDate.toISOString(),
        kstDatetime: formatDatetime(kstDate),
        kstYear: kstDate.getUTCFullYear(),
        kstMonth: kstDate.getUTCMonth() + 1,
        kstDay: kstDate.getUTCDate(),
        kstHour: kstDate.getUTCHours(),
        kstMinute: kstDate.getUTCMinutes(),
      };

      entries.push(entry);
    } catch (error) {
      console.error(`[오류] ${year}년 ${termDef.name} 계산 실패:`, error);
    }
  }

  return entries;
}

// ============================================================
// 전체 범위 생성
// ============================================================

/**
 * 지정 범위의 모든 연도 절기 데이터 생성
 */
export function generateAllSolarTerms(
  startYear: number,
  endYear: number
): Map<number, SolarTermEntry[]> {
  const allData = new Map<number, SolarTermEntry[]>();

  console.log(`\n📅 절기 데이터 생성: ${startYear}년 ~ ${endYear}년`);
  console.log(`   총 ${endYear - startYear + 1}개 연도 × 24절기 = ${(endYear - startYear + 1) * 24}건\n`);

  for (let year = startYear; year <= endYear; year++) {
    const terms = calculateYearSolarTerms(year);
    allData.set(year, terms);

    if (year % 10 === 0) {
      console.log(`   ✅ ${year}년 완료 (${terms.length}개 절기)`);
    }
  }

  console.log(`\n✅ 전체 생성 완료: ${allData.size}개 연도\n`);
  return allData;
}

// ============================================================
// TypeScript 소스 파일로 출력
// ============================================================

/**
 * 생성된 데이터를 TypeScript 파일 형식 문자열로 변환
 */
function generateTypeScriptSource(
  allData: Map<number, SolarTermEntry[]>
): string {
  let output = `/**
 * 절기 데이터 (자동 생성)
 * 
 * 생성 도구: astronomy-engine
 * 생성 일시: ${new Date().toISOString()}
 * 범위: ${[...allData.keys()].sort((a, b) => a - b)[0]}년 ~ ${[...allData.keys()].sort((a, b) => a - b).pop()}년
 * 
 * 각 절기의 절입시각은 KST(한국 표준시, UTC+9) 기준
 * 
 * ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.
 *    수정이 필요하면 generateSolarTerms.ts를 실행하세요.
 */

export interface SolarTermData {
  /** 절기 인덱스 (0~23) */
  i: number;
  /** 한글명 */
  name: string;
  /** 한자명 */
  hanja: string;
  /** 절기(節) 여부 */
  isJeol: boolean;
  /** KST 월 */
  month: number;
  /** KST 일 */
  day: number;
  /** KST 시 */
  hour: number;
  /** KST 분 */
  minute: number;
}

/**
 * 연도별 절기 데이터
 * key: 연도 (양력)
 * value: 해당 연도의 24절기 배열 (소한→대한→입춘→...→동지 순서)
 */
export const SOLAR_TERMS_DATA: Record<number, SolarTermData[]> = {\n`;

  const sortedYears = [...allData.keys()].sort((a, b) => a - b);

  for (const year of sortedYears) {
    const terms = allData.get(year)!;
    output += `  ${year}: [\n`;

    for (const term of terms) {
      output += `    { i: ${String(term.termIndex).padStart(2)}, `;
      output += `name: '${term.name}', `;
      output += `hanja: '${term.hanja}', `;
      output += `isJeol: ${String(term.isJeol).padEnd(5)}, `;
      output += `month: ${String(term.kstMonth).padStart(2)}, `;
      output += `day: ${String(term.kstDay).padStart(2)}, `;
      output += `hour: ${String(term.kstHour).padStart(2)}, `;
      output += `minute: ${String(term.kstMinute).padStart(2)} },\n`;
    }

    output += `  ],\n`;
  }

  output += `};\n`;

  // 편의 함수들 추가
  output += `
// ============================================================
// 편의 함수
// ============================================================

/**
 * 특정 연도의 입춘 절입시각 조회
 * 년주 계산에 사용
 */
export function getLichunForYear(year: number): { month: number; day: number; hour: number; minute: number } | null {
  const terms = SOLAR_TERMS_DATA[year];
  if (!terms) return null;
  const lichun = terms.find(t => t.name === '입춘');
  if (!lichun) return null;
  return { month: lichun.month, day: lichun.day, hour: lichun.hour, minute: lichun.minute };
}

/**
 * 특정 연도의 12절기(節) 조회
 * 월주 계산에 사용
 */
export function getJeolTermsForYear(year: number): SolarTermData[] | null {
  const terms = SOLAR_TERMS_DATA[year];
  if (!terms) return null;
  return terms.filter(t => t.isJeol);
}

/**
 * 특정 날짜가 어떤 절기 월에 속하는지 판단
 * 반환값: 인월(1) ~ 축월(12) (음력 월 아님, 절기 월)
 * 
 * 절기월 매핑:
 *   입춘~경칩 전 = 인월(1) → 지지: 寅
 *   경칩~청명 전 = 묘월(2) → 지지: 卯
 *   ...
 *   소한~입춘 전 = 축월(12) → 지지: 丑
 */
export function getJeolMonth(year: number, month: number, day: number, hour: number, minute: number): number | null {
  // 현재 연도와 이전 연도의 절기가 필요할 수 있음
  const currentYearTerms = getJeolTermsForYear(year);
  const prevYearTerms = getJeolTermsForYear(year - 1);
  
  if (!currentYearTerms) return null;

  // 12절기를 시간순 정렬 (이미 정렬되어 있지만 안전하게)
  // 소한(1월) → 입춘(2월) → ... → 대설(12월)
  
  const inputMinutes = month * 100000 + day * 1000 + hour * 60 + minute;
  
  // 각 절기의 시작 시점과 비교
  // 절기 월 번호: 소한=12(축월), 입춘=1(인월), 경칩=2(묘월), ...
  const JEOL_MONTH_MAP: Record<string, number> = {
    '소한': 12, '입춘': 1, '경칩': 2, '청명': 3,
    '입하': 4, '망종': 5, '소서': 6, '입추': 7,
    '백로': 8, '한로': 9, '입동': 10, '대설': 11,
  };

  // 역순으로 검사: 대설 → ... → 소한 → (전년 대설)
  for (let idx = currentYearTerms.length - 1; idx >= 0; idx--) {
    const term = currentYearTerms[idx];
    const termTime = term.month * 100000 + term.day * 1000 + term.hour * 60 + term.minute;
    
    if (inputMinutes >= termTime) {
      return JEOL_MONTH_MAP[term.name] ?? null;
    }
  }

  // 현재 연도의 소한 이전 → 전년 대설 이후
  if (prevYearTerms) {
    const prevDaeseol = prevYearTerms.find(t => t.name === '대설');
    if (prevDaeseol) {
      return 11; // 대설월 (해월, 亥月... 아니고 축월 전)
    }
  }
  
  // 전년 대설 ~ 소한 사이 = 축월이 아니라 자월(11)... 
  // 이 부분은 월주 모듈에서 더 정밀하게 처리
  return 12; // 기본값: 축월
}

/**
 * 데이터 범위 확인
 */
export function getSolarTermsRange(): { min: number; max: number } {
  const years = Object.keys(SOLAR_TERMS_DATA).map(Number);
  return { min: Math.min(...years), max: Math.max(...years) };
}

/**
 * 특정 연도 데이터 존재 여부
 */
export function hasSolarTermsData(year: number): boolean {
  return year in SOLAR_TERMS_DATA;
}
`;

  return output;
}

// ============================================================
// 메인 실행
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

function main() {
  const START_YEAR = 1920;
  const END_YEAR = 2050;

  console.log('='.repeat(60));
  console.log('  절기 데이터 생성기 (astronomy-engine)');
  console.log('='.repeat(60));

  // 1. 데이터 생성
  const allData = generateAllSolarTerms(START_YEAR, END_YEAR);

  // 2. 검증: 몇 개 샘플 출력
  console.log('📋 샘플 데이터 확인:\n');

  const sampleYears = [1970, 1990, 2000, 2024, 2025];
  for (const year of sampleYears) {
    const terms = allData.get(year);
    if (terms) {
      console.log(`--- ${year}년 ---`);
      for (const term of terms) {
        if (term.isJeol) {  // 12절기만 출력
          console.log(
            `  ${term.hanja}(${term.name}): ${term.kstDatetime} KST`
          );
        }
      }
      console.log('');
    }
  }

  // 3. TypeScript 파일 생성
  const tsSource = generateTypeScriptSource(allData);
  const outputPath = path.join(__dirname, 'solarTermsGenerated.ts');

  fs.writeFileSync(outputPath, tsSource, 'utf-8');
  console.log(`📁 파일 생성 완료: ${outputPath}`);
  console.log(`   파일 크기: ${(Buffer.byteLength(tsSource) / 1024).toFixed(1)} KB`);

  // 4. 기존 데이터와 교차 검증
  console.log('\n🔍 기존 데이터 교차 검증:');
  crossValidate(allData);
}

// ============================================================
// 교차 검증 (기존 solarTerms.ts 데이터와 비교)
// ============================================================

/**
 * 기존에 수동 입력한 데이터와 비교
 * 허용 오차: ±2분
 */
function crossValidate(allData: Map<number, SolarTermEntry[]>) {
  // 기존 데이터에서 알려진 값들 (직접 하드코딩으로 검증)
  // 형식: [year, termName, expectedKstDatetime]
  const knownValues: [number, string, string][] = [
    [2024, '입춘', '2024-02-04 17:26'],
    [2024, '경칩', '2024-03-05 11:22'],
    [2024, '소한', '2024-01-06 05:49'],
    [2000, '입춘', '2000-02-04 21:40'],    // ← 수정
    [1990, '입춘', '1990-02-04 11:13'],    // ← 수정
    [1985, '입춘', '1985-02-04 06:12'],
    [2025, '입춘', '2025-02-03 23:10'],
  ];

  let passCount = 0;
  let failCount = 0;

  for (const [year, termName, expected] of knownValues) {
    const terms = allData.get(year);
    if (!terms) {
      console.log(`  ⚠️  ${year}년 데이터 없음`);
      failCount++;
      continue;
    }

    const term = terms.find(t => t.name === termName);
    if (!term) {
      console.log(`  ⚠️  ${year}년 ${termName} 없음`);
      failCount++;
      continue;
    }

    const actual = term.kstDatetime;

    // 분 단위 차이 계산
    const expDate = parseKstDatetime(expected);
    const actDate = parseKstDatetime(actual);
    const diffMinutes = Math.abs(expDate.getTime() - actDate.getTime()) / 60000;

    if (diffMinutes <= 2) {
      console.log(`  ✅ ${year}년 ${termName}: ${actual} (기대: ${expected}, 차이: ${diffMinutes.toFixed(0)}분)`);
      passCount++;
    } else {
      console.log(`  ❌ ${year}년 ${termName}: ${actual} (기대: ${expected}, 차이: ${diffMinutes.toFixed(0)}분)`);
      failCount++;
    }
  }

  console.log(`\n  검증 결과: ${passCount}건 통과, ${failCount}건 실패`);
}

function parseKstDatetime(str: string): Date {
  // "2024-02-04 17:27" → Date
  const [datePart, timePart] = str.split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [h, min] = timePart.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, min));
}

// 실행
main();