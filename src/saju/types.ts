// src/saju/types.ts
// 사주 계산에 사용되는 모든 타입을 정의합니다.

/**
 * 천간 정보
 */
export interface StemInfo {
  index: number        // 0~9
  char: string         // "甲"
  name: string         // "갑"
  element: string      // "wood" | "fire" | "earth" | "metal" | "water"
  elementKo: string    // "목" | "화" | "토" | "금" | "수"
  yinYang: string      // "yang" | "yin"
  yinYangKo: string    // "양" | "음"
}

/**
 * 지지 정보
 */
export interface BranchInfo {
  index: number        // 0~11
  char: string         // "子"
  name: string         // "자"
  element: string      // "wood" | "fire" | "earth" | "metal" | "water"
  elementKo: string    // "목" | "화" | "토" | "금" | "수"
  yinYang: string      // "yang" | "yin"
  yinYangKo: string    // "양" | "음"
  originalTimeRange: string   // "23:00~01:00"
  adjustedTimeRange: string   // "23:30~01:30"
}

/**
 * 하나의 기둥 (천간 + 지지)
 */
export interface Pillar {
  heavenlyStem: StemInfo
  earthlyBranch: BranchInfo
}

/**
 * 지장간 정보
 */
export interface HiddenStemInfo {
  stem: StemInfo
  type: 'residual' | 'middle' | 'main'  // 여기 / 중기 / 본기
  weight: number                          // 0~1 비율
}

/**
 * 시간 보정 결과
 */
export interface TimeAdjustmentResult {
  originalHour: number
  originalMinute: number
  adjustedHour: number
  adjustedMinute: number
  adjustmentType: 'standard30' | 'trueSolar' | 'none'
  adjustmentMinutes: number
  description: string
  dateChanged: boolean
}

/**
 * 사주 계산 입력
 */
export interface SajuInput {
  solarOrLunar: 'solar' | 'lunar'
  year: number
  month: number
  day: number
  hour: number | null
  minute: number | null
  gender: 'male' | 'female'
  birthTimeUnknown: boolean
  leapMonth: boolean
  timeAdjustment: 'standard30' | 'trueSolar' | 'none'
  jasiType: 'night' | 'early'
}

/**
 * 오행 상세
 */
export interface FiveElementDetail {
  count: number
  weightedScore: number
  percentage: number
}

/**
 * 오행 분포 전체
 */
export interface FiveElements {
  wood: FiveElementDetail
  fire: FiveElementDetail
  earth: FiveElementDetail
  metal: FiveElementDetail
  water: FiveElementDetail
  dominant: string
  weakest: string
}

/**
 * 십성 상세
 */
export interface TenGodDetail {
  name: string
  nameKo: string
  count: number
  positions: string[]
}

/**
 * 신강/신약 판단 근거
 */
export interface StrengthFactor {
  factor: string
  effect: 'help' | 'restrain'
  weight: number
}

/**
 * 신강/신약 판단 결과
 */
export interface StrengthResult {
  result: 'strong' | 'weak' | 'neutral'
  score: number
  helpScore: number
  restrainScore: number
  factors: StrengthFactor[]
  summary: string
}

/**
 * 사주 계산 최종 결과
 */
export interface SajuResult {
  input: {
    solarDate: string
    lunarDate: string
    solarOrLunar: string
    leapMonth: boolean
    birthTime: string | null
    birthTimeUnknown: boolean
    gender: string
    timeAdjustment: string
    jasiType: string
  }
  timeAdjustmentInfo: TimeAdjustmentResult | null
  fourPillars: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar | null
  }
  hiddenStems: {
    year: HiddenStemInfo[]
    month: HiddenStemInfo[]
    day: HiddenStemInfo[]
    hour: HiddenStemInfo[] | null
  }
  fiveElements: FiveElements
  tenGods: Record<string, TenGodDetail>
  dayMaster: {
    stem: string
    name: string
    element: string
    yinYang: string
    description: string
  }
  strength: StrengthResult
  meta: {
    calculatedAt: string
    engineVersion: string
    solarTermUsed: string
    solarTermDateTime: string
  }
}