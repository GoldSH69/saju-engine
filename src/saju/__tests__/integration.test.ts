// src/saju/__tests__/integration.test.ts
export {}

import { adjustTime } from '../timeAdjustment'
import { getHourBranchIndex } from '../hourBranch'
import { calculateDayPillar } from '../dayPillar'
import { calculateHourPillar } from '../hourPillar'
import { BRANCHES } from '../constants'

// ============================================
// 테스트 도우미
// ============================================
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

// ============================================
console.log('')
console.log('========================================')
console.log(' 통합 테스트 (기준일 수정 후)')
console.log('========================================')

// ------------------------------------------
// 1. 시간 보정 → 시지 결정
// ------------------------------------------
console.log('')
console.log('[ 1. 30분 보정 → 시지 결정 ]')
console.log('')

interface HourTestCase {
  inputHour: number
  inputMinute: number
  expectedBranch: string
  expectedChar: string
  adjustment: 'standard30' | 'none'
}

const hourTestCases: HourTestCase[] = [
  { inputHour: 7, inputMinute: 20, expectedBranch: '묘', expectedChar: '卯', adjustment: 'standard30' },
  { inputHour: 5, inputMinute: 20, expectedBranch: '인', expectedChar: '寅', adjustment: 'standard30' },
  { inputHour: 9, inputMinute: 20, expectedBranch: '진', expectedChar: '辰', adjustment: 'standard30' },
  { inputHour: 11, inputMinute: 20, expectedBranch: '사', expectedChar: '巳', adjustment: 'standard30' },
  { inputHour: 13, inputMinute: 20, expectedBranch: '오', expectedChar: '午', adjustment: 'standard30' },
  { inputHour: 15, inputMinute: 20, expectedBranch: '미', expectedChar: '未', adjustment: 'standard30' },
  { inputHour: 17, inputMinute: 20, expectedBranch: '신', expectedChar: '申', adjustment: 'standard30' },
  { inputHour: 19, inputMinute: 20, expectedBranch: '유', expectedChar: '酉', adjustment: 'standard30' },
  { inputHour: 21, inputMinute: 20, expectedBranch: '술', expectedChar: '戌', adjustment: 'standard30' },
  { inputHour: 23, inputMinute: 20, expectedBranch: '해', expectedChar: '亥', adjustment: 'standard30' },
  { inputHour: 1, inputMinute: 20, expectedBranch: '자', expectedChar: '子', adjustment: 'standard30' },
  { inputHour: 3, inputMinute: 20, expectedBranch: '축', expectedChar: '丑', adjustment: 'standard30' },
  { inputHour: 7, inputMinute: 40, expectedBranch: '진', expectedChar: '辰', adjustment: 'standard30' },
  { inputHour: 8,  inputMinute: 0, expectedBranch: '진', expectedChar: '辰', adjustment: 'standard30' },
  { inputHour: 6,  inputMinute: 0, expectedBranch: '묘', expectedChar: '卯', adjustment: 'standard30' },
  { inputHour: 12, inputMinute: 0, expectedBranch: '오', expectedChar: '午', adjustment: 'standard30' },
  { inputHour: 7, inputMinute: 20, expectedBranch: '진', expectedChar: '辰', adjustment: 'none' },
  { inputHour: 5, inputMinute: 20, expectedBranch: '묘', expectedChar: '卯', adjustment: 'none' },
  { inputHour: 0, inputMinute: 10, expectedBranch: '자', expectedChar: '子', adjustment: 'standard30' },
  { inputHour: 0, inputMinute: 30, expectedBranch: '자', expectedChar: '子', adjustment: 'standard30' },
]

for (const tc of hourTestCases) {
  const timeStr = `${String(tc.inputHour).padStart(2, '0')}:${String(tc.inputMinute).padStart(2, '0')}`
  const adjLabel = tc.adjustment === 'standard30' ? '보정' : '비보정'
  const label = `${timeStr} (${adjLabel}) → ${tc.expectedChar}(${tc.expectedBranch})시`

  runTest(label, () => {
    const timeResult = adjustTime(tc.inputHour, tc.inputMinute, tc.adjustment)
    const branchIndex = getHourBranchIndex(timeResult.adjustedHour, timeResult.adjustedMinute)
    const branch = BRANCHES[branchIndex]
    assertEqual(branch.name, tc.expectedBranch, '시지이름')
    assertEqual(branch.char, tc.expectedChar, '시지한자')
  })
}

// ------------------------------------------
// 2. 일주 계산 - 만세력 검증 완료 데이터
// ------------------------------------------
console.log('')
console.log('[ 2. 일주(日柱) 계산 - 만세력 검증 데이터 10건 ]')
console.log('')

interface DayPillarTestCase {
  year: number
  month: number
  day: number
  expectedStem: string
  expectedBranch: string
  label: string
}

const dayPillarCases: DayPillarTestCase[] = [
  { year: 2024, month: 1, day: 1, expectedStem: '甲', expectedBranch: '子', label: '2024-01-01 = 甲子(갑자) [기준일]' },
  { year: 2024, month: 2, day: 4, expectedStem: '戊', expectedBranch: '戌', label: '2024-02-04 = 戊戌(무술)' },
  { year: 2000, month: 1, day: 1, expectedStem: '戊', expectedBranch: '午', label: '2000-01-01 = 戊午(무오)' },
  { year: 1990, month: 5, day: 15, expectedStem: '庚', expectedBranch: '辰', label: '1990-05-15 = 庚辰(경진)' },
  { year: 1985, month: 10, day: 23, expectedStem: '乙', expectedBranch: '未', label: '1985-10-23 = 乙未(을미)' },
  { year: 1970, month: 1, day: 1, expectedStem: '辛', expectedBranch: '巳', label: '1970-01-01 = 辛巳(신사)' },
  { year: 2023, month: 12, day: 31, expectedStem: '癸', expectedBranch: '亥', label: '2023-12-31 = 癸亥(계해)' },
  { year: 1900, month: 2, day: 1, expectedStem: '乙', expectedBranch: '巳', label: '1900-02-01 = 乙巳(을사)' },
  { year: 1950, month: 6, day: 15, expectedStem: '辛', expectedBranch: '巳', label: '1950-06-15 = 辛巳(신사)' },
  { year: 1980, month: 3, day: 20, expectedStem: '壬', expectedBranch: '辰', label: '1980-03-20 = 壬辰(임진)' },
]

for (const tc of dayPillarCases) {
  runTest(tc.label, () => {
    const result = calculateDayPillar(tc.year, tc.month, tc.day)
    assertEqual(result.heavenlyStem.char, tc.expectedStem, '천간')
    assertEqual(result.earthlyBranch.char, tc.expectedBranch, '지지')
  })
}

// ------------------------------------------
// 3. 시주 계산 (일간별 기본 검증)
// ------------------------------------------
console.log('')
console.log('[ 3. 시주(時柱) 계산 - 일간별 기본 검증 ]')
console.log('')

runTest('일간 甲 + 子시 = 甲子', () => {
  const result = calculateHourPillar(0, 0, 0, false)
  assertEqual(result.heavenlyStem.char, '甲', '시간')
  assertEqual(result.earthlyBranch.char, '子', '시지')
})

runTest('일간 甲 + 丑시 = 乙丑', () => {
  const result = calculateHourPillar(2, 0, 0, false)
  assertEqual(result.heavenlyStem.char, '乙', '시간')
  assertEqual(result.earthlyBranch.char, '丑', '시지')
})

runTest('일간 甲 + 寅시 = 丙寅', () => {
  const result = calculateHourPillar(4, 0, 0, false)
  assertEqual(result.heavenlyStem.char, '丙', '시간')
  assertEqual(result.earthlyBranch.char, '寅', '시지')
})

runTest('일간 甲 + 卯시 = 丁卯', () => {
  const result = calculateHourPillar(6, 0, 0, false)
  assertEqual(result.heavenlyStem.char, '丁', '시간')
  assertEqual(result.earthlyBranch.char, '卯', '시지')
})

runTest('일간 乙 + 子시 = 丙子', () => {
  const result = calculateHourPillar(0, 0, 1, false)
  assertEqual(result.heavenlyStem.char, '丙', '시간')
  assertEqual(result.earthlyBranch.char, '子', '시지')
})

runTest('일간 丙 + 子시 = 戊子', () => {
  const result = calculateHourPillar(0, 0, 2, false)
  assertEqual(result.heavenlyStem.char, '戊', '시간')
  assertEqual(result.earthlyBranch.char, '子', '시지')
})

runTest('일간 丁 + 子시 = 庚子', () => {
  const result = calculateHourPillar(0, 0, 3, false)
  assertEqual(result.heavenlyStem.char, '庚', '시간')
  assertEqual(result.earthlyBranch.char, '子', '시지')
})

runTest('일간 戊 + 子시 = 壬子', () => {
  const result = calculateHourPillar(0, 0, 4, false)
  assertEqual(result.heavenlyStem.char, '壬', '시간')
  assertEqual(result.earthlyBranch.char, '子', '시지')
})

runTest('일간 己 + 子시 = 甲子', () => {
  const result = calculateHourPillar(0, 0, 5, false)
  assertEqual(result.heavenlyStem.char, '甲', '시간')
  assertEqual(result.earthlyBranch.char, '子', '시지')
})

// ------------------------------------------
// 4. 전체 흐름 (30분 보정 + 일주 + 시주)
// ------------------------------------------
console.log('')
console.log('[ 4. 전체 흐름: 30분 보정 + 일주 + 시주 출력 ]')
console.log('  (만세력과 비교용)')
console.log('')

const fullTestDates = [
  { y: 1990, m: 5, d: 15, h: 7, min: 20 },
  { y: 2000, m: 1, d: 1,  h: 12, min: 0 },
  { y: 2024, m: 2, d: 4,  h: 9, min: 30 },
  { y: 1985, m: 10, d: 23, h: 23, min: 20 },
  { y: 2024, m: 1, d: 1,  h: 7, min: 20 },
]

for (const d of fullTestDates) {
  const timeResult = adjustTime(d.h, d.min, 'standard30')

  let effYear = d.y
  let effMonth = d.m
  let effDay = d.d
  if (timeResult.dateChanged) {
    const tempDate = new Date(d.y, d.m - 1, d.d)
    tempDate.setDate(tempDate.getDate() - 1)
    effYear = tempDate.getFullYear()
    effMonth = tempDate.getMonth() + 1
    effDay = tempDate.getDate()
  }

  const dayPillar = calculateDayPillar(effYear, effMonth, effDay)
  const hourPillar = calculateHourPillar(
    timeResult.adjustedHour,
    timeResult.adjustedMinute,
    dayPillar.heavenlyStem.index,
    false
  )

  const dateStr = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  const timeStr = `${String(d.h).padStart(2, '0')}:${String(d.min).padStart(2, '0')}`
  const adjTimeStr = `${String(timeResult.adjustedHour).padStart(2, '0')}:${String(timeResult.adjustedMinute).padStart(2, '0')}`

  console.log(`  📋 ${dateStr} ${timeStr} → 보정: ${adjTimeStr}`)
  console.log(`     일주: ${dayPillar.heavenlyStem.char}${dayPillar.earthlyBranch.char}(${dayPillar.heavenlyStem.name}${dayPillar.earthlyBranch.name})`)
  console.log(`     시주: ${hourPillar.heavenlyStem.char}${hourPillar.earthlyBranch.char}(${hourPillar.heavenlyStem.name}${hourPillar.earthlyBranch.name})`)
  console.log(`     시지: ${hourPillar.earthlyBranch.char}(${hourPillar.earthlyBranch.name})시`)
  console.log('')
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

if (failCount > 0) {
  process.exit(1)
}