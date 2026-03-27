/**
 * solarTermsGenerated.ts → 기존 solarTerms.ts 형식으로 변환
 * 
 * 기존 형식을 100% 유지하여 yearPillar.ts, monthPillar.ts 수정 불필요
 * 실행: npx ts-node src/data/convertToExisting.ts
 */

import { SOLAR_TERMS_DATA as GENERATED_DATA } from './solarTermsGenerated';
import * as fs from 'fs';
import * as path from 'path';

function convert() {
  const years = Object.keys(GENERATED_DATA)
    .map(Number)
    .sort((a, b) => a - b);

  console.log(`📅 변환 시작: ${years[0]}년 ~ ${years[years.length - 1]}년`);
  console.log(`   총 ${years.length}개 연도\n`);

  // ============================================================
  // 파일 헤더
  // ============================================================
  let output = `// src/data/solarTerms.ts
// 절기 절입시각 데이터 (자동 생성)
// 생성 도구: astronomy-engine → convertToExisting.ts
// 생성 일시: ${new Date().toISOString()}
// 범위: ${years[0]}년 ~ ${years[years.length - 1]}년
// 형식: "YYYY-MM-DDTHH:mm" (한국 표준시 KST 기준)
//
// ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.
//    수정이 필요하면 convertToExisting.ts를 실행하세요.

export interface SolarTermEntry {
  name: string
  dateTime: string
}

export interface YearSolarTerms {
  year: number
  terms: SolarTermEntry[]
}

export const SOLAR_TERMS_DATA: YearSolarTerms[] = [\n`;

  // ============================================================
  // 연도별 12절기 데이터
  // ============================================================
  for (const year of years) {
    const terms = GENERATED_DATA[year];
    const jeolTerms = terms.filter(t => t.isJeol);

    output += `  {\n`;
    output += `    year: ${year},\n`;
    output += `    terms: [\n`;

    for (const term of jeolTerms) {
      const mm = String(term.month).padStart(2, '0');
      const dd = String(term.day).padStart(2, '0');
      const hh = String(term.hour).padStart(2, '0');
      const min = String(term.minute).padStart(2, '0');
      const dateTime = `${year}-${mm}-${dd}T${hh}:${min}`;

      output += `      { name: '${term.name}', dateTime: '${dateTime}' },\n`;
    }

    output += `    ]\n`;
    output += `  },\n`;
  }

  output += `]\n`;

  // ============================================================
  // 기존과 동일한 함수들
  // ============================================================
  output += `
// ============================================================
// 조회 함수
// ============================================================

/**
 * 특정 연도의 절기 데이터 조회
 */
export function getSolarTermsForYear(year: number): YearSolarTerms | null {
  return SOLAR_TERMS_DATA.find(d => d.year === year) || null
}

/**
 * 특정 연도 + 절기명으로 절입시각 Date 반환
 * yearPillar.ts, monthPillar.ts에서 사용
 */
export function getSolarTermDateTime(year: number, termName: string): Date | null {
  const yearData = getSolarTermsForYear(year)
  if (!yearData) return null

  const term = yearData.terms.find(t => t.name === termName)
  if (!term) return null

  return new Date(term.dateTime + ':00+09:00')
}
`;

  // ============================================================
  // 파일 저장
  // ============================================================
  const outputPath = path.join(__dirname, 'solarTerms_new.ts');
  fs.writeFileSync(outputPath, output, 'utf-8');

  console.log(`✅ 변환 완료!`);
  console.log(`📁 파일: ${outputPath}`);
  console.log(`   크기: ${(Buffer.byteLength(output) / 1024).toFixed(1)} KB`);
  console.log(`   연도: ${years.length}개`);
  console.log(`   절기: 연도당 12절기\n`);

  // ============================================================
  // 기존 데이터와 교차 비교
  // ============================================================
  console.log('🔍 기존 데이터와 교차 비교:\n');

  const oldData: Record<number, { name: string; dateTime: string }[]> = {
    1969: [
      { name: '소한', dateTime: '1969-01-05T22:28' },
      { name: '입춘', dateTime: '1969-02-04T03:59' },
      { name: '경칩', dateTime: '1969-03-05T21:47' },
      { name: '청명', dateTime: '1969-04-05T02:53' },
      { name: '입하', dateTime: '1969-05-05T20:21' },
      { name: '망종', dateTime: '1969-06-06T00:55' },
      { name: '소서', dateTime: '1969-07-07T11:25' },
      { name: '입추', dateTime: '1969-08-07T21:09' },
      { name: '백로', dateTime: '1969-09-07T23:44' },
      { name: '한로', dateTime: '1969-10-08T15:31' },
      { name: '입동', dateTime: '1969-11-07T18:14' },
      { name: '대설', dateTime: '1969-12-07T11:03' },
    ],
    2024: [
      { name: '소한', dateTime: '2024-01-06T05:49' },
      { name: '입춘', dateTime: '2024-02-04T17:27' },
      { name: '경칩', dateTime: '2024-03-05T11:23' },
      { name: '청명', dateTime: '2024-04-04T16:02' },
      { name: '입하', dateTime: '2024-05-05T09:10' },
      { name: '망종', dateTime: '2024-06-05T13:10' },
      { name: '소서', dateTime: '2024-07-06T22:20' },
      { name: '입추', dateTime: '2024-08-07T09:09' },
      { name: '백로', dateTime: '2024-09-07T12:11' },
      { name: '한로', dateTime: '2024-10-08T03:00' },
      { name: '입동', dateTime: '2024-11-07T07:20' },
      { name: '대설', dateTime: '2024-12-07T00:17' },
    ],
  };

  let passCount = 0;
  let warnCount = 0;

  for (const [yearStr, oldTerms] of Object.entries(oldData)) {
    const year = Number(yearStr);
    const newTerms = GENERATED_DATA[year]?.filter(t => t.isJeol);

    console.log(`--- ${year}년 ---`);

    if (!newTerms) {
      console.log(`  ❌ 새 데이터 없음\n`);
      continue;
    }

    for (const oldTerm of oldTerms) {
      const newTerm = newTerms.find(t => t.name === oldTerm.name);
      if (!newTerm) {
        console.log(`  ❌ ${oldTerm.name}: 새 데이터에 없음`);
        warnCount++;
        continue;
      }

      const mm = String(newTerm.month).padStart(2, '0');
      const dd = String(newTerm.day).padStart(2, '0');
      const hh = String(newTerm.hour).padStart(2, '0');
      const min = String(newTerm.minute).padStart(2, '0');
      const newDateTime = `${year}-${mm}-${dd}T${hh}:${min}`;

      // 분 단위 차이 계산
      const oldDate = new Date(oldTerm.dateTime + ':00+09:00');
      const newDate = new Date(newDateTime + ':00+09:00');
      const diffMin = Math.abs(oldDate.getTime() - newDate.getTime()) / 60000;

      if (diffMin <= 1) {
        console.log(`  ✅ ${oldTerm.name}: ${newDateTime} (차이: ${diffMin}분)`);
        passCount++;
      } else if (diffMin <= 3) {
        console.log(`  ⚠️  ${oldTerm.name}: 기존=${oldTerm.dateTime} → 새=${newDateTime} (차이: ${diffMin}분)`);
        warnCount++;
      } else {
        console.log(`  ❌ ${oldTerm.name}: 기존=${oldTerm.dateTime} → 새=${newDateTime} (차이: ${diffMin}분)`);
        warnCount++;
      }
    }
    console.log('');
  }

  console.log(`\n📊 비교 결과: ✅ ${passCount}건 일치, ⚠️ ${warnCount}건 차이 있음`);
  console.log(`\n📌 다음 단계:`);
  console.log(`   1. 비교 결과가 양호하면 (대부분 ±1분 이내)`);
  console.log(`   2. solarTerms.ts를 solarTerms_old.ts로 백업`);
  console.log(`   3. solarTerms_new.ts를 solarTerms.ts로 이름 변경`);
  console.log(`   4. npm run test:ym 실행하여 기존 테스트 통과 확인`);
}

convert();