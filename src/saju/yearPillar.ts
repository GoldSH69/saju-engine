// src/saju/yearPillar.ts
// 년주(年柱) 계산 모듈
//
// 기준: 입춘(立春)
// 입춘 이전 출생 → 전년도 간지
// 입춘 이후 출생 → 해당 연도 간지

import { STEMS, BRANCHES } from './constants'
import { Pillar } from './types'
import { getSolarTermDateTime } from '../data/solarTerms'

/**
 * 년주(年柱)를 계산합니다.
 *
 * @param year   양력 연도
 * @param month  양력 월
 * @param day    양력 일
 * @param hour   시 (0~23, 절입시각 비교용)
 * @param minute 분 (0~59)
 * @returns 년주 (천간 + 지지)
 */
export function calculateYearPillar(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Pillar {
  // 해당 연도의 입춘 시각 조회
  const lichunDate = getSolarTermDateTime(year, '입춘')

  // 출생일시를 Date로 변환
  const birthDate = new Date(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+09:00`
  )

  // 입춘 이전이면 전년도 간지
  let effectiveYear = year
  if (lichunDate && birthDate < lichunDate) {
    effectiveYear = year - 1
  }

  // 년주 천간: (연도 - 4) % 10
  let stemIndex = (effectiveYear - 4) % 10
  if (stemIndex < 0) stemIndex += 10

  // 년주 지지: (연도 - 4) % 12
  let branchIndex = (effectiveYear - 4) % 12
  if (branchIndex < 0) branchIndex += 12

  return {
    heavenlyStem: STEMS[stemIndex],
    earthlyBranch: BRANCHES[branchIndex]
  }
}