/**
 * 공망(空亡) 모듈 테스트
 *
 * 실행: cd D:\Work\AI\saju-engine
 *       npx ts-node src/saju/tests/gongmang.test.ts
 */

import { calculateGongmangPair, isGongmang, analyzeGongmang, checkFortuneGongmang } from '../gongmang'

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

// ─── 1. 기본 공망 계산 (6개 순 전체 검증) ─────────────

console.log('\n=== 1. 기본 공망 계산 (6개 순) ===')

// 甲子旬: 공망 戌(10), 亥(11)
const r1 = calculateGongmangPair(0, 0)
assert(r1.sunName === '甲子旬', '甲子 → 甲子旬')
assert(r1.indices[0] === 10 && r1.indices[1] === 11, '甲子旬 공망: 戌, 亥')
assert(r1.chars[0] === '戌' && r1.chars[1] === '亥', '甲子旬 공망 한자: 戌, 亥')

// 乙丑도 甲子旬
const r1b = calculateGongmangPair(1, 1)
assert(r1b.sunName === '甲子旬', '乙丑 → 甲子旬')
assert(r1b.indices[0] === 10 && r1b.indices[1] === 11, '乙丑 공망: 戌, 亥')

// 癸酉도 甲子旬 (마지막)
const r1c = calculateGongmangPair(9, 9)
assert(r1c.sunName === '甲子旬', '癸酉 → 甲子旬')
assert(r1c.indices[0] === 10 && r1c.indices[1] === 11, '癸酉 공망: 戌, 亥')

// 甲戌旬: 공망 申(8), 酉(9)
const r2 = calculateGongmangPair(0, 10)
assert(r2.sunName === '甲戌旬', '甲戌 → 甲戌旬')
assert(r2.indices[0] === 8 && r2.indices[1] === 9, '甲戌旬 공망: 申, 酉')

// 甲申旬: 공망 午(6), 未(7)
const r3 = calculateGongmangPair(0, 8)
assert(r3.sunName === '甲申旬', '甲申 → 甲申旬')
assert(r3.indices[0] === 6 && r3.indices[1] === 7, '甲申旬 공망: 午, 未')

// 甲午旬: 공망 辰(4), 巳(5)
const r4 = calculateGongmangPair(0, 6)
assert(r4.sunName === '甲午旬', '甲午 → 甲午旬')
assert(r4.indices[0] === 4 && r4.indices[1] === 5, '甲午旬 공망: 辰, 巳')

// 甲辰旬: 공망 寅(2), 卯(3)
const r5 = calculateGongmangPair(0, 4)
assert(r5.sunName === '甲辰旬', '甲辰 → 甲辰旬')
assert(r5.indices[0] === 2 && r5.indices[1] === 3, '甲辰旬 공망: 寅, 卯')

// 甲寅旬: 공망 子(0), 丑(1)
const r6 = calculateGongmangPair(0, 2)
assert(r6.sunName === '甲寅旬', '甲寅 → 甲寅旬')
assert(r6.indices[0] === 0 && r6.indices[1] === 1, '甲寅旬 공망: 子, 丑')

// ─── 2. 중간 간지 테스트 ──────────────────────────────

console.log('\n=== 2. 중간 간지 공망 ===')

// 庚午: stem=6, branch=6 → startBranch=0 → 甲子旬 → 공망 戌,亥
const r7 = calculateGongmangPair(6, 6)
assert(r7.sunName === '甲子旬', '庚午 → 甲子旬')
assert(r7.indices[0] === 10 && r7.indices[1] === 11, '庚午 공망: 戌, 亥')

// 庚子: stem=6, branch=0 → startBranch=6 → 甲午旬 → 공망 辰,巳
const r8 = calculateGongmangPair(6, 0)
assert(r8.sunName === '甲午旬', '庚子 → 甲午旬')
assert(r8.indices[0] === 4 && r8.indices[1] === 5, '庚子 공망: 辰, 巳')

// 辛巳: stem=7, branch=5 → startBranch=10 → 甲戌旬 → 공망 申,酉
const r9 = calculateGongmangPair(7, 5)
assert(r9.sunName === '甲戌旬', '辛巳 → 甲戌旬')
assert(r9.indices[0] === 8 && r9.indices[1] === 9, '辛巳 공망: 申, 酉')

// 壬寅: stem=8, branch=2 → startBranch=6 → 甲午旬 → 공망 辰,巳
const r10 = calculateGongmangPair(8, 2)
assert(r10.sunName === '甲午旬', '壬寅 → 甲午旬')
assert(r10.indices[0] === 4 && r10.indices[1] === 5, '壬寅 공망: 辰, 巳')

// 丁卯: stem=3, branch=3 → startBranch=0 → 甲子旬 → 공망 戌,亥
const r11 = calculateGongmangPair(3, 3)
assert(r11.sunName === '甲子旬', '丁卯 → 甲子旬')
assert(r11.indices[0] === 10 && r11.indices[1] === 11, '丁卯 공망: 戌, 亥')

// 己酉: stem=5, branch=9 → startBranch=4 → 甲辰旬 → 공망 寅,卯
const r12 = calculateGongmangPair(5, 9)
assert(r12.sunName === '甲辰旬', '己酉 → 甲辰旬')
assert(r12.indices[0] === 2 && r12.indices[1] === 3, '己酉 공망: 寅, 卯')

// 丙申: stem=2, branch=8 → startBranch=6 → 甲午旬 → 공망 辰,巳
const r13 = calculateGongmangPair(2, 8)
assert(r13.sunName === '甲午旬', '丙申 → 甲午旬')
assert(r13.indices[0] === 4 && r13.indices[1] === 5, '丙申 공망: 辰, 巳')

// ─── 3. isGongmang 함수 ──────────────────────────────

console.log('\n=== 3. isGongmang 함수 ===')

// 庚午 일주: 甲子旬 → 공망 戌(10), 亥(11)
assert(isGongmang(6, 6, 10) === true, '庚午: 戌은 공망')
assert(isGongmang(6, 6, 11) === true, '庚午: 亥은 공망')
assert(isGongmang(6, 6, 0) === false, '庚午: 子는 공망 아님')
assert(isGongmang(6, 6, 6) === false, '庚午: 午는 공망 아님')
assert(isGongmang(6, 6, 9) === false, '庚午: 酉는 공망 아님')

// 甲辰 일주: 甲辰旬 → 공망 寅(2), 卯(3)
assert(isGongmang(0, 4, 2) === true, '甲辰: 寅은 공망')
assert(isGongmang(0, 4, 3) === true, '甲辰: 卯은 공망')
assert(isGongmang(0, 4, 4) === false, '甲辰: 辰은 공망 아님')
assert(isGongmang(0, 4, 0) === false, '甲辰: 子는 공망 아님')

// 己酉 일주: 甲辰旬 → 공망 寅(2), 卯(3)
assert(isGongmang(5, 9, 2) === true, '己酉: 寅은 공망')
assert(isGongmang(5, 9, 3) === true, '己酉: 卯은 공망')
assert(isGongmang(5, 9, 9) === false, '己酉: 酉는 공망 아님')

// 甲寅 일주: 甲寅旬 → 공망 子(0), 丑(1)
assert(isGongmang(0, 2, 0) === true, '甲寅: 子는 공망')
assert(isGongmang(0, 2, 1) === true, '甲寅: 丑은 공망')
assert(isGongmang(0, 2, 2) === false, '甲寅: 寅은 공망 아님')

// ─── 4. 원국 공망 분석 ───────────────────────────────

console.log('\n=== 4. 원국 공망 분석 ===')

// 년주 甲寅(0,2), 월지 午(6), 일주 庚子(6,0), 시지 酉(9)
// 년공망(甲寅旬): 子(0), 丑(1)
// 일공망(甲午旬): 辰(4), 巳(5)
const a1 = analyzeGongmang(0, 2, 6, 6, 0, 9)

assert(a1.yearGongmang.sunName === '甲寅旬', '년공망: 甲寅旬')
assert(a1.yearGongmang.indices[0] === 0, '년공망1: 子')
assert(a1.yearGongmang.indices[1] === 1, '년공망2: 丑')

assert(a1.dayGongmang.sunName === '甲午旬', '일공망: 甲午旬')
assert(a1.dayGongmang.indices[0] === 4, '일공망1: 辰')
assert(a1.dayGongmang.indices[1] === 5, '일공망2: 巳')

// 년지 寅(2) → 공망 아님
assert(a1.branchStatus.year.isYearGongmang === false, '년지 寅 → 년공망 아님')
assert(a1.branchStatus.year.isDayGongmang === false, '년지 寅 → 일공망 아님')

// 월지 午(6) → 공망 아님
assert(a1.branchStatus.month.isYearGongmang === false, '월지 午 → 년공망 아님')
assert(a1.branchStatus.month.isDayGongmang === false, '월지 午 → 일공망 아님')

// 일지 子(0) → 년공망! (甲寅旬의 공망 子,丑)
assert(a1.branchStatus.day.isYearGongmang === true, '일지 子 → 년공망 해당!')
assert(a1.branchStatus.day.isDayGongmang === false, '일지 子 → 일공망 아님')

// 시지 酉(9) → 공망 아님
assert(a1.branchStatus.hour!.isYearGongmang === false, '시지 酉 → 년공망 아님')
assert(a1.branchStatus.hour!.isDayGongmang === false, '시지 酉 → 일공망 아님')

assert(a1.summary.length >= 2, '요약 최소 2줄')

// 시간 미상 테스트
const a2 = analyzeGongmang(0, 2, 6, 6, 0, null)
assert(a2.branchStatus.hour === null, '시간 미상 → hour null')

// 월지가 일공망인 경우
// 년주 甲子(0,0), 월지 巳(5), 일주 甲午(0,6), 시지 寅(2)
// 년공망(甲子旬): 戌(10), 亥(11)
// 일공망(甲午旬): 辰(4), 巳(5) ← 월지 巳가 일공망!
const a3 = analyzeGongmang(0, 0, 5, 0, 6, 2)
assert(a3.branchStatus.month.isDayGongmang === true, '월지 巳 → 일공망 해당!')
assert(a3.branchStatus.month.isYearGongmang === false, '월지 巳 → 년공망 아님')

// ─── 5. 운세 공망 + 해공 ─────────────────────────────

console.log('\n=== 5. 운세 공망 + 해공 ===')

// 일주 庚子(6,0) → 일공망 辰(4), 巳(5)
// 년주 甲寅(0,2) → 년공망 子(0), 丑(1)
// 원국 지지: [寅(2), 午(6), 子(0), 酉(9)]

// 테스트 5-1: 세운 辰(4) → 일공망, 원국에 酉(9)=합상대 있음 → 합해공!
const f1 = checkFortuneGongmang(0, 2, 6, 0, 4, [2, 6, 0, 9])
assert(f1.isDayGongmang === true, '세운 辰 → 일공망')
assert(f1.isYearGongmang === false, '세운 辰 → 년공망 아님')
assert(f1.isReleased === true, '세운 辰 → 酉와 합으로 해공!')
assert(f1.description.includes('해공'), '해석에 해공 포함')

// 테스트 5-2: 세운 巳(5) → 일공망, 원국에 亥(11)=충상대 없음 → 해공 안 됨
// 하지만 원국에 申(8)=합상대도 없음
const f2 = checkFortuneGongmang(0, 2, 6, 0, 5, [2, 6, 0, 9])
assert(f2.isDayGongmang === true, '세운 巳 → 일공망')
assert(f2.isReleased === false, '세운 巳 → 해공 안 됨')

// 테스트 5-3: 세운 子(0) → 년공망, 원국에 午(6)=충상대 있음! → 해공!
const f3 = checkFortuneGongmang(0, 2, 6, 0, 0, [2, 6, 0, 9])
assert(f3.isYearGongmang === true, '세운 子 → 년공망')
assert(f3.isDayGongmang === false, '세운 子 → 일공망 아님')
assert(f3.isReleased === true, '세운 子 → 충으로 해공!')
assert(f3.releases.length > 0, '해공 정보 존재')
assert(f3.releases[0].releaseType === '충', '해공 유형: 충')
assert(f3.description.includes('해공'), '해석에 해공 포함')

// 테스트 5-4: 세운 丑(1) → 년공망, 원국에 子(0)=합상대 있음! → 해공!
const f4 = checkFortuneGongmang(0, 2, 6, 0, 1, [2, 6, 0, 9])
assert(f4.isYearGongmang === true, '세운 丑 → 년공망')
assert(f4.isReleased === true, '세운 丑 → 합으로 해공!')
assert(f4.releases[0].releaseType === '합', '해공 유형: 합')
assert(f4.description.includes('해공'), '해석에 해공 포함')

// 테스트 5-5: 세운 午(6) → 공망 아님
const f5 = checkFortuneGongmang(0, 2, 6, 0, 6, [2, 6, 0, 9])
assert(f5.isDayGongmang === false, '세운 午 → 일공망 아님')
assert(f5.isYearGongmang === false, '세운 午 → 년공망 아님')
assert(f5.description === '', '공망 아닌 경우 설명 없음')

// 테스트 5-6: 세운 寅(2) → 공망 아님
const f6 = checkFortuneGongmang(0, 2, 6, 0, 2, [2, 6, 0, 9])
assert(f6.isDayGongmang === false, '세운 寅 → 공망 아님')
assert(f6.isYearGongmang === false, '세운 寅 → 공망 아님')

// ─── 6. 년공망 + 일공망 동시 ──────────────────────────

console.log('\n=== 6. 년공망 + 일공망 동시 ===')

// 특수 케이스: 년공망과 일공망이 겹치는 경우
// 년주 甲子(0,0) → 년공망 戌(10), 亥(11)
// 일주 甲子(0,0) → 일공망 戌(10), 亥(11)
// 세운 戌(10) → 년공망이자 일공망!
const f7 = checkFortuneGongmang(0, 0, 0, 0, 10, [0, 6, 0, 9])
assert(f7.isDayGongmang === true, '세운 戌 → 일공망')
assert(f7.isYearGongmang === true, '세운 戌 → 년공망')
assert(f7.description.includes('년공망이자 일공망'), '해석에 이중공망 포함')

// ─── 7. 해공: 충과 합 동시 ───────────────────────────

console.log('\n=== 7. 해공 복합 케이스 ===')

// 일주 甲辰(0,4) → 일공망 寅(2), 卯(3)
// 원국 지지에 申(8, 寅의 충상대) + 戌(10, 卯의 합상대) 있으면
// → 寅은 충으로 해공, 卯는 합으로 해공

// 세운 寅(2) → 일공망, 원국에 申(8) 있음 → 충해공
const f8 = checkFortuneGongmang(0, 0, 0, 4, 2, [0, 6, 4, 8])
assert(f8.isDayGongmang === true, '세운 寅 → 일공망')
assert(f8.isReleased === true, '세운 寅 → 해공됨')
assert(f8.releases.some(r => r.releaseType === '충'), '충으로 해공')

// 세운 卯(3) → 일공망, 원국에 戌(10) 있음 → 합해공
const f9 = checkFortuneGongmang(0, 0, 0, 4, 3, [0, 6, 4, 10])
assert(f9.isDayGongmang === true, '세운 卯 → 일공망')
assert(f9.isReleased === true, '세운 卯 → 해공됨')
assert(f9.releases.some(r => r.releaseType === '합'), '합으로 해공')

// ─── 8. 모든 12지지 순회 테스트 ──────────────────────

console.log('\n=== 8. 12지지 순회 — 각 순마다 정확히 2개 공망 ===')

// 6개 순 × 공망 2개 = 12지지 전부 커버 확인
const allGongmang = new Set<number>()
const sunStarts = [
  [0, 0],   // 甲子旬
  [0, 10],  // 甲戌旬
  [0, 8],   // 甲申旬
  [0, 6],   // 甲午旬
  [0, 4],   // 甲辰旬
  [0, 2],   // 甲寅旬
]

for (const [s, b] of sunStarts) {
  const pair = calculateGongmangPair(s, b)
  assert(pair.indices.length === 2, `${pair.sunName}: 공망 2개`)
  allGongmang.add(pair.indices[0])
  allGongmang.add(pair.indices[1])
}

assert(allGongmang.size === 12, '6개 순의 공망이 12지지 모두 커버')

// ─── 9. 같은 순 내 모든 간지가 동일 공망 ────────────

console.log('\n=== 9. 같은 순 내 동일 공망 확인 ===')

// 甲子旬: 甲子~癸酉 → 전부 공망 戌,亥
for (let i = 0; i < 10; i++) {
  const stemIdx = i
  const branchIdx = i
  const pair = calculateGongmangPair(stemIdx, branchIdx)
  assert(
    pair.indices[0] === 10 && pair.indices[1] === 11,
    `甲子旬[${i}]: 천간${stemIdx} 지지${branchIdx} → 공망 戌,亥`
  )
}

// 甲戌旬: 甲戌~癸未 → 전부 공망 申,酉
for (let i = 0; i < 10; i++) {
  const stemIdx = i
  const branchIdx = (10 + i) % 12
  const pair = calculateGongmangPair(stemIdx, branchIdx)
  assert(
    pair.indices[0] === 8 && pair.indices[1] === 9,
    `甲戌旬[${i}]: 천간${stemIdx} 지지${branchIdx} → 공망 申,酉`
  )
}

// ─── 결과 ─────────────────────────────────────────────

console.log('\n' + '='.repeat(50))
console.log(`총 ${passed + failed}건: ✅ ${passed}건 통과, ❌ ${failed}건 실패`)
if (failed === 0) {
  console.log('🎉 공망 모듈 전체 테스트 통과!')
} else {
  console.log('⚠️ 실패한 테스트가 있습니다!')
  process.exit(1)
}