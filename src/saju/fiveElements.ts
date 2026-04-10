// src/saju/fiveElements.ts
// 오행(五行) 분포 계산 모듈
//
// 천간/지지/지장간의 오행 분포를 분석
// 신강/신약, 용신 판단의 기초 데이터

import { STEMS, BRANCHES } from './constants'
import { getHiddenStems, extractAllHiddenStems } from './hiddenStems'

// ============================================================
// 타입 정의
// ============================================================

/** 오행 종류 */
export type FiveElement = '木' | '火' | '土' | '金' | '水'

/** 음양 */
export type YinYang = '양' | '음'

/** 오행 상세 정보 */
export interface ElementInfo {
  element: FiveElement
  elementName: string    // 목, 화, 토, 금, 수
  yinYang: YinYang
}

/** 오행 분포 결과 */
export interface FiveElementCount {
  木: number
  火: number
  土: number
  金: number
  水: number
}

/** 오행 분석 전체 결과 */
export interface FiveElementAnalysis {
  /** 표면 천간 4개의 오행 분포 */
  stemElements: FiveElementCount
  /** 지지 4개의 오행 분포 */
  branchElements: FiveElementCount
  /** 지장간 포함 전체 오행 분포 (가중치 없음, 단순 카운트) */
  totalElements: FiveElementCount
  /** 지장간 포함 전체 오행 분포 (일수 가중치 적용) */
  weightedElements: FiveElementCount
  /** 가장 강한 오행 */
  strongest: FiveElement
  /** 가장 약한 오행 */
  weakest: FiveElement
  /** 없는 오행 목록 */
  missing: FiveElement[]
  /** 일간의 오행 */
  dayStemElement: FiveElement
  /** 일간의 음양 */
  dayStemYinYang: YinYang
  /** 월령 오행 (월지의 대표 오행) */
  monthElement: FiveElement
  /** 상세 내역 (디버그/표시용) */
  details: ElementDetail[]
}

/** 개별 글자의 오행 상세 */
export interface ElementDetail {
  position: string      // 년간, 년지, 월간, ... 
  char: string          // 한자
  element: FiveElement  // 오행
  yinYang: YinYang      // 음양
  isHidden: boolean     // 지장간 여부
  hiddenRole?: string   // 지장간 역할 (여기/중기/정기)
  hiddenDays?: number   // 지장간 사령 일수
}

// ============================================================
// 천간 → 오행/음양 매핑
// ============================================================

const STEM_ELEMENT_MAP: Record<string, ElementInfo> = {
  '甲': { element: '木', elementName: '목', yinYang: '양' },
  '乙': { element: '木', elementName: '목', yinYang: '음' },
  '丙': { element: '火', elementName: '화', yinYang: '양' },
  '丁': { element: '火', elementName: '화', yinYang: '음' },
  '戊': { element: '土', elementName: '토', yinYang: '양' },
  '己': { element: '土', elementName: '토', yinYang: '음' },
  '庚': { element: '金', elementName: '금', yinYang: '양' },
  '辛': { element: '金', elementName: '금', yinYang: '음' },
  '壬': { element: '水', elementName: '수', yinYang: '양' },
  '癸': { element: '水', elementName: '수', yinYang: '음' },
}

// ============================================================
// 지지 → 오행/음양 매핑
// ============================================================

const BRANCH_ELEMENT_MAP: Record<string, ElementInfo> = {
  '子': { element: '水', elementName: '수', yinYang: '양' },
  '丑': { element: '土', elementName: '토', yinYang: '음' },
  '寅': { element: '木', elementName: '목', yinYang: '양' },
  '卯': { element: '木', elementName: '목', yinYang: '음' },
  '辰': { element: '土', elementName: '토', yinYang: '양' },
  '巳': { element: '火', elementName: '화', yinYang: '양' },
  '午': { element: '火', elementName: '화', yinYang: '음' },
  '未': { element: '土', elementName: '토', yinYang: '음' },
  '申': { element: '金', elementName: '금', yinYang: '양' },
  '酉': { element: '金', elementName: '금', yinYang: '음' },
  '戌': { element: '土', elementName: '토', yinYang: '양' },
  '亥': { element: '水', elementName: '수', yinYang: '음' },
}

// ============================================================
// 공개 함수
// ============================================================
// ============================================================
// 위치별 가중치 (C1: 오행 가중치 고도화)
// ============================================================

/** 천간 위치별 가중치 [년간, 월간, 일간, 시간] */
const STEM_POSITION_WEIGHTS = [25, 35, 30, 20]

/** 지장간 위치별 배율 [년지, 월지, 일지, 시지] */
const BRANCH_POSITION_MULTIPLIERS = [0.8, 1.5, 1.2, 0.8]

/**
 * 천간의 오행 정보 반환
 */
export function getStemElement(stemChar: string): ElementInfo {
  const info = STEM_ELEMENT_MAP[stemChar]
  if (!info) throw new Error(`알 수 없는 천간: ${stemChar}`)
  return info
}

/**
 * 지지의 오행 정보 반환
 */
export function getBranchElement(branchChar: string): ElementInfo {
  const info = BRANCH_ELEMENT_MAP[branchChar]
  if (!info) throw new Error(`알 수 없는 지지: ${branchChar}`)
  return info
}

/**
 * 빈 오행 카운트 생성
 */
function emptyCount(): FiveElementCount {
  return { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
}

/**
 * 사주 전체 오행 분포 분석
 * 
 * @param stemChars 천간 4개 [년간, 월간, 일간, 시간]
 * @param branchChars 지지 4개 [년지, 월지, 일지, 시지]
 * @returns 오행 분석 결과
 * 
 * @example
 * analyzeFiveElements(
 *   ['甲', '丙', '戊', '庚'],  // 천간
 *   ['辰', '午', '子', '寅']   // 지지
 * )
 */
export function analyzeFiveElements(
  stemChars: string[],
  branchChars: string[]
): FiveElementAnalysis {
  const positions = ['년간', '월간', '일간', '시간']
  const branchPositions = ['년지', '월지', '일지', '시지']

  const stemElements = emptyCount()
  const branchElements = emptyCount()
  const totalElements = emptyCount()
  const weightedElements = emptyCount()
  const details: ElementDetail[] = []

  // ──────────── 1. 표면 천간 분석 (위치별 가중치) ────────────
  for (let i = 0; i < stemChars.length; i++) {
    const info = getStemElement(stemChars[i])
    stemElements[info.element]++
    totalElements[info.element]++
    weightedElements[info.element] += STEM_POSITION_WEIGHTS[i] ?? 20

    details.push({
      position: positions[i],
      char: stemChars[i],
      element: info.element,
      yinYang: info.yinYang,
      isHidden: false,
    })
  }

  // ──────────── 2. 지지 오행 분석 ────────────
  for (let i = 0; i < branchChars.length; i++) {
    const info = getBranchElement(branchChars[i])
    branchElements[info.element]++

    details.push({
      position: branchPositions[i],
      char: branchChars[i],
      element: info.element,
      yinYang: info.yinYang,
      isHidden: false,
    })
  }

  // ──────────── 3. 지장간 분석 (위치별 배율) ────────────
  for (let i = 0; i < branchChars.length; i++) {
    const hiddenStems = getHiddenStems(branchChars[i])
    const multiplier = BRANCH_POSITION_MULTIPLIERS[i] ?? 0.8

    for (const hidden of hiddenStems) {
      const info = getStemElement(hidden.char)
      totalElements[info.element]++
      weightedElements[info.element] += Math.round(hidden.days * multiplier * 10) / 10

      details.push({
        position: `${branchPositions[i]}→${hidden.roleName}`,
        char: hidden.char,
        element: info.element,
        yinYang: info.yinYang,
        isHidden: true,
        hiddenRole: hidden.roleName,
        hiddenDays: hidden.days,
      })
    }
  }

  // ──────────── 4. 분석 ────────────
  const ALL_ELEMENTS: FiveElement[] = ['木', '火', '土', '金', '水']

  let strongest: FiveElement = '木'
  let weakest: FiveElement = '木'
  let maxVal = -1
  let minVal = Infinity

  for (const el of ALL_ELEMENTS) {
    if (weightedElements[el] > maxVal) {
      maxVal = weightedElements[el]
      strongest = el
    }
    if (weightedElements[el] < minVal) {
      minVal = weightedElements[el]
      weakest = el
    }
  }

  const missing = ALL_ELEMENTS.filter(el => totalElements[el] === 0)
  const dayStemInfo = getStemElement(stemChars[2])

  // 월령 오행 (월지 = branchChars[1])
  const monthElement = branchChars.length >= 2
    ? getBranchElement(branchChars[1]).element
    : dayStemInfo.element

  return {
    stemElements,
    branchElements,
    totalElements,
    weightedElements,
    strongest,
    weakest,
    missing,
    dayStemElement: dayStemInfo.element,
    dayStemYinYang: dayStemInfo.yinYang,
    monthElement,
    details,
  }
}

/**
 * 오행 분포를 보기 좋게 출력 (디버그용)
 */
export function formatFiveElements(analysis: FiveElementAnalysis): string {
  const lines: string[] = []
  const ELEMENT_NAMES: Record<FiveElement, string> = {
    '木': '목(木)', '火': '화(火)', '土': '토(土)', '金': '금(金)', '水': '수(水)',
  }

  lines.push('┌──────────────────────────────────────┐')
  lines.push('│          오행(五行) 분포 분석          │')
  lines.push('├──────────────────────────────────────┤')

  // 표면 천간
  lines.push('│ [표면 천간]                           │')
  for (const el of ['木','火','土','金','水'] as FiveElement[]) {
    const count = analysis.stemElements[el]
    const bar = '■'.repeat(count) + '□'.repeat(4 - count)
    lines.push(`│   ${ELEMENT_NAMES[el]}: ${bar} ${count}개`.padEnd(39) + '│')
  }

  lines.push('├──────────────────────────────────────┤')

  // 전체 (지장간 포함)
  lines.push('│ [전체 - 지장간 포함]                   │')
  for (const el of ['木','火','土','金','水'] as FiveElement[]) {
    const count = analysis.totalElements[el]
    const weight = analysis.weightedElements[el]
    lines.push(`│   ${ELEMENT_NAMES[el]}: ${String(count).padStart(2)}개 (가중치: ${String(weight).padStart(3)})`.padEnd(39) + '│')
  }

  lines.push('├──────────────────────────────────────┤')

  // 요약
  lines.push(`│ 일간: ${analysis.dayStemYinYang}${ELEMENT_NAMES[analysis.dayStemElement]}`.padEnd(39) + '│')
  lines.push(`│ 최강: ${ELEMENT_NAMES[analysis.strongest]}`.padEnd(39) + '│')
  lines.push(`│ 최약: ${ELEMENT_NAMES[analysis.weakest]}`.padEnd(39) + '│')

  if (analysis.missing.length > 0) {
    const missingStr = analysis.missing.map(el => ELEMENT_NAMES[el]).join(', ')
    lines.push(`│ 부재: ${missingStr}`.padEnd(39) + '│')
  } else {
    lines.push('│ 부재: 없음 (오행 균형)'.padEnd(39) + '│')
  }

  lines.push('└──────────────────────────────────────┘')

  return lines.join('\n')
}