/**
 * fortune.ts - 세운(歲運) / 월운(月運) / 일운(日運) 계산 모듈
 *
 * 세운: 특정 연도의 간지 → 원국과의 상호작용
 * 월운: 특정 월의 간지 → 원국과의 상호작용
 * 일운: 특정 일의 간지 → 원국과의 상호작용
 *
 * 충합형해 로직은 interactions.ts 공통 모듈 사용
 */

import { STEMS, BRANCHES } from './constants'
import { Pillar, StemInfo, BranchInfo } from './types'
import { calculateMonthPillar } from './monthPillar'
import { getHiddenStems, HiddenStemEntry } from './hiddenStems'
import {
  InteractionResult,
  FortuneTenStar,
  analyzeInteractions,
  getInteractionTenStar,
} from './interactions'

// ─── 타입 re-export (하위호환) ───────────────────────────
// fortune.ts를 통해 DaewoonTenStar를 import하던 코드 호환
export type { InteractionResult, FortuneTenStar }

// DaewoonTenStar 하위호환 별칭 (fortune.ts에서도 export 유지)
export type DaewoonTenStar = FortuneTenStar

// ─── 일주 계산 (내부용) ──────────────────────────────────

function calculateDayPillarInternal(year: number, month: number, day: number): { stemIndex: number; branchIndex: number } {
  const baseDate = new Date('2024-01-01T00:00:00+09:00')
  const targetDate = new Date(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+09:00`
  )
  const diffDays = Math.round((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  let idx = diffDays % 60
  if (idx < 0) idx += 60
  return { stemIndex: idx % 10, branchIndex: idx % 12 }
}

// ─── 타입 정의 ───────────────────────────────────────────

/** 공통 운세 항목 */
export interface FortuneEntry {
  stemIndex: number
  branchIndex: number
  stem: StemInfo
  branch: BranchInfo
  ganjiChar: string
  ganjiName: string
  hiddenStems: HiddenStemEntry[]
  tenStar: FortuneTenStar
  interactions: InteractionResult
}

/** 세운 결과 */
export interface YearlyFortuneResult {
  targetYear: number
  fortune: FortuneEntry
  currentDaewoon?: {
    ganjiChar: string
    startAge: number
    endAge: number
  }
}

/** 월운 결과 */
export interface MonthlyFortuneResult {
  targetYear: number
  targetMonth: number
  fortune: FortuneEntry
  solarTermName: string
  solarTermDateTime: string
}

/** 일운 결과 */
export interface DailyFortuneResult {
  targetYear: number
  targetMonth: number
  targetDay: number
  fortune: FortuneEntry
}

/** 기간 세운 (여러 해) */
export interface YearlyFortuneRangeResult {
  startYear: number
  endYear: number
  fortunes: YearlyFortuneResult[]
}

/** 기간 월운 (여러 달) */
export interface MonthlyFortuneRangeResult {
  targetYear: number
  fortunes: MonthlyFortuneResult[]
}

// ─── FortuneEntry 생성 헬퍼 ──────────────────────────────

function makeFortuneEntry(
  stemIndex: number,
  branchIndex: number,
  dayStemIndex: number,
  fourPillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
  label: string
): FortuneEntry {
  const stem = STEMS[stemIndex]
  const branch = BRANCHES[branchIndex]
  const hiddenStemsData = getHiddenStems(branch.char)

  // 십성 (공통 모듈 사용)
  const stemStar = getInteractionTenStar(dayStemIndex, stemIndex)
  const branchMainHS = hiddenStemsData.find(h => h.role === 'jeonggi')
  const branchMainStar = branchMainHS
    ? getInteractionTenStar(dayStemIndex, branchMainHS.index)
    : stemStar

  // 충합형해 (공통 모듈 사용)
  const interactions = analyzeInteractions(stemIndex, branchIndex, fourPillars, label)

  return {
    stemIndex,
    branchIndex,
    stem,
    branch,
    ganjiChar: `${stem.char}${branch.char}`,
    ganjiName: `${stem.name}${branch.name}`,
    hiddenStems: hiddenStemsData,
    tenStar: {
      stemStar: stemStar.star,
      stemCategory: stemStar.category,
      branchMainStar: branchMainStar.star,
      branchMainCategory: branchMainStar.category,
    },
    interactions,
  }
}

// ─── 세운(歲運) 계산 ─────────────────────────────────────

/**
 * 특정 연도의 세운을 계산합니다.
 */
export function calculateYearlyFortune(
  targetYear: number,
  dayStemIndex: number,
  fourPillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }
): YearlyFortuneResult {

  let stemIndex = (targetYear - 4) % 10
  if (stemIndex < 0) stemIndex += 10
  let branchIndex = (targetYear - 4) % 12
  if (branchIndex < 0) branchIndex += 12

  const fortune = makeFortuneEntry(stemIndex, branchIndex, dayStemIndex, fourPillars, '세운')

  return {
    targetYear,
    fortune,
  }
}

/**
 * 기간 세운을 계산합니다 (여러 해).
 */
export function calculateYearlyFortuneRange(
  startYear: number,
  endYear: number,
  dayStemIndex: number,
  fourPillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }
): YearlyFortuneRangeResult {
  const fortunes: YearlyFortuneResult[] = []

  for (let y = startYear; y <= endYear; y++) {
    fortunes.push(calculateYearlyFortune(y, dayStemIndex, fourPillars))
  }

  return { startYear, endYear, fortunes }
}

// ─── 월운(月運) 계산 ─────────────────────────────────────

/**
 * 특정 연월의 월운을 계산합니다.
 */
export function calculateMonthlyFortune(
  targetYear: number,
  targetMonth: number,
  dayStemIndex: number,
  fourPillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }
): MonthlyFortuneResult {

  let yearStemIndex = (targetYear - 4) % 10
  if (yearStemIndex < 0) yearStemIndex += 10

  const monthResult = calculateMonthPillar(
    targetYear, targetMonth, 15, 12, 0, yearStemIndex
  )

  const stemIndex = monthResult.pillar.heavenlyStem.index
  const branchIndex = monthResult.pillar.earthlyBranch.index

  const fortune = makeFortuneEntry(stemIndex, branchIndex, dayStemIndex, fourPillars, '월운')

  return {
    targetYear,
    targetMonth,
    fortune,
    solarTermName: monthResult.solarTermName,
    solarTermDateTime: monthResult.solarTermDateTime,
  }
}

/**
 * 특정 연도의 12개월 월운을 계산합니다.
 */
export function calculateMonthlyFortuneRange(
  targetYear: number,
  dayStemIndex: number,
  fourPillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }
): MonthlyFortuneRangeResult {
  const fortunes: MonthlyFortuneResult[] = []

  for (let m = 1; m <= 12; m++) {
    fortunes.push(calculateMonthlyFortune(targetYear, m, dayStemIndex, fourPillars))
  }

  return { targetYear, fortunes }
}

// ─── 일운(日運) 계산 ─────────────────────────────────────

/**
 * 특정 날짜의 일운을 계산합니다.
 */
export function calculateDailyFortune(
  targetYear: number,
  targetMonth: number,
  targetDay: number,
  dayStemIndex: number,
  fourPillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }
): DailyFortuneResult {

  const dayResult = calculateDayPillarInternal(targetYear, targetMonth, targetDay)
  const fortune = makeFortuneEntry(
    dayResult.stemIndex, dayResult.branchIndex,
    dayStemIndex, fourPillars, '일운'
  )

  return {
    targetYear,
    targetMonth,
    targetDay,
    fortune,
  }
}

/**
 * 특정 기간의 일운을 계산합니다 (날짜 범위).
 */
export function calculateDailyFortuneRange(
  startYear: number, startMonth: number, startDay: number,
  days: number,
  dayStemIndex: number,
  fourPillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null }
): DailyFortuneResult[] {
  const results: DailyFortuneResult[] = []
  const startDate = new Date(startYear, startMonth - 1, startDay)

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    results.push(calculateDailyFortune(
      d.getFullYear(), d.getMonth() + 1, d.getDate(),
      dayStemIndex, fourPillars
    ))
  }

  return results
}

// ─── 포맷 출력 함수들 ────────────────────────────────────

export function formatYearlyFortune(result: YearlyFortuneResult): string {
  const f = result.fortune
  const stars = `천간:${f.tenStar.stemStar} 지지:${f.tenStar.branchMainStar}`
  const inter = f.interactions.summary.length > 0
    ? f.interactions.summary.join(', ')
    : '없음'
  return `${result.targetYear}년 세운: ${f.ganjiChar}(${f.ganjiName}) [${stars}] | 충합형해: ${inter}`
}

export function formatMonthlyFortune(result: MonthlyFortuneResult): string {
  const f = result.fortune
  const stars = `천간:${f.tenStar.stemStar} 지지:${f.tenStar.branchMainStar}`
  const inter = f.interactions.summary.length > 0
    ? f.interactions.summary.join(', ')
    : '없음'
  return `${result.targetYear}년 ${result.targetMonth}월 월운: ${f.ganjiChar}(${f.ganjiName}) [${stars}] [${result.solarTermName}] | 충합형해: ${inter}`
}

export function formatDailyFortune(result: DailyFortuneResult): string {
  const f = result.fortune
  const stars = `천간:${f.tenStar.stemStar} 지지:${f.tenStar.branchMainStar}`
  const inter = f.interactions.summary.length > 0
    ? f.interactions.summary.join(', ')
    : '없음'
  return `${result.targetYear}-${String(result.targetMonth).padStart(2, '0')}-${String(result.targetDay).padStart(2, '0')} 일운: ${f.ganjiChar}(${f.ganjiName}) [${stars}] | 충합형해: ${inter}`
}

/** 세운 범위 표 출력 */
export function formatYearlyFortuneRange(result: YearlyFortuneRangeResult, dayStemChar: string): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════════════════════')
  lines.push(`  세운(歲運) 분석 — 일간: ${dayStemChar}`)
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  연도   │ 간지  │ 십성(천간/지지)  │ 충합형해')
  lines.push('  ───────┼───────┼─────────────────┼──────────')

  for (const yr of result.fortunes) {
    const f = yr.fortune
    const stars = `${f.tenStar.stemStar}/${f.tenStar.branchMainStar}`
    const inter = f.interactions.summary.length > 0
      ? f.interactions.summary[0]
      : '-'
    lines.push(`  ${yr.targetYear}  │ ${f.ganjiChar}   │ ${stars.padEnd(15)} │ ${inter}`)
  }

  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

/** 월운 범위 표 출력 */
export function formatMonthlyFortuneRange(result: MonthlyFortuneRangeResult, dayStemChar: string): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════════════════════')
  lines.push(`  ${result.targetYear}년 월운(月運) 분석 — 일간: ${dayStemChar}`)
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  월  │ 절기   │ 간지  │ 십성(천간/지지)  │ 충합형해')
  lines.push('  ────┼────────┼───────┼─────────────────┼──────────')

  for (const mr of result.fortunes) {
    const f = mr.fortune
    const stars = `${f.tenStar.stemStar}/${f.tenStar.branchMainStar}`
    const inter = f.interactions.summary.length > 0
      ? f.interactions.summary[0]
      : '-'
    lines.push(`  ${String(mr.targetMonth).padStart(2)}월 │ ${mr.solarTermName.padEnd(6)} │ ${f.ganjiChar}   │ ${stars.padEnd(15)} │ ${inter}`)
  }

  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}