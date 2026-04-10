/**
 * 해석 템플릿 통합 모듈
 *
 * 9개 개별 템플릿을 통합하여 하나의 함수로 전체 해석을 생성합니다.
 *
 * 사용:
 *   import { generateInterpretation } from './interpretations'
 *   const interp = generateInterpretation(calculateResult)
 */

// ─── 개별 모듈 re-export ────────────────────────────────

export { DAY_STEM_TEXTS, getDayStemText } from './dayStemTexts'
export type { DayStemText } from './dayStemTexts'

export { FIVE_ELEMENT_TEXTS, getFiveElementText, analyzeFiveElementTexts } from './fiveElementTexts'
export type { FiveElementText } from './fiveElementTexts'

export { TEN_STAR_TEXTS, getTenStarText, analyzeTenStarTexts } from './tenStarTexts'
export type { TenStarText } from './tenStarTexts'

export { STRENGTH_TEXTS, getStrengthText } from './strengthTexts'
export type { StrengthText } from './strengthTexts'

export { DAILY_FORTUNE_TEXTS, getDailyFortuneText } from './dailyFortuneTexts'
export type { DailyFortuneText } from './dailyFortuneTexts'

export { MONTHLY_FORTUNE_TEXTS, getMonthlyFortuneText } from './monthlyFortuneTexts'
export type { MonthlyFortuneText } from './monthlyFortuneTexts'

export { YEARLY_FORTUNE_TEXTS, getYearlyFortuneText } from './yearlyFortuneTexts'
export type { YearlyFortuneText } from './yearlyFortuneTexts'

// ─── C2 상세 분석 모듈 re-export ────────────────────────

export { generateDetailedFiveElementAnalysis } from './detailedFiveElementTexts'
export type { DetailedFiveElementResult } from './detailedFiveElementTexts'

export { generateDetailedTenStarAnalysis } from './detailedTenStarTexts'
export type { DetailedTenStarResult } from './detailedTenStarTexts'

// ─── 통합 해석 결과 타입 ────────────────────────────────

import type { DetailedFiveElementResult } from './detailedFiveElementTexts'
import type { DetailedTenStarResult } from './detailedTenStarTexts'

export interface InterpretationResult {
  /** 일간 성격 해석 */
  dayStem: {
    char: string
    name: string
    symbol: string
    short: string
    detail: string
    keywords: string[]
  } | null

  /** 오행 과다/부족 해석 */
  fiveElements: {
    excess: { element: string; elementKo: string; count: number; short: string; detail: string }[]
    lack: { element: string; elementKo: string; count: number; short: string; detail: string }[]
  }

  /** 십성 분포 해석 */
  tenStars: {
    excess: { star: string; count: number; short: string; text: string }[]
    lack: { star: string; count: number; short: string; text: string }[]
    dominant: { star: string; count: number; short: string; detail: string; keywords: string[] } | null
  }

  /** 신강/신약 해석 */
  strength: {
    result: string
    symbol: string
    short: string
    detail: string
    career: string
    relationship: string
    wealth: string
    health: string
    advice: string
    keywords: string[]
  } | null

  /** 오늘의 운세 (일운 천간 십성 기반) */
  dailyFortune: {
    star: string
    theme: string
    rating: number
    ratingEmoji: string
    short: string
    detail: string
    advice: string
    lucky: {
      color: string
      direction: string
      number: string
      time: string
    }
    caution: string
  } | null

  /** 이번달 운세 (월운 천간 십성 기반) */
  monthlyFortune: {
    star: string
    theme: string
    rating: number
    ratingEmoji: string
    short: string
    detail: string
    advice: string
    focus: {
      career: string
      relationship: string
      health: string
      wealth: string
    }
    caution: string
  } | null

  /** 올해의 운세 (세운 천간 십성 기반) */
  yearlyFortune: {
    star: string
    theme: string
    rating: number
    ratingEmoji: string
    short: string
    detail: string
    advice: string
    outlook: {
      career: string
      relationship: string
      health: string
      wealth: string
    }
    keywords: [string, string, string]
    caution: string
  } | null

  /** C2: 가중치 기반 오행 상세 분석 (⑧ blur 영역) */
  detailedFiveElements: DetailedFiveElementResult | null

  /** C2: 위치별 십성 상세 분석 (⑨ blur 영역) */
  detailedTenStars: DetailedTenStarResult | null
}

// ─── 통합 해석 생성 함수 ────────────────────────────────

import { getDayStemText } from './dayStemTexts'
import { analyzeFiveElementTexts } from './fiveElementTexts'
import { analyzeTenStarTexts } from './tenStarTexts'
import { getStrengthText } from './strengthTexts'
import { getDailyFortuneText } from './dailyFortuneTexts'
import { getMonthlyFortuneText } from './monthlyFortuneTexts'
import { getYearlyFortuneText } from './yearlyFortuneTexts'
import { generateDetailedFiveElementAnalysis } from './detailedFiveElementTexts'
import { generateDetailedTenStarAnalysis } from './detailedTenStarTexts'

/**
 * 사주 계산 결과에서 전체 해석을 한번에 생성
 *
 * @param result calculateSaju()의 반환값 (또는 API 응답)
 * @returns InterpretationResult
 */
export function generateInterpretation(result: any): InterpretationResult {

  // ① 일간 성격
  let dayStem: InterpretationResult['dayStem'] = null
  const dayStemChar = result.dayStem?.char
    || result.fourPillars?.day?.heavenlyStem?.char
    || null

  if (dayStemChar) {
    const text = getDayStemText(dayStemChar)
    if (text) {
      dayStem = {
        char: text.char,
        name: text.name,
        symbol: text.symbol,
        short: text.short,
        detail: text.detail,
        keywords: text.keywords,
      }
    }
  }

  // ② 오행 과다/부족
  let fiveElements: InterpretationResult['fiveElements'] = { excess: [], lack: [] }

  const counts = result.fiveElements?.counts
    || extractFiveElementCounts(result)

  if (counts) {
    fiveElements = analyzeFiveElementTexts(counts)
  }

  // ③ 십성 분포
  let tenStars: InterpretationResult['tenStars'] = { excess: [], lack: [], dominant: null }

  const starCount = result.tenStars?.starCount
  if (starCount) {
    const analyzed = analyzeTenStarTexts(starCount)
    tenStars = {
      excess: analyzed.excess,
      lack: analyzed.lack,
      dominant: analyzed.dominant ? {
        star: analyzed.dominant.star,
        count: analyzed.dominant.count,
        short: analyzed.dominant.text.short,
        detail: analyzed.dominant.text.detail,
        keywords: analyzed.dominant.text.keywords,
      } : null,
    }
  }

  // ④ 신강/신약
  let strength: InterpretationResult['strength'] = null

  const strengthResult = result.strength?.result
    || result.strength?.strength
    || null

  if (strengthResult) {
    const text = getStrengthText(strengthResult)
    if (text) {
      strength = {
        result: text.result,
        symbol: text.symbol,
        short: text.short,
        detail: text.detail,
        career: text.career,
        relationship: text.relationship,
        wealth: text.wealth,
        health: text.health,
        advice: text.advice,
        keywords: text.keywords,
      }
    }
  }

  // ⑤ 오늘의 운세
  let dailyFortune: InterpretationResult['dailyFortune'] = null

  const dailyStemStar = result.fortune?.daily?.fortune?.tenStar?.stemStar
    || null

  if (dailyStemStar) {
    const text = getDailyFortuneText(dailyStemStar)
    if (text) {
      dailyFortune = {
        star: text.star,
        theme: text.theme,
        rating: text.rating,
        ratingEmoji: text.ratingEmoji,
        short: text.short,
        detail: text.detail,
        advice: text.advice,
        lucky: text.lucky,
        caution: text.caution,
      }
    }
  }

  // ⑥ 이번달 운세
  let monthlyFortune: InterpretationResult['monthlyFortune'] = null

  const monthlyStemStar = result.fortune?.monthly?.fortune?.tenStar?.stemStar
    || null

  if (monthlyStemStar) {
    const text = getMonthlyFortuneText(monthlyStemStar)
    if (text) {
      monthlyFortune = {
        star: text.star,
        theme: text.theme,
        rating: text.rating,
        ratingEmoji: text.ratingEmoji,
        short: text.short,
        detail: text.detail,
        advice: text.advice,
        focus: text.focus,
        caution: text.caution,
      }
    }
  }

  // ⑦ 올해의 운세
  let yearlyFortune: InterpretationResult['yearlyFortune'] = null

  const yearlyStemStar = result.fortune?.yearly?.fortune?.tenStar?.stemStar
    || null

  if (yearlyStemStar) {
    const text = getYearlyFortuneText(yearlyStemStar)
    if (text) {
      yearlyFortune = {
        star: text.star,
        theme: text.theme,
        rating: text.rating,
        ratingEmoji: text.ratingEmoji,
        short: text.short,
        detail: text.detail,
        advice: text.advice,
        outlook: text.outlook,
        keywords: text.keywords,
        caution: text.caution,
      }
    }
  }

  // ⑧ C2: 가중치 기반 오행 상세 분석
  let detailedFiveElements: DetailedFiveElementResult | null = null

  if (result.fiveElements?.weightedElements && result.fiveElements?.details) {
    try {
      detailedFiveElements = generateDetailedFiveElementAnalysis(result.fiveElements)
    } catch {
      // 상세 분석 실패 시 무시 (기본 해석은 유지)
    }
  }

  // ⑨ C2: 위치별 십성 상세 분석
  let detailedTenStars: DetailedTenStarResult | null = null

  if (result.tenStars?.categoryCount && result.tenStars?.yearStem) {
    try {
      detailedTenStars = generateDetailedTenStarAnalysis(result.tenStars)
    } catch {
      // 상세 분석 실패 시 무시
    }
  }

  return {
    dayStem,
    fiveElements,
    tenStars,
    strength,
    dailyFortune,
    monthlyFortune,
    yearlyFortune,
    detailedFiveElements,
    detailedTenStars,
  }
}

// ─── 헬퍼: 기둥에서 오행 카운트 추출 ────────────────────

function extractFiveElementCounts(result: any): Record<string, number> | null {
  const counts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }

  const fp = result.fourPillars
  if (!fp) return null

  const pillars = [fp.year, fp.month, fp.day, fp.hour]
  for (const p of pillars) {
    if (!p) continue
    const stemEl = p.heavenlyStem?.element
    const branchEl = p.earthlyBranch?.element
    if (stemEl && counts[stemEl] !== undefined) counts[stemEl]++
    if (branchEl && counts[branchEl] !== undefined) counts[branchEl]++
  }

  return counts
}

// ─── 개별 조회 헬퍼 (API에서 편리하게 사용) ─────────────

/**
 * 일간 한자로 성격 해석 조회 (short만)
 */
export function getShortDayStemInterpretation(dayStemChar: string): string {
  const text = getDayStemText(dayStemChar)
  return text?.short || ''
}

/**
 * 신강/신약 결과로 해석 조회 (short만)
 */
export function getShortStrengthInterpretation(strengthResult: string): string {
  const text = getStrengthText(strengthResult)
  return text?.short || ''
}

/**
 * 십성으로 오늘의 운세 조회 (short만)
 */
export function getShortDailyFortune(stemStar: string): string {
  const text = getDailyFortuneText(stemStar)
  return text?.short || ''
}

/**
 * 십성으로 이번달 운세 조회 (short만)
 */
export function getShortMonthlyFortune(stemStar: string): string {
  const text = getMonthlyFortuneText(stemStar)
  return text?.short || ''
}

/**
 * 십성으로 올해 운세 조회 (short만)
 */
export function getShortYearlyFortune(stemStar: string): string {
  const text = getYearlyFortuneText(stemStar)
  return text?.short || ''
}