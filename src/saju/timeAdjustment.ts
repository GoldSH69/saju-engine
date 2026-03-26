// src/saju/timeAdjustment.ts
// 한국 표준시 30분 보정 및 진태양시 보정을 처리합니다.

import { TimeAdjustmentResult } from './types'

/**
 * 시간 보정을 적용합니다.
 *
 * 한국 표준시는 동경 135도 기준이지만,
 * 실제 한반도(서울)는 동경 127.5도에 위치하여
 * 약 30분의 시차가 발생합니다.
 *
 * 기본 정책: 30분을 빼서 실제 태양시에 가깝게 보정
 */
export function adjustTime(
  hour: number,
  minute: number,
  adjustmentType: 'standard30' | 'trueSolar' | 'none',
  year?: number,
  month?: number,
  day?: number
): TimeAdjustmentResult {

  // 보정 없음
  if (adjustmentType === 'none') {
    return {
      originalHour: hour,
      originalMinute: minute,
      adjustedHour: hour,
      adjustedMinute: minute,
      adjustmentType: 'none',
      adjustmentMinutes: 0,
      description: '보정 없음 (동경 135도 표준시 기준)',
      dateChanged: false
    }
  }

  // 보정할 분 수 결정
  let correctionMinutes: number

  if (adjustmentType === 'standard30') {
    // 한국 표준시 30분 보정
    correctionMinutes = 30
  } else {
    // 진태양시 정밀 보정
    const longitudeCorrection = (135 - 126.98) * 4  // 약 32.08분
    const eot = getEquationOfTime(year!, month!, day!)
    correctionMinutes = Math.round(longitudeCorrection + eot)
  }

  // 보정 적용 (입력 시간에서 보정 분을 뺌)
  let totalMinutes = hour * 60 + minute - correctionMinutes
  let dateChanged = false

  // 자정을 넘어가는 경우 처리
  if (totalMinutes < 0) {
    totalMinutes += 1440  // 1440분 = 24시간
    dateChanged = true     // 전날로 이동
  } else if (totalMinutes >= 1440) {
    totalMinutes -= 1440
    // 이 경우는 거의 발생하지 않음
  }

  const adjustedHour = Math.floor(totalMinutes / 60)
  const adjustedMinute = totalMinutes % 60

  const description = adjustmentType === 'standard30'
    ? '한국 표준시 30분 보정 (동경 127.5도 기준)'
    : `서울 기준 진태양시 보정 (${correctionMinutes}분 보정)`

  return {
    originalHour: hour,
    originalMinute: minute,
    adjustedHour,
    adjustedMinute,
    adjustmentType,
    adjustmentMinutes: -correctionMinutes,
    description,
    dateChanged
  }
}

/**
 * 균시차(Equation of Time) 계산
 * 진태양시 보정에 사용됩니다.
 * 날짜에 따라 -14분 ~ +16분 변동
 */
function getEquationOfTime(year: number, month: number, day: number): number {
  const n = getDayOfYear(year, month, day)
  const b = (360 / 365) * (n - 81) * (Math.PI / 180)
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  return Math.round(eot)
}

/**
 * 해당 연도의 몇 번째 날인지 계산
 */
function getDayOfYear(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day)
  const start = new Date(year, 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}