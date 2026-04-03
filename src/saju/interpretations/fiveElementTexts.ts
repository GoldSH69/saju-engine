/**
 * 오행(五行) 과다/부족 해석 템플릿
 *
 * 사주 원국의 오행 분포에서 가장 많은 오행(과다)과 가장 적은/없는 오행(부족)을
 * 기반으로 성격적 특성과 조언을 제공합니다.
 *
 * 과다: 해당 오행이 3개 이상이면 과다로 판단
 * 부족: 해당 오행이 0개이면 부족(결핍)으로 판단
 */

export interface FiveElementText {
  /** 오행 영문 */
  element: string
  /** 오행 한글 */
  elementKo: string
  /** 과다 - 짧은 해석 (무료) */
  excessShort: string
  /** 과다 - 상세 해석 (광고/유료) */
  excessDetail: string
  /** 부족 - 짧은 해석 (무료) */
  lackShort: string
  /** 부족 - 상세 해석 (광고/유료) */
  lackDetail: string
  /** 과다 키워드 */
  excessKeywords: string[]
  /** 부족 키워드 */
  lackKeywords: string[]
}

export const FIVE_ELEMENT_TEXTS: Record<string, FiveElementText> = {
  wood: {
    element: 'wood',
    elementKo: '목(木)',
    excessShort: '목(木)이 강합니다. 성장과 확장의 욕구가 크며 자기주장이 강합니다.',
    excessDetail: '목(木) 기운이 과다하면 자기주장이 강하고 고집이 셀 수 있습니다. '
      + '성장과 확장을 끊임없이 추구하여 한 자리에 안주하지 못하는 경향이 있습니다. '
      + '남의 말을 잘 듣지 않고 독단적으로 행동할 수 있습니다.\n\n'
      + '【성격】 고집, 독립심 과다, 참을성 부족\n'
      + '【건강】 간, 담, 눈, 근육 관련 주의\n'
      + '【조언】 금(金) 기운을 보충하세요. '
      + '흰색 계열 옷, 서쪽 방향, 매운 음식이 도움됩니다. '
      + '타인의 의견을 경청하는 습관을 기르세요.',
    lackShort: '목(木)이 부족합니다. 추진력과 성장 에너지가 약할 수 있습니다.',
    lackDetail: '목(木) 기운이 부족하면 추진력과 결단력이 약해질 수 있습니다. '
      + '새로운 일을 시작하는 데 어려움을 느끼고, 소극적인 태도를 보일 수 있습니다. '
      + '자기 표현이 서툴고 남의 눈치를 많이 봅니다.\n\n'
      + '【성격】 소극적, 우유부단, 자신감 부족\n'
      + '【건강】 간 기능 저하, 피로감, 시력 저하 주의\n'
      + '【조언】 목(木) 기운을 보충하세요. '
      + '녹색 계열 옷, 동쪽 방향, 신맛 음식이 도움됩니다. '
      + '나무가 많은 공원 산책이 좋습니다.',
    excessKeywords: ['고집', '독립', '확장', '성급'],
    lackKeywords: ['소극', '우유부단', '자신감 부족'],
  },

  fire: {
    element: 'fire',
    elementKo: '화(火)',
    excessShort: '화(火)가 강합니다. 열정적이지만 감정 기복이 크고 성급할 수 있습니다.',
    excessDetail: '화(火) 기운이 과다하면 열정이 넘치지만 감정 조절이 어려울 수 있습니다. '
      + '급하고 다혈질이며 한번 화가 나면 쉽게 가라앉지 않습니다. '
      + '화려한 것을 좋아하고 과시욕이 있을 수 있습니다.\n\n'
      + '【성격】 급함, 다혈질, 과시욕, 감정 기복\n'
      + '【건강】 심장, 혈압, 소장, 혀 관련 주의\n'
      + '【조언】 수(水) 기운을 보충하세요. '
      + '검은색 계열 옷, 북쪽 방향, 짠맛 음식이 도움됩니다. '
      + '명상이나 수영 등 마음을 가라앉히는 활동을 하세요.',
    lackShort: '화(火)가 부족합니다. 열정과 표현력이 약하고 소극적일 수 있습니다.',
    lackDetail: '화(火) 기운이 부족하면 열정이 부족하고 무기력해지기 쉽습니다. '
      + '자신을 표현하는 것을 어려워하고 사교 활동에 소극적입니다. '
      + '몸이 차갑고 에너지가 낮은 편입니다.\n\n'
      + '【성격】 무기력, 냉담, 표현력 부족, 소극적\n'
      + '【건강】 심장 기능 저하, 혈액순환 불량, 냉증 주의\n'
      + '【조언】 화(火) 기운을 보충하세요. '
      + '빨간색 계열 옷, 남쪽 방향, 쓴맛 음식이 도움됩니다. '
      + '햇빛을 많이 쬐고 활동적인 운동을 하세요.',
    excessKeywords: ['급함', '다혈질', '과시', '감정 기복'],
    lackKeywords: ['무기력', '냉담', '표현 부족'],
  },

  earth: {
    element: 'earth',
    elementKo: '토(土)',
    excessShort: '토(土)가 강합니다. 안정적이지만 변화를 싫어하고 보수적일 수 있습니다.',
    excessDetail: '토(土) 기운이 과다하면 안정을 지나치게 추구하여 변화를 거부합니다. '
      + '보수적이고 완고하며 새로운 것을 시도하기 어려워합니다. '
      + '고민이 많고 결정을 미루는 경향이 있습니다.\n\n'
      + '【성격】 보수적, 완고, 우유부단, 걱정 많음\n'
      + '【건강】 위장, 비장, 소화기, 피부 관련 주의\n'
      + '【조언】 목(木) 기운을 보충하세요. '
      + '녹색 계열 옷, 동쪽 방향, 신맛 음식이 도움됩니다. '
      + '새로운 것에 도전하는 용기를 내세요.',
    lackShort: '토(土)가 부족합니다. 안정감이 부족하고 중심을 잡기 어려울 수 있습니다.',
    lackDetail: '토(土) 기운이 부족하면 안정감이 없고 마음이 불안정합니다. '
      + '한 곳에 정착하지 못하고 이리저리 떠도는 느낌입니다. '
      + '신뢰를 주기 어렵고 약속을 잘 지키지 못할 수 있습니다.\n\n'
      + '【성격】 불안, 산만, 신뢰 부족, 정착 못함\n'
      + '【건강】 소화기 약함, 식욕부진, 근육 약화 주의\n'
      + '【조언】 토(土) 기운을 보충하세요. '
      + '노란색 계열 옷, 중앙 방향, 단맛 음식이 도움됩니다. '
      + '규칙적인 생활 습관을 만들어 안정감을 키우세요.',
    excessKeywords: ['보수', '완고', '걱정', '안정 집착'],
    lackKeywords: ['불안', '산만', '정착 못함'],
  },

  metal: {
    element: 'metal',
    elementKo: '금(金)',
    excessShort: '금(金)이 강합니다. 원칙을 중시하지만 냉정하고 날카로울 수 있습니다.',
    excessDetail: '금(金) 기운이 과다하면 원칙과 규율을 지나치게 강조합니다. '
      + '냉정하고 차가우며 타인에게 엄격한 잣대를 적용합니다. '
      + '비판적이고 완벽주의적이며 융통성이 부족합니다.\n\n'
      + '【성격】 냉정, 비판적, 완벽주의, 융통성 부족\n'
      + '【건강】 폐, 대장, 피부, 호흡기 관련 주의\n'
      + '【조언】 화(火) 기운을 보충하세요. '
      + '빨간색 계열 옷, 남쪽 방향, 쓴맛 음식이 도움됩니다. '
      + '따뜻한 대인관계를 유지하려고 노력하세요.',
    lackShort: '금(金)이 부족합니다. 결단력이 약하고 우유부단할 수 있습니다.',
    lackDetail: '금(金) 기운이 부족하면 결단력과 실행력이 약합니다. '
      + '우유부단하고 중요한 순간에 판단을 내리지 못합니다. '
      + '자기 절제가 어렵고 원칙 없이 흔들리기 쉽습니다.\n\n'
      + '【성격】 우유부단, 절제 부족, 원칙 없음\n'
      + '【건강】 폐 기능 약함, 호흡기 질환, 피부 트러블 주의\n'
      + '【조언】 금(金) 기운을 보충하세요. '
      + '흰색 계열 옷, 서쪽 방향, 매운 음식이 도움됩니다. '
      + '작은 것부터 결단하는 습관을 기르세요.',
    excessKeywords: ['냉정', '비판', '완벽주의', '엄격'],
    lackKeywords: ['우유부단', '절제 부족', '원칙 없음'],
  },

  water: {
    element: 'water',
    elementKo: '수(水)',
    excessShort: '수(水)가 강합니다. 지혜롭지만 감정에 휩쓸리거나 우울해지기 쉽습니다.',
    excessDetail: '수(水) 기운이 과다하면 생각이 너무 많고 감정에 휩쓸리기 쉽습니다. '
      + '우울하거나 비관적인 성향이 강해지며 현실 도피 경향이 있습니다. '
      + '변덕이 심하고 한 곳에 집중하지 못합니다.\n\n'
      + '【성격】 과민, 우울, 변덕, 현실 도피, 공상\n'
      + '【건강】 신장, 방광, 생식기, 귀 관련 주의\n'
      + '【조언】 토(土) 기운을 보충하세요. '
      + '노란색 계열 옷, 중앙 방향, 단맛 음식이 도움됩니다. '
      + '현실적인 목표를 세우고 실행에 옮기세요.',
    lackShort: '수(水)가 부족합니다. 유연함과 지혜가 부족하고 고집스러울 수 있습니다.',
    lackDetail: '수(水) 기운이 부족하면 유연함이 부족하고 융통성이 없습니다. '
      + '직관력이 떨어지고 상황 판단이 느립니다. '
      + '대인관계에서 융화되지 못하고 고립될 수 있습니다.\n\n'
      + '【성격】 경직, 융통성 부족, 고집, 고립\n'
      + '【건강】 신장 기능 약함, 비뇨기 문제, 청력 저하 주의\n'
      + '【조언】 수(水) 기운을 보충하세요. '
      + '검은색 계열 옷, 북쪽 방향, 짠맛 음식이 도움됩니다. '
      + '물 가까이에서 시간을 보내고 독서를 많이 하세요.',
    excessKeywords: ['과민', '우울', '변덕', '공상'],
    lackKeywords: ['경직', '융통성 부족', '고립'],
  },
}

/**
 * 오행 영문 키로 해석 조회
 */
export function getFiveElementText(element: string): FiveElementText | null {
  return FIVE_ELEMENT_TEXTS[element] || null
}

/**
 * 오행 분포에서 과다/부족 해석을 자동 생성
 *
 * @param counts { wood: n, fire: n, earth: n, metal: n, water: n }
 * @param excessThreshold 과다 기준 (기본 3)
 */
export function analyzeFiveElementTexts(
  counts: Record<string, number>,
  excessThreshold: number = 3
): {
  excess: { element: string; elementKo: string; count: number; short: string; detail: string }[]
  lack: { element: string; elementKo: string; count: number; short: string; detail: string }[]
} {
  const elements = ['wood', 'fire', 'earth', 'metal', 'water']
  const excess: { element: string; elementKo: string; count: number; short: string; detail: string }[] = []
  const lack: { element: string; elementKo: string; count: number; short: string; detail: string }[] = []

  for (const el of elements) {
    const text = FIVE_ELEMENT_TEXTS[el]
    if (!text) continue

    const count = counts[el] || 0

    if (count >= excessThreshold) {
      excess.push({
        element: el,
        elementKo: text.elementKo,
        count,
        short: text.excessShort,
        detail: text.excessDetail,
      })
    }

    if (count === 0) {
      lack.push({
        element: el,
        elementKo: text.elementKo,
        count,
        short: text.lackShort,
        detail: text.lackDetail,
      })
    }
  }

  return { excess, lack }
}