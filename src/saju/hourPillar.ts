// src/saju/hourPillar.ts
// 시주(時柱) 계산 모듈
//
// 1. 보정된 시간으로 시지(時支)를 결정
// 2. 일간(日干)에 따라 시간(時干)을 결정

import { STEMS, BRANCHES, HOUR_STEM_START } from './constants'
import { Pillar } from './types'
import { getHourBranchIndex } from './hourBranch'

/**
 * 시주(時柱)를 계산합니다.
 * 
 * @param adjustedHour    보정된 시간 (0~23)
 * @param adjustedMinute  보정된 분 (0~59)
 * @param dayStemIndex    일간 천간 인덱스 (0~9)
 * @param useNextDayStem  야자시 시 다음일 일간 사용 여부
 * @returns 시주 (천간 + 지지)
 */
export function calculateHourPillar(
  adjustedHour: number,
  adjustedMinute: number,
  dayStemIndex: number,
  useNextDayStem: boolean = false
): Pillar {

  // 1. 시지 결정 (보정된 시간 기준)
  const branchIndex = getHourBranchIndex(adjustedHour, adjustedMinute)

  // 2. 시간 결정 (일간 기준)
  // 야자시이고 useNextDayStem이면 다음일 일간 사용
  const effectiveDayStemIndex = useNextDayStem
    ? (dayStemIndex + 1) % 10
    : dayStemIndex

  // 일간 그룹 (0~4)
  // 甲(0),己(5) → 그룹0 / 乙(1),庚(6) → 그룹1 / ...
  const dayGroup = effectiveDayStemIndex % 5

  // 해당 그룹의 子시 시작 천간
  const startStemIndex = HOUR_STEM_START[dayGroup]

  // 시지 인덱스만큼 더하여 시간 결정
  const stemIndex = (startStemIndex + branchIndex) % 10

  return {
    heavenlyStem: STEMS[stemIndex],
    earthlyBranch: BRANCHES[branchIndex]
  }
}