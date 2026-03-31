/**
 * daewoon.ts - 대운(大運) 계산 모듈
 *
 * 대운 = 10년 단위 운의 흐름
 * 월주를 기준으로 순행/역행하며 간지를 나열
 *
 * 핵심 로직:
 *   ① 순행/역행 결정 (성별 + 년간 음양)
 *   ② 대운 시작 나이 계산 (생일 ↔ 이전/다음 절기 시간차)
 *   ③ 대운 간지 나열 (월주 기준)
 *   ④ 각 대운별 원국과의 상호작용 분석
 *
 * 충합형해 로직은 interactions.ts 공통 모듈 사용
 */

import { STEMS, BRANCHES } from './constants'
import { Pillar, StemInfo, BranchInfo } from './types'
import { getSolarTermDateTime } from '../data/solarTerms'
import { getHiddenStems, HiddenStemEntry } from './hiddenStems'
import {
  // 타입 re-export용
  StemCombination,
  BranchClash,
  BranchCombine,
  BranchPunishment,
  BranchHarm,
  InteractionResult,
  FortuneTenStar,
  // 함수
  analyzeInteractions,
  getInteractionTenStar,
} from './interactions'

// ─── 타입 re-export (하위호환) ───────────────────────────
export type {
  StemCombination,
  BranchClash,
  BranchCombine,
  BranchPunishment,
  BranchHarm,
  InteractionResult,
}

// DaewoonTenStar → FortuneTenStar 하위호환 별칭
export type DaewoonTenStar = FortuneTenStar

// ─── 12절기 순서 (양력 월 기준) ──────────────────────────
const JEOL_SEQUENCE: string[] = [
  '소한',   // 1월 절기
  '입춘',   // 2월
  '경칩',   // 3월
  '청명',   // 4월
  '입하',   // 5월
  '망종',   // 6월
  '소서',   // 7월
  '입추',   // 8월
  '백로',   // 9월
  '한로',   // 10월
  '입동',   // 11월
  '대설',   // 12월
]

// ─── 타입 정의 ───────────────────────────────────────────

/** 순행/역행 */
export type Direction = 'forward' | 'backward'

/** 대운 시작 나이 상세 */
export interface DaewoonStartAge {
  years: number
  months: number
  totalMonths: number
  daysBetween: number
  description: string
}

/** 개별 대운 정보 */
export interface DaewoonEntry {
  index: number
  stemIndex: number
  branchIndex: number
  stem: StemInfo
  branch: BranchInfo
  ganjiChar: string
  ganjiName: string
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  hiddenStems: HiddenStemEntry[]
  tenStar: FortuneTenStar
  interactions: InteractionResult
}

/** 대운 계산 결과 전체 */
export interface DaewoonResult {
  direction: Direction
  directionReason: string
  startAge: DaewoonStartAge
  entries: DaewoonEntry[]
  meta: {
    count: number
    prevTermName: string
    prevTermDate: string
    nextTermName: string
    nextTermDate: string
  }
}

/** 대운 계산 옵션 */
export interface DaewoonOptions {
  count?: number
}

// ─── 이전/다음 절기 찾기 ─────────────────────────────────

interface NearbyTerm {
  name: string
  date: Date
  dateStr: string
}

/**
 * 생일 기준 이전 절기와 다음 절기를 찾습니다.
 * 12절기(節)만 대상으로 합니다.
 */
function findNearbyTerms(
  year: number, month: number, day: number,
  hour: number, minute: number
): { prev: NearbyTerm; next: NearbyTerm } {

  const birthDate = new Date(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+09:00`
  )

  // 전년도 ~ 다음해까지의 모든 절기를 수집
  const allTerms: { name: string; date: Date; dateStr: string }[] = []

  for (const checkYear of [year - 1, year, year + 1]) {
    for (const termName of JEOL_SEQUENCE) {
      const termDate = getSolarTermDateTime(checkYear, termName)
      if (termDate) {
        allTerms.push({
          name: termName,
          date: termDate,
          dateStr: termDate.toISOString(),
        })
      }
    }
  }

  // 날짜순 정렬
  allTerms.sort((a, b) => a.date.getTime() - b.date.getTime())

  // 이전 절기: 생일 이전이면서 가장 가까운 것
  let prev: NearbyTerm | null = null
  let next: NearbyTerm | null = null

  for (let i = 0; i < allTerms.length; i++) {
    if (allTerms[i].date.getTime() <= birthDate.getTime()) {
      prev = allTerms[i]
    } else {
      if (!next) next = allTerms[i]
    }
  }

  if (!prev || !next) {
    throw new Error(`절기 데이터 범위 밖: ${year}-${month}-${day}`)
  }

  return { prev, next }
}

// ─── 대운 시작 나이 계산 ─────────────────────────────────

/**
 * 대운 시작 나이를 계산합니다.
 *
 * 순행: 생일 → 다음 절기까지 일수 ÷ 3
 * 역행: 생일 → 이전 절기까지 일수 ÷ 3
 * 나머지: 1일 = 4개월로 환산
 */
function calculateStartAge(
  birthDate: Date,
  targetTermDate: Date
): DaewoonStartAge {
  const diffMs = Math.abs(targetTermDate.getTime() - birthDate.getTime())
  const diffMinutes = diffMs / (1000 * 60)
  const diffDays = diffMinutes / (60 * 24)

  const totalDaysDiv3 = diffDays / 3
  const years = Math.floor(totalDaysDiv3)
  const remainderDays = diffDays - (years * 3)
  const months = Math.round(remainderDays * 4)

  const totalMonths = years * 12 + months

  let description: string
  if (months === 0) {
    description = `${years}세`
  } else {
    description = `${years}세 ${months}개월`
  }

  return {
    years,
    months,
    totalMonths,
    daysBetween: Math.round(diffDays * 10) / 10,
    description,
  }
}

// ─── 60갑자 순행/역행 ────────────────────────────────────

function getSixtyIndex(stemIndex: number, branchIndex: number): number {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIndex && i % 12 === branchIndex) {
      return i
    }
  }
  return -1
}

function getNextSixty(stemIndex: number, branchIndex: number, step: number): { stemIndex: number; branchIndex: number } {
  const current = getSixtyIndex(stemIndex, branchIndex)
  let next = (current + step) % 60
  if (next < 0) next += 60
  return {
    stemIndex: next % 10,
    branchIndex: next % 12,
  }
}

// ─── 메인: 대운 계산 함수 ────────────────────────────────

/**
 * 대운을 계산합니다.
 *
 * @param birthYear   양력 생년
 * @param birthMonth  양력 생월
 * @param birthDay    양력 생일
 * @param birthHour   시 (0~23)
 * @param birthMinute 분 (0~59)
 * @param gender      성별 ('male' | 'female')
 * @param yearPillar  년주 (순행/역행 판단에 사용)
 * @param monthPillar 월주 (대운 기준점)
 * @param dayPillar   일주 (십성 판단에 사용)
 * @param fourPillars 사주 4기둥 (충합형해 분석에 사용)
 * @param options     옵션 (대운 개수 등)
 */
export function calculateDaewoon(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  birthMinute: number,
  gender: 'male' | 'female',
  yearPillar: Pillar,
  monthPillar: Pillar,
  dayPillar: Pillar,
  fourPillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
  options: DaewoonOptions = {}
): DaewoonResult {

  const count = options.count ?? 10

  // ① 순행/역행 결정
  const yearStemYinYang = yearPillar.heavenlyStem.yinYang
  const isMale = gender === 'male'
  const isYangStem = yearStemYinYang === 'yang'

  const isForward = (isMale && isYangStem) || (!isMale && !isYangStem)
  const direction: Direction = isForward ? 'forward' : 'backward'

  const directionReason = `${isMale ? '남' : '여'}명 + 년간 ${yearPillar.heavenlyStem.char}(${isYangStem ? '양' : '음'}) → ${isForward ? '순행' : '역행'}`

  // ② 이전/다음 절기 찾기
  const nearbyTerms = findNearbyTerms(birthYear, birthMonth, birthDay, birthHour, birthMinute)

  // ③ 대운 시작 나이 계산
  const birthDate = new Date(
    `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}T${String(birthHour).padStart(2, '0')}:${String(birthMinute).padStart(2, '0')}:00+09:00`
  )

  const targetTerm = isForward ? nearbyTerms.next : nearbyTerms.prev
  const startAge = calculateStartAge(birthDate, targetTerm.date)

  // ④ 대운 간지 나열
  const monthStemIndex = monthPillar.heavenlyStem.index
  const monthBranchIndex = monthPillar.earthlyBranch.index
  const dayStemIndex = dayPillar.heavenlyStem.index

  const entries: DaewoonEntry[] = []
  const step = isForward ? 1 : -1

  for (let i = 1; i <= count; i++) {
    const ganji = getNextSixty(monthStemIndex, monthBranchIndex, step * i)
    const stem = STEMS[ganji.stemIndex]
    const branch = BRANCHES[ganji.branchIndex]

    const entryStartAge = startAge.years + (i - 1) * 10
    const entryEndAge = entryStartAge + 9
    const entryStartYear = birthYear + entryStartAge
    const entryEndYear = birthYear + entryEndAge

    // 지장간
    const hiddenStems = getHiddenStems(branch.char)

    // 십성 (공통 모듈 사용)
    const stemStar = getInteractionTenStar(dayStemIndex, ganji.stemIndex)
    const branchMainHS = hiddenStems.find(h => h.role === 'jeonggi')
    const branchMainStar = branchMainHS
      ? getInteractionTenStar(dayStemIndex, branchMainHS.index)
      : stemStar

    // 충합형해 (공통 모듈 사용)
    const interactions = analyzeInteractions(ganji.stemIndex, ganji.branchIndex, fourPillars, '대운')

    entries.push({
      index: i,
      stemIndex: ganji.stemIndex,
      branchIndex: ganji.branchIndex,
      stem,
      branch,
      ganjiChar: `${stem.char}${branch.char}`,
      ganjiName: `${stem.name}${branch.name}`,
      startAge: entryStartAge,
      endAge: entryEndAge,
      startYear: entryStartYear,
      endYear: entryEndYear,
      hiddenStems,
      tenStar: {
        stemStar: stemStar.star,
        stemCategory: stemStar.category,
        branchMainStar: branchMainStar.star,
        branchMainCategory: branchMainStar.category,
      },
      interactions,
    })
  }

  return {
    direction,
    directionReason,
    startAge,
    entries,
    meta: {
      count,
      prevTermName: nearbyTerms.prev.name,
      prevTermDate: nearbyTerms.prev.dateStr,
      nextTermName: nearbyTerms.next.name,
      nextTermDate: nearbyTerms.next.dateStr,
    },
  }
}

// ─── 대운 포맷 출력 (디버깅/테스트용) ────────────────────

export function formatDaewoon(result: DaewoonResult): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════')
  lines.push('  대운(大運) 분석')
  lines.push('═══════════════════════════════════════════════════')
  lines.push(`  방향: ${result.direction === 'forward' ? '순행(順行)' : '역행(逆行)'}`)
  lines.push(`  근거: ${result.directionReason}`)
  lines.push(`  시작: ${result.startAge.description}`)
  lines.push(`  절기: 이전 ${result.meta.prevTermName} / 다음 ${result.meta.nextTermName}`)
  lines.push('')
  lines.push('  ┌────┬──────┬────────────┬──────────┬─────────────────┐')
  lines.push('  │ #  │ 간지 │  나이      │  십성    │  충합형해       │')
  lines.push('  ├────┼──────┼────────────┼──────────┼─────────────────┤')

  for (const e of result.entries) {
    const ageRange = `${String(e.startAge).padStart(2)}~${String(e.endAge).padStart(2)}세`
    const yearRange = `(${e.startYear}~${e.endYear})`
    const starStr = `${e.tenStar.stemStar}/${e.tenStar.branchMainStar}`
    const interStr = e.interactions.summary.length > 0
      ? e.interactions.summary[0]
      : '-'

    lines.push(`  │ ${String(e.index).padStart(2)} │ ${e.ganjiChar}  │ ${ageRange} ${yearRange} │ ${starStr.padEnd(8)} │ ${interStr}`)
  }

  lines.push('  └────┴──────┴────────────┴──────────┴─────────────────┘')
  lines.push('═══════════════════════════════════════════════════')

  return lines.join('\n')
}