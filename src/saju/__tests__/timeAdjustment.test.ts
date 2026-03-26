// src/saju/__tests__/timeAdjustment.test.ts
// 시간 보정 모듈 테스트

// 이 한 줄이 파일을 독립 모듈로 만들어줍니다 (충돌 방지)
export {}

import { adjustTime } from '../timeAdjustment'

// ============================================
// 테스트 도우미
// ============================================
let passCount = 0
let failCount = 0
const errors: string[] = []

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
    errors.push(`${name}: ${error.message}`)
  }
}

// ============================================
// 테스트 시작
// ============================================

console.log('')
console.log('========================================')
console.log(' 시간 보정 모듈 테스트')
console.log('========================================')
console.log('')

// ------------------------------------------
// 1. 30분 보정 기본 테스트
// ------------------------------------------
console.log('[ 30분 보정 기본 테스트 ]')

runTest('07:20 → 06:50 (묘시 영역)', () => {
  const result = adjustTime(7, 20, 'standard30')
  assertEqual(result.adjustedHour, 6, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('07:40 → 07:10 (진시 영역)', () => {
  const result = adjustTime(7, 40, 'standard30')
  assertEqual(result.adjustedHour, 7, '시')
  assertEqual(result.adjustedMinute, 10, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('05:20 → 04:50 (인시 영역)', () => {
  const result = adjustTime(5, 20, 'standard30')
  assertEqual(result.adjustedHour, 4, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('05:40 → 05:10 (묘시 영역)', () => {
  const result = adjustTime(5, 40, 'standard30')
  assertEqual(result.adjustedHour, 5, '시')
  assertEqual(result.adjustedMinute, 10, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('09:20 → 08:50 (진시 영역)', () => {
  const result = adjustTime(9, 20, 'standard30')
  assertEqual(result.adjustedHour, 8, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('11:20 → 10:50 (사시 영역)', () => {
  const result = adjustTime(11, 20, 'standard30')
  assertEqual(result.adjustedHour, 10, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('13:20 → 12:50 (오시 영역)', () => {
  const result = adjustTime(13, 20, 'standard30')
  assertEqual(result.adjustedHour, 12, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('15:20 → 14:50 (미시 영역)', () => {
  const result = adjustTime(15, 20, 'standard30')
  assertEqual(result.adjustedHour, 14, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('23:20 → 22:50 (해시 영역)', () => {
  const result = adjustTime(23, 20, 'standard30')
  assertEqual(result.adjustedHour, 22, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('23:40 → 23:10 (자시 영역)', () => {
  const result = adjustTime(23, 40, 'standard30')
  assertEqual(result.adjustedHour, 23, '시')
  assertEqual(result.adjustedMinute, 10, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

console.log('')

// ------------------------------------------
// 2. 날짜 변경 경계 테스트
// ------------------------------------------
console.log('[ 날짜 변경 경계 테스트 ]')

runTest('00:10 → 23:40 (전날로 변경)', () => {
  const result = adjustTime(0, 10, 'standard30')
  assertEqual(result.adjustedHour, 23, '시')
  assertEqual(result.adjustedMinute, 40, '분')
  assertEqual(result.dateChanged, true, '날짜변경')
})

runTest('00:20 → 23:50 (전날로 변경)', () => {
  const result = adjustTime(0, 20, 'standard30')
  assertEqual(result.adjustedHour, 23, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, true, '날짜변경')
})

runTest('00:29 → 23:59 (전날로 변경)', () => {
  const result = adjustTime(0, 29, 'standard30')
  assertEqual(result.adjustedHour, 23, '시')
  assertEqual(result.adjustedMinute, 59, '분')
  assertEqual(result.dateChanged, true, '날짜변경')
})

runTest('00:30 → 00:00 (날짜 변경 없음)', () => {
  const result = adjustTime(0, 30, 'standard30')
  assertEqual(result.adjustedHour, 0, '시')
  assertEqual(result.adjustedMinute, 0, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('00:40 → 00:10 (날짜 변경 없음)', () => {
  const result = adjustTime(0, 40, 'standard30')
  assertEqual(result.adjustedHour, 0, '시')
  assertEqual(result.adjustedMinute, 10, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

runTest('01:20 → 00:50 (날짜 변경 없음)', () => {
  const result = adjustTime(1, 20, 'standard30')
  assertEqual(result.adjustedHour, 0, '시')
  assertEqual(result.adjustedMinute, 50, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

console.log('')

// ------------------------------------------
// 3. 보정 없음 테스트
// ------------------------------------------
console.log('[ 보정 없음 테스트 ]')

runTest('보정 없음: 07:20 → 07:20 그대로', () => {
  const result = adjustTime(7, 20, 'none')
  assertEqual(result.adjustedHour, 7, '시')
  assertEqual(result.adjustedMinute, 20, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
  assertEqual(result.adjustmentMinutes, 0, '보정분')
})

runTest('보정 없음: 23:40 → 23:40 그대로', () => {
  const result = adjustTime(23, 40, 'none')
  assertEqual(result.adjustedHour, 23, '시')
  assertEqual(result.adjustedMinute, 40, '분')
  assertEqual(result.dateChanged, false, '날짜변경')
})

console.log('')

// ------------------------------------------
// 4. 보정 메타 정보 테스트
// ------------------------------------------
console.log('[ 보정 메타 정보 테스트 ]')

runTest('30분 보정 타입 확인', () => {
  const result = adjustTime(7, 20, 'standard30')
  assertEqual(result.adjustmentType, 'standard30', '보정타입')
  assertEqual(result.adjustmentMinutes, -30, '보정분')
  assertEqual(result.originalHour, 7, '원본시')
  assertEqual(result.originalMinute, 20, '원본분')
})

console.log('')

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
  errors.forEach(e => console.log(`   - ${e}`))
}
console.log('========================================')
console.log('')

if (failCount > 0) {
  process.exit(1)
}