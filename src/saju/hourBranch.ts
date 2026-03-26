// src/saju/hourBranch.ts
// 보정된 시간을 기반으로 시지(時支)를 결정합니다.

import { BRANCHES } from './constants'
import { BranchInfo } from './types'

/**
 * 보정된 시간을 기준으로 시지(時支) 인덱스를 반환합니다.
 *
 * 보정된 시간에 전통적 정시(正時) 경계를 적용합니다.
 * 子시: 23:00~01:00
 * 丑시: 01:00~03:00
 * 寅시: 03:00~05:00
 * ...
 *
 * 사용자가 30분 보정을 적용했다면,
 * 이미 보정이 완료된 시간이 들어옵니다.
 */
export function getHourBranchIndex(adjustedHour: number, adjustedMinute: number): number {
  const totalMinutes = adjustedHour * 60 + adjustedMinute

  // 子시: 23:00 ~ 01:00 (1380분 ~ 1440분 + 0분 ~ 60분)
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) return 0

  // 丑시: 01:00 ~ 03:00
  if (totalMinutes < 3 * 60) return 1

  // 寅시: 03:00 ~ 05:00
  if (totalMinutes < 5 * 60) return 2

  // 卯시: 05:00 ~ 07:00
  if (totalMinutes < 7 * 60) return 3

  // 辰시: 07:00 ~ 09:00
  if (totalMinutes < 9 * 60) return 4

  // 巳시: 09:00 ~ 11:00
  if (totalMinutes < 11 * 60) return 5

  // 午시: 11:00 ~ 13:00
  if (totalMinutes < 13 * 60) return 6

  // 未시: 13:00 ~ 15:00
  if (totalMinutes < 15 * 60) return 7

  // 申시: 15:00 ~ 17:00
  if (totalMinutes < 17 * 60) return 8

  // 酉시: 17:00 ~ 19:00
  if (totalMinutes < 19 * 60) return 9

  // 戌시: 19:00 ~ 21:00
  if (totalMinutes < 21 * 60) return 10

  // 亥시: 21:00 ~ 23:00
  return 11
}

/**
 * 보정된 시간을 기준으로 시지 정보를 반환합니다.
 */
export function getHourBranch(adjustedHour: number, adjustedMinute: number): BranchInfo {
  const index = getHourBranchIndex(adjustedHour, adjustedMinute)
  return BRANCHES[index]
}