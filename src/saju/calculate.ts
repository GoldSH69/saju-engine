/**
 * calculate.ts - 사주 전체 통합 계산 엔트리 함수
 *
 * 양력 생년월일시 입력 → 4주 + 지장간 + 오행 + 십성 + 신강/신약 + 용신 + 대운 통합 계산
 * 모든 모듈을 연결하는 최종 엔트리
 */

import { STEMS, BRANCHES, ELEMENT_KO } from './constants'
import {
  Pillar, StemInfo, BranchInfo,
  TenStar, TenStarCategory, TenStarInfo, TenStarResult,
  TimeAdjustmentResult,
} from './types'
import { adjustTime } from './timeAdjustment'
import { getHourBranchIndex } from './hourBranch'
import { getJulianDayNumber } from './dayPillar'
import { calculateHourPillar } from './hourPillar'
import { calculateYearPillar } from './yearPillar'
import { calculateMonthPillar } from './monthPillar'
import { getHiddenStems, HiddenStemEntry } from './hiddenStems'
import { analyzeFiveElements } from './fiveElements'
import { getTenStar, getTenStarCategory } from './tenStars'
import { calculateStrength } from './strengthScore'
import { calculateDaewoon, DaewoonResult, DaewoonOptions } from './daewoon'
import {
  calculateYearlyFortune, calculateMonthlyFortune, calculateDailyFortune,
  YearlyFortuneResult, MonthlyFortuneResult, DailyFortuneResult,
} from './fortune'
import { calculateYongsin, YongsinResult, YongsinMethod, YongsinOptions } from './yongsin'
import { analyzeGongmang, GongmangAnalysis } from './gongmang'
import { analyzeGwiin, GwiinAnalysis } from './gwiin'

// ─── 일주 계산 헬퍼 (JDN 기반) ──────────────────────────

const BASE_JDN = getJulianDayNumber(2024, 1, 1)  // 2024-01-01 = 甲子 = index 0

function calculateDayPillarFromDate(year: number, month: number, day: number): Pillar {
  const jdn = getJulianDayNumber(year, month, day)
  let idx = (jdn - BASE_JDN) % 60
  if (idx < 0) idx += 60
  return {
    heavenlyStem: STEMS[idx % 10],
    earthlyBranch: BRANCHES[idx % 12],
  }
}

// ─── 입력 타입 ───────────────────────────────────────────

export interface CalculateInput {
  year: number
  month: number
  day: number
  hour?: number | null
  minute?: number | null
  gender?: 'male' | 'female'
  timeOption?: 'standard30' | 'trueSolar' | 'none'
  daewoonCount?: number
  yongsinMethod?: YongsinMethod
  includeSpecialPattern?: boolean
  fortuneTargetYear?: number
  fortuneTargetMonth?: number
  fortuneTargetDay?: number
}

// ─── 지장간 결과 타입 ────────────────────────────────────

export interface HiddenStemsResult {
  year: HiddenStemEntry[]
  month: HiddenStemEntry[]
  day: HiddenStemEntry[]
  hour: HiddenStemEntry[] | null
}

// ─── 운세 결과 ───────────────────────────────────────────

export interface FortuneResult {
  yearly?: YearlyFortuneResult
  monthly?: MonthlyFortuneResult
  daily?: DailyFortuneResult
}

// ─── 최종 통합 결과 ──────────────────────────────────────

export interface CalculateResult {
  input: {
    year: number
    month: number
    day: number
    hour: number | null
    minute: number | null
    gender: 'male' | 'female'
    timeOption: 'standard30' | 'trueSolar' | 'none'
    birthTimeUnknown: boolean
  }
  adjustedTime: TimeAdjustmentResult | null
  effectiveDate: {
    year: number
    month: number
    day: number
  }
  fourPillars: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar | null
  }
  dayStem: {
    char: string
    name: string
    element: string
    elementKo: string
    yinYang: string
    yinYangKo: string
  }
  hiddenStems: HiddenStemsResult
  fiveElements: any
  tenStars: TenStarResult
  strength: any
  yongsin: YongsinResult
  daewoon: DaewoonResult | null
  fortune: FortuneResult | null
  gongmang: GongmangAnalysis | null
  gwiin: GwiinAnalysis | null
  monthSolarTerm: {
    name: string
    dateTime: string
  }
  meta: {
    calculatedAt: string
    engineVersion: string
    warnings: string[]
  }
}

// ─── 십성 분석 빌더 ──────────────────────────────────────

function buildTenStarAnalysis(
  dayStemChar: string,
  dayStemName: string,
  yearPillar: Pillar,
  monthPillar: Pillar,
  hourPillar: Pillar | null,
  hiddenStems: HiddenStemsResult
): TenStarResult {
  const allStars: TenStarInfo[] = []

  const starCount: Record<TenStar, number> = {
    '비견': 0, '겁재': 0, '식신': 0, '상관': 0,
    '편재': 0, '정재': 0, '편인': 0, '정인': 0,
    '편관': 0, '정관': 0,
  }
  const categoryCount: Record<TenStarCategory, number> = {
    '비화': 0, '식상': 0, '재성': 0, '인성': 0, '관성': 0,
  }

  function makeStar(targetChar: string, targetName: string, position: string): TenStarInfo {
    const star = getTenStar(dayStemChar, targetChar)
    const category = getTenStarCategory(star)
    starCount[star]++
    categoryCount[category]++
    const info: TenStarInfo = {
      target: targetChar,
      targetKorean: targetName,
      tenStar: star,
      category,
      position,
    }
    allStars.push(info)
    return info
  }

  const yearStemStar = makeStar(
    yearPillar.heavenlyStem.char,
    yearPillar.heavenlyStem.name,
    '년간'
  )
  const monthStemStar = makeStar(
    monthPillar.heavenlyStem.char,
    monthPillar.heavenlyStem.name,
    '월간'
  )
  let hourStemStar: TenStarInfo
  if (hourPillar) {
    hourStemStar = makeStar(
      hourPillar.heavenlyStem.char,
      hourPillar.heavenlyStem.name,
      '시간'
    )
  } else {
    hourStemStar = {
      target: '', targetKorean: '', tenStar: '비견', category: '비화', position: '시간',
    }
  }

  function makeHiddenStars(entries: HiddenStemEntry[] | null, positionPrefix: string): TenStarInfo[] {
    if (!entries) return []
    return entries.map(hs => {
      const stemInfo = STEMS[hs.index]
      return makeStar(hs.char, stemInfo?.name || '', `${positionPrefix}지장간`)
    })
  }

  const yearBranchStars = makeHiddenStars(hiddenStems.year, '년')
  const monthBranchStars = makeHiddenStars(hiddenStems.month, '월')
  const dayBranchStars = makeHiddenStars(hiddenStems.day, '일')
  const hourBranchStars = makeHiddenStars(hiddenStems.hour, '시')

  return {
    dayStem: dayStemChar,
    dayStemKorean: dayStemName,
    yearStem: yearStemStar,
    monthStem: monthStemStar,
    hourStem: hourStemStar,
    yearBranchStars,
    monthBranchStars,
    dayBranchStars,
    hourBranchStars,
    allStars,
    starCount,
    categoryCount,
  }
}

// ─── 경고 메시지 생성 ────────────────────────────────────

function generateWarnings(
  input: CalculateInput,
  adjustedHour: number | null,
  adjustedMinute: number | null
): string[] {
  const warnings: string[] = []

  if (input.hour === null || input.hour === undefined) {
    warnings.push('출생 시간 미입력: 시주 미계산, 대운/십성/신강신약 정확도가 낮습니다.')
    return warnings
  }

    if (adjustedHour === null) return warnings

  const totalMin = adjustedHour * 60 + (adjustedMinute || 0)

  const boundaries = [
    { min: 90,  name: '축시/인시 경계(01:30)' },
    { min: 210, name: '묘시/진시 경계(03:30)' },
    { min: 330, name: '사시/오시 경계(05:30)' },
    { min: 450, name: '미시/신시 경계(07:30)' },
    { min: 570, name: '유시/술시 경계(09:30)' },
    { min: 690, name: '해시/자시 경계(11:30)' },
    { min: 1410, name: '자시/축시 경계(23:30)' },
  ]

  for (const b of boundaries) {
    if (Math.abs(totalMin - b.min) <= 5) {
      warnings.push(`보정 후 시간이 ${b.name} 근처입니다. 출생시간이 정확한지 확인하세요.`)
    }
  }

  if (adjustedHour >= 23 || adjustedHour === 0) {
    warnings.push('자시(子時) 구간입니다. 야자시(夜子時) 정책이 적용됩니다.')
  }

  return warnings
}

// ─── 한글→영문 신강/신약 변환 (yongsin 모듈 호환) ────────

function strengthToEn(koreanStrength: string): 'strong' | 'weak' | 'neutral' {
  if (koreanStrength === '신강') return 'strong'
  if (koreanStrength === '신약') return 'weak'
  return 'neutral'
}

// ─── 메인: 통합 계산 함수 ────────────────────────────────

export function calculateSaju(input: CalculateInput): CalculateResult {
  const gender = input.gender ?? 'male'
  const timeOption = input.timeOption ?? 'standard30'
  const birthTimeUnknown = (input.hour === null || input.hour === undefined)
  const hour = birthTimeUnknown ? 0 : input.hour!
  const minute = birthTimeUnknown ? 0 : (input.minute ?? 0)

  const warnings: string[] = []

  // ═══ ① 시간 보정 ═══
  let timeResult: TimeAdjustmentResult | null = null
  let adjustedHour = hour
  let adjustedMinute = minute

  if (!birthTimeUnknown) {
    timeResult = adjustTime(hour, minute, timeOption)
    adjustedHour = timeResult.adjustedHour
    adjustedMinute = timeResult.adjustedMinute
  }

  // ═══ ② 날짜 보정 (30분 보정으로 전날로 넘어가는 경우) ═══
  let effectiveYear = input.year
  let effectiveMonth = input.month
  let effectiveDay = input.day
  let dateChanged = false

  if (timeResult?.dateChanged) {
    const d = new Date(input.year, input.month - 1, input.day)
    d.setDate(d.getDate() - 1)
    effectiveYear = d.getFullYear()
    effectiveMonth = d.getMonth() + 1
    effectiveDay = d.getDate()
    dateChanged = true
    warnings.push('시간 보정으로 인해 전날 기준으로 계산합니다.')
  }

  // ═══ ③ 일주(日柱) 계산 ═══
  const dayPillar = calculateDayPillarFromDate(effectiveYear, effectiveMonth, effectiveDay)
  const dayStemIndex = dayPillar.heavenlyStem.index
  const dayStemChar = dayPillar.heavenlyStem.char

  // ═══ ④ 년주(年柱) 계산 ═══
  const yearPillar = calculateYearPillar(
    effectiveYear, effectiveMonth, effectiveDay,
    adjustedHour, adjustedMinute
  )

  // ═══ ⑤ 월주(月柱) 계산 ═══
  const monthResult = calculateMonthPillar(
    effectiveYear, effectiveMonth, effectiveDay,
    adjustedHour, adjustedMinute,
    yearPillar.heavenlyStem.index
  )
  const monthPillar = monthResult.pillar

  // ═══ ⑥ 시주(時柱) 계산 ═══
  let hourPillar: Pillar | null = null
  let isYajasi = false

  if (!birthTimeUnknown) {
    isYajasi = adjustedHour >= 23
    const useNextDayStem = isYajasi

    hourPillar = calculateHourPillar(
      adjustedHour, adjustedMinute,
      dayStemIndex, useNextDayStem
    )

    if (isYajasi) {
      warnings.push('야자시(夜子時) 적용: 23시 이후이므로 다음날 일간 기준으로 시주를 계산합니다.')
    }
  }

  // ═══ ⑦ 4주 조립 ═══
  const fourPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  }

  // ═══ ⑧ 지장간 추출 ═══
  const hiddenStems: HiddenStemsResult = {
    year: getHiddenStems(yearPillar.earthlyBranch.char),
    month: getHiddenStems(monthPillar.earthlyBranch.char),
    day: getHiddenStems(dayPillar.earthlyBranch.char),
    hour: hourPillar ? getHiddenStems(hourPillar.earthlyBranch.char) : null,
  }

  // ═══ ⑨ 오행 분포 ═══
  const stemChars = [
    yearPillar.heavenlyStem.char,
    monthPillar.heavenlyStem.char,
    dayPillar.heavenlyStem.char,
  ]
  const branchChars = [
    yearPillar.earthlyBranch.char,
    monthPillar.earthlyBranch.char,
    dayPillar.earthlyBranch.char,
  ]
  if (hourPillar) {
    stemChars.push(hourPillar.heavenlyStem.char)
    branchChars.push(hourPillar.earthlyBranch.char)
  }
  const fiveElements = analyzeFiveElements(stemChars, branchChars)

  // ═══ ⑩ 십성 분석 ═══
  const tenStars = buildTenStarAnalysis(
    dayStemChar,
    dayPillar.heavenlyStem.name,
    yearPillar, monthPillar, hourPillar,
    hiddenStems
  )

  // ═══ ⑪ 신강/신약 판단 ═══
  const strength = calculateStrength(
    yearPillar.heavenlyStem.char,
    monthPillar.heavenlyStem.char,
    dayPillar.heavenlyStem.char,
    hourPillar?.heavenlyStem.char ?? null,
    yearPillar.earthlyBranch.char,
    monthPillar.earthlyBranch.char,
    dayPillar.earthlyBranch.char,
    hourPillar?.earthlyBranch.char ?? null
  )

  // ═══ ⑫ 용신 판단 ═══
  const yongsin = calculateYongsin(
    dayStemIndex,
    monthPillar.earthlyBranch.index,
    strengthToEn(strength.strength),
    strength.strengthLevel,
    strength.supportScore,
    strength.restrainScore,
    {
      method: input.yongsinMethod ?? 'combined',
      includeSpecialPattern: input.includeSpecialPattern ?? false,
    }
  )

  // ═══ ⑬ 대운 계산 ═══
  let daewoon: DaewoonResult | null = null

  if (!birthTimeUnknown) {
    daewoon = calculateDaewoon(
      effectiveYear, effectiveMonth, effectiveDay,
      adjustedHour, adjustedMinute,
      gender,
      yearPillar, monthPillar, dayPillar,
      fourPillars,
      { count: input.daewoonCount ?? 10 }
    )
  } else {
    warnings.push('출생 시간 미입력: 대운 시작 나이가 부정확할 수 있습니다.')
    daewoon = calculateDaewoon(
      effectiveYear, effectiveMonth, effectiveDay,
      12, 0,
      gender,
      yearPillar, monthPillar, dayPillar,
      { year: yearPillar, month: monthPillar, day: dayPillar, hour: null },
      { count: input.daewoonCount ?? 10 }
    )
  }
  // ═══ ⑬-2 공망 분석 ═══
  const gongmang = analyzeGongmang(
    yearPillar.heavenlyStem.index,
    yearPillar.earthlyBranch.index,
    monthPillar.earthlyBranch.index,
    dayStemIndex,
    dayPillar.earthlyBranch.index,
    hourPillar ? hourPillar.earthlyBranch.index : null
  )

  // ═══ ⑬-3 천을귀인 분석 ═══
  const gwiin = analyzeGwiin(
    dayStemIndex,
    yearPillar.earthlyBranch.index,
    monthPillar.earthlyBranch.index,
    dayPillar.earthlyBranch.index,
    hourPillar ? hourPillar.earthlyBranch.index : null
  )

  // ═══ ⑭ 운세 (선택) ═══
  let fortune: FortuneResult | null = null

  if (input.fortuneTargetYear) {
    fortune = {}

    fortune.yearly = calculateYearlyFortune(
      input.fortuneTargetYear,
      dayStemIndex,
      fourPillars
    )

    if (input.fortuneTargetMonth) {
      fortune.monthly = calculateMonthlyFortune(
        input.fortuneTargetYear,
        input.fortuneTargetMonth,
        dayStemIndex,
        fourPillars
      )
    }

    if (input.fortuneTargetMonth && input.fortuneTargetDay) {
      fortune.daily = calculateDailyFortune(
        input.fortuneTargetYear,
        input.fortuneTargetMonth,
        input.fortuneTargetDay,
        dayStemIndex,
        fourPillars
      )
    }
  }

  // ═══ ⑮ 일간 정보 ═══
  const dayStemInfo = dayPillar.heavenlyStem

  // ═══ ⑯ 경고 메시지 ═══
  const allWarnings = [
    ...generateWarnings(input, birthTimeUnknown ? null : adjustedHour, birthTimeUnknown ? null : adjustedMinute),
    ...warnings,
  ]

  // ═══ ⑰ 결과 조립 ═══
  return {
    input: {
      year: input.year,
      month: input.month,
      day: input.day,
      hour: birthTimeUnknown ? null : hour,
      minute: birthTimeUnknown ? null : minute,
      gender,
      timeOption,
      birthTimeUnknown,
    },
    adjustedTime: timeResult,
    effectiveDate: {
      year: effectiveYear,
      month: effectiveMonth,
      day: effectiveDay,
    },
    fourPillars,
    dayStem: {
      char: dayStemInfo.char,
      name: dayStemInfo.name,
      element: dayStemInfo.element,
      elementKo: dayStemInfo.elementKo,
      yinYang: dayStemInfo.yinYang,
      yinYangKo: dayStemInfo.yinYangKo,
    },
    hiddenStems,
    fiveElements,
    tenStars,
    strength,
    yongsin,
    daewoon,
    fortune,
    gongmang,
    gwiin,
    monthSolarTerm: {
      name: monthResult.solarTermName,
      dateTime: monthResult.solarTermDateTime,
    },
    meta: {
      calculatedAt: new Date().toISOString(),
      engineVersion: '1.0.0',
      warnings: allWarnings,
    },
  }
}

// ─── 포맷 출력 (디버깅/테스트용) ─────────────────────────

export function formatSajuResult(result: CalculateResult): string {
  const { fourPillars: fp, dayStem, strength, yongsin } = result
  const lines: string[] = []

  lines.push('╔═══════════════════════════════════════════════════════╗')
  lines.push('║              사주팔자 종합 분석 결과                 ║')
  lines.push('╚═══════════════════════════════════════════════════════╝')
  lines.push('')

  const timeStr = result.input.birthTimeUnknown
    ? '시간 모름'
    : `${String(result.input.hour).padStart(2, '0')}:${String(result.input.minute).padStart(2, '0')}`
  lines.push(`  입력: ${result.input.year}년 ${result.input.month}월 ${result.input.day}일 ${timeStr} (${result.input.gender === 'male' ? '남' : '여'})`)

  if (result.adjustedTime) {
    lines.push(`  보정: ${result.adjustedTime.description}`)
  }
  lines.push('')

  if (fp.hour) {
    lines.push('  ┌──────┬──────┬──────┬──────┐')
    lines.push('  │ 시주 │ 일주 │ 월주 │ 년주 │')
    lines.push('  ├──────┼──────┼──────┼──────┤')
    lines.push(`  │  ${fp.hour.heavenlyStem.char}   │  ${fp.day.heavenlyStem.char}   │  ${fp.month.heavenlyStem.char}   │  ${fp.year.heavenlyStem.char}   │  천간`)
    lines.push(`  │  ${fp.hour.earthlyBranch.char}   │  ${fp.day.earthlyBranch.char}   │  ${fp.month.earthlyBranch.char}   │  ${fp.year.earthlyBranch.char}   │  지지`)
    lines.push('  └──────┴──────┴──────┴──────┘')
    lines.push(`   ${fp.hour.heavenlyStem.name}${fp.hour.earthlyBranch.name}   ${fp.day.heavenlyStem.name}${fp.day.earthlyBranch.name}   ${fp.month.heavenlyStem.name}${fp.month.earthlyBranch.name}   ${fp.year.heavenlyStem.name}${fp.year.earthlyBranch.name}`)
  } else {
    lines.push('  ┌──────┬──────┬──────┐')
    lines.push('  │ 일주 │ 월주 │ 년주 │')
    lines.push('  ├──────┼──────┼──────┤')
    lines.push(`  │  ${fp.day.heavenlyStem.char}   │  ${fp.month.heavenlyStem.char}   │  ${fp.year.heavenlyStem.char}   │  천간`)
    lines.push(`  │  ${fp.day.earthlyBranch.char}   │  ${fp.month.earthlyBranch.char}   │  ${fp.year.earthlyBranch.char}   │  지지`)
    lines.push('  └──────┴──────┴──────┘')
    lines.push(`   ${fp.day.heavenlyStem.name}${fp.day.earthlyBranch.name}   ${fp.month.heavenlyStem.name}${fp.month.earthlyBranch.name}   ${fp.year.heavenlyStem.name}${fp.year.earthlyBranch.name}`)
    lines.push('  (시주: 시간 미입력)')
  }
  lines.push('')

  lines.push(`  ■ 일간(나): ${dayStem.char}(${dayStem.name}) — ${dayStem.elementKo}/${dayStem.yinYangKo}`)
  lines.push(`  ■ 월주 절기: ${result.monthSolarTerm.name}`)
  lines.push('')

  lines.push('  ■ 지장간:')
  const hsLabels = [
    { key: 'year' as const, label: '년지' },
    { key: 'month' as const, label: '월지' },
    { key: 'day' as const, label: '일지' },
    { key: 'hour' as const, label: '시지' },
  ]
  for (const { key, label } of hsLabels) {
    const hs = result.hiddenStems[key]
    if (hs) {
      const hsStr = hs.map(h => `${h.char}(${h.roleName})`).join(', ')
      lines.push(`    ${label}: ${hsStr}`)
    } else {
      lines.push(`    ${label}: -`)
    }
  }
  lines.push('')

  lines.push(`  ■ 신강/신약: ${strength.strength} (점수: ${strength.totalScore.toFixed(1)})`)
  lines.push('')

  lines.push(`  ■ 용신: ${yongsin.yongsinKo}(${yongsin.yongsin})`)
  lines.push(`    판단: ${yongsin.reason}`)
  const fav = yongsin.guide.favorableElements.join(', ')
  const unfav = yongsin.guide.unfavorableElements.join(', ')
  lines.push(`    좋은 오행: ${fav} | 나쁜 오행: ${unfav}`)
  lines.push('')

  if (result.daewoon) {
    const dw = result.daewoon
    lines.push(`  ■ 대운: ${dw.direction === 'forward' ? '순행' : '역행'} (시작: ${dw.startAge.description})`)
    const dwLine = dw.entries.slice(0, 8).map(e =>
      `${e.ganjiChar}(${e.startAge}~${e.endAge})`
    ).join(' → ')
    lines.push(`    ${dwLine}`)
    lines.push('')
  }
    // 공망 출력
  if (result.gongmang) {
    lines.push('  ■ 공망(空亡):')
    result.gongmang.summary.forEach(s => lines.push(`    ${s}`))
    lines.push('')
  }

  // 천을귀인 출력
  if (result.gwiin) {
    lines.push('  ■ 천을귀인(天乙貴人):')
    result.gwiin.summary.forEach(s => lines.push(`    ${s}`))
    lines.push('')
  }

  if (result.fortune) {
    lines.push('  ■ 운세:')
    if (result.fortune.yearly) {
      const yr = result.fortune.yearly
      lines.push(`    ${yr.targetYear}년 세운: ${yr.fortune.ganjiChar}(${yr.fortune.ganjiName}) [${yr.fortune.tenStar.stemStar}/${yr.fortune.tenStar.branchMainStar}]`)
    }
    if (result.fortune.monthly) {
      const mr = result.fortune.monthly
      lines.push(`    ${mr.targetMonth}월 월운: ${mr.fortune.ganjiChar}(${mr.fortune.ganjiName}) [${mr.fortune.tenStar.stemStar}/${mr.fortune.tenStar.branchMainStar}]`)
    }
    if (result.fortune.daily) {
      const dr = result.fortune.daily
      lines.push(`    ${dr.targetDay}일 일운: ${dr.fortune.ganjiChar}(${dr.fortune.ganjiName}) [${dr.fortune.tenStar.stemStar}/${dr.fortune.tenStar.branchMainStar}]`)
    }
    lines.push('')
  }

  if (result.meta.warnings.length > 0) {
    lines.push('  ⚠ 참고사항:')
    result.meta.warnings.forEach(w => lines.push(`    - ${w}`))
    lines.push('')
  }

  lines.push('═══════════════════════════════════════════════════════')
  return lines.join('\n')
}

// ─── DB 저장용 JSON 직렬화 ───────────────────────────────

export function toResultJson(result: CalculateResult): object {
  const { fourPillars: fp } = result

  function pillarToJson(p: Pillar) {
    return {
      stem: { char: p.heavenlyStem.char, index: p.heavenlyStem.index, element: p.heavenlyStem.element, yinYang: p.heavenlyStem.yinYang },
      branch: { char: p.earthlyBranch.char, index: p.earthlyBranch.index, element: p.earthlyBranch.element, yinYang: p.earthlyBranch.yinYang },
      ganji: `${p.heavenlyStem.char}${p.earthlyBranch.char}`,
      ganjiName: `${p.heavenlyStem.name}${p.earthlyBranch.name}`,
    }
  }

  return {
    version: result.meta.engineVersion,
    input: result.input,
    effectiveDate: result.effectiveDate,
    adjustedTime: result.adjustedTime ? {
      adjustedHour: result.adjustedTime.adjustedHour,
      adjustedMinute: result.adjustedTime.adjustedMinute,
      adjustmentType: result.adjustedTime.adjustmentType,
      dateChanged: result.adjustedTime.dateChanged,
    } : null,
    pillars: {
      year: pillarToJson(fp.year),
      month: pillarToJson(fp.month),
      day: pillarToJson(fp.day),
      hour: fp.hour ? pillarToJson(fp.hour) : null,
    },
    dayStem: result.dayStem,
    hiddenStems: {
      year: result.hiddenStems.year?.map(h => ({ char: h.char, index: h.index, role: h.role, days: h.days })),
      month: result.hiddenStems.month?.map(h => ({ char: h.char, index: h.index, role: h.role, days: h.days })),
      day: result.hiddenStems.day?.map(h => ({ char: h.char, index: h.index, role: h.role, days: h.days })),
      hour: result.hiddenStems.hour?.map(h => ({ char: h.char, index: h.index, role: h.role, days: h.days })) ?? null,
    },
    strength: {
      result: result.strength.strength,
      score: result.strength.totalScore,
      helpScore: result.strength.supportScore,
      restrainScore: result.strength.restrainScore,
    },
    yongsin: {
      yongsin: result.yongsin.yongsin,
      yongsinKo: result.yongsin.yongsinKo,
      method: result.yongsin.method,
      fiveSin: result.yongsin.fiveSin.map((f: any) => ({
        element: f.element, elementKo: f.elementKo, role: f.role,
      })),
      guide: result.yongsin.guide,
    },
    daewoon: result.daewoon ? {
      direction: result.daewoon.direction,
      startAge: result.daewoon.startAge,
      entries: result.daewoon.entries.map((e: any) => ({
        index: e.index,
        ganji: e.ganjiChar,
        ganjiName: e.ganjiName,
        startAge: e.startAge,
        endAge: e.endAge,
        startYear: e.startYear,
        endYear: e.endYear,
        tenStar: e.tenStar,
      })),
    } : null,
        gongmang: result.gongmang ? {
      yearGongmang: {
        sunName: result.gongmang.yearGongmang.sunName,
        chars: result.gongmang.yearGongmang.chars,
        names: result.gongmang.yearGongmang.names,
      },
      dayGongmang: {
        sunName: result.gongmang.dayGongmang.sunName,
        chars: result.gongmang.dayGongmang.chars,
        names: result.gongmang.dayGongmang.names,
      },
      branchStatus: result.gongmang.branchStatus,
      summary: result.gongmang.summary,
    } : null,
    gwiin: result.gwiin ? {
      gwiinPair: {
        chars: result.gwiin.gwiinPair.chars,
        names: result.gwiin.gwiinPair.names,
        elements: result.gwiin.gwiinPair.elements,
      },
      branchStatus: result.gwiin.branchStatus,
      gwiinCount: result.gwiin.gwiinCount,
      gwiinPositions: result.gwiin.gwiinPositions,
      summary: result.gwiin.summary,
    } : null,
    monthSolarTerm: result.monthSolarTerm,
    meta: result.meta,
  }
}