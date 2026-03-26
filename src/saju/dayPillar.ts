// src/saju/dayPillar.ts
// 일주(日柱) 계산 모듈
// 기준일: 2024-01-01 = 甲子(갑자) = 60갑자 인덱스 0 (만세력 검증 완료)

import { STEMS, BRANCHES } from './constants'
import { Pillar } from './types'

/**
 * 그레고리력 날짜 → 율리우스 적일(JDN) 변환
 */
export function getJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

/**
 * 일주(日柱)를 계산합니다.
 * 
 * 검증된 기준점:
 * - 2024-01-01 = 甲子(갑자) = 인덱스 0
 * - 1900-02-01 = 乙巳(을사) = 인덱스 41
 */
export function calculateDayPillar(year: number, month: number, day: number): Pillar {
  const jdn = getJulianDayNumber(year, month, day)
  const BASE_JDN = getJulianDayNumber(2024, 1, 1)
  const BASE_INDEX = 0

  let ganzhiIndex = ((jdn - BASE_JDN) + BASE_INDEX) % 60
  if (ganzhiIndex < 0) ganzhiIndex += 60

  const stemIndex = ganzhiIndex % 10
  const branchIndex = ganzhiIndex % 12

  return {
    heavenlyStem: STEMS[stemIndex],
    earthlyBranch: BRANCHES[branchIndex]
  }
}

/**
 * 60갑자 인덱스만 반환 (테스트/디버깅용)
 */
export function getDayGanzhiIndex(year: number, month: number, day: number): number {
  const jdn = getJulianDayNumber(year, month, day)
  const BASE_JDN = getJulianDayNumber(2024, 1, 1)
  const BASE_INDEX = 0
  let index = ((jdn - BASE_JDN) + BASE_INDEX) % 60
  if (index < 0) index += 60
  return index
}