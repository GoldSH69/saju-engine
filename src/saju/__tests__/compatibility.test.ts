/**
 * 궁합 모듈 테스트
 * 실행: npx ts-node src/saju/__tests__/compatibility.test.ts
 */

import { calculateSaju, CalculateInput } from '../calculate'
import { analyzeCompatibility, CompatibilityResult } from '../compatibility'

let passed = 0
let failed = 0

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ ${msg}`)
    passed++
  } else {
    console.log(`  ❌ ${msg}`)
    failed++
  }
}

console.log('')
console.log('========================================')
console.log(' 궁합 모듈 테스트')
console.log('========================================')
console.log('')

// ─── 두 사람 사주 계산 ──────────────────────────────────

const input1: CalculateInput = {
  year: 1969, month: 3, day: 26,
  hour: 7, minute: 20, gender: 'male',
}
const input2: CalculateInput = {
  year: 1975, month: 8, day: 15,
  hour: 14, minute: 0, gender: 'female',
}

const result1 = calculateSaju(input1)
const result2 = calculateSaju(input2)

console.log('=== fiveElements 구조 확인 ===')
console.log(JSON.stringify(result1.fiveElements, null, 2).slice(0, 500))

console.log(`Person1: ${result1.dayStem.char}(${result1.dayStem.name}) ${result1.dayStem.elementKo}/${result1.dayStem.yinYangKo}`)
console.log(`  일주: ${result1.fourPillars.day.heavenlyStem.char}${result1.fourPillars.day.earthlyBranch.char}`)
console.log(`Person2: ${result2.dayStem.char}(${result2.dayStem.name}) ${result2.dayStem.elementKo}/${result2.dayStem.yinYangKo}`)
console.log(`  일주: ${result2.fourPillars.day.heavenlyStem.char}${result2.fourPillars.day.earthlyBranch.char}`)
console.log('')

// ─── 테스트 1: 기본 궁합 분석 ───────────────────────────

console.log('[테스트 1] 기본 궁합 분석')
const compat = analyzeCompatibility(result1, result2, '홍길동', '김영희')

assert(compat !== null && compat !== undefined, '결과 객체 존재')
assert(compat.totalScore >= 0 && compat.totalScore <= 100, `총점 범위: ${compat.totalScore}`)
assert(!!compat.grade, `등급: ${compat.grade}`)
assert(!!compat.summary, `요약: ${compat.summary}`)
assert(compat.advice.length > 0, `조언 ${compat.advice.length}개`)
console.log('')

// ─── 테스트 2: person 정보 ──────────────────────────────

console.log('[테스트 2] person 정보')
assert(compat.person1.name === '홍길동', `person1 이름: ${compat.person1.name}`)
assert(compat.person2.name === '김영희', `person2 이름: ${compat.person2.name}`)
assert(!!compat.person1.dayStem, `person1 일간: ${compat.person1.dayStem}`)
assert(!!compat.person2.dayStem, `person2 일간: ${compat.person2.dayStem}`)
console.log('')

// ─── 테스트 3: 5개 항목 점수 범위 ───────────────────────

console.log('[테스트 3] 5개 항목 점수 범위')
const items = compat.items

assert(items.dayElement.score >= 0 && items.dayElement.score <= 25,
  `① 일간오행: ${items.dayElement.score}/25 (${items.dayElement.grade})`)
assert(items.yongsinComplement.score >= 0 && items.yongsinComplement.score <= 20,
  `② 용신보완: ${items.yongsinComplement.score}/20 (${items.yongsinComplement.grade})`)
assert(items.tenStar.score >= 0 && items.tenStar.score <= 20,
  `③ 십성궁합: ${items.tenStar.score}/20 (${items.tenStar.grade})`)
assert(items.dayBranch.score >= 0 && items.dayBranch.score <= 25,
  `④ 일지궁합: ${items.dayBranch.score}/25 (${items.dayBranch.grade})`)
assert(items.elementBalance.score >= 0 && items.elementBalance.score <= 10,
  `⑤ 오행균형: ${items.elementBalance.score}/10 (${items.elementBalance.grade})`)
console.log('')

// ─── 테스트 4: 점수 합산 검증 ───────────────────────────

console.log('[테스트 4] 점수 합산 검증')
const sum = items.dayElement.score + items.yongsinComplement.score +
  items.tenStar.score + items.dayBranch.score + items.elementBalance.score
assert(compat.totalScore === sum, `총점(${compat.totalScore}) = 합산(${sum})`)
console.log('')

// ─── 테스트 5: 등급 유효성 ──────────────────────────────

console.log('[테스트 5] 등급 유효성')
const validGrades = ['천생연분', '좋은 궁합', '보통', '노력 필요', '주의 필요']
assert(validGrades.includes(compat.grade), `등급 유효: ${compat.grade}`)
console.log('')

// ─── 테스트 6: 각 항목 details ──────────────────────────

console.log('[테스트 6] 각 항목 details 존재')
assert(items.dayElement.details.length > 0, `① details ${items.dayElement.details.length}개`)
assert(items.yongsinComplement.details.length > 0, `② details ${items.yongsinComplement.details.length}개`)
assert(items.tenStar.details.length > 0, `③ details ${items.tenStar.details.length}개`)
assert(items.dayBranch.details.length > 0, `④ details ${items.dayBranch.details.length}개`)
assert(items.elementBalance.details.length > 0, `⑤ details ${items.elementBalance.details.length}개`)
console.log('')

// ─── 테스트 7: 같은 사람 궁합 ───────────────────────────

console.log('[테스트 7] 같은 사람 궁합 (비화)')
const selfCompat = analyzeCompatibility(result1, result1)
assert(selfCompat.items.dayElement.description.includes('비화'), `일간: 비화 관계`)
assert(selfCompat.items.dayBranch.score === 15, `일지: 같은 지지 = 15점 (실제: ${selfCompat.items.dayBranch.score})`)
console.log('')

// ─── 테스트 8: 이름 없이 동작 ───────────────────────────

console.log('[테스트 8] 이름 없이 동작')
const noName = analyzeCompatibility(result1, result2)
assert(noName.person1.name === undefined, `person1 이름 undefined`)
assert(noName.totalScore >= 0, `총점: ${noName.totalScore}`)
console.log('')

// ─── 상세 결과 출력 ─────────────────────────────────────

console.log('─── 상세 결과 ───')
console.log(`총점: ${compat.totalScore}/100 — ${compat.grade}`)
console.log(`요약: ${compat.summary}`)
console.log('')
Object.values(compat.items).forEach(item => {
  console.log(`  [${item.category}] ${item.score}/${item.maxScore} (${item.grade})`)
  console.log(`    ${item.description}`)
  item.details.forEach(d => console.log(`    · ${d}`))
  console.log('')
})
console.log('조언:')
compat.advice.forEach(a => console.log(`  💡 ${a}`))

// ─── 결과 ───────────────────────────────────────────────

console.log('')
console.log('========================================')
console.log(` 결과: ${passed}개 통과 / ${failed}개 실패`)
console.log('========================================')
console.log('')

if (failed > 0) process.exit(1)