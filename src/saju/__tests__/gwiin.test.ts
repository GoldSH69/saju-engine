/**
 * 천을귀인(天乙貴人) 모듈 테스트
 *
 * 실행: cd D:\Work\AI\saju-engine
 *       npx ts-node src/saju/__tests__/gwiin.test.ts
 */

import { getGwiinBranches, isGwiin, analyzeGwiin, checkFortuneGwiin } from '../gwiin'

let passed = 0
let failed = 0

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++
    console.log(`  ✅ ${msg}`)
  } else {
    failed++
    console.log(`  ❌ ${msg}`)
  }
}

// ─── 1. getGwiinBranches — 10개 일간 전체 검증 ────────

console.log('\n=== 1. getGwiinBranches (10개 일간) ===')

// 甲(0) → 丑(1), 未(7)
const g0 = getGwiinBranches(0)
assert(g0.indices[0] === 1 && g0.indices[1] === 7, '甲 → 丑(1), 未(7)')
assert(g0.chars[0] === '丑' && g0.chars[1] === '未', '甲 → 한자 丑, 未')
assert(g0.names[0] === '축' && g0.names[1] === '미', '甲 → 한글 축, 미')

// 乙(1) → 子(0), 申(8)
const g1 = getGwiinBranches(1)
assert(g1.indices[0] === 0 && g1.indices[1] === 8, '乙 → 子(0), 申(8)')
assert(g1.chars[0] === '子' && g1.chars[1] === '申', '乙 → 한자 子, 申')

// 丙(2) → 酉(9), 亥(11)
const g2 = getGwiinBranches(2)
assert(g2.indices[0] === 9 && g2.indices[1] === 11, '丙 → 酉(9), 亥(11)')
assert(g2.chars[0] === '酉' && g2.chars[1] === '亥', '丙 → 한자 酉, 亥')

// 丁(3) → 酉(9), 亥(11) — 丙과 동일
const g3 = getGwiinBranches(3)
assert(g3.indices[0] === 9 && g3.indices[1] === 11, '丁 → 酉(9), 亥(11) [丙과 동일]')

// 戊(4) → 丑(1), 未(7) — 甲과 동일
const g4 = getGwiinBranches(4)
assert(g4.indices[0] === 1 && g4.indices[1] === 7, '戊 → 丑(1), 未(7) [甲과 동일]')

// 己(5) → 子(0), 申(8) — 乙과 동일
const g5 = getGwiinBranches(5)
assert(g5.indices[0] === 0 && g5.indices[1] === 8, '己 → 子(0), 申(8) [乙과 동일]')

// 庚(6) → 丑(1), 未(7)
const g6 = getGwiinBranches(6)
assert(g6.indices[0] === 1 && g6.indices[1] === 7, '庚 → 丑(1), 未(7)')

// 辛(7) → 寅(2), 午(6)
const g7 = getGwiinBranches(7)
assert(g7.indices[0] === 2 && g7.indices[1] === 6, '辛 → 寅(2), 午(6)')
assert(g7.chars[0] === '寅' && g7.chars[1] === '午', '辛 → 한자 寅, 午')

// 壬(8) → 卯(3), 巳(5)
const g8 = getGwiinBranches(8)
assert(g8.indices[0] === 3 && g8.indices[1] === 5, '壬 → 卯(3), 巳(5)')
assert(g8.chars[0] === '卯' && g8.chars[1] === '巳', '壬 → 한자 卯, 巳')

// 癸(9) → 卯(3), 巳(5) — 壬과 동일
const g9 = getGwiinBranches(9)
assert(g9.indices[0] === 3 && g9.indices[1] === 5, '癸 → 卯(3), 巳(5) [壬과 동일]')

// elements 확인
assert(g0.elements[0] === '토' && g0.elements[1] === '토', '甲 귀인 오행: 토, 토')
assert(g7.elements[0] === '목' && g7.elements[1] === '화', '辛 귀인 오행: 목, 화')
assert(g8.elements[0] === '목' && g8.elements[1] === '화', '壬 귀인 오행: 목, 화')

// 모든 일간에서 indices/chars/names/elements 길이 2
for (let i = 0; i < 10; i++) {
  const pair = getGwiinBranches(i)
  assert(pair.indices.length === 2, `일간${i}: indices 길이 2`)
  assert(pair.chars.length === 2, `일간${i}: chars 길이 2`)
  assert(pair.names.length === 2, `일간${i}: names 길이 2`)
  assert(pair.elements.length === 2, `일간${i}: elements 길이 2`)
}

// ─── 2. isGwiin — 기본 판별 ──────────────────────────

console.log('\n=== 2. isGwiin 판별 ===')

// 甲(0): 귀인 丑(1), 未(7)
assert(isGwiin(0, 1) === true, '甲 + 丑 → 귀인')
assert(isGwiin(0, 7) === true, '甲 + 未 → 귀인')
assert(isGwiin(0, 0) === false, '甲 + 子 → 귀인 아님')
assert(isGwiin(0, 2) === false, '甲 + 寅 → 귀인 아님')
assert(isGwiin(0, 6) === false, '甲 + 午 → 귀인 아님')

// 辛(7): 귀인 寅(2), 午(6)
assert(isGwiin(7, 2) === true, '辛 + 寅 → 귀인')
assert(isGwiin(7, 6) === true, '辛 + 午 → 귀인')
assert(isGwiin(7, 0) === false, '辛 + 子 → 귀인 아님')
assert(isGwiin(7, 3) === false, '辛 + 卯 → 귀인 아님')
assert(isGwiin(7, 1) === false, '辛 + 丑 → 귀인 아님')

// 壬(8): 귀인 卯(3), 巳(5)
assert(isGwiin(8, 3) === true, '壬 + 卯 → 귀인')
assert(isGwiin(8, 5) === true, '壬 + 巳 → 귀인')
assert(isGwiin(8, 0) === false, '壬 + 子 → 귀인 아님')
assert(isGwiin(8, 7) === false, '壬 + 未 → 귀인 아님')

// 乙(1): 귀인 子(0), 申(8)
assert(isGwiin(1, 0) === true, '乙 + 子 → 귀인')
assert(isGwiin(1, 8) === true, '乙 + 申 → 귀인')
assert(isGwiin(1, 1) === false, '乙 + 丑 → 귀인 아님')

// 丙(2): 귀인 酉(9), 亥(11)
assert(isGwiin(2, 9) === true, '丙 + 酉 → 귀인')
assert(isGwiin(2, 11) === true, '丙 + 亥 → 귀인')
assert(isGwiin(2, 0) === false, '丙 + 子 → 귀인 아님')

// 잘못된 인덱스 → false
assert(isGwiin(10, 0) === false, '인덱스 10 → false')
assert(isGwiin(-1, 0) === false, '인덱스 -1 → false')

// 모든 일간에 대해 정확히 2개만 귀인
for (let stem = 0; stem < 10; stem++) {
  let count = 0
  for (let branch = 0; branch < 12; branch++) {
    if (isGwiin(stem, branch)) count++
  }
  assert(count === 2, `일간${stem}: 12지지 중 정확히 2개만 귀인`)
}

// ─── 3. analyzeGwiin — 원국 분석 ─────────────────────

console.log('\n=== 3. analyzeGwiin 원국 분석 ===')

// 3-1: 귀인 없는 경우
// 甲일간(0), 귀인: 丑(1), 未(7)
// 년지=子(0), 월지=寅(2), 일지=辰(4), 시지=午(6) → 모두 귀인 아님
const a1 = analyzeGwiin(0, 0, 2, 4, 6)
assert(a1.dayStem.char === '甲', '일간: 甲')
assert(a1.dayStem.index === 0, '일간 인덱스: 0')
assert(a1.gwiinPair.indices[0] === 1 && a1.gwiinPair.indices[1] === 7, '귀인 쌍: 丑, 未')
assert(a1.gwiinCount === 0, '귀인 수: 0')
assert(a1.gwiinPositions.length === 0, '귀인 위치: 없음')
assert(a1.branchStatus.year.isGwiin === false, '년지 子 → 귀인 아님')
assert(a1.branchStatus.month.isGwiin === false, '월지 寅 → 귀인 아님')
assert(a1.branchStatus.day.isGwiin === false, '일지 辰 → 귀인 아님')
assert(a1.branchStatus.hour!.isGwiin === false, '시지 午 → 귀인 아님')
assert(a1.summary.some(s => s.includes('없습니다')), '요약에 "없습니다" 포함')

// 3-2: 귀인 1개 (년지)
// 甲일간(0), 년지=丑(1) → 귀인!
const a2 = analyzeGwiin(0, 1, 2, 4, 6)
assert(a2.gwiinCount === 1, '귀인 수: 1')
assert(a2.gwiinPositions[0] === '년지', '귀인 위치: 년지')
assert(a2.branchStatus.year.isGwiin === true, '년지 丑 → 귀인!')
assert(a2.branchStatus.year.keyword === '조상/사회적 귀인', '년지 키워드: 조상/사회적')
assert(a2.branchStatus.year.description.includes('어른'), '년지 설명에 "어른" 포함')
assert(a2.branchStatus.month.isGwiin === false, '월지 寅 → 귀인 아님')

// 3-3: 귀인 1개 (월지)
// 辛일간(7), 귀인: 寅(2), 午(6)
// 월지=寅(2) → 귀인!
const a3 = analyzeGwiin(7, 0, 2, 4, 8)
assert(a3.gwiinCount === 1, '辛일간: 귀인 수 1')
assert(a3.gwiinPositions[0] === '월지', '귀인 위치: 월지')
assert(a3.branchStatus.month.isGwiin === true, '월지 寅 → 귀인!')
assert(a3.branchStatus.month.keyword === '부모/직장 귀인', '월지 키워드')

// 3-4: 귀인 1개 (일지) — 배우자 귀인 특수 메시지
// 甲일간(0), 일지=丑(1) → 귀인!
const a4 = analyzeGwiin(0, 0, 2, 1, 6)
assert(a4.gwiinCount === 1, '귀인 수: 1')
assert(a4.gwiinPositions[0] === '일지', '귀인 위치: 일지')
assert(a4.branchStatus.day.isGwiin === true, '일지 丑 → 귀인!')
assert(a4.branchStatus.day.keyword === '배우자 귀인', '일지 키워드')
assert(a4.summary.some(s => s.includes('배우자 복')), '요약에 배우자 복 포함')

// 3-5: 귀인 1개 (시지)
// 甲일간(0), 시지=未(7) → 귀인!
const a5 = analyzeGwiin(0, 0, 2, 4, 7)
assert(a5.gwiinCount === 1, '귀인 수: 1')
assert(a5.gwiinPositions[0] === '시지', '귀인 위치: 시지')
assert(a5.branchStatus.hour!.isGwiin === true, '시지 未 → 귀인!')
assert(a5.branchStatus.hour!.keyword === '자녀/말년 귀인', '시지 키워드')

// 3-6: 귀인 2개
// 甲일간(0), 년지=丑(1), 시지=未(7) → 2개!
const a6 = analyzeGwiin(0, 1, 2, 4, 7)
assert(a6.gwiinCount === 2, '귀인 수: 2')
assert(a6.gwiinPositions.includes('년지'), '귀인 위치에 년지 포함')
assert(a6.gwiinPositions.includes('시지'), '귀인 위치에 시지 포함')
assert(a6.summary.some(s => s.includes('인복이 좋아')), '요약에 인복 포함')

// 3-7: 귀인 3개 이상
// 甲일간(0), 년지=丑(1), 일지=未(7), 시지=丑(1) → 3개!
const a7 = analyzeGwiin(0, 1, 2, 7, 1)
assert(a7.gwiinCount === 3, '귀인 수: 3')
assert(a7.summary.some(s => s.includes('귀인이 많아')), '요약에 "귀인이 많아" 포함')

// 3-8: 시간 미상 (hourBranchIndex = null)
const a8 = analyzeGwiin(0, 1, 2, 4, null)
assert(a8.branchStatus.hour === null, '시간 미상 → hour null')
assert(a8.gwiinCount === 1, '시간 미상: 년지 丑만 귀인 → 1개')
assert(a8.gwiinPositions[0] === '년지', '시간 미상: 귀인 위치 년지')

// 3-9: 壬일간 검증
// 壬(8), 귀인: 卯(3), 巳(5)
// 년지=卯(3), 월지=巳(5) → 2개!
const a9 = analyzeGwiin(8, 3, 5, 0, 0)
assert(a9.gwiinPair.chars[0] === '卯' && a9.gwiinPair.chars[1] === '巳', '壬 귀인: 卯, 巳')
assert(a9.gwiinCount === 2, '壬: 귀인 수 2')
assert(a9.branchStatus.year.isGwiin === true, '년지 卯 → 귀인!')
assert(a9.branchStatus.month.isGwiin === true, '월지 巳 → 귀인!')

// 3-10: 辛일간 — 월지+시지 모두 귀인
// 辛(7), 귀인: 寅(2), 午(6)
// 월지=寅(2), 시지=午(6) → 2개!
const a10 = analyzeGwiin(7, 0, 2, 4, 6)
assert(a10.gwiinCount === 2, '辛: 귀인 수 2')
assert(a10.branchStatus.month.isGwiin === true, '월지 寅 → 귀인!')
assert(a10.branchStatus.hour!.isGwiin === true, '시지 午 → 귀인!')

// 3-11: 반환 구조 완전성
assert(a1.hasOwnProperty('dayStem'), '속성: dayStem')
assert(a1.hasOwnProperty('gwiinPair'), '속성: gwiinPair')
assert(a1.hasOwnProperty('branchStatus'), '속성: branchStatus')
assert(a1.hasOwnProperty('gwiinCount'), '속성: gwiinCount')
assert(a1.hasOwnProperty('gwiinPositions'), '속성: gwiinPositions')
assert(a1.hasOwnProperty('summary'), '속성: summary')
assert(a1.dayStem.hasOwnProperty('char'), '속성: dayStem.char')
assert(a1.dayStem.hasOwnProperty('name'), '속성: dayStem.name')
assert(a1.dayStem.hasOwnProperty('index'), '속성: dayStem.index')

// 3-12: 모든 일간에 대해 summary에 항상 귀인 정보 포함
for (let stem = 0; stem < 10; stem++) {
  const result = analyzeGwiin(stem, 0, 1, 2, 3)
  assert(result.summary.length >= 1, `일간${stem}: summary 1줄 이상`)
  assert(result.summary[0].includes('천을귀인'), `일간${stem}: 첫 줄에 천을귀인 포함`)
}

// 3-13: 귀인 아닌 위치의 keyword/description 빈 문자열
assert(a1.branchStatus.year.keyword === '', '귀인 아닌 년지: keyword 빈 문자열')
assert(a1.branchStatus.year.description === '', '귀인 아닌 년지: description 빈 문자열')

// ─── 4. checkFortuneGwiin — 운세 귀인 ────────────────

console.log('\n=== 4. checkFortuneGwiin 운세 귀인 ===')

// 4-1: 귀인에 해당하는 운세 지지
// 甲일간(0), 운세 지지=丑(1) → 귀인!
const f1 = checkFortuneGwiin(0, 1)
assert(f1.isGwiin === true, '甲 + 세운丑 → 귀인!')
assert(f1.fortuneBranchChar === '丑', '운세 지지 한자: 丑')
assert(f1.fortuneBranchName === '축', '운세 지지 한글: 축')
assert(f1.description.includes('천을귀인'), '설명에 천을귀인 포함')
assert(f1.description.includes('귀인의 도움'), '설명에 귀인의 도움 포함')
assert(f1.description.includes('흉한 기운'), '설명에 흉한 기운 완화 포함')

// 4-2: 귀인에 해당하지 않는 운세 지지
// 甲일간(0), 운세 지지=子(0) → 귀인 아님
const f2 = checkFortuneGwiin(0, 0)
assert(f2.isGwiin === false, '甲 + 세운子 → 귀인 아님')
assert(f2.description === '', '귀인 아닌 경우 설명 빈 문자열')

// 4-3: 辛일간, 午(6) 운세 → 귀인
const f3 = checkFortuneGwiin(7, 6)
assert(f3.isGwiin === true, '辛 + 세운午 → 귀인!')
assert(f3.fortuneBranchChar === '午', '운세 지지: 午')

// 4-4: 辛일간, 寅(2) 운세 → 귀인
const f4 = checkFortuneGwiin(7, 2)
assert(f4.isGwiin === true, '辛 + 세운寅 → 귀인!')

// 4-5: 辛일간, 卯(3) 운세 → 귀인 아님
const f5 = checkFortuneGwiin(7, 3)
assert(f5.isGwiin === false, '辛 + 세운卯 → 귀인 아님')

// 4-6: 壬일간, 卯(3) → 귀인
const f6 = checkFortuneGwiin(8, 3)
assert(f6.isGwiin === true, '壬 + 세운卯 → 귀인!')

// 4-7: 壬일간, 巳(5) → 귀인
const f7 = checkFortuneGwiin(8, 5)
assert(f7.isGwiin === true, '壬 + 세운巳 → 귀인!')

// 4-8: 壬일간, 子(0) → 귀인 아님
const f8 = checkFortuneGwiin(8, 0)
assert(f8.isGwiin === false, '壬 + 세운子 → 귀인 아님')

// 4-9: 丙일간, 酉(9) → 귀인
const f9 = checkFortuneGwiin(2, 9)
assert(f9.isGwiin === true, '丙 + 세운酉 → 귀인!')

// 4-10: 丙일간, 亥(11) → 귀인
const f10 = checkFortuneGwiin(2, 11)
assert(f10.isGwiin === true, '丙 + 세운亥 → 귀인!')

// 4-11: 모든 일간 × 12지지 → 정확히 2개만 귀인
for (let stem = 0; stem < 10; stem++) {
  let gwiinCount = 0
  for (let branch = 0; branch < 12; branch++) {
    const result = checkFortuneGwiin(stem, branch)
    if (result.isGwiin) gwiinCount++
  }
  assert(gwiinCount === 2, `일간${stem}: 12지지 중 정확히 2개 귀인`)
}

// 4-12: 귀인일 때 description 비어있지 않음, 아닐 때 빈 문자열
for (let stem = 0; stem < 10; stem++) {
  for (let branch = 0; branch < 12; branch++) {
    const result = checkFortuneGwiin(stem, branch)
    if (result.isGwiin) {
      assert(result.description.length > 0, `일간${stem}+지지${branch}: 귀인 설명 있음`)
    } else {
      assert(result.description === '', `일간${stem}+지지${branch}: 비귀인 설명 빈 문자열`)
    }
  }
}

// ─── 5. 통합 시나리오 ────────────────────────────────

console.log('\n=== 5. 통합 시나리오 ===')

// 5-1: 甲일간, 년지丑(귀인), 세운未(귀인)
const s1_analysis = analyzeGwiin(0, 1, 2, 4, 6)
assert(s1_analysis.gwiinCount === 1, '시나리오1: 원국 귀인 1개')
assert(s1_analysis.branchStatus.year.isGwiin === true, '시나리오1: 년지 丑 귀인')
const s1_fortune = checkFortuneGwiin(0, 7) // 未
assert(s1_fortune.isGwiin === true, '시나리오1: 세운 未 귀인')

// 5-2: 辛일간, 원국에 귀인 없음, 세운寅(귀인)
// 辛(7), 귀인: 寅(2), 午(6)
// 원국: 子(0), 丑(1), 卯(3), 巳(5) → 귀인 없음
const s2_analysis = analyzeGwiin(7, 0, 1, 3, 5)
assert(s2_analysis.gwiinCount === 0, '시나리오2: 원국 귀인 없음')
const s2_fortune = checkFortuneGwiin(7, 2) // 寅
assert(s2_fortune.isGwiin === true, '시나리오2: 세운 寅 귀인!')

// 5-3: 시간 미상 + 운세 귀인
const s3_analysis = analyzeGwiin(8, 3, 0, 0, null) // 壬, 년지=卯
assert(s3_analysis.gwiinCount === 1, '시나리오3: 년지 卯 귀인 1개')
assert(s3_analysis.branchStatus.hour === null, '시나리오3: 시간 미상')
const s3_fortune = checkFortuneGwiin(8, 5) // 巳
assert(s3_fortune.isGwiin === true, '시나리오3: 세운 巳 귀인!')

// 5-4: 己일간(5), 원국 4기둥 모두 귀인 확인
// 己(5), 귀인: 子(0), 申(8)
// 년지=子(0), 월지=申(8), 일지=子(0), 시지=申(8) → 4개 전부 귀인
const s4_analysis = analyzeGwiin(5, 0, 8, 0, 8)
assert(s4_analysis.gwiinCount === 4, '시나리오4: 4기둥 전부 귀인!')
assert(s4_analysis.summary.some(s => s.includes('귀인이 많아')), '시나리오4: 귀인 많음 메시지')

// ─── 결과 ─────────────────────────────────────────────

console.log('\n' + '='.repeat(50))
console.log(`총 ${passed + failed}건: ✅ ${passed}건 통과, ❌ ${failed}건 실패`)
if (failed === 0) {
  console.log('🎉 천을귀인 모듈 전체 테스트 통과!')
} else {
  console.log('⚠️ 실패한 테스트가 있습니다!')
  process.exit(1)
}