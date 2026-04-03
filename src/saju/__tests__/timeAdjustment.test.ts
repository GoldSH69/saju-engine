// src/saju/__tests__/timeAdjustment.test.ts
export {}

import { adjustTime } from '../timeAdjustment'

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
console.log(' 시간 보정 모듈 테스트')
console.log('========================================')
console.log('')

console.log('[ 30분 보정 기본 테스트 ]')

runTest('07:20 → 06:50', () => {
  const r = adjustTime(7, 20, 'standard30')
  assertEqual(r.adjustedHour, 6, '시')
  assertEqual(r.adjustedMinute, 50, '분')
  assertEqual(r.dateChanged, false, '날짜변경')
})

runTest('07:40 → 07:10', () => {
  const r = adjustTime(7, 40, 'standard30')
  assertEqual(r.adjustedHour, 7, '시')
  assertEqual(r.adjustedMinute, 10, '분')
})

runTest('05:20 → 04:50', () => {
  const r = adjustTime(5, 20, 'standard30')
  assertEqual(r.adjustedHour, 4, '시')
  assertEqual(r.adjustedMinute, 50, '분')
})

runTest('05:40 → 05:10', () => {
  const r = adjustTime(5, 40, 'standard30')
  assertEqual(r.adjustedHour, 5, '시')
  assertEqual(r.adjustedMinute, 10, '분')
})

runTest('09:20 → 08:50', () => {
  const r = adjustTime(9, 20, 'standard30')
  assertEqual(r.adjustedHour, 8, '시')
  assertEqual(r.adjustedMinute, 50, '분')
})

runTest('11:20 → 10:50', () => {
  const r = adjustTime(11, 20, 'standard30')
  assertEqual(r.adjustedHour, 10, '시')
  assertEqual(r.adjustedMinute, 50, '분')
})

runTest('13:20 → 12:50', () => {
  const r = adjustTime(13, 20, 'standard30')
  assertEqual(r.adjustedHour, 12, '시')
  assertEqual(r.adjustedMinute, 50, '분')
})

runTest('15:20 → 14:50', () => {
  const r = adjustTime(15, 20, 'standard30')
  assertEqual(r.adjustedHour, 14, '시')
  assertEqual(r.adjustedMinute, 50, '분')
})

runTest('23:20 → 22:50', () => {
  const r = adjustTime(23, 20, 'standard30')
  assertEqual(r.adjustedHour, 22, '시')
  assertEqual(r.adjustedMinute, 50, '분')
})

runTest('23:40 → 23:10', () => {
  const r = adjustTime(23, 40, 'standard30')
  assertEqual(r.adjustedHour, 23, '시')
  assertEqual(r.adjustedMinute, 10, '분')
})

console.log('')
console.log('[ 날짜 변경 경계 테스트 ]')

runTest('00:10 → 23:40 (전날)', () => {
  const r = adjustTime(0, 10, 'standard30')
  assertEqual(r.adjustedHour, 23, '시')
  assertEqual(r.adjustedMinute, 40, '분')
  assertEqual(r.dateChanged, true, '날짜변경')
})

runTest('00:20 → 23:50 (전날)', () => {
  const r = adjustTime(0, 20, 'standard30')
  assertEqual(r.adjustedHour, 23, '시')
  assertEqual(r.adjustedMinute, 50, '분')
  assertEqual(r.dateChanged, true, '날짜변경')
})

runTest('00:29 → 23:59 (전날)', () => {
  const r = adjustTime(0, 29, 'standard30')
  assertEqual(r.adjustedHour, 23, '시')
  assertEqual(r.adjustedMinute, 59, '분')
  assertEqual(r.dateChanged, true, '날짜변경')
})

runTest('00:30 → 00:00 (변경없음)', () => {
  const r = adjustTime(0, 30, 'standard30')
  assertEqual(r.adjustedHour, 0, '시')
  assertEqual(r.adjustedMinute, 0, '분')
  assertEqual(r.dateChanged, false, '날짜변경')
})

runTest('00:40 → 00:10 (변경없음)', () => {
  const r = adjustTime(0, 40, 'standard30')
  assertEqual(r.adjustedHour, 0, '시')
  assertEqual(r.adjustedMinute, 10, '분')
  assertEqual(r.dateChanged, false, '날짜변경')
})

runTest('01:20 → 00:50 (변경없음)', () => {
  const r = adjustTime(1, 20, 'standard30')
  assertEqual(r.adjustedHour, 0, '시')
  assertEqual(r.adjustedMinute, 50, '분')
  assertEqual(r.dateChanged, false, '날짜변경')
})

console.log('')
console.log('[ 보정 없음 테스트 ]')

runTest('보정없음: 07:20 그대로', () => {
  const r = adjustTime(7, 20, 'none')
  assertEqual(r.adjustedHour, 7, '시')
  assertEqual(r.adjustedMinute, 20, '분')
  assertEqual(r.adjustmentMinutes, 0, '보정분')
})

runTest('보정없음: 23:40 그대로', () => {
  const r = adjustTime(23, 40, 'none')
  assertEqual(r.adjustedHour, 23, '시')
  assertEqual(r.adjustedMinute, 40, '분')
})

console.log('')
console.log('[ 메타 정보 테스트 ]')

runTest('30분 보정 메타 확인', () => {
  const r = adjustTime(7, 20, 'standard30')
  assertEqual(r.adjustmentType, 'standard30', '타입')
  assertEqual(r.adjustmentMinutes, -30, '보정분')
  assertEqual(r.originalHour, 7, '원본시')
  assertEqual(r.originalMinute, 20, '원본분')
})

console.log('')
console.log('========================================')
if (failCount === 0) {
  console.log(` ✅ 전체 통과: ${passCount}개 성공`)
} else {
  console.log(` ❌ 결과: ${passCount}개 통과, ${failCount}개 실패`)
  errorList.forEach(e => console.log(`   - ${e}`))
}
console.log('========================================')
console.log('')

if (failCount > 0) {
  process.exit(1)
}