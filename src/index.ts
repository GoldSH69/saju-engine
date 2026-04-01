/**
 * saju-engine 진입점
 * 모든 공개 API를 여기서 re-export
 */

// ─── 핵심 계산 함수 ─────────────────────────────────────
export {
  calculateSaju,
  formatSajuResult,
  toResultJson,
} from './saju/calculate'

// ─── 타입 (CalculateInput / CalculateResult 등) ─────────
export type {
  CalculateInput,
  CalculateResult,
  HiddenStemsResult,
  FortuneResult,
} from './saju/calculate'

// ─── 기본 타입 ──────────────────────────────────────────
export type {
  StemInfo,
  BranchInfo,
  Pillar,
  TimeAdjustmentResult,
  TenStar,
  TenStarCategory,
  TenStarInfo,
  TenStarResult,
  HiddenStemEntry,
  HiddenStemInfo,
  FiveElementCount,
  FiveElementAnalysis,
  StrengthDetail,
  StrengthResult,
  StrengthFactor,
} from './saju/types'

// ─── 상수 (필요 시 프론트에서 참조) ─────────────────────
export {
  STEMS,
  BRANCHES,
  ELEMENT_KO,
} from './saju/constants'

// ─── 개별 모듈 (고급 사용) ──────────────────────────────
export { adjustTime } from './saju/timeAdjustment'
export { getHourBranchIndex } from './saju/hourBranch'
export { getJulianDayNumber } from './saju/dayPillar'
export { calculateHourPillar } from './saju/hourPillar'
export { calculateYearPillar } from './saju/yearPillar'
export { calculateMonthPillar } from './saju/monthPillar'
export { getHiddenStems } from './saju/hiddenStems'
export { analyzeFiveElements } from './saju/fiveElements'
export { getTenStar, getTenStarCategory } from './saju/tenStars'
export { calculateStrength } from './saju/strengthScore'
export { calculateDaewoon } from './saju/daewoon'
export {
  calculateYearlyFortune,
  calculateMonthlyFortune,
  calculateDailyFortune,
} from './saju/fortune'
export { calculateYongsin } from './saju/yongsin'

// ─── 대운/운세 타입 ─────────────────────────────────────
export type { DaewoonResult, DaewoonOptions } from './saju/daewoon'
export type {
  YearlyFortuneResult,
  MonthlyFortuneResult,
  DailyFortuneResult,
} from './saju/fortune'
export type {
  YongsinResult,
  YongsinMethod,
  YongsinOptions,
} from './saju/yongsin'

// ─── 충합형해 ───────────────────────────────────────────
export type {
  StemCombination,
  BranchClash,
  BranchCombine,
  BranchPunishment,
  BranchHarm,
  InteractionResult,
  FortuneTenStar,
} from './saju/interactions'
export { analyzeInteractions } from './saju/interactions'