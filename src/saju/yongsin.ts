/**
 * yongsin.ts - 용신(用神) 판단 모듈
 *
 * 용신 = 사주의 균형을 맞추기 위해 가장 필요한 오행
 *
 * 5신 체계:
 *   용신(用神) - 가장 필요한 오행
 *   희신(喜神) - 용신을 돕는 오행
 *   기신(忌神) - 용신을 방해하는 오행
 *   구신(仇神) - 기신을 돕는 오행
 *   한신(閑神) - 크게 영향 없는 오행
 *
 * 판단 방법:
 *   ① 억부용신 - 신강/신약에 따라 필요한 오행
 *   ② 조후용신 - 계절(생월)에 따라 필요한 오행
 *   ③ combined - 억부 + 조후 종합 판단 (기본값)
 */

import { STEMS, BRANCHES, GENERATES, OVERCOMES, ELEMENT_KO } from './constants'
import { Pillar, StemInfo, BranchInfo } from './types'
import { getHiddenStems, HiddenStemEntry } from './hiddenStems'

// ─── 오행 타입 ───────────────────────────────────────────

export type FiveElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

const ALL_ELEMENTS: FiveElement[] = ['wood', 'fire', 'earth', 'metal', 'water']

// ─── 오행 관계 맵 ────────────────────────────────────────

/** 나를 생하는 오행 (인성) */
const GENERATED_BY: Record<string, string> = {
  wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal'
}

/** 나를 극하는 오행 (관성) */
const OVERCOME_BY: Record<string, string> = {
  wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth'
}

// ─── 옵션 타입 ───────────────────────────────────────────

export type YongsinMethod = 'eokbu' | 'johu' | 'combined'
export type DetailLevel = 'simple' | 'full'

export interface YongsinOptions {
  method?: YongsinMethod              // 기본: 'combined'
  includeSpecialPattern?: boolean      // 종격 판단 포함 (기본: false)
  detailLevel?: DetailLevel            // 기본: 'full'
}

// ─── 5신 역할 ────────────────────────────────────────────

export type SinRole = '용신' | '희신' | '기신' | '구신' | '한신'

export interface ElementRole {
  element: FiveElement
  elementKo: string
  role: SinRole
  reason: string
  score: number          // 필요도 점수 (높을수록 필요)
}

// ─── 조후 테이블 ─────────────────────────────────────────

interface JohuEntry {
  primary: FiveElement       // 1순위 필요 오행
  secondary: FiveElement     // 2순위
  reason: string
}

/**
 * 조후용신 테이블
 * Key: `${일간오행}_${생월지지인덱스}`
 *
 * 생월 지지:
 *   寅(2)=봄, 卯(3)=봄, 辰(4)=봄
 *   巳(5)=여름, 午(6)=여름, 未(7)=여름
 *   申(8)=가을, 酉(9)=가을, 戌(10)=가을
 *   亥(11)=겨울, 子(0)=겨울, 丑(1)=겨울
 */
const JOHU_TABLE: Record<string, JohuEntry> = {
  // ── 목(木) 일간 ──
  'wood_0':  { primary: 'fire',  secondary: 'water', reason: '겨울 목 → 화로 따뜻함, 수는 있으나 과하면 안됨' },
  'wood_1':  { primary: 'fire',  secondary: 'water', reason: '겨울 목 → 화가 급선무' },
  'wood_2':  { primary: 'water', secondary: 'fire',  reason: '봄 목 → 수로 자양, 화로 발산' },
  'wood_3':  { primary: 'water', secondary: 'fire',  reason: '봄 목 → 수로 자양' },
  'wood_4':  { primary: 'water', secondary: 'metal', reason: '늦봄 목 → 수 필요, 금으로 조절' },
  'wood_5':  { primary: 'water', secondary: 'metal', reason: '여름 목 → 수로 해갈, 금으로 자양' },
  'wood_6':  { primary: 'water', secondary: 'metal', reason: '여름 목 → 수가 급선무' },
  'wood_7':  { primary: 'water', secondary: 'metal', reason: '늦여름 목 → 수 필요' },
  'wood_8':  { primary: 'water', secondary: 'fire',  reason: '가을 목 → 수로 생, 화로 금 제어' },
  'wood_9':  { primary: 'water', secondary: 'fire',  reason: '가을 목 → 금왕, 수와 화 필요' },
  'wood_10': { primary: 'water', secondary: 'fire',  reason: '늦가을 목 → 수와 화 필요' },
  'wood_11': { primary: 'fire',  secondary: 'water', reason: '겨울 목 → 화로 따뜻함' },

  // ── 화(火) 일간 ──
  'fire_0':  { primary: 'wood',  secondary: 'earth', reason: '겨울 화 → 목으로 생화, 토로 조절' },
  'fire_1':  { primary: 'wood',  secondary: 'earth', reason: '겨울 화 → 목이 급선무' },
  'fire_2':  { primary: 'wood',  secondary: 'water', reason: '봄 화 → 목으로 생, 수로 조절' },
  'fire_3':  { primary: 'water', secondary: 'earth', reason: '봄 화 → 화왕, 수로 제어' },
  'fire_4':  { primary: 'water', secondary: 'metal', reason: '늦봄 화 → 수로 제어' },
  'fire_5':  { primary: 'water', secondary: 'metal', reason: '여름 화 → 수가 급선무' },
  'fire_6':  { primary: 'water', secondary: 'metal', reason: '여름 화 → 수로 해갈' },
  'fire_7':  { primary: 'water', secondary: 'metal', reason: '늦여름 화 → 수 필요' },
  'fire_8':  { primary: 'wood',  secondary: 'earth', reason: '가을 화 → 목으로 생화' },
  'fire_9':  { primary: 'wood',  secondary: 'earth', reason: '가을 화 → 목이 필요' },
  'fire_10': { primary: 'wood',  secondary: 'water', reason: '늦가을 화 → 목으로 생' },
  'fire_11': { primary: 'wood',  secondary: 'earth', reason: '겨울 화 → 목으로 생화' },

  // ── 토(Earth) 일간 ──
  'earth_0':  { primary: 'fire',  secondary: 'wood',  reason: '겨울 토 → 화로 따뜻함, 목으로 소통' },
  'earth_1':  { primary: 'fire',  secondary: 'wood',  reason: '겨울 토 → 화가 급선무' },
  'earth_2':  { primary: 'fire',  secondary: 'metal', reason: '봄 토 → 화로 생, 금으로 설기' },
  'earth_3':  { primary: 'fire',  secondary: 'metal', reason: '봄 토 → 목왕, 화로 통관' },
  'earth_4':  { primary: 'metal', secondary: 'water', reason: '늦봄 토 → 금수로 설기' },
  'earth_5':  { primary: 'water', secondary: 'metal', reason: '여름 토 → 수로 해갈' },
  'earth_6':  { primary: 'water', secondary: 'metal', reason: '여름 토 → 수가 급선무' },
  'earth_7':  { primary: 'metal', secondary: 'water', reason: '늦여름 토 → 금수로 설기' },
  'earth_8':  { primary: 'fire',  secondary: 'wood',  reason: '가을 토 → 화로 생토' },
  'earth_9':  { primary: 'fire',  secondary: 'wood',  reason: '가을 토 → 금왕, 화로 제어' },
  'earth_10': { primary: 'fire',  secondary: 'water', reason: '늦가을 토 → 화로 생' },
  'earth_11': { primary: 'fire',  secondary: 'wood',  reason: '겨울 토 → 화로 따뜻함' },

  // ── 금(Metal) 일간 ──
  'metal_0':  { primary: 'fire',  secondary: 'earth', reason: '겨울 금 → 화로 따뜻함, 토로 생' },
  'metal_1':  { primary: 'fire',  secondary: 'earth', reason: '겨울 금 → 화가 필요' },
  'metal_2':  { primary: 'earth', secondary: 'fire',  reason: '봄 금 → 토로 생금, 화로 조절' },
  'metal_3':  { primary: 'earth', secondary: 'fire',  reason: '봄 금 → 목왕, 토로 보호' },
  'metal_4':  { primary: 'water', secondary: 'earth', reason: '늦봄 금 → 수로 설기' },
  'metal_5':  { primary: 'water', secondary: 'earth', reason: '여름 금 → 수로 해갈' },
  'metal_6':  { primary: 'water', secondary: 'earth', reason: '여름 금 → 수가 급선무' },
  'metal_7':  { primary: 'water', secondary: 'earth', reason: '늦여름 금 → 수와 토 필요' },
  'metal_8':  { primary: 'water', secondary: 'fire',  reason: '가을 금 → 수로 설기, 화로 제련' },
  'metal_9':  { primary: 'water', secondary: 'fire',  reason: '가을 금 → 금왕, 수와 화 필요' },
  'metal_10': { primary: 'water', secondary: 'fire',  reason: '늦가을 금 → 수로 설기' },
  'metal_11': { primary: 'fire',  secondary: 'earth', reason: '겨울 금 → 화로 따뜻함' },

  // ── 수(Water) 일간 ──
  'water_0':  { primary: 'fire',  secondary: 'earth', reason: '겨울 수 → 화로 따뜻함, 토로 제방' },
  'water_1':  { primary: 'fire',  secondary: 'earth', reason: '겨울 수 → 화가 급선무' },
  'water_2':  { primary: 'fire',  secondary: 'metal', reason: '봄 수 → 화로 발산, 금으로 생' },
  'water_3':  { primary: 'fire',  secondary: 'metal', reason: '봄 수 → 목왕 설기, 화 필요' },
  'water_4':  { primary: 'metal', secondary: 'water', reason: '늦봄 수 → 금으로 생수' },
  'water_5':  { primary: 'metal', secondary: 'water', reason: '여름 수 → 금으로 생수' },
  'water_6':  { primary: 'metal', secondary: 'water', reason: '여름 수 → 금이 급선무' },
  'water_7':  { primary: 'metal', secondary: 'water', reason: '늦여름 수 → 금 필요' },
  'water_8':  { primary: 'fire',  secondary: 'wood',  reason: '가을 수 → 화로 발산' },
  'water_9':  { primary: 'fire',  secondary: 'wood',  reason: '가을 수 → 금왕생수, 화 필요' },
  'water_10': { primary: 'fire',  secondary: 'wood',  reason: '늦가을 수 → 화 필요' },
  'water_11': { primary: 'fire',  secondary: 'earth', reason: '겨울 수 → 화로 따뜻함' },
}

// ─── 특수격국 판단 (선택적) ──────────────────────────────

export type PatternType = 'normal' | 'jonggang' | 'jongjae' | 'jongsal' | 'jonga'

export interface SpecialPatternResult {
  isSpecial: boolean
  patternType: PatternType
  patternName: string
  description: string
}

function checkSpecialPattern(
  dayStemIndex: number,
  strengthScore: number,
  helpScore: number,
  restrainScore: number,
  monthBranchElement: string
): SpecialPatternResult {
  const normal: SpecialPatternResult = {
    isSpecial: false,
    patternType: 'normal',
    patternName: '보통격(普通格)',
    description: '일반적인 억부용신 적용',
  }

  // 극단적 신약 (도움 비율 20% 이하) → 종격 가능
  const totalScore = helpScore + restrainScore
  if (totalScore === 0) return normal

  const helpRatio = helpScore / totalScore

  // 종강격: 극단적 신강 (도움 비율 80% 이상)
  if (helpRatio >= 0.80) {
    return {
      isSpecial: true,
      patternType: 'jonggang',
      patternName: '종강격(從強格)',
      description: '극단적 신강 → 강한 쪽을 따름 (비화/인성이 용신)',
    }
  }

  // 종격들: 극단적 신약 (도움 비율 20% 이하)
  if (helpRatio <= 0.20) {
    const dayElement = STEMS[dayStemIndex].element

    // 월지 오행으로 종격 종류 판단
    if (OVERCOMES[monthBranchElement] === dayElement) {
      return {
        isSpecial: true,
        patternType: 'jongsal',
        patternName: '종살격(從殺格)',
        description: '극단적 신약 + 관살 왕 → 관살을 따름',
      }
    }
    if (OVERCOMES[dayElement] === monthBranchElement) {
      return {
        isSpecial: true,
        patternType: 'jongjae',
        patternName: '종재격(從財格)',
        description: '극단적 신약 + 재성 왕 → 재성을 따름',
      }
    }
    if (GENERATES[dayElement] === monthBranchElement) {
      return {
        isSpecial: true,
        patternType: 'jonga',
        patternName: '종아격(從兒格)',
        description: '극단적 신약 + 식상 왕 → 식상을 따름',
      }
    }

    // 일반 종격
    return {
      isSpecial: true,
      patternType: 'jongjae',
      patternName: '종격(從格)',
      description: '극단적 신약 → 왕한 오행을 따름',
    }
  }

  return normal
}

// ─── 억부용신 계산 ───────────────────────────────────────

interface EokbuResult {
  yongsin: FiveElement
  heeshin: FiveElement
  gishin: FiveElement
  gushin: FiveElement
  hanshin: FiveElement
  reason: string
}

function calculateEokbu(
  dayElement: FiveElement,
  strengthResult: 'strong' | 'weak' | 'neutral',
  strengthLevel: number,
  isSpecial: boolean,
  patternType: PatternType
): EokbuResult {
  // 특수격국: 용신 판단이 뒤집힘
  if (isSpecial) {
    if (patternType === 'jonggang') {
      // 종강격: 비화/인성이 용신 (강한 쪽 따라감)
      const yongsin = dayElement                           // 비화
      const heeshin = GENERATED_BY[dayElement] as FiveElement  // 인성 (나를 생하는)
      const gishin = OVERCOMES[dayElement] as FiveElement      // 재성 (내가 극하는) → 체력 소모
      const gushin = OVERCOME_BY[dayElement] as FiveElement    // 관성 (나를 극하는)
      const hanshin = GENERATES[dayElement] as FiveElement     // 식상

      return {
        yongsin, heeshin, gishin, gushin, hanshin,
        reason: `종강격: ${ELEMENT_KO[dayElement]}(비화)가 용신, 강한 쪽을 따름`
      }
    }

    // 종격(종재/종살/종아): 왕한 오행을 따라감
    // 간단히: 신약의 반대 → 극하는/설기하는 오행이 용신
    const yongsin = GENERATES[dayElement] as FiveElement        // 식상 (내가 생하는)
    const heeshin = OVERCOMES[dayElement] as FiveElement        // 재성
    const gishin = dayElement                                    // 비화 → 오히려 나쁨
    const gushin = GENERATED_BY[dayElement] as FiveElement      // 인성
    const hanshin = OVERCOME_BY[dayElement] as FiveElement      // 관성

    return {
      yongsin, heeshin, gishin, gushin, hanshin,
      reason: `종격: ${ELEMENT_KO[yongsin]}(식상)이 용신, 약한 쪽을 따름`
    }
  }

  // 보통격: 억부용신
  if (strengthResult === 'strong' || (strengthResult === 'neutral' && strengthLevel > 0)) {
    // 신강 → 설기/극하는 오행이 필요
    // 용신: 식상(내가 생하는) 또는 재성(내가 극하는) 또는 관성(나를 극하는)
    const yongsin = GENERATES[dayElement] as FiveElement        // 식상 (설기)
    const heeshin = OVERCOMES[dayElement] as FiveElement        // 재성
    const gishin = GENERATED_BY[dayElement] as FiveElement      // 인성 (나를 더 강하게)
    const gushin = dayElement                                    // 비화
    const hanshin = OVERCOME_BY[dayElement] as FiveElement      // 관성

    return {
      yongsin, heeshin, gishin, gushin, hanshin,
      reason: `신강: ${ELEMENT_KO[yongsin]}(식상)으로 설기, ${ELEMENT_KO[heeshin]}(재성)이 희신`
    }
  } else {
    // 신약 → 생조/돕는 오행이 필요
    // 용신: 인성(나를 생하는) 또는 비화(같은 오행)
    const yongsin = GENERATED_BY[dayElement] as FiveElement     // 인성 (나를 생)
    const heeshin = dayElement                                   // 비화
    const gishin = GENERATES[dayElement] as FiveElement          // 식상 (더 약하게)
    const gushin = OVERCOMES[dayElement] as FiveElement          // 재성
    const hanshin = OVERCOME_BY[dayElement] as FiveElement       // 관성

    return {
      yongsin, heeshin, gishin, gushin, hanshin,
      reason: `신약: ${ELEMENT_KO[yongsin]}(인성)으로 생조, ${ELEMENT_KO[heeshin]}(비화)가 희신`
    }
  }
}

// ─── 조후용신 계산 ───────────────────────────────────────

interface JohuResult {
  primary: FiveElement
  secondary: FiveElement
  reason: string
  season: string
}

function calculateJohu(
  dayElement: FiveElement,
  monthBranchIndex: number
): JohuResult {
  const key = `${dayElement}_${monthBranchIndex}`
  const entry = JOHU_TABLE[key]

  // 계절 판단
  let season: string
  if ([2, 3, 4].includes(monthBranchIndex)) season = '봄(春)'
  else if ([5, 6, 7].includes(monthBranchIndex)) season = '여름(夏)'
  else if ([8, 9, 10].includes(monthBranchIndex)) season = '가을(秋)'
  else season = '겨울(冬)'

  if (!entry) {
    // 테이블에 없는 경우 기본값
    return {
      primary: 'water',
      secondary: 'fire',
      reason: `조후 데이터 없음 (${key})`,
      season,
    }
  }

  return {
    primary: entry.primary,
    secondary: entry.secondary,
    reason: entry.reason,
    season,
  }
}

// ─── 종합 용신 (combined) ────────────────────────────────

interface CombinedScore {
  element: FiveElement
  eokbuScore: number     // 억부 관점 점수
  johuScore: number       // 조후 관점 점수
  totalScore: number      // 종합 점수
}

function calculateCombined(
  eokbu: EokbuResult,
  johu: JohuResult
): { scores: CombinedScore[]; yongsin: FiveElement; reason: string } {
  const scores: CombinedScore[] = ALL_ELEMENTS.map(el => {
    let eokbuScore = 0
    let johuScore = 0

    // 억부 점수
    if (el === eokbu.yongsin) eokbuScore = 10
    else if (el === eokbu.heeshin) eokbuScore = 7
    else if (el === eokbu.hanshin) eokbuScore = 3
    else if (el === eokbu.gushin) eokbuScore = -3
    else if (el === eokbu.gishin) eokbuScore = -7

    // 조후 점수
    if (el === johu.primary) johuScore = 8
    else if (el === johu.secondary) johuScore = 5

    return {
      element: el,
      eokbuScore,
      johuScore,
      totalScore: eokbuScore + johuScore,
    }
  })

  // 점수 내림차순 정렬
  scores.sort((a, b) => b.totalScore - a.totalScore)

  const yongsin = scores[0].element
  const reason = `억부(${ELEMENT_KO[eokbu.yongsin]}) + 조후(${ELEMENT_KO[johu.primary]}) 종합 → ${ELEMENT_KO[yongsin]}`

  return { scores, yongsin, reason }
}

// ─── 5신 배정 ────────────────────────────────────────────

function assignFiveSin(
  yongsinElement: FiveElement,
  dayElement: FiveElement,
  strengthResult: 'strong' | 'weak' | 'neutral',
  isSpecial: boolean,
  patternType: PatternType
): ElementRole[] {
  const roles: ElementRole[] = []

  // 용신 기준으로 5신 배정
  // 용신을 생하는 → 희신
  // 용신을 극하는 → 기신
  // 기신을 생하는 → 구신
  // 나머지 → 한신

  const heeshinElement = GENERATED_BY[yongsinElement] as FiveElement    // 용신을 생하는
  const gishinElement = OVERCOME_BY[yongsinElement] as FiveElement      // 용신을 극하는
  const gushinElement = GENERATED_BY[gishinElement] as FiveElement      // 기신을 생하는

  // 남은 1개가 한신
  const assigned = [yongsinElement, heeshinElement, gishinElement, gushinElement]
  const hanshinElement = ALL_ELEMENTS.find(e => !assigned.includes(e)) || 'earth'

  const makeRole = (el: FiveElement, role: SinRole, reason: string, score: number): ElementRole => ({
    element: el,
    elementKo: ELEMENT_KO[el] || el,
    role,
    reason,
    score,
  })

  roles.push(makeRole(yongsinElement, '용신', `사주에 가장 필요한 오행`, 10))
  roles.push(makeRole(heeshinElement as FiveElement, '희신', `용신(${ELEMENT_KO[yongsinElement]})을 생하는 오행`, 7))
  roles.push(makeRole(gishinElement as FiveElement, '기신', `용신(${ELEMENT_KO[yongsinElement]})을 극하는 오행`, -7))
  roles.push(makeRole(gushinElement as FiveElement, '구신', `기신(${ELEMENT_KO[gishinElement]})을 생하는 오행`, -3))
  roles.push(makeRole(hanshinElement as FiveElement, '한신', `크게 영향 없는 오행`, 0))

  return roles
}

// ─── 결과 타입 ───────────────────────────────────────────

export interface YongsinResult {
  /** 최종 용신 오행 */
  yongsin: FiveElement
  yongsinKo: string

  /** 5신 배정 */
  fiveSin: ElementRole[]

  /** 억부용신 결과 */
  eokbu: {
    yongsin: FiveElement
    yongsinKo: string
    heeshin: FiveElement
    gishin: FiveElement
    reason: string
  }

  /** 조후용신 결과 */
  johu: {
    primary: FiveElement
    primaryKo: string
    secondary: FiveElement
    secondaryKo: string
    season: string
    reason: string
  }

  /** 종합 점수 (combined 모드일 때) */
  combinedScores?: CombinedScore[]

  /** 특수격국 (옵션 활성화 시) */
  specialPattern?: SpecialPatternResult

  /** 판단 방법 */
  method: YongsinMethod

  /** 종합 판단 근거 */
  reason: string

  /** 실용 가이드 */
  guide: {
    favorableElements: string[]    // 좋은 오행 (한글)
    unfavorableElements: string[]  // 나쁜 오행 (한글)
    favorableColors: string[]      // 좋은 색상
    favorableDirections: string[]  // 좋은 방향
    favorableSeasons: string[]     // 좋은 계절
  }
}

// ─── 실용 가이드 데이터 ──────────────────────────────────

const ELEMENT_COLORS: Record<string, string[]> = {
  wood:  ['초록', '청록', '연두'],
  fire:  ['빨강', '주황', '보라'],
  earth: ['노랑', '갈색', '베이지'],
  metal: ['흰색', '금색', '은색'],
  water: ['검정', '파랑', '남색'],
}

const ELEMENT_DIRECTIONS: Record<string, string> = {
  wood: '동쪽', fire: '남쪽', earth: '중앙',
  metal: '서쪽', water: '북쪽',
}

const ELEMENT_SEASONS: Record<string, string> = {
  wood: '봄', fire: '여름', earth: '환절기',
  metal: '가을', water: '겨울',
}

function buildGuide(fiveSin: ElementRole[]): YongsinResult['guide'] {
  const favorable = fiveSin.filter(r => r.role === '용신' || r.role === '희신')
  const unfavorable = fiveSin.filter(r => r.role === '기신' || r.role === '구신')

  return {
    favorableElements: favorable.map(r => r.elementKo),
    unfavorableElements: unfavorable.map(r => r.elementKo),
    favorableColors: favorable.flatMap(r => ELEMENT_COLORS[r.element] || []),
    favorableDirections: favorable.map(r => ELEMENT_DIRECTIONS[r.element] || ''),
    favorableSeasons: favorable.map(r => ELEMENT_SEASONS[r.element] || ''),
  }
}

// ─── 메인: 용신 계산 함수 ────────────────────────────────

/**
 * 용신을 계산합니다.
 *
 * @param dayStemIndex     일간 인덱스 (0~9)
 * @param monthBranchIndex 월지 인덱스 (0~11) - 조후용신에 사용
 * @param strengthResult   신강/신약 판단 결과
 * @param strengthLevel    신강/신약 점수 (-100~100)
 * @param helpScore        돕는 세력 점수
 * @param restrainScore    억제 세력 점수
 * @param options          옵션
 */
export function calculateYongsin(
  dayStemIndex: number,
  monthBranchIndex: number,
  strengthResult: 'strong' | 'weak' | 'neutral',
  strengthLevel: number,
  helpScore: number,
  restrainScore: number,
  options: YongsinOptions = {}
): YongsinResult {
  const method = options.method ?? 'combined'
  const includeSpecial = options.includeSpecialPattern ?? false
  const detailLevel = options.detailLevel ?? 'full'

  const dayElement = STEMS[dayStemIndex].element as FiveElement
  const monthBranchElement = BRANCHES[monthBranchIndex].element as FiveElement

  // ① 특수격국 판단 (옵션)
  let specialPattern: SpecialPatternResult | undefined
  let isSpecial = false
  let patternType: PatternType = 'normal'

  if (includeSpecial) {
    specialPattern = checkSpecialPattern(
      dayStemIndex, strengthLevel, helpScore, restrainScore, monthBranchElement
    )
    isSpecial = specialPattern.isSpecial
    patternType = specialPattern.patternType
  }

  // ② 억부용신 계산
  const eokbu = calculateEokbu(dayElement, strengthResult, strengthLevel, isSpecial, patternType)

  // ③ 조후용신 계산
  const johu = calculateJohu(dayElement, monthBranchIndex)

  // ④ 최종 용신 결정
  let finalYongsin: FiveElement
  let finalReason: string
  let combinedScores: CombinedScore[] | undefined

  if (method === 'eokbu') {
    finalYongsin = eokbu.yongsin
    finalReason = `억부용신: ${eokbu.reason}`
  } else if (method === 'johu') {
    finalYongsin = johu.primary
    finalReason = `조후용신: ${johu.reason}`
  } else {
    // combined
    const combined = calculateCombined(eokbu, johu)
    finalYongsin = combined.yongsin
    finalReason = combined.reason
    combinedScores = combined.scores
  }

  // ⑤ 5신 배정
  const fiveSin = assignFiveSin(finalYongsin, dayElement, strengthResult, isSpecial, patternType)

  // ⑥ 실용 가이드
  const guide = buildGuide(fiveSin)

  return {
    yongsin: finalYongsin,
    yongsinKo: ELEMENT_KO[finalYongsin] || finalYongsin,
    fiveSin,
    eokbu: {
      yongsin: eokbu.yongsin,
      yongsinKo: ELEMENT_KO[eokbu.yongsin] || eokbu.yongsin,
      heeshin: eokbu.heeshin,
      gishin: eokbu.gishin,
      reason: eokbu.reason,
    },
    johu: {
      primary: johu.primary,
      primaryKo: ELEMENT_KO[johu.primary] || johu.primary,
      secondary: johu.secondary,
      secondaryKo: ELEMENT_KO[johu.secondary] || johu.secondary,
      season: johu.season,
      reason: johu.reason,
    },
    combinedScores,
    specialPattern,
    method,
    reason: finalReason,
    guide,
  }
}

// ─── 포맷 출력 ───────────────────────────────────────────

export function formatYongsin(result: YongsinResult): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════')
  lines.push('  용신(用神) 분석')
  lines.push('═══════════════════════════════════════════════════')
  lines.push(`  판단 방법: ${result.method === 'combined' ? '억부+조후 종합' : result.method === 'eokbu' ? '억부용신' : '조후용신'}`)
  lines.push(`  종합 판단: ${result.reason}`)
  lines.push('')

  // 5신
  lines.push('  ■ 5신 배정:')
  const roleOrder: SinRole[] = ['용신', '희신', '한신', '구신', '기신']
  for (const roleName of roleOrder) {
    const r = result.fiveSin.find(f => f.role === roleName)
    if (r) {
      const marker = r.role === '용신' ? '★' : r.role === '희신' ? '○' : r.role === '기신' ? '✕' : r.role === '구신' ? '△' : '─'
      lines.push(`    ${marker} ${r.role}: ${r.elementKo}(${r.element}) — ${r.reason}`)
    }
  }
  lines.push('')

  // 억부
  lines.push('  ■ 억부용신:')
  lines.push(`    용신: ${result.eokbu.yongsinKo} | ${result.eokbu.reason}`)
  lines.push('')

  // 조후
  lines.push('  ■ 조후용신:')
  lines.push(`    계절: ${result.johu.season}`)
  lines.push(`    1순위: ${result.johu.primaryKo} | 2순위: ${result.johu.secondaryKo}`)
  lines.push(`    근거: ${result.johu.reason}`)
  lines.push('')

  // 종합 점수
  if (result.combinedScores) {
    lines.push('  ■ 종합 점수:')
    for (const s of result.combinedScores) {
      const bar = s.totalScore > 0 ? '█'.repeat(Math.min(s.totalScore, 20)) : '░'.repeat(Math.min(Math.abs(s.totalScore), 20))
      lines.push(`    ${ELEMENT_KO[s.element]}(${s.element}): 억부${s.eokbuScore >= 0 ? '+' : ''}${s.eokbuScore} 조후${s.johuScore >= 0 ? '+' : ''}${s.johuScore} = ${s.totalScore >= 0 ? '+' : ''}${s.totalScore} ${bar}`)
    }
    lines.push('')
  }

  // 특수격국
  if (result.specialPattern) {
    lines.push('  ■ 격국 판단:')
    lines.push(`    ${result.specialPattern.patternName}: ${result.specialPattern.description}`)
    lines.push('')
  }

  // 실용 가이드
  lines.push('  ■ 실용 가이드:')
  lines.push(`    좋은 오행: ${result.guide.favorableElements.join(', ')}`)
  lines.push(`    나쁜 오행: ${result.guide.unfavorableElements.join(', ')}`)
  lines.push(`    좋은 색상: ${result.guide.favorableColors.join(', ')}`)
  lines.push(`    좋은 방향: ${result.guide.favorableDirections.join(', ')}`)
  lines.push(`    좋은 계절: ${result.guide.favorableSeasons.join(', ')}`)

  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}