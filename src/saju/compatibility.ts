/**
 * compatibility.ts - 궁합(宮合) 분석 모듈
 *
 * 두 사람의 사주 계산 결과(CalculateResult)를 받아 궁합을 분석합니다.
 *
 * 5가지 항목 (총 100점):
 *   ① 일간 오행 궁합 (25점) - 상생/상극/비화 + 음양 조화
 *   ② 용신 보완 (20점) - 상대가 내 부족 오행을 채워주는지
 *   ③ 십성 궁합 (20점) - 상대 일간이 내 기준 어떤 십성인지
 *   ④ 일지 궁합 (25점) - 배우자궁 충/합/형/해
 *   ⑤ 오행 균형 보완 (10점) - 두 사주 합쳤을 때 균형도
 */

import { STEMS, BRANCHES, GENERATES, OVERCOMES, ELEMENT_KO } from './constants'
import { Pillar, FiveElementCount } from './types'
import { CalculateResult } from './calculate'
import { FiveElement, YongsinResult, ElementRole } from './yongsin'
import {
  getInteractionTenStar,
  BRANCH_CLASHES_DATA,
  BRANCH_SIX_COMBINES_DATA,
  BRANCH_THREE_COMBINES_DATA,
  BRANCH_PUNISHMENTS_DATA,
  BRANCH_HARMS_DATA,
} from './interactions'

// ═══════════════════════════════════════════════════════════
// 타입 정의
// ═══════════════════════════════════════════════════════════

/** 궁합 등급 */
export type CompatibilityGrade = '천생연분' | '좋은 궁합' | '보통' | '노력 필요' | '주의 필요'

/** 개별 항목 결과 */
export interface CompatibilityItem {
  category: string        // 항목명
  score: number           // 획득 점수
  maxScore: number        // 만점
  grade: string           // A/B/C/D/F
  description: string     // 한줄 요약
  details: string[]       // 상세 설명 배열
}

/** 궁합 종합 결과 */
export interface CompatibilityResult {
  /** 두 사람 기본 정보 */
  person1: {
    name?: string
    dayStem: string       // 일간 한자
    dayStemName: string   // 일간 한글
    dayElement: string    // 일간 오행 (영어)
    dayElementKo: string  // 일간 오행 (한글)
    yinYang: string       // 음양
  }
  person2: {
    name?: string
    dayStem: string
    dayStemName: string
    dayElement: string
    dayElementKo: string
    yinYang: string
  }

  /** 5개 항목별 결과 */
  items: {
    dayElement: CompatibilityItem     // ① 일간 오행 궁합
    yongsinComplement: CompatibilityItem  // ② 용신 보완
    tenStar: CompatibilityItem        // ③ 십성 궁합
    dayBranch: CompatibilityItem      // ④ 일지 궁합
    elementBalance: CompatibilityItem // ⑤ 오행 균형 보완
  }

  /** 종합 */
  totalScore: number       // 총점 (0~100)
  grade: CompatibilityGrade
  summary: string          // 종합 한줄 요약
  advice: string[]         // 조언 배열

  /** 메타 */
  meta: {
    calculatedAt: string
    engineVersion: string
  }
}

// ═══════════════════════════════════════════════════════════
// 상수
// ═══════════════════════════════════════════════════════════

/** 나를 생하는 오행 */
const GENERATED_BY: Record<string, string> = {
  wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal'
}

/** 점수 → 등급 변환 (항목별) */
function itemGrade(score: number, maxScore: number): string {
  const ratio = score / maxScore
  if (ratio >= 0.9) return 'A'
  if (ratio >= 0.7) return 'B'
  if (ratio >= 0.5) return 'C'
  if (ratio >= 0.3) return 'D'
  return 'F'
}

/** 총점 → 궁합 등급 */
function totalGrade(score: number): CompatibilityGrade {
  if (score >= 85) return '천생연분'
  if (score >= 70) return '좋은 궁합'
  if (score >= 50) return '보통'
  if (score >= 35) return '노력 필요'
  return '주의 필요'
}

// ═══════════════════════════════════════════════════════════
// ① 일간 오행 궁합 (25점)
//   - 오행 관계: 상생(18) / 비화(13) / 상극(7)
//   - 음양 조화: 다름(+7) / 같음(+3)
// ═══════════════════════════════════════════════════════════

function analyzeDayElementCompatibility(
  person1: CalculateResult,
  person2: CalculateResult
): CompatibilityItem {
  const el1 = person1.dayStem.element
  const el2 = person2.dayStem.element
  const yy1 = person1.dayStem.yinYang
  const yy2 = person2.dayStem.yinYang
  const ko1 = person1.dayStem.elementKo
  const ko2 = person2.dayStem.elementKo
  const name1 = person1.dayStem.name
  const name2 = person2.dayStem.name

  const details: string[] = []
  let baseScore = 0
  let relationDesc = ''

  if (el1 === el2) {
    // 비화: 같은 오행
    baseScore = 13
    relationDesc = '비화(比和)'
    details.push(`두 사람 모두 ${ko1} 오행으로, 서로를 깊이 이해합니다.`)
    details.push('동질감이 강하지만 발전적 자극이 부족할 수 있습니다.')
  } else if (GENERATES[el1] === el2) {
    // person1 → person2 생
    baseScore = 18
    relationDesc = '상생(相生)'
    details.push(`${name1}(${ko1})이 ${name2}(${ko2})을 생해주는 상생 관계입니다.`)
    details.push(`${name1}이 자연스럽게 ${name2}을 돕고 지원하는 흐름입니다.`)
  } else if (GENERATES[el2] === el1) {
    // person2 → person1 생
    baseScore = 18
    relationDesc = '상생(相生)'
    details.push(`${name2}(${ko2})이 ${name1}(${ko1})을 생해주는 상생 관계입니다.`)
    details.push(`${name2}이 자연스럽게 ${name1}을 돕고 지원하는 흐름입니다.`)
  } else if (OVERCOMES[el1] === el2) {
    // person1이 person2를 극
    baseScore = 7
    relationDesc = '상극(相剋)'
    details.push(`${name1}(${ko1})이 ${name2}(${ko2})을 극하는 관계입니다.`)
    details.push('주도권 갈등이 생길 수 있으며, 서로 양보하는 노력이 필요합니다.')
  } else if (OVERCOMES[el2] === el1) {
    // person2가 person1을 극
    baseScore = 7
    relationDesc = '상극(相剋)'
    details.push(`${name2}(${ko2})이 ${name1}(${ko1})을 극하는 관계입니다.`)
    details.push('한 쪽이 압박을 느낄 수 있으며, 소통과 배려가 중요합니다.')
  }

  // 음양 조화 보너스
  let yinYangBonus = 0
  if (yy1 !== yy2) {
    yinYangBonus = 7
    details.push('음양이 달라 서로 보완적이고 자연스럽게 끌리는 관계입니다.')
  } else {
    yinYangBonus = 3
    details.push('음양이 같아 편안하지만 변화가 적을 수 있습니다.')
  }

  const score = Math.min(baseScore + yinYangBonus, 25)

  return {
    category: '일간 오행 궁합',
    score,
    maxScore: 25,
    grade: itemGrade(score, 25),
    description: `${name1}(${ko1}) ↔ ${name2}(${ko2}): ${relationDesc}`,
    details,
  }
}

// ═══════════════════════════════════════════════════════════
// ② 용신 보완 (20점)
//   - 양방향 평가: person1 관점(10점) + person2 관점(10점)
//   - 상대 일간 오행이 내 5신 중 무엇인지
// ═══════════════════════════════════════════════════════════

/** 5신 역할 → 점수 */
function sinRoleScore(role: string): number {
  switch (role) {
    case '용신': return 10
    case '희신': return 7
    case '한신': return 4
    case '구신': return 2
    case '기신': return 0
    default: return 3
  }
}

function analyzeYongsinComplement(
  person1: CalculateResult,
  person2: CalculateResult
): CompatibilityItem {
  const details: string[] = []
  const name1 = person1.dayStem.name
  const name2 = person2.dayStem.name

  // Person1 관점: 상대(person2)의 일간 오행이 내 5신 중 무엇?
  const p2Element = person2.dayStem.element
  const p1Role = person1.yongsin.fiveSin.find(r => r.element === p2Element)
  const p1Score = p1Role ? sinRoleScore(p1Role.role) : 3

  if (p1Role) {
    const helpText = p1Score >= 7 ? '큰 도움' : p1Score >= 4 ? '보통' : '주의'
    details.push(`${name1} 관점: 상대(${name2})의 ${person2.dayStem.elementKo}은 나의 ${p1Role.role} → ${helpText}`)
  }

  // Person2 관점: 상대(person1)의 일간 오행이 내 5신 중 무엇?
  const p1Element = person1.dayStem.element
  const p2Role = person2.yongsin.fiveSin.find(r => r.element === p1Element)
  const p2Score = p2Role ? sinRoleScore(p2Role.role) : 3

  if (p2Role) {
    const helpText = p2Score >= 7 ? '큰 도움' : p2Score >= 4 ? '보통' : '주의'
    details.push(`${name2} 관점: 상대(${name1})의 ${person1.dayStem.elementKo}은 나의 ${p2Role.role} → ${helpText}`)
  }

  // 양방향 종합 메시지
  if (p1Score >= 7 && p2Score >= 7) {
    details.push('🌟 서로가 서로에게 필요한 오행을 채워주는 이상적인 관계입니다!')
  } else if (p1Score >= 7 || p2Score >= 7) {
    details.push('한 쪽이 상대에게 필요한 기운을 보완해주는 관계입니다.')
  } else if (p1Score <= 2 && p2Score <= 2) {
    details.push('용신 보완 측면에서 서로 부담이 될 수 있어 이해와 배려가 필요합니다.')
  } else {
    details.push('용신 보완 측면에서는 무난한 관계입니다.')
  }

  const score = Math.min(p1Score + p2Score, 20)

  return {
    category: '용신 보완',
    score,
    maxScore: 20,
    grade: itemGrade(score, 20),
    description: `용신 보완: ${p1Role?.role || '?'} ↔ ${p2Role?.role || '?'}`,
    details,
  }
}

// ═══════════════════════════════════════════════════════════
// ③ 십성 궁합 (20점)
//   - 양방향: person1 관점(10점) + person2 관점(10점)
//   - 상대 일간이 나에게 어떤 십성인지
// ═══════════════════════════════════════════════════════════

/** 십성 → 궁합 점수 (배우자 관점) */
function tenStarCompatScore(star: string): { score: number; desc: string } {
  switch (star) {
    case '정재': return { score: 10, desc: '정재 — 안정적 내조, 이상적 배우자상' }
    case '정관': return { score: 10, desc: '정관 — 신뢰와 존경, 이상적 배우자상' }
    case '편재': return { score: 7, desc: '편재 — 자유롭고 활기찬 관계' }
    case '편관': return { score: 7, desc: '편관 — 강렬한 끌림, 열정적 관계' }
    case '식신': return { score: 6, desc: '식신 — 편안하고 즐거운 관계' }
    case '상관': return { score: 5, desc: '상관 — 매력적이나 갈등 소지' }
    case '정인': return { score: 5, desc: '정인 — 따뜻한 보살핌, 안정감' }
    case '편인': return { score: 4, desc: '편인 — 정서적 의존, 답답할 수 있음' }
    case '비견': return { score: 3, desc: '비견 — 동료 의식, 낭만 부족' }
    case '겁재': return { score: 2, desc: '겁재 — 경쟁 관계, 마찰 주의' }
    default:     return { score: 3, desc: '알 수 없음' }
  }
}

function analyzeTenStarCompatibility(
  person1: CalculateResult,
  person2: CalculateResult
): CompatibilityItem {
  const details: string[] = []
  const name1 = person1.dayStem.name
  const name2 = person2.dayStem.name
  const stem1 = person1.fourPillars.day.heavenlyStem.index
  const stem2 = person2.fourPillars.day.heavenlyStem.index

  // Person1 관점: 상대(person2) 일간이 나에게 무슨 십성?
  const star1to2 = getInteractionTenStar(stem1, stem2)
  const score1 = tenStarCompatScore(star1to2.star)
  details.push(`${name1} 관점: 상대(${name2})는 나의 ${star1to2.star}`)
  details.push(`  → ${score1.desc}`)

  // Person2 관점: 상대(person1) 일간이 나에게 무슨 십성?
  const star2to1 = getInteractionTenStar(stem2, stem1)
  const score2 = tenStarCompatScore(star2to1.star)
  details.push(`${name2} 관점: 상대(${name1})는 나의 ${star2to1.star}`)
  details.push(`  → ${score2.desc}`)

  // 특수 조합 메시지
  const stars = [star1to2.star, star2to1.star].sort()
  if (stars.includes('정재') && stars.includes('정관')) {
    details.push('💕 정재-정관 조합: 전통적으로 가장 이상적인 배우자 궁합입니다!')
  } else if (stars.includes('편재') && stars.includes('편관')) {
    details.push('🔥 편재-편관 조합: 강렬한 끌림이 있으나 주도권 다툼에 주의하세요.')
  } else if (stars.includes('식신') || stars.includes('정인')) {
    details.push('☺️ 서로 편안함을 주는 관계입니다.')
  } else if (stars.includes('겁재') && stars.includes('겁재')) {
    details.push('⚡ 겁재-겁재: 경쟁적 관계로, 각자의 영역을 존중해야 합니다.')
  }

  const score = Math.min(score1.score + score2.score, 20)

  return {
    category: '십성 궁합',
    score,
    maxScore: 20,
    grade: itemGrade(score, 20),
    description: `${name1}→${star1to2.star} / ${name2}→${star2to1.star}`,
    details,
  }
}

// ═══════════════════════════════════════════════════════════
// ④ 일지 궁합 (25점)
//   - 배우자궁(일지) 간 관계: 육합/삼합/충/형/해
//   - 복수 관계 시 가장 강한 것 우선 적용
// ═══════════════════════════════════════════════════════════

/** 두 지지 간 육합 여부 */
function isSixCombine(b1: number, b2: number): { match: boolean; element: string } {
  for (const c of BRANCH_SIX_COMBINES_DATA) {
    if ((b1 === c.branches[0] && b2 === c.branches[1]) ||
        (b1 === c.branches[1] && b2 === c.branches[0])) {
      return { match: true, element: c.element }
    }
  }
  return { match: false, element: '' }
}

/** 두 지지 간 삼합 반합 여부 */
function isThreeCombine(b1: number, b2: number): { match: boolean; element: string } {
  for (const t of BRANCH_THREE_COMBINES_DATA) {
    const idx1 = t.branches.indexOf(b1)
    const idx2 = t.branches.indexOf(b2)
    if (idx1 >= 0 && idx2 >= 0 && idx1 !== idx2) {
      return { match: true, element: t.element }
    }
  }
  return { match: false, element: '' }
}

/** 두 지지 간 충 여부 */
function isClash(b1: number, b2: number): boolean {
  return BRANCH_CLASHES_DATA.some(c =>
    (b1 === c[0] && b2 === c[1]) || (b1 === c[1] && b2 === c[0])
  )
}

/** 두 지지 간 형 여부 */
function isPunishment(b1: number, b2: number): { match: boolean; typeName: string } {
  for (const p of BRANCH_PUNISHMENTS_DATA) {
    if (p.type === 'self') {
      if (b1 === p.branches[0] && b2 === p.branches[0]) {
        return { match: true, typeName: p.typeName }
      }
    } else if (p.branches.length === 2) {
      if ((b1 === p.branches[0] && b2 === p.branches[1]) ||
          (b1 === p.branches[1] && b2 === p.branches[0])) {
        return { match: true, typeName: p.typeName }
      }
    } else if (p.branches.length === 3) {
      const idx1 = p.branches.indexOf(b1)
      const idx2 = p.branches.indexOf(b2)
      if (idx1 >= 0 && idx2 >= 0 && idx1 !== idx2) {
        return { match: true, typeName: p.typeName }
      }
    }
  }
  return { match: false, typeName: '' }
}

/** 두 지지 간 해 여부 */
function isHarm(b1: number, b2: number): boolean {
  return BRANCH_HARMS_DATA.some(h =>
    (b1 === h[0] && b2 === h[1]) || (b1 === h[1] && b2 === h[0])
  )
}

function analyzeDayBranchCompatibility(
  person1: CalculateResult,
  person2: CalculateResult
): CompatibilityItem {
  const b1 = person1.fourPillars.day.earthlyBranch.index
  const b2 = person2.fourPillars.day.earthlyBranch.index
  const char1 = person1.fourPillars.day.earthlyBranch.char
  const char2 = person2.fourPillars.day.earthlyBranch.char
  const name1ko = person1.fourPillars.day.earthlyBranch.name
  const name2ko = person2.fourPillars.day.earthlyBranch.name
  const details: string[] = []

  details.push(`배우자궁: ${char1}(${name1ko}) ↔ ${char2}(${name2ko})`)

  let score = 12  // 기본: 관계 없음

  // 육합 (최고)
  const sixCombine = isSixCombine(b1, b2)
  if (sixCombine.match) {
    score = 25
    details.push(`✨ 육합! ${char1}${char2} → ${ELEMENT_KO[sixCombine.element]}`)
    details.push('가장 이상적인 배우자궁 관계입니다. 자연스럽게 잘 맞습니다.')
  }

  // 삼합 반합
  const threeCombine = isThreeCombine(b1, b2)
  if (threeCombine.match && score < 20) {
    score = 20
    details.push(`🌟 삼합(반합)! → ${ELEMENT_KO[threeCombine.element]}`)
    details.push('협력적이고 조화로운 관계입니다.')
  }

  // 같은 지지
  if (b1 === b2 && score < 15) {
    score = 15
    details.push(`같은 일지(${char1}${char2}): 동질감이 강합니다.`)
  }

  // 충 (가장 나쁨)
  if (isClash(b1, b2)) {
    score = Math.min(score, 3)
    details.push(`⚠️ 충! ${char1}↔${char2}: 배우자궁 충돌로 갈등이 잦을 수 있습니다.`)
    details.push('서로 다른 점을 인정하고 대화로 풀어가는 노력이 필요합니다.')
  }

  // 형
  const punishment = isPunishment(b1, b2)
  if (punishment.match && score > 7) {
    score = Math.min(score, 7)
    details.push(`⚠️ 형(${punishment.typeName})! ${char1}↔${char2}: 스트레스와 마찰 주의`)
  }

  // 해
  if (isHarm(b1, b2) && score > 5) {
    score = Math.min(score, 5)
    details.push(`⚠️ 해! ${char1}↔${char2}: 은근한 갈등, 서로 상처를 줄 수 있습니다.`)
  }

  // 관계 없음
  if (score === 12) {
    details.push('특별한 충합형해 관계는 없습니다. 무난한 관계입니다.')
  }

  return {
    category: '일지 궁합',
    score,
    maxScore: 25,
    grade: itemGrade(score, 25),
    description: `${char1}(${name1ko}) ↔ ${char2}(${name2ko})`,
    details,
  }
}

// ═══════════════════════════════════════════════════════════
// ⑤ 오행 균형 보완 (10점)
//   - 두 사주의 오행을 합산했을 때 균형도 평가
//   - 한쪽에 부족한 오행을 상대가 보충해주는지
// ═══════════════════════════════════════════════════════════

const ALL_ELEMENTS: FiveElement[] = ['wood', 'fire', 'earth', 'metal', 'water']

function analyzeElementBalance(
  person1: CalculateResult,
  person2: CalculateResult
): CompatibilityItem {
  const details: string[] = []
  const c1 = person1.fiveElements.counts as FiveElementCount
  const c2 = person2.fiveElements.counts as FiveElementCount

  // 개별 오행 합산
  const combined: Record<string, number> = {}
  let total = 0
  for (const el of ALL_ELEMENTS) {
    combined[el] = (c1[el] || 0) + (c2[el] || 0)
    total += combined[el]
  }

  if (total === 0) {
    return {
      category: '오행 균형 보완',
      score: 5,
      maxScore: 10,
      grade: 'C',
      description: '오행 데이터 부족',
      details: ['오행 정보가 불충분하여 정확한 분석이 어렵습니다.'],
    }
  }

  // 균형도: 각 오행이 20%에 가까울수록 좋음
  const ideal = total / 5
  let deviationSum = 0
  for (const el of ALL_ELEMENTS) {
    deviationSum += Math.abs(combined[el] - ideal)
  }
  // deviationSum 최솟값=0(완벽균형), 최댓값≈total*1.6
  const balanceRatio = 1 - (deviationSum / (total * 1.6))
  const balanceScore = Math.round(balanceRatio * 6)  // 0~6점

  details.push('합산 오행 분포:')
  for (const el of ALL_ELEMENTS) {
    const pct = total > 0 ? Math.round((combined[el] / total) * 100) : 0
    const bar = '█'.repeat(Math.min(Math.round(pct / 5), 10))
    details.push(`  ${ELEMENT_KO[el]}: ${combined[el]} (${pct}%) ${bar}`)
  }

  // 보충 점수: 한쪽에 0인 오행을 상대가 채워주는지
  let complementCount = 0
  for (const el of ALL_ELEMENTS) {
    const v1 = c1[el as keyof FiveElementCount] || 0
    const v2 = c2[el as keyof FiveElementCount] || 0
    if (v1 === 0 && v2 > 0) {
      complementCount++
      details.push(`✨ ${person2.dayStem.name}이 ${person1.dayStem.name}에게 부족한 ${ELEMENT_KO[el]}을 보충`)
    }
    if (v2 === 0 && v1 > 0) {
      complementCount++
      details.push(`✨ ${person1.dayStem.name}이 ${person2.dayStem.name}에게 부족한 ${ELEMENT_KO[el]}을 보충`)
    }
  }
  const complementScore = Math.min(complementCount * 2, 4)  // 0~4점

  const score = Math.min(balanceScore + complementScore, 10)

  if (score >= 8) {
    details.push('두 사람이 만나면 오행이 고르게 채워져 시너지가 큽니다.')
  } else if (score >= 5) {
    details.push('오행 균형 측면에서 무난한 조합입니다.')
  } else {
    details.push('오행 편중이 심화될 수 있어 의식적인 보완이 필요합니다.')
  }

  return {
    category: '오행 균형 보완',
    score,
    maxScore: 10,
    grade: itemGrade(score, 10),
    description: `균형도 ${Math.round(balanceRatio * 100)}% / 보충 ${complementCount}건`,
    details,
  }
}

// ═══════════════════════════════════════════════════════════
// 종합 조언 생성
// ═══════════════════════════════════════════════════════════

function generateAdvice(
  items: CompatibilityResult['items'],
  grade: CompatibilityGrade
): string[] {
  const advice: string[] = []

  // 등급별 기본 조언
  switch (grade) {
    case '천생연분':
      advice.push('사주적으로 매우 잘 맞는 조합입니다. 서로를 믿고 함께 성장하세요.')
      break
    case '좋은 궁합':
      advice.push('좋은 궁합입니다. 작은 차이는 서로의 매력으로 받아들이세요.')
      break
    case '보통':
      advice.push('무난한 관계입니다. 서로의 다른 점을 이해하려는 노력이 관계를 더 좋게 만듭니다.')
      break
    case '노력 필요':
      advice.push('차이가 있는 관계입니다. 대화와 양보를 통해 충분히 극복할 수 있습니다.')
      break
    case '주의 필요':
      advice.push('사주적으로 부딪히는 요소가 있습니다. 서로를 이해하려는 꾸준한 노력이 중요합니다.')
      break
  }

  // 항목별 약점 보완 조언
  if (items.dayElement.score < 12) {
    advice.push('오행이 상극 관계이므로, 상대를 바꾸려 하기보다 있는 그대로 존중하세요.')
  }
  if (items.dayBranch.score < 10) {
    advice.push('배우자궁에 충돌이 있으니 중요한 결정은 충분한 대화 후 함께 내리세요.')
  }
  if (items.yongsinComplement.score < 8) {
    advice.push('용신 보완이 약하므로 각자의 부족한 기운을 취미나 활동으로 보충하세요.')
  }
  if (items.tenStar.score < 8) {
    advice.push('십성 관계에서 역할 기대치가 다를 수 있으니 솔직한 소통이 중요합니다.')
  }

  // 긍정 강화
  if (items.dayBranch.score >= 20) {
    advice.push('💕 배우자궁 합이 있어 결혼 생활의 기반이 탄탄합니다.')
  }
  if (items.yongsinComplement.score >= 14) {
    advice.push('🌟 서로의 부족함을 채워주는 훌륭한 보완 관계입니다.')
  }

  return advice
}

// ═══════════════════════════════════════════════════════════
// 메인: 궁합 통합 분석 함수
// ═══════════════════════════════════════════════════════════

/**
 * 두 사람의 사주 결과를 받아 궁합을 분석합니다.
 *
 * @param person1 첫 번째 사람의 calculateSaju() 결과
 * @param person2 두 번째 사람의 calculateSaju() 결과
 * @param name1   첫 번째 사람 이름 (선택)
 * @param name2   두 번째 사람 이름 (선택)
 */
export function analyzeCompatibility(
  person1: CalculateResult,
  person2: CalculateResult,
  name1?: string,
  name2?: string
): CompatibilityResult {
  // 5개 항목 분석
  const dayElement = analyzeDayElementCompatibility(person1, person2)
  const yongsinComplement = analyzeYongsinComplement(person1, person2)
  const tenStar = analyzeTenStarCompatibility(person1, person2)
  const dayBranch = analyzeDayBranchCompatibility(person1, person2)
  const elementBalance = analyzeElementBalance(person1, person2)

  const items = { dayElement, yongsinComplement, tenStar, dayBranch, elementBalance }

  // 종합 점수
  const totalScore = dayElement.score + yongsinComplement.score +
    tenStar.score + dayBranch.score + elementBalance.score
  const grade = totalGrade(totalScore)

  // 종합 요약
  const summary = `종합 ${totalScore}점 — ${grade} (${
    [dayElement, dayBranch, tenStar, yongsinComplement, elementBalance]
      .sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore))
      .slice(0, 2)
      .map(i => `${i.category} ${i.grade}`)
      .join(', ')
  } 우수)`

  // 조언
  const advice = generateAdvice(items, grade)

  return {
    person1: {
      name: name1,
      dayStem: person1.dayStem.char,
      dayStemName: person1.dayStem.name,
      dayElement: person1.dayStem.element,
      dayElementKo: person1.dayStem.elementKo,
      yinYang: person1.dayStem.yinYang,
    },
    person2: {
      name: name2,
      dayStem: person2.dayStem.char,
      dayStemName: person2.dayStem.name,
      dayElement: person2.dayStem.element,
      dayElementKo: person2.dayStem.elementKo,
      yinYang: person2.dayStem.yinYang,
    },
    items,
    totalScore,
    grade,
    summary,
    advice,
    meta: {
      calculatedAt: new Date().toISOString(),
      engineVersion: '1.0.0',
    },
  }
}