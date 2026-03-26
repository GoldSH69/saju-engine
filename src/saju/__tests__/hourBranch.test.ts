// src/saju/__tests__/hourBranch.test.ts
// 시간 보정 + 시지 결정 통합 테스트
// 핵심: 30분 보정 후 올바른 시지가 나오는지 확인

import { adjustTime } from '../timeAdjustment'
import { getHourBranchIndex } from '../hourBranch'
import { BRANCHES } from '../constants'

let passCount = 0
let failCount = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    passCount++
    console.log(`  ✅ ${name}`)
  } catch (error: any) {
    failCount++
    console.log(`  ❌ ${name}`)
    console.log(`     ${error.message}`)
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`기대값: ${expected}, 실제값: ${actual}`)
      }
    }
  }
}

/**
 * 표준시 입력 → 30분 보정 → 시지 판단까지 한번에 테스트
 */
function testFullFlow(
  inputHour: number,
  inputMinute: number,
  expectedBranchName: string,
  expectedBranchChar: string,
  adjustmentType: 'standard30' | 'none' = 'standard30'
) {
  const timeResult = adjustTime(inputHour, inputMinute, adjustmentType)
  const branchIndex = getHourBranchIndex(timeResult.adjustedHour, timeResult.adjustedMinute)
  const branch = BRANCHES[branchIndex]

  const inputTimeStr = `${String(inputHour).padStart(2, '0')}:${String(inputMinute).padStart(2, '0')}`
  const adjustedTimeStr = `${String(timeResult.adjustedHour).padStart(2, '0')}:${String(timeResult.adjustedMinute).padStart(2, '0')}`
  const label = adjustmentType === 'standard30'
    ? `표준시 ${inputTimeStr} → 보정 ${adjustedTimeStr} → ${expectedBranchChar}(${expectedBranchName})시`
    : `표준시 ${inputTimeStr} → 비보정 → ${expectedBranchChar}(${expectedBranchName})시`

  test(label, () => {
    expect(branch.name).toBe(expectedBranchName)
    expect(branch.char).toBe(expectedBranchChar)
  })
}

// ============================================
// 테스트 시작
// ============================================

console.log('')
console.log('========================================')
console.log(' 시간 보정 + 시지 결정 통합 테스트')
console.log('========================================')
console.log('')

// ------------------------------------------
// 1. 30분 보정 적용 시 시지 확인
// ------------------------------------------
console.log('[ 30분 보정 적용 - 시주 경계 변경 케이스 ]')
console.log('  (보정으로 인해 시지가 변경되는 경우)')
console.log('')

testFullFlow(7, 20, '묘', '卯', 'standard30')    // 07:20 → 06:50 → 묘시 ✅
testFullFlow(5, 20, '인', '寅', 'standard30')     // 05:20 → 04:50 → 인시
testFullFlow(9, 20, '진', '辰', 'standard30')     // 09:20 → 08:50 → 진시
testFullFlow(11, 20, '사', '巳', 'standard30')    // 11:20 → 10:50 → 사시
testFullFlow(13, 20, '오', '午', 'standard30')    // 13:20 → 12:50 → 오시
testFullFlow(15, 20, '미', '未', 'standard30')    // 15:20 → 14:50 → 미시
testFullFlow(17, 20, '신', '申', 'standard30')    // 17:20 → 16:50 → 신시
testFullFlow(19, 20, '유', '酉', 'standard30')    // 19:20 → 18:50 → 유시
testFullFlow(21, 20, '술', '戌', 'standard30')    // 21:20 → 20:50 → 술시
testFullFlow(23, 20, '해', '亥', 'standard30')    // 23:20 → 22:50 → 해시
testFullFlow(1, 20, '자', '子', 'standard30')     // 01:20 → 00:50 → 자시
testFullFlow(3, 20, '축', '丑', 'standard30')     // 03:20 → 02:50 → 축시

console.log('')

// ------------------------------------------
// 2. 30분 보정 적용 - 시지가 변경되지 않는 케이스
// ------------------------------------------
console.log('[ 30분 보정 적용 - 시지 유지 케이스 ]')
console.log('  (보정해도 시지가 같은 경우)')
console.log('')

testFullFlow(7, 40, '진', '辰', 'standard30')    // 07:40 → 07:10 → 진시 (변경 없음)
testFullFlow(5, 40, '묘', '卯', 'standard30')     // 05:40 → 05:10 → 묘시 (변경 없음)
testFullFlow(8, 0, '진', '辰', 'standard30')      // 08:00 → 07:30 → 진시 (경계)
testFullFlow(6, 0, '묘', '卯', 'standard30')      // 06:00 → 05:30 → 묘시 (경계)
testFullFlow(12, 0, '사', '巳', 'standard30')     // 12:00 → 11:30 → 사시 (경계)

console.log('')

// ------------------------------------------
// 3. 비보정 시 시지 확인 (비교용)
// ------------------------------------------
console.log('[ 보정 없음 - 비교용 ]')
console.log('')

testFullFlow(7, 20, '진', '辰', 'none')           // 07:20 → 그대로 → 진시
testFullFlow(5, 20, '묘', '卯', 'none')            // 05:20 → 그대로 → 묘시
testFullFlow(9, 20, '사', '巳', 'none')            // 09:20 → 그대로 → 사시

console.log('')

// ------------------------------------------
// 4. 날짜 변경 + 시지 확인
// ------------------------------------------
console.log('[ 날짜 변경 경계 + 시지 확인 ]')
console.log('')

testFullFlow(0, 10, '해', '亥', 'standard30')     // 00:10 → 23:40 (전날) → 해시
testFullFlow(0, 20, '해', '亥', 'standard30')     // 00:20 → 23:50 (전날) → 해시
testFullFlow(0, 30, '자', '子', 'standard30')     // 00:30 → 00:00 → 자시
testFullFlow(0, 40, '자', '子', 'standard30')     // 00:40 → 00:10 → 자시

console.log('')

// ------------------------------------------
// 결과 요약
// ------------------------------------------
console.log('========================================')
console.log(` 결과: ${passCount}개 통과, ${failCount}개 실패`)
console.log('========================================')
console.log('')

if (failCount > 0) {
  process.exit(1)
}