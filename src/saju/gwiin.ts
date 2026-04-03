/**
 * 천을귀인(天乙貴人) 계산 모듈
 *
 * 천을귀인은 사주에서 가장 중요한 길신(吉神)으로,
 * 위기 시 도움을 주는 귀인, 좋은 인연, 보이지 않는 도움을 의미합니다.
 *
 * 일간(日干) 기준으로 천을귀인 지지 2개가 정해지며,
 * 원국 4기둥 지지 + 대운/세운 지지에서 확인합니다.
 *
 * ┌────────┬─────────────────────┐
 * │ 일간    │ 천을귀인 지지        │
 * ├────────┼─────────────────────┤
 * │ 甲(갑)  │ 丑(축), 未(미)       │
 * │ 乙(을)  │ 子(자), 申(신)       │
 * │ 丙(병)  │ 酉(유), 亥(해)       │
 * │ 丁(정)  │ 酉(유), 亥(해)       │
 * │ 戊(무)  │ 丑(축), 未(미)       │
 * │ 己(기)  │ 子(자), 申(신)       │
 * │ 庚(경)  │ 丑(축), 未(미)       │
 * │ 辛(신)  │ 寅(인), 午(오)       │
 * │ 壬(임)  │ 卯(묘), 巳(사)       │
 * │ 癸(계)  │ 卯(묘), 巳(사)       │
 * └────────┴─────────────────────┘
 *
 * 위치별 의미:
 * - 년지: 조상/사회적 귀인 → 가문, 사회적 배경에서 도움
 * - 월지: 부모/직장 귀인 → 부모, 직장 상사/동료에서 도움
 * - 일지: 배우자 귀인 → 배우자가 귀인 역할
 * - 시지: 자녀/말년 귀인 → 자녀, 후배, 말년에 도움
 */

import { STEMS, BRANCHES } from './constants'

// ─── 천을귀인 테이블 ────────────────────────────────────
// 일간 인덱스 → [귀인 지지 인덱스1, 귀인 지지 인덱스2]

const GWIIN_TABLE: Record<number, [number, number]> = {
  0: [1, 7],    // 甲(갑) → 丑(축,1), 未(미,7)
  1: [0, 8],    // 乙(을) → 子(자,0), 申(신,8)
  2: [9, 11],   // 丙(병) → 酉(유,9), 亥(해,11)
  3: [9, 11],   // 丁(정) → 酉(유,9), 亥(해,11)
  4: [1, 7],    // 戊(무) → 丑(축,1), 未(미,7)
  5: [0, 8],    // 己(기) → 子(자,0), 申(신,8)
  6: [1, 7],    // 庚(경) → 丑(축,1), 未(미,7)
  7: [2, 6],    // 辛(신) → 寅(인,2), 午(오,6)
  8: [3, 5],    // 壬(임) → 卯(묘,3), 巳(사,5)
  9: [3, 5],    // 癸(계) → 卯(묘,3), 巳(사,5)
}

// ─── 위치별 의미 ────────────────────────────────────────

const POSITION_MEANINGS: Record<string, {
  label: string
  keyword: string
  description: string
}> = {
  year: {
    label: '년지',
    keyword: '조상/사회적 귀인',
    description: '가문이나 사회적 배경에서 도움을 받습니다. 어른이나 윗사람의 후원이 있습니다.',
  },
  month: {
    label: '월지',
    keyword: '부모/직장 귀인',
    description: '부모나 직장에서 귀인을 만납니다. 상사나 동료의 도움으로 성장합니다.',
  },
  day: {
    label: '일지',
    keyword: '배우자 귀인',
    description: '배우자가 귀인 역할을 합니다. 결혼 후 운이 좋아지는 경향이 있습니다.',
  },
  hour: {
    label: '시지',
    keyword: '자녀/말년 귀인',
    description: '자녀나 후배가 귀인이 됩니다. 말년에 좋은 인연과 도움이 있습니다.',
  },
}

// ─── 타입 정의 ─────────────────────────────────────────

/** 천을귀인 지지 쌍 정보 */
export interface GwiinPair {
  /** 귀인 지지 인덱스 [첫째, 둘째] */
  indices: [number, number]
  /** 귀인 지지 한자 */
  chars: [string, string]
  /** 귀인 지지 한글 */
  names: [string, string]
  /** 귀인 지지 오행 한글 */
  elements: [string, string]
}

/** 원국 지지의 귀인 상태 */
export interface BranchGwiinStatus {
  /** 위치 ('year' | 'month' | 'day' | 'hour') */
  position: string
  /** 위치 한글 ('년지' | '월지' | '일지' | '시지') */
  positionLabel: string
  /** 해당 지지 한자 */
  branchChar: string
  /** 해당 지지 한글 */
  branchName: string
  /** 천을귀인 해당 여부 */
  isGwiin: boolean
  /** 귀인일 때 의미 키워드 */
  keyword: string
  /** 귀인일 때 설명 */
  description: string
}

/** 운세(대운/세운) 귀인 확인 결과 */
export interface FortuneGwiinResult {
  /** 운세 지지가 천을귀인인지 */
  isGwiin: boolean
  /** 운세 지지 한자 */
  fortuneBranchChar: string
  /** 운세 지지 한글 */
  fortuneBranchName: string
  /** 해석 텍스트 */
  description: string
}

/** 전체 천을귀인 분석 결과 */
export interface GwiinAnalysis {
  /** 일간 정보 */
  dayStem: {
    char: string
    name: string
    index: number
  }
  /** 천을귀인 지지 쌍 */
  gwiinPair: GwiinPair
  /** 원국 각 지지의 귀인 상태 */
  branchStatus: {
    year: BranchGwiinStatus
    month: BranchGwiinStatus
    day: BranchGwiinStatus
    hour: BranchGwiinStatus | null
  }
  /** 원국에서 귀인이 있는 위치 수 */
  gwiinCount: number
  /** 귀인이 있는 위치 목록 */
  gwiinPositions: string[]
  /** 요약 텍스트 배열 */
  summary: string[]
}

// ─── 핵심 계산 함수 ────────────────────────────────────

/**
 * 일간 기준 천을귀인 지지 2개를 반환
 *
 * @param dayStemIndex 일간(천간) 인덱스 (0~9)
 * @returns GwiinPair
 */
export function getGwiinBranches(dayStemIndex: number): GwiinPair {
  const pair = GWIIN_TABLE[dayStemIndex]
  if (!pair) {
    throw new Error(`잘못된 일간 인덱스: ${dayStemIndex}`)
  }

  const [idx1, idx2] = pair
  return {
    indices: [idx1, idx2],
    chars: [BRANCHES[idx1].char, BRANCHES[idx2].char],
    names: [BRANCHES[idx1].name, BRANCHES[idx2].name],
    elements: [BRANCHES[idx1].elementKo, BRANCHES[idx2].elementKo],
  }
}

/**
 * 특정 지지가 천을귀인인지 확인
 *
 * @param dayStemIndex 일간(천간) 인덱스 (0~9)
 * @param targetBranchIndex 확인할 지지 인덱스 (0~11)
 * @returns boolean
 */
export function isGwiin(
  dayStemIndex: number,
  targetBranchIndex: number
): boolean {
  const pair = GWIIN_TABLE[dayStemIndex]
  if (!pair) return false
  return pair[0] === targetBranchIndex || pair[1] === targetBranchIndex
}

/**
 * 원국 전체 천을귀인 분석
 *
 * @param dayStemIndex 일간(천간) 인덱스
 * @param yearBranchIndex 년지 인덱스
 * @param monthBranchIndex 월지 인덱스
 * @param dayBranchIndex 일지 인덱스
 * @param hourBranchIndex 시지 인덱스 (null이면 시간 미상)
 */
export function analyzeGwiin(
  dayStemIndex: number,
  yearBranchIndex: number,
  monthBranchIndex: number,
  dayBranchIndex: number,
  hourBranchIndex: number | null
): GwiinAnalysis {
  const dayStem = STEMS[dayStemIndex]
  const gwiinPair = getGwiinBranches(dayStemIndex)

  function checkStatus(
    position: string,
    branchIndex: number
  ): BranchGwiinStatus {
    const branch = BRANCHES[branchIndex]
    const hasGwiin = isGwiin(dayStemIndex, branchIndex)
    const meaning = POSITION_MEANINGS[position]

    return {
      position,
      positionLabel: meaning.label,
      branchChar: branch.char,
      branchName: branch.name,
      isGwiin: hasGwiin,
      keyword: hasGwiin ? meaning.keyword : '',
      description: hasGwiin ? meaning.description : '',
    }
  }

  const branchStatus = {
    year: checkStatus('year', yearBranchIndex),
    month: checkStatus('month', monthBranchIndex),
    day: checkStatus('day', dayBranchIndex),
    hour: hourBranchIndex !== null ? checkStatus('hour', hourBranchIndex) : null,
  }

  // 귀인 위치 집계
  const gwiinPositions: string[] = []
  const statuses = [branchStatus.year, branchStatus.month, branchStatus.day, branchStatus.hour]

  for (const s of statuses) {
    if (s && s.isGwiin) {
      gwiinPositions.push(s.positionLabel)
    }
  }

  // 요약 생성
  const summary: string[] = []

  summary.push(
    `일간 ${dayStem.char}(${dayStem.name})의 천을귀인: ` +
    `${gwiinPair.chars[0]}(${gwiinPair.names[0]}), ${gwiinPair.chars[1]}(${gwiinPair.names[1]})`
  )

  if (gwiinPositions.length === 0) {
    summary.push('원국에 천을귀인이 없습니다. 스스로의 노력이 더욱 중요합니다.')
  } else if (gwiinPositions.length >= 3) {
    summary.push(
      `${gwiinPositions.join(', ')}에 천을귀인이 있습니다. ` +
      `귀인이 많아 주변의 도움을 많이 받는 팔자입니다. ` +
      `위기 상황에서도 좋은 인연이 나타나 도움을 줍니다.`
    )
  } else if (gwiinPositions.length === 2) {
    summary.push(
      `${gwiinPositions.join(', ')}에 천을귀인이 있습니다. ` +
      `인복이 좋아 중요한 순간마다 귀인의 도움을 받을 수 있습니다.`
    )
  } else {
    // 1개
    const gwiinStatus = statuses.find(s => s && s.isGwiin)!
    summary.push(
      `${gwiinStatus.positionLabel}에 천을귀인이 있습니다. ` +
      `${gwiinStatus.keyword} — ${gwiinStatus.description}`
    )
  }

  // 특수 케이스: 일지 귀인
  if (branchStatus.day.isGwiin) {
    summary.push(
      '일지에 귀인이 있어 배우자 복이 좋습니다. ' +
      '배우자가 인생의 중요한 귀인 역할을 합니다.'
    )
  }

  return {
    dayStem: {
      char: dayStem.char,
      name: dayStem.name,
      index: dayStemIndex,
    },
    gwiinPair,
    branchStatus,
    gwiinCount: gwiinPositions.length,
    gwiinPositions,
    summary,
  }
}

/**
 * 운세(대운/세운/월운/일운) 지지가 천을귀인인지 확인
 *
 * @param dayStemIndex 일간(천간) 인덱스
 * @param fortuneBranchIndex 운세의 지지 인덱스
 */
export function checkFortuneGwiin(
  dayStemIndex: number,
  fortuneBranchIndex: number
): FortuneGwiinResult {
  const fortuneBranch = BRANCHES[fortuneBranchIndex]
  const hasGwiin = isGwiin(dayStemIndex, fortuneBranchIndex)

  let description = ''

  if (hasGwiin) {
    description =
      `${fortuneBranch.char}(${fortuneBranch.name})는 천을귀인에 해당합니다. ` +
      `귀인의 도움으로 어려운 일이 풀리고, 좋은 인연을 만날 수 있는 시기입니다. ` +
      `흉한 기운이 있더라도 귀인이 이를 완화시켜 줍니다.`
  }

  return {
    isGwiin: hasGwiin,
    fortuneBranchChar: fortuneBranch.char,
    fortuneBranchName: fortuneBranch.name,
    description,
  }
}