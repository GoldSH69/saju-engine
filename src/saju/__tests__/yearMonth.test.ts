// src/saju/__tests__/yearMonth.test.ts
export {}

import { calculateYearPillar } from '../yearPillar'
import { calculateMonthPillar } from '../monthPillar'

let passCount = 0
let failCount = 0
const errorList: string[] = []

function assertEqual(actual: any, expected: any, label: string): void {
  if (actual !== expected) {
    throw new Error(`[${label}] 기대값: ${expected}, 실제값: ${actual}`)
  }
}

function runTest(name: string, fn: () => void): void {
  try {
    fn()
    passCount++
    console.log(`  ✅ ${name}`)
  } catch (error: any) {
    failCount++
    console.log(`  ❌ ${name}`)
    console.log(`     ${error.message}`)
    errorList.push(`${name}: ${error.message}`)
  }
}

console.log('')
console.log('========================================')
console.log(' 년주 + 월주 계산 테스트')
console.log('========================================')

// ------------------------------------------
// 1. 년주 계산
// ------------------------------------------
console.log('')
console.log('[ 1. 년주(年柱) 계산 ]')
console.log('')

interface YearTestCase {
  year: number
  month: number
  day: number
  expectedStem: string
  expectedBranch: string
  label: string
}

const yearCases: YearTestCase[] = [
  { year: 2024, month: 3, day: 15, expectedStem: '甲', expectedBranch: '辰', label: '2024-03-15 = 甲辰(갑진)년' },
  { year: 2023, month: 6, day: 15, expectedStem: '癸', expectedBranch: '卯', label: '2023-06-15 = 癸卯(계묘)년' },
  { year: 2000, month: 5, day: 1, expectedStem: '庚', expectedBranch: '辰', label: '2000-05-01 = 庚辰(경진)년' },
  { year: 1990, month: 5, day: 15, expectedStem: '庚', expectedBranch: '午', label: '1990-05-15 = 庚午(경오)년' },
  { year: 1985, month: 10, day: 23, expectedStem: '乙', expectedBranch: '丑', label: '1985-10-23 = 乙丑(을축)년' },
  { year: 1970, month: 6, day: 1, expectedStem: '庚', expectedBranch: '戌', label: '1970-06-01 = 庚戌(경술)년' },
  { year: 2024, month: 1, day: 15, expectedStem: '癸', expectedBranch: '卯', label: '2024-01-15(입춘 전) = 癸卯(계묘)년' },
  { year: 2000, month: 1, day: 1, expectedStem: '己', expectedBranch: '卯', label: '2000-01-01(입춘 전) = 己卯(기묘)년' },
  { year: 1990, month: 1, day: 30, expectedStem: '己', expectedBranch: '巳', label: '1990-01-30(입춘 전) = 己巳(기사)년' },
]

for (const tc of yearCases) {
  runTest(tc.label, () => {
    const result = calculateYearPillar(tc.year, tc.month, tc.day)
    assertEqual(result.heavenlyStem.char, tc.expectedStem, '천간')
    assertEqual(result.earthlyBranch.char, tc.expectedBranch, '지지')
  })
}

// 입춘 당일 시간 경계 테스트
console.log('')
console.log('  [ 입춘 당일 시간 경계 ]')
console.log('')

runTest('2024-02-04 10:00 (입춘 10:27 전) = 癸卯', () => {
  const result = calculateYearPillar(2024, 2, 4, 10, 0)
  assertEqual(result.heavenlyStem.char, '癸', '천간')
  assertEqual(result.earthlyBranch.char, '卯', '지지')
})

runTest('2024-02-04 18:00 (입춘 17:26 후) = 甲辰', () => {
  const result = calculateYearPillar(2024, 2, 4, 18, 0)
  assertEqual(result.heavenlyStem.char, '甲', '천간')
  assertEqual(result.earthlyBranch.char, '辰', '지지')
})

runTest('1990-02-04 05:00 (입춘 05:46 전) = 己巳', () => {
  const result = calculateYearPillar(1990, 2, 4, 5, 0)
  assertEqual(result.heavenlyStem.char, '己', '천간')
  assertEqual(result.earthlyBranch.char, '巳', '지지')
})

runTest('1990-02-04 12:00 (입춘 11:13 후) = 庚午', () => {
  const result = calculateYearPillar(1990, 2, 4, 12, 0)
  assertEqual(result.heavenlyStem.char, '庚', '천간')
  assertEqual(result.earthlyBranch.char, '午', '지지')
})

// ------------------------------------------
// 2. 월주 계산 (출력 → 만세력 교차 검증)
// ------------------------------------------
console.log('')
console.log('[ 2. 월주(月柱) 교차 검증용 출력 ]')
console.log('')

const monthCheckDates = [
  { y: 2024, m: 1, d: 15, h: 12, min: 0, label: '2024-01-15 12:00' },
  { y: 2024, m: 2, d: 3, h: 12, min: 0, label: '2024-02-03 12:00 (입춘 전)' },
  { y: 2024, m: 2, d: 5, h: 12, min: 0, label: '2024-02-05 12:00 (입춘 후)' },
  { y: 2024, m: 3, d: 15, h: 12, min: 0, label: '2024-03-15 12:00' },
  { y: 2024, m: 6, d: 15, h: 12, min: 0, label: '2024-06-15 12:00' },
  { y: 1990, m: 5, d: 15, h: 7, min: 0, label: '1990-05-15 07:00' },
  { y: 1985, m: 10, d: 23, h: 14, min: 0, label: '1985-10-23 14:00' },
  { y: 2000, m: 1, d: 1, h: 12, min: 0, label: '2000-01-01 12:00' },
  { y: 1970, m: 6, d: 1, h: 12, min: 0, label: '1970-06-01 12:00' },
]

for (const d of monthCheckDates) {
  try {
    const yearPillar = calculateYearPillar(d.y, d.m, d.d, d.h, d.min)
    const monthResult = calculateMonthPillar(d.y, d.m, d.d, d.h, d.min, yearPillar.heavenlyStem.index)

    console.log(`  📋 ${d.label}`)
    console.log(`     년주: ${yearPillar.heavenlyStem.char}${yearPillar.earthlyBranch.char}(${yearPillar.heavenlyStem.name}${yearPillar.earthlyBranch.name})`)
    console.log(`     월주: ${monthResult.pillar.heavenlyStem.char}${monthResult.pillar.earthlyBranch.char}(${monthResult.pillar.heavenlyStem.name}${monthResult.pillar.earthlyBranch.name})`)
    console.log(`     절기: ${monthResult.solarTermName}`)
    console.log('')
  } catch (error: any) {
    console.log(`  ⚠️ ${d.label}: ${error.message}`)
    console.log('')
  }
}

// ------------------------------------------
// 결과 요약
// ------------------------------------------
console.log('========================================')
if (failCount === 0) {
  console.log(` ✅ 전체 통과: ${passCount}개 성공`)
} else {
  console.log(` ❌ 결과: ${passCount}개 통과, ${failCount}개 실패`)
  console.log('')
  console.log(' 실패 목록:')
  errorList.forEach(e => console.log(`   - ${e}`))
}
console.log('========================================')
console.log('')
console.log('📌 위의 📋 년주/월주 결과를 만세력 사이트와 비교하세요!')
console.log('')

if (failCount > 0) {
  process.exit(1)
}