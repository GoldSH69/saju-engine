// src/saju/hourBranch.ts
// 보정된 시간을 기반으로 시지(時支)를 결정합니다.

import { BRANCHES } from './constants'
import { BranchInfo } from './types'

/**
 * 보정된 시간으로 시지(時支) 인덱스를 반환합니다.
 * 
 * 이미 보정이 완료된 시간이 들어옵니다.
 * 보정된 시간에 전통적 정시(正時) 경계를 적용합니다.
 * 
 * 子시: 23:00 ~ 01:00
 * 丑시: 01:00 ~ 03:00
 * 寅시: 03:00 ~ 05:00
 * 卯시: 05:00 ~ 07:00
 * 辰시: 07:00 ~ 09:00
 * 巳시: 09:00 ~ 11:00
 * 午시: 11:00 ~ 13:00
 * 未시: 13:00 ~ 15:00
 * 申시: 15:00 ~ 17:00
 * 酉시: 17:00 ~ 19:00
 * 戌시: 19:00 ~ 21:00
 * 亥시: 21:00 ~ 23:00
 */
export function getHourBranchIndex(adjustedHour: number, adjustedMinute: number): number {
  const totalMinutes = adjustedHour * 60 + adjustedMinute

  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) return 0   // 子
  if (totalMinutes < 3 * 60) return 1   // 丑
  if (totalMinutes < 5 * 60) return 2   // 寅
  if (totalMinutes < 7 * 60) return 3   // 卯
  if (totalMinutes < 9 * 60) return 4   // 辰
  if (totalMinutes < 11 * 60) return 5  // 巳
  if (totalMinutes < 13 * 60) return 6  // 午
  if (totalMinutes < 15 * 60) return 7  // 未
  if (totalMinutes < 17 * 60) return 8  // 申
  if (totalMinutes < 19 * 60) return 9  // 酉
  if (totalMinutes < 21 * 60) return 10 // 戌
  return 11 // 亥
}

/**
 * 보정된 시간으로 시지 정보 객체를 반환합니다.
 */
export function getHourBranch(adjustedHour: number, adjustedMinute: number): BranchInfo {
  const index = getHourBranchIndex(adjustedHour, adjustedMinute)
  return BRANCHES[index]
}