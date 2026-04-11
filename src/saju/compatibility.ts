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
  description: string     // 한줄 요약 (무료)
  details: string[]       // 기본 설명 배열 (무료)
  /** 광고 후 상세 해석 (blur 영역) */
  detailedAnalysis: {
    interpretation: string   // 심층 해석
    relationship: string     // 관계 역학
    advice: string           // 맞춤 조언
    keywords: string[]       // 키워드 3개
  }
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

    // 상세 해석 생성
  const detailedAnalysis = generateDayElementDetailed(
    el1, el2, ko1, ko2, name1, name2, yy1, yy2, relationDesc, score
  )

  return {
    category: '일간 오행 궁합',
    score,
    maxScore: 25,
    grade: itemGrade(score, 25),
    description: `${name1}(${ko1}) ↔ ${name2}(${ko2}): ${relationDesc}`,
    details,
    detailedAnalysis,
  }
}

function generateDayElementDetailed(
  el1: string, el2: string, ko1: string, ko2: string,
  name1: string, name2: string, yy1: string, yy2: string,
  relation: string, score: number
): CompatibilityItem['detailedAnalysis'] {
  let interpretation = ''
  let relationship = ''
  let advice = ''
  const keywords: string[] = []

  if (el1 === el2) {
    interpretation = `${name1}과 ${name2}은 같은 ${ko1} 오행으로, 서로의 생각과 가치관을 본능적으로 이해합니다. 말하지 않아도 통하는 편안함이 있지만, 같은 성향이 강해 새로운 자극이 부족할 수 있습니다. 장기적으로는 외부 활동이나 취미를 통해 신선한 에너지를 보충하는 것이 좋습니다.`
    relationship = `비화 관계는 동료 의식이 강합니다. 서로를 경쟁자가 아닌 동반자로 인식할 때 최고의 시너지를 냅니다. 의견 충돌 시 제3자의 중재가 도움됩니다.`
    advice = `같은 오행끼리는 안정적이지만 정체될 수 있으니, 함께 새로운 경험을 도전하세요.`
    keywords.push('동질감', '안정', '자극 보충')
  } else if (GENERATES[el1] === el2 || GENERATES[el2] === el1) {
    const giver = GENERATES[el1] === el2 ? name1 : name2
    const receiver = GENERATES[el1] === el2 ? name2 : name1
    interpretation = `상생 관계로, ${giver}이 자연스럽게 ${receiver}을 돕고 성장시키는 흐름입니다. 이 관계에서는 주는 쪽이 지치지 않도록 받는 쪽의 감사와 배려가 중요합니다. 오행의 생함은 부모가 자식을 키우는 것과 같은 자연스러운 에너지 흐름입니다.`
    relationship = `상생은 가장 자연스러운 오행 관계입니다. ${giver}은 베푸는 역할, ${receiver}은 성장하는 역할로 서로 보완합니다. 단, 역할이 고정되면 한쪽이 부담을 느낄 수 있으니 때로는 역할을 바꿔보세요.`
    advice = `${receiver}은 ${giver}의 도움에 감사를 표현하고, ${giver}은 자신의 에너지 관리를 잊지 마세요.`
    keywords.push('상생', '성장', '보완')
  } else {
    const attacker = OVERCOMES[el1] === el2 ? name1 : name2
    const defender = OVERCOMES[el1] === el2 ? name2 : name1
    interpretation = `상극 관계로, ${attacker}의 기운이 ${defender}을 억제하는 구조입니다. 이는 갈등을 의미하기도 하지만, 서로를 단련시키는 긴장감이 되기도 합니다. 상극을 잘 활용하면 서로의 약점을 보완하는 발전적 관계가 됩니다.`
    relationship = `상극은 긴장 관계이지만 모든 상극이 나쁜 것은 아닙니다. 적절한 견제는 서로를 성장시킵니다. ${attacker}은 주도하려는 성향을 자제하고, ${defender}은 위축되지 않도록 자기 목소리를 내는 것이 중요합니다.`
    advice = `서로의 다름을 인정하고, 갈등 시 감정보다 이성으로 대화하세요. 공통 목표를 세우면 힘이 합쳐집니다.`
    keywords.push('긴장', '단련', '소통')
  }

  // 음양 조화 추가
  if (yy1 !== yy2) {
    interpretation += ` 음양이 다르기 때문에 자연스러운 끌림이 있으며, 서로 부족한 면을 보완하는 관계입니다.`
    keywords.push('음양 조화')
  } else {
    interpretation += ` 음양이 같아 편안하고 안정적이지만, 관계에 변화와 새로움을 의식적으로 만들어가야 합니다.`
  }

  return { interpretation, relationship, advice, keywords: keywords.slice(0, 3) }
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

    const detailedAnalysis = generateYongsinDetailed(
    name1, name2, p1Role?.role, p2Role?.role,
    person1.dayStem.elementKo, person2.dayStem.elementKo, score
  )

  return {
    category: '용신 보완',
    score,
    maxScore: 20,
    grade: itemGrade(score, 20),
    description: `용신 보완: ${p1Role?.role || '?'} ↔ ${p2Role?.role || '?'}`,
    details,
    detailedAnalysis,
  }
}

function generateYongsinDetailed(
  name1: string, name2: string,
  role1?: string, role2?: string,
  elKo1?: string, elKo2?: string,
  score?: number
): CompatibilityItem['detailedAnalysis'] {
  const r1 = role1 || '한신'
  const r2 = role2 || '한신'

  let interpretation = ''
  let relationship = ''
  let advice = ''
  const keywords: string[] = []

  if (r1 === '용신' || r2 === '용신') {
    const lucky = r1 === '용신' ? name2 : name1
    const receiver = r1 === '용신' ? name1 : name2
    interpretation = `${lucky}의 오행이 ${receiver}에게 용신(가장 필요한 기운)으로 작용합니다. 이는 만나는 것만으로도 ${receiver}에게 큰 힘이 되는 관계입니다. 사주명리학에서 용신을 채워주는 사람은 인생의 귀인과도 같습니다.`
    relationship = `용신 보완은 궁합에서 가장 중요한 요소 중 하나입니다. ${receiver}은 ${lucky}과 함께할 때 운이 트이고 일이 잘 풀리는 경험을 하게 됩니다.`
    advice = `이 귀한 인연을 소중히 여기세요. ${receiver}은 ${lucky}에게 충분한 감사를 표현하고, ${lucky}은 자신의 역할에 보람을 느끼세요.`
    keywords.push('귀인', '용신 보완', '행운')
  } else if (r1 === '희신' || r2 === '희신') {
    interpretation = `상대의 오행이 희신(용신을 돕는 기운)으로 작용합니다. 직접적인 용신은 아니지만, 간접적으로 필요한 기운을 보충해주는 좋은 관계입니다.`
    relationship = `희신 관계는 함께하면 자연스럽게 운이 좋아지는 관계입니다. 큰 변화보다는 일상에서 서서히 긍정적 영향을 미칩니다.`
    advice = `서로의 장점을 인정하고, 함께하는 시간을 꾸준히 만드세요.`
    keywords.push('희신', '간접 보완', '안정')
  } else if (r1 === '기신' || r2 === '기신') {
    interpretation = `상대의 오행이 기신(방해하는 기운)으로 작용할 수 있습니다. 이는 함께할 때 피로감이나 부담을 느낄 수 있다는 의미입니다. 하지만 의식적인 노력으로 충분히 극복할 수 있습니다.`
    relationship = `기신 관계는 서로에게 스트레스를 줄 수 있지만, 이를 인지하고 있으면 오히려 자기 성장의 계기가 됩니다.`
    advice = `함께 있을 때 무리하지 말고, 각자의 시간과 공간을 존중하세요.`
    keywords.push('기신', '보완 필요', '성장')
  } else {
    interpretation = `용신 보완 측면에서 특별히 강한 영향은 없는 관계입니다. 서로의 오행이 한신(중립) 역할로, 큰 도움도 큰 방해도 없이 무난합니다.`
    relationship = `중립적 관계는 안정적이지만, 특별한 시너지를 기대하기는 어렵습니다. 다른 궁합 요소에서 보완이 필요합니다.`
    advice = `서로에게 필요한 오행을 함께 채울 수 있는 활동(여행, 운동 등)을 찾아보세요.`
    keywords.push('중립', '무난', '활동 보완')
  }

  return { interpretation, relationship, advice, keywords: keywords.slice(0, 3) }
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

  const detailedAnalysis = generateTenStarDetailed(
    name1, name2, star1to2.star, star2to1.star, score
  )

  return {
    category: '십성 궁합',
    score,
    maxScore: 20,
    grade: itemGrade(score, 20),
    description: `${name1}→${star1to2.star} / ${name2}→${star2to1.star}`,
    details,
    detailedAnalysis,
  }
}

function generateTenStarDetailed(
  name1: string, name2: string,
  star1: string, star2: string, score: number
): CompatibilityItem['detailedAnalysis'] {
  const starTexts: Record<string, { interp: string; rel: string }> = {
    '정재': {
      interp: '안정적이고 헌신적인 내조형 파트너입니다. 경제적 안정감과 가정적인 분위기를 만들어줍니다.',
      rel: '정재는 전통적으로 가장 이상적인 배우자상으로, 믿음직하고 성실한 관계를 만들어갑니다.'
    },
    '정관': {
      interp: '존경과 신뢰를 바탕으로 한 관계입니다. 사회적 체면과 도덕적 기준을 중시하는 파트너입니다.',
      rel: '정관은 나를 바르게 이끌어주는 존재로, 서로 예의와 존중을 지키는 관계입니다.'
    },
    '편재': {
      interp: '자유롭고 활동적인 에너지를 가진 파트너입니다. 함께 있으면 새로운 경험과 즐거움이 많습니다.',
      rel: '편재는 변화를 즐기는 성향으로, 일상에 활력을 불어넣지만 안정감이 부족할 수 있습니다.'
    },
    '편관': {
      interp: '강렬한 끌림과 카리스마가 있는 관계입니다. 열정적이지만 주도권 다툼이 생길 수 있습니다.',
      rel: '편관은 나를 긴장시키는 존재로, 적절한 긴장감이 관계를 성장시키지만 과하면 스트레스가 됩니다.'
    },
    '식신': {
      interp: '편안하고 즐거운 관계입니다. 함께 맛있는 것을 먹고 여유를 즐기는 감성적 파트너입니다.',
      rel: '식신은 나의 표현력과 창의성을 자극하는 관계로, 예술적 취미를 함께 즐기면 더 좋습니다.'
    },
    '상관': {
      interp: '매력적이고 재능 있는 파트너이지만, 감정 기복과 비판적 성향에 주의해야 합니다.',
      rel: '상관은 나의 틀을 깨뜨리는 존재로, 자유로운 표현을 허용해야 관계가 유지됩니다.'
    },
    '정인': {
      interp: '따뜻하게 보살펴주는 어머니 같은 파트너입니다. 정서적 안정감과 학문적 교류가 있습니다.',
      rel: '정인은 나를 돌봐주는 존재로, 편안하지만 때로는 간섭으로 느껴질 수 있습니다.'
    },
    '편인': {
      interp: '독특한 사고방식을 가진 파트너로, 정서적 교류는 깊지만 현실적 문제에서 갈등이 생길 수 있습니다.',
      rel: '편인은 내면의 세계를 공유하는 관계이지만, 지나친 의존은 서로를 답답하게 만듭니다.'
    },
    '비견': {
      interp: '친구 같은 동료 관계입니다. 대등한 위치에서 서로를 이해하지만 낭만적 감정은 약할 수 있습니다.',
      rel: '비견은 나와 대등한 존재로, 공정한 관계를 추구하지만 경쟁 의식이 생길 수 있습니다.'
    },
    '겁재': {
      interp: '경쟁적 에너지가 강한 관계입니다. 서로 자극을 주지만 양보와 타협이 어려울 수 있습니다.',
      rel: '겁재는 나의 것을 빼앗을 수 있는 존재로, 재정과 영역을 명확히 구분하는 것이 좋습니다.'
    },
  }

  const t1 = starTexts[star1] || { interp: '특별한 해석 없음', rel: '일반적 관계' }
  const t2 = starTexts[star2] || { interp: '특별한 해석 없음', rel: '일반적 관계' }

  const interpretation =
    `${name1}에게 ${name2}은 ${star1}로 작용합니다. ${t1.interp} ` +
    `반대로 ${name2}에게 ${name1}은 ${star2}로 작용합니다. ${t2.interp}`

  const relationship = `${name1} 관점: ${t1.rel} ${name2} 관점: ${t2.rel}`

  let advice = ''
  if (score >= 16) {
    advice = '십성 궁합이 매우 좋습니다. 서로의 역할이 자연스럽게 맞아떨어지니 그 흐름을 유지하세요.'
  } else if (score >= 10) {
    advice = '십성 관계가 무난합니다. 서로에게 기대하는 역할을 솔직하게 이야기하면 더 좋아집니다.'
  } else {
    advice = '십성 관계에서 마찰이 예상됩니다. 역할 기대를 줄이고, 있는 그대로의 모습을 받아들이세요.'
  }

  const keywords: string[] = [star1, star2, score >= 14 ? '조화' : score >= 8 ? '무난' : '노력']

  return { interpretation, relationship, advice, keywords }
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

    const detailedAnalysis = generateDayBranchDetailed(
    char1, char2, name1ko, name2ko, score
  )

  return {
    category: '일지 궁합',
    score,
    maxScore: 25,
    grade: itemGrade(score, 25),
    description: `${char1}(${name1ko}) ↔ ${char2}(${name2ko})`,
    details,
    detailedAnalysis,
  }
}

function generateDayBranchDetailed(
  char1: string, char2: string,
  name1ko: string, name2ko: string, score: number
): CompatibilityItem['detailedAnalysis'] {
  let interpretation = ''
  let relationship = ''
  let advice = ''
  const keywords: string[] = []

  if (score >= 23) {
    interpretation = `${char1}(${name1ko})과 ${char2}(${name2ko})은 육합 관계로, 배우자궁에서 가장 이상적인 조합입니다. 육합은 두 지지가 만나 새로운 오행을 만들어내는 화학적 결합으로, 서로 만나면 1+1=3 이상의 시너지가 발생합니다. 결혼 궁합에서 일지 육합은 최고의 인연으로 봅니다.`
    relationship = `육합 관계는 처음 만났을 때부터 오래 알고 지낸 듯한 친밀감을 느낍니다. 생활 습관과 가치관이 자연스럽게 맞아 갈등이 적고, 함께하는 일상이 편안합니다.`
    advice = `이 귀한 인연을 당연하게 여기지 마세요. 감사하는 마음을 유지하면 더욱 깊은 관계로 발전합니다.`
    keywords.push('육합', '최상의 인연', '자연스러운 조화')
  } else if (score >= 18) {
    interpretation = `${char1}(${name1ko})과 ${char2}(${name2ko})은 삼합(반합) 관계로, 협력적이고 조화로운 조합입니다. 삼합은 같은 오행의 기운을 공유하는 관계로, 공통된 목표를 향해 함께 나아가는 힘이 있습니다.`
    relationship = `삼합 관계는 비전과 방향성이 비슷하여 인생의 동반자로 적합합니다. 큰 결정을 함께 할 때 의견이 잘 맞습니다.`
    advice = `공동 프로젝트나 목표를 세우면 관계가 더 단단해집니다.`
    keywords.push('삼합', '협력', '공동 목표')
  } else if (score >= 13) {
    interpretation = `${char1}(${name1ko})과 ${char2}(${name2ko})은 특별한 충합 관계가 없어 무난한 조합입니다. 극적인 끌림은 적지만 큰 갈등도 없어 안정적인 관계를 유지할 수 있습니다.`
    relationship = `무난한 관계는 오히려 장기적으로 유리합니다. 극적인 감정보다 꾸준한 신뢰가 관계를 지탱합니다.`
    advice = `함께하는 즐거운 추억을 의식적으로 만들어가세요.`
    keywords.push('무난', '안정', '꾸준함')
  } else if (score >= 6) {
    interpretation = `${char1}(${name1ko})과 ${char2}(${name2ko}) 사이에 형(刑) 또는 해(害) 관계가 있습니다. 이는 은근한 마찰과 스트레스를 유발할 수 있는 구조입니다. 하지만 서로의 패턴을 이해하면 충분히 극복할 수 있습니다.`
    relationship = `형해 관계는 겉으로 드러나지 않는 갈등이 쌓일 수 있습니다. 작은 불만도 미루지 말고 바로 소통하는 것이 중요합니다.`
    advice = `주기적으로 서로의 감정을 확인하는 대화 시간을 만드세요.`
    keywords.push('형해', '소통 필요', '인내')
  } else {
    interpretation = `${char1}(${name1ko})과 ${char2}(${name2ko})은 충(沖) 관계로, 배우자궁에서 가장 강한 충돌이 발생하는 구조입니다. 충은 정반대 에너지의 부딪힘으로, 가치관과 생활 방식에서 근본적인 차이가 있을 수 있습니다. 하지만 충은 반드시 나쁜 것만은 아닙니다 — 서로 다른 관점이 새로운 시야를 열어줄 수도 있습니다.`
    relationship = `충 관계는 초반에 강한 끌림을 느끼지만 함께 살면 갈등이 잦을 수 있습니다. 각자의 독립적 공간과 시간을 보장하는 것이 핵심입니다.`
    advice = `중요한 결정은 감정이 격앙된 상태에서 하지 마세요. 하루 이상 숙고한 후 대화하면 충돌을 줄일 수 있습니다.`
    keywords.push('충', '차이 인정', '독립 공간')
  }

  return { interpretation, relationship, advice, keywords }
}

// ═══════════════════════════════════════════════════════════
// ⑤ 오행 균형 보완 (10점)
//   - 두 사주의 오행을 합산했을 때 균형도 평가
//   - 한쪽에 부족한 오행을 상대가 보충해주는지
// ═══════════════════════════════════════════════════════════

const ALL_ELEMENTS: FiveElement[] = ['wood', 'fire', 'earth', 'metal', 'water']

/** fiveElements에서 오행 값을 안전하게 추출 (한글/영문 키 모두 지원) */
function getElementValues(fiveElements: any): Record<string, number> {
  const source = fiveElements?.weightedElements || fiveElements?.totalElements
  if (!source) return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }

  // 한글 키 → 영문 키 매핑
  const koToEn: Record<string, string> = {
    '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water',
  }

  // 영문 키가 있으면 그대로, 한글 키가 있으면 변환
  if (source.wood !== undefined) {
    return {
      wood: Number(source.wood) || 0,
      fire: Number(source.fire) || 0,
      earth: Number(source.earth) || 0,
      metal: Number(source.metal) || 0,
      water: Number(source.water) || 0,
    }
  }

  // 한글 키
  return {
    wood: Number(source['木']) || 0,
    fire: Number(source['火']) || 0,
    earth: Number(source['土']) || 0,
    metal: Number(source['金']) || 0,
    water: Number(source['水']) || 0,
  }
}

function analyzeElementBalance(
  person1: CalculateResult,
  person2: CalculateResult
): CompatibilityItem {
  const details: string[] = []
  const c1 = getElementValues(person1.fiveElements)
  const c2 = getElementValues(person2.fiveElements)

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
      detailedAnalysis: {
        interpretation: '오행 데이터가 부족하여 상세 분석이 어렵습니다.',
        relationship: '출생시간을 정확히 입력하면 더 정확한 분석이 가능합니다.',
        advice: '출생시간을 확인하여 다시 분석해보세요.',
        keywords: ['데이터 부족', '시간 확인', '재분석'],
      },
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

    const detailedAnalysis = generateElementBalanceDetailed(
    c1, c2, combined, total, balanceRatio, complementCount,
    person1.dayStem.name, person2.dayStem.name, score
  )

  return {
    category: '오행 균형 보완',
    score,
    maxScore: 10,
    grade: itemGrade(score, 10),
    description: `균형도 ${Math.round(balanceRatio * 100)}% / 보충 ${complementCount}건`,
    details,
    detailedAnalysis,
  }
}

function generateElementBalanceDetailed(
  c1: Record<string, number>, c2: Record<string, number>,
  combined: Record<string, number>, total: number,
  balanceRatio: number, complementCount: number,
  name1: string, name2: string, score: number
): CompatibilityItem['detailedAnalysis'] {
  const balancePct = Math.round(balanceRatio * 100)

  // 최다/최소 오행 찾기
  let maxEl = 'wood', minEl = 'wood'
  for (const el of ALL_ELEMENTS) {
    if (combined[el] > combined[maxEl]) maxEl = el
    if (combined[el] < combined[minEl]) minEl = el
  }

  const maxKo = ELEMENT_KO[maxEl]
  const minKo = ELEMENT_KO[minEl]

  let interpretation = ''
  let relationship = ''
  let advice = ''
  const keywords: string[] = []

  if (balancePct >= 75) {
    interpretation = `두 사람의 오행을 합산하면 균형도가 ${balancePct}%로 매우 뛰어납니다. 한쪽에 치우침 없이 오행이 고르게 분포되어, 함께하면 운의 흐름이 안정적입니다. 특히 ${maxKo} 기운이 풍부하여 공동 활동에서 힘을 발휘합니다.`
    keywords.push('고른 균형', '시너지', '안정')
  } else if (balancePct >= 50) {
    interpretation = `두 사람의 합산 오행 균형도가 ${balancePct}%로 무난한 수준입니다. ${maxKo} 기운이 다소 강하고 ${minKo} 기운이 약한 편이지만, 일상에 큰 지장은 없는 조합입니다.`
    keywords.push('무난', maxKo + ' 강세', minKo + ' 보충')
  } else {
    interpretation = `합산 오행 균형도가 ${balancePct}%로 다소 편중된 조합입니다. ${maxKo}에 집중되고 ${minKo}이 부족하여, 함께할 때 특정 분야에서만 강점을 보이고 다른 분야가 약해질 수 있습니다.`
    keywords.push('편중', minKo + ' 부족', '의식적 보완')
  }

  if (complementCount > 0) {
    relationship = `${complementCount}개 오행에서 서로의 빈자리를 채워주는 보완 관계입니다. 한쪽에 없는 오행을 상대가 가지고 있어, 함께하면 더 완전해집니다.`
  } else {
    relationship = `오행 보충 관계는 없지만, 전체적인 분포로 보면 함께하는 것이 각자보다 나은 균형을 만들어냅니다.`
  }

  const weakElKo = ELEMENT_KO[minEl]
  const elActivity: Record<string, string> = {
    '木': '산책, 등산, 정원 가꾸기 등 자연 속 활동',
    '火': '운동, 요리, 캠프파이어 등 열정적 활동',
    '土': '도예, 텃밭 가꾸기, 명상 등 안정적 활동',
    '金': '악기 연주, 공예, 헬스 등 단련 활동',
    '水': '수영, 여행, 독서 등 유연한 활동',
  }

  advice = `부족한 ${weakElKo} 기운을 함께 보충하세요. ${elActivity[weakElKo] || '관련 활동'}을 함께하면 오행 균형이 개선됩니다.`

  return { interpretation, relationship, advice, keywords: keywords.slice(0, 3) }
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