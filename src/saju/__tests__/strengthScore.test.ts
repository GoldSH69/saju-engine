// src/saju/__tests__/strengthScore.test.ts
export {};

import { calculateStrength } from '../strengthScore';

let passed = 0;
let failed = 0;
let total = 0;

function assertEqual(actual: any, expected: any, testName: string) {
  total++;
  if (actual === expected) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    console.log(`  ❌ ${testName}: expected "${expected}", got "${actual}"`);
  }
}

function assertTrue(condition: boolean, testName: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    console.log(`  ❌ ${testName}: condition is false`);
  }
}

// ============================================================
// 테스트 1: 전형적 신강 사주
// 甲寅年 丙寅月 甲寅日 甲子時
// 일간: 甲(양목)
// 월지 寅의 정기: 甲(木) → 같은 오행 → 득령
// 寅의 지장간: 戊(편재), 丙(식신), 甲(비견) → 甲은 돕는
// 甲이 3개나 투출 + 월지 득령 → 매우 강
// ============================================================
console.log('\n=== 테스트 1: 전형적 신강 - 甲寅 丙寅 甲寅 甲子 ===');

const result1 = calculateStrength(
  '甲', '丙', '甲', '甲',
  '寅', '寅', '寅', '子'
);

assertEqual(result1.dayStem, '甲', '일간 = 甲');
assertEqual(result1.dayElementKo, '목', '일간 오행 = 목');
assertEqual(result1.deukryeong, true, '득령 (월지 寅 정기 甲 = 木 = 같은 오행)');
assertEqual(result1.strength, '신강', '판정: 신강');
assertTrue(result1.supportScore > result1.restrainScore, '돕는 힘 > 약화 힘');
assertTrue(result1.strengthLevel > 0, '강도 양수');

console.log(`  📊 점수: 돕는 ${result1.supportScore} / 약화 ${result1.restrainScore} / 레벨 ${result1.strengthLevel}`);
console.log(`  📝 ${result1.summary}`);

// ============================================================
// 테스트 2: 전형적 신약 사주
// 甲申年 丙申月 癸巳日 戊午時
// 일간: 癸(음수)
// 월지 申 정기: 庚(金) → 금생수 → 득령이지만...
// 나머지: 甲(식신), 丙(정재)x2, 戊(편관), 午(丁=편재, 己=편관)
// 관성+재성+식상이 압도 → 실질적으로 약
// ============================================================
console.log('\n=== 테스트 2: 신약 경향 - 甲申 丙申 癸巳 戊午 ===');

const result2 = calculateStrength(
  '甲', '丙', '癸', '戊',
  '申', '申', '巳', '午'
);

assertEqual(result2.dayStem, '癸', '일간 = 癸');
assertEqual(result2.dayElementKo, '수', '일간 오행 = 수');
console.log(`  📊 점수: 돕는 ${result2.supportScore} / 약화 ${result2.restrainScore} / 레벨 ${result2.strengthLevel}`);
console.log(`  📝 ${result2.summary}`);
// 관성+재성+식상이 많아 약할 것
assertTrue(result2.restrainScore > result2.supportScore, '약화 힘 > 돕는 힘');

// ============================================================
// 테스트 3: 득령 판단 - 월지 오행이 일간을 생하는 경우
// 일간: 甲(木), 월지: 子 (정기: 癸=水, 수생목 → 득령)
// ============================================================
console.log('\n=== 테스트 3: 득령 - 월지가 일간을 생하는 경우 ===');

const result3 = calculateStrength(
  '庚', '壬', '甲', '丙',
  '午', '子', '子', '寅'
);

assertEqual(result3.deukryeong, true, '득령 (월지 子 정기 癸=水, 수생목=甲)');
console.log(`  📊 점수: 돕는 ${result3.supportScore} / 약화 ${result3.restrainScore} / 강도 ${result3.strengthLevel}`);
console.log(`  📝 ${result3.summary}`);

// ============================================================
// 테스트 4: 실령 판단 - 월지 오행이 일간을 극하는 경우
// 일간: 甲(木), 월지: 申 (정기: 庚=金, 금극목 → 실령)
// ============================================================
console.log('\n=== 테스트 4: 실령 - 월지가 일간을 극하는 경우 ===');

const result4 = calculateStrength(
  '庚', '庚', '甲', '庚',
  '申', '申', '申', '申'
);

assertEqual(result4.deukryeong, false, '실령 (월지 申 정기 庚=金, 금극목)');
assertEqual(result4.strength, '신약', '판정: 신약 (金이 압도)');
assertTrue(result4.strengthLevel < 0, '강도 음수');
console.log(`  📊 점수: 돕는 ${result4.supportScore} / 약화 ${result4.restrainScore} / 강도 ${result4.strengthLevel}`);
console.log(`  📝 ${result4.summary}`);

// ============================================================
// 테스트 5: 시간 모름 케이스
// ============================================================
console.log('\n=== 테스트 5: 시간 모름 ===');

const result5 = calculateStrength(
  '甲', '丙', '甲', null,
  '寅', '寅', '寅', null
);

assertEqual(result5.dayStem, '甲', '일간 = 甲');
assertEqual(result5.deukryeong, true, '득령');
// 시간 없어도 계산 가능해야 함
assertTrue(result5.details.length > 0, '상세 내역 존재');
assertTrue(result5.summary.length > 0, '요약 텍스트 존재');
console.log(`  📊 점수: 돕는 ${result5.supportScore} / 약화 ${result5.restrainScore} / 강도 ${result5.strengthLevel}`);
console.log(`  📝 ${result5.summary}`);

// ============================================================
// 테스트 6: 중화에 가까운 사주
// 甲子年 丁卯月 戊辰日 壬子時  
// 일간: 戊(양토)
// 월지 卯 정기: 乙(木), 목극토 → 실령
// 하지만 辰(일지)에 戊(비견) 있고, 균형잡힌 구성
// ============================================================
console.log('\n=== 테스트 6: 균형 사주 - 甲子 丁卯 戊辰 壬子 ===');

const result6 = calculateStrength(
  '甲', '丁', '戊', '壬',
  '子', '卯', '辰', '子'
);

assertEqual(result6.dayStem, '戊', '일간 = 戊');
assertEqual(result6.dayElementKo, '토', '일간 오행 = 토');
assertEqual(result6.deukryeong, false, '실령 (월지 卯 정기 乙=木, 목극토)');
console.log(`  📊 점수: 돕는 ${result6.supportScore} / 약화 ${result6.restrainScore} / 강도 ${result6.strengthLevel}`);
console.log(`  📝 ${result6.summary}`);

// ============================================================
// 테스트 7: 상세 내역 구조 검증
// ============================================================
console.log('\n=== 테스트 7: 상세 내역 구조 검증 ===');

const r = result1; // 甲寅 丙寅 甲寅 甲子
assertTrue(r.details.length > 0, '상세 내역 배열 존재');

// 모든 항목에 필수 필드 존재
let allValid = true;
for (const d of r.details) {
  if (!d.position || !d.stem || !d.tenStar || !d.category || d.weight === undefined) {
    allValid = false;
    console.log(`  ❌ 불완전한 항목: ${JSON.stringify(d)}`);
  }
}
total++;
if (allValid) {
  passed++;
  console.log(`  ✅ 모든 상세 항목에 필수 필드 존재 (${r.details.length}건)`);
} else {
  failed++;
}

// score 합계 검증
const sumPositive = r.details.filter(d => d.score > 0).reduce((a, d) => a + d.weight, 0);
const sumNegative = r.details.filter(d => d.score < 0).reduce((a, d) => a + d.weight, 0);
const diff = Math.abs(sumPositive - r.supportScore);
assertTrue(diff < 0.01, `돕는 점수 합계 일치 (차이: ${diff.toFixed(4)})`);

// ============================================================
// 테스트 8: 모든 오행 일간에 대한 기본 동작 검증
// ============================================================
console.log('\n=== 테스트 8: 10천간 일간별 기본 동작 ===');

const allStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
let errorCount = 0;

for (const stem of allStems) {
  try {
    const res = calculateStrength(
      '甲', '丙', stem, '庚',
      '子', '午', '卯', '酉'
    );
    if (!res.strength || !res.summary) {
      errorCount++;
      console.log(`  ❌ ${stem}: 결과 불완전`);
    }
  } catch (e) {
    errorCount++;
    console.log(`  ❌ ${stem}: 오류 - ${e}`);
  }
}
total++;
if (errorCount === 0) {
  passed++;
  console.log(`  ✅ 10천간 모두 정상 계산`);
} else {
  failed++;
}

// ============================================================
// 테스트 9: strengthLevel 범위 검증
// ============================================================
console.log('\n=== 테스트 9: 강도 레벨 범위 ===');

assertTrue(result1.strengthLevel >= -100 && result1.strengthLevel <= 100, 
  `신강 사주 레벨 범위 내: ${result1.strengthLevel}`);
assertTrue(result4.strengthLevel >= -100 && result4.strengthLevel <= 100, 
  `신약 사주 레벨 범위 내: ${result4.strengthLevel}`);

// ============================================================
// 테스트 10: 극단적 케이스 - 비견 가득
// 甲寅 甲寅 甲寅 甲寅 (비현실적이지만 계산 검증)
// ============================================================
console.log('\n=== 테스트 10: 극단 신강 - 甲寅 甲寅 甲寅 甲寅 ===');

const result10 = calculateStrength(
  '甲', '甲', '甲', '甲',
  '寅', '寅', '寅', '寅'
);

assertEqual(result10.strength, '신강', '극단 신강');
assertTrue(result10.strengthLevel > 20, `강도 20 이상: ${result10.strengthLevel}`);
console.log(`  📊 강도: ${result10.strengthLevel}`);

// ============================================================
// 결과 출력
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`신강/신약 테스트 결과: ${passed}/${total} 통과`);
if (failed > 0) {
  console.log(`❌ ${failed}건 실패`);
  process.exit(1);
} else {
  console.log('✅ 전체 통과!');
}