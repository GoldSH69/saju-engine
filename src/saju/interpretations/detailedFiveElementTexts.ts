/**
 * 오행 상세 분석 (가중치 기반) — C2
 *
 * C1에서 구축한 가중치 데이터(weightedElements, monthElement 등)를 활용하여
 * blur 영역 ⑧에서 광고 후 제공되는 상세 해석을 생성합니다.
 *
 * 포함 내용:
 *   ① 가중치 점수 순위표
 *   ② 최강/최약 오행 해석
 *   ③ 월령(출생 계절) 분석
 *   ④ 균형 진단 (0~100점)
 *   ⑤ 보충 추천 (색상, 방향, 음식, 활동)
 *   ⑥ 위치별 오행 배치 해석 (천간 4개)
 */

import type { FiveElementAnalysis, FiveElement } from '../fiveElements'

// ─── 오행 기본 정보 ─────────────────────────────────────

const ELEMENT_INFO: Record<FiveElement, {
  ko: string
  color: string
  direction: string
  season: string
  taste: string
  organ: string
  emotion: string
  activity: string
}> = {
  '木': { ko: '목(木)', color: '녹색/청색', direction: '동쪽', season: '봄', taste: '신맛', organ: '간/담', emotion: '분노', activity: '나무가 많은 공원 산책, 등산' },
  '火': { ko: '화(火)', color: '빨간색/자주색', direction: '남쪽', season: '여름', taste: '쓴맛', organ: '심장/소장', emotion: '기쁨', activity: '햇빛 쬐기, 활동적인 운동' },
  '土': { ko: '토(土)', color: '노란색/갈색', direction: '중앙', season: '환절기', taste: '단맛', organ: '위장/비장', emotion: '사려', activity: '규칙적 생활, 안정적 루틴' },
  '金': { ko: '금(金)', color: '흰색/은색', direction: '서쪽', season: '가을', taste: '매운맛', organ: '폐/대장', emotion: '슬픔', activity: '명상, 호흡 운동, 요가' },
  '水': { ko: '수(水)', color: '검은색/남색', direction: '북쪽', season: '겨울', taste: '짠맛', organ: '신장/방광', emotion: '공포', activity: '수영, 독서, 물가 산책' },
}

// ─── 오행 상생/상극 ─────────────────────────────────────

/** 상생: A → GENERATING[A] (A가 생하는 오행) */
const GENERATING: Record<FiveElement, FiveElement> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
}

/** 상극: A → CONTROLLING[A] (A가 극하는 오행) */
const CONTROLLING: Record<FiveElement, FiveElement> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
}

// ─── 월령 텍스트 ────────────────────────────────────────

const MONTH_ELEMENT_TEXTS: Record<FiveElement, string> = {
  '木': '봄의 기운(목기)이 왕성한 시기에 태어났습니다. 성장과 발전의 에너지가 강하며, 새로운 시작에 유리합니다.',
  '火': '여름의 기운(화기)이 왕성한 시기에 태어났습니다. 열정과 표현력이 넘치며, 활발한 활동 에너지가 있습니다.',
  '土': '토(土)의 전환기에 태어났습니다. 안정과 중재의 에너지가 있으며, 계절의 변화를 조율하는 힘이 있습니다.',
  '金': '가을의 기운(금기)이 왕성한 시기에 태어났습니다. 결실과 정리의 에너지가 강하며, 결단력이 뛰어납니다.',
  '水': '겨울의 기운(수기)이 왕성한 시기에 태어났습니다. 지혜와 저장의 에너지가 강하며, 깊은 사고력이 있습니다.',
}

// ─── 위치별 의미 + 오행별 해석 텍스트 ───────────────────

const POSITION_INFO: Record<string, { label: string; meaning: string }> = {
  '년간': { label: '년간(年干)', meaning: '조상운 · 사회적 이미지' },
  '월간': { label: '월간(月干)', meaning: '부모운 · 직업 · 사회활동' },
  '일간': { label: '일간(日干)', meaning: '자기 자신의 본질' },
  '시간': { label: '시간(時干)', meaning: '자녀운 · 말년 · 미래' },
}

const POSITION_TEXTS: Record<string, Record<FiveElement, string>> = {
  '년간': {
    '木': '조상으로부터 성장과 발전의 기운을 받았습니다. 사회적으로 진취적인 이미지입니다.',
    '火': '조상으로부터 열정과 명예의 기운을 받았습니다. 사회적으로 밝고 활발한 이미지입니다.',
    '土': '조상으로부터 안정과 신뢰의 기운을 받았습니다. 사회적으로 믿음직한 이미지입니다.',
    '金': '조상으로부터 결단과 원칙의 기운을 받았습니다. 사회적으로 카리스마 있는 이미지입니다.',
    '水': '조상으로부터 지혜와 유연함의 기운을 받았습니다. 사회적으로 영리한 이미지입니다.',
  },
  '월간': {
    '木': '직업적으로 성장하는 분야에 인연이 있습니다. 교육, 출판, 환경 관련 분야가 유리합니다.',
    '火': '직업적으로 표현하는 분야에 인연이 있습니다. 예술, 미디어, 요식업 등이 유리합니다.',
    '土': '직업적으로 안정적인 분야에 인연이 있습니다. 부동산, 건축, 농업 등이 유리합니다.',
    '金': '직업적으로 정밀한 분야에 인연이 있습니다. 금융, 법률, 의료 등이 유리합니다.',
    '水': '직업적으로 유동적인 분야에 인연이 있습니다. 무역, 물류, IT 등이 유리합니다.',
  },
  '일간': {
    '木': '본질적으로 성장과 발전을 추구하는 사람입니다.',
    '火': '본질적으로 열정과 표현을 추구하는 사람입니다.',
    '土': '본질적으로 안정과 신뢰를 추구하는 사람입니다.',
    '金': '본질적으로 원칙과 정의를 추구하는 사람입니다.',
    '水': '본질적으로 지혜와 유연함을 추구하는 사람입니다.',
  },
  '시간': {
    '木': '말년에 성장과 발전의 기운이 있습니다. 자녀가 진취적이고 활동적입니다.',
    '火': '말년에 열정과 활력의 기운이 있습니다. 자녀가 밝고 표현력이 뛰어납니다.',
    '土': '말년에 안정과 평화의 기운이 있습니다. 자녀가 성실하고 신뢰감이 있습니다.',
    '金': '말년에 결실과 풍요의 기운이 있습니다. 자녀가 똑똑하고 판단력이 좋습니다.',
    '水': '말년에 지혜와 여유의 기운이 있습니다. 자녀가 영리하고 적응력이 뛰어납니다.',
  },
}

// ─── 결과 타입 ──────────────────────────────────────────

export interface DetailedFiveElementResult {
  /** 가중치 점수 순위 (높은 점수 순) */
  scoreRanking: {
    element: FiveElement
    ko: string
    score: number
    percent: number
    rank: number
    status: '과다' | '강함' | '보통' | '약함' | '결핍'
  }[]

  /** 최강 오행 해석 */
  strongestText: string

  /** 최약 오행 해석 */
  weakestText: string

  /** 월령(출생 계절) 분석 */
  monthAnalysis: {
    element: FiveElement
    ko: string
    season: string
    description: string
    relation: string
  }

  /** 균형 진단 */
  balance: {
    type: '균형' | '약간 편중' | '편중' | '심한 편중'
    score: number
    description: string
  }

  /** 보충 추천 (가장 약한 오행 기준) */
  supplement: {
    element: FiveElement
    ko: string
    color: string
    direction: string
    taste: string
    activity: string
    description: string
  }

  /** 위치별 오행 배치 해석 (천간 4개) */
  positionAnalysis: {
    position: string
    label: string
    char: string
    element: FiveElement
    elementKo: string
    meaning: string
    interpretation: string
  }[]
}

// ─── 메인 함수 ──────────────────────────────────────────

/**
 * C1 가중치 데이터 기반 오행 상세 해석 생성
 *
 * @param fiveElements analyzeFiveElements()의 반환값
 * @returns 상세 오행 분석 결과 (⑧ blur 영역용)
 */
export function generateDetailedFiveElementAnalysis(
  fiveElements: FiveElementAnalysis
): DetailedFiveElementResult {

  const ALL: FiveElement[] = ['木', '火', '土', '金', '水']
  const w = fiveElements.weightedElements
  const totalWeight = ALL.reduce((sum, el) => sum + w[el], 0)
  const avgScore = totalWeight / 5

  // ── ① 가중치 점수 순위 ──
  const rawRanking = ALL.map(el => ({
    element: el,
    ko: ELEMENT_INFO[el].ko,
    score: Math.round(w[el] * 10) / 10,
    percent: totalWeight > 0 ? Math.round((w[el] / totalWeight) * 100) : 0,
  })).sort((a, b) => b.score - a.score)

  const scoreRanking = rawRanking.map((item, idx) => {
    let status: '과다' | '강함' | '보통' | '약함' | '결핍'
    if (fiveElements.totalElements[item.element] === 0) status = '결핍'
    else if (item.score > avgScore * 1.6) status = '과다'
    else if (item.score > avgScore * 1.2) status = '강함'
    else if (item.score < avgScore * 0.4) status = '약함'
    else status = '보통'
    return { ...item, rank: idx + 1, status }
  })

  // ── ② 최강 오행 해석 ──
  const stEl = fiveElements.strongest
  const stInfo = ELEMENT_INFO[stEl]
  const ctrlTarget = ELEMENT_INFO[CONTROLLING[stEl]]
  const strongestText =
    `${stInfo.ko} 기운이 가장 강합니다 (가중치 ${w[stEl].toFixed(1)}점, ${scoreRanking.find(r => r.element === stEl)?.percent}%). `
    + `${stInfo.ko}은(는) ${stInfo.season}의 기운으로 ${stInfo.emotion}의 감정과 관련됩니다. `
    + `${stInfo.organ} 건강에 주의하고, ${ctrlTarget.ko} 기운으로 조절하면 균형이 잡힙니다.`

  // ── ③ 최약 오행 해석 ──
  const wkEl = fiveElements.weakest
  const wkInfo = ELEMENT_INFO[wkEl]
  const isMissing = fiveElements.missing.includes(wkEl)
  const weakestText = isMissing
    ? `${wkInfo.ko} 기운이 사주에 없습니다 (결핍). `
      + `${wkInfo.ko}은(는) ${wkInfo.season}의 기운으로, 부족하면 ${wkInfo.organ} 건강이 약해질 수 있습니다. `
      + `${wkInfo.color} 계열의 옷이나 소품, ${wkInfo.direction} 방향, ${wkInfo.taste} 음식으로 적극 보충하세요.`
        : `${wkInfo.ko} 기운이 가장 약합니다 (가중치 ${w[wkEl].toFixed(1)}점, ${scoreRanking.find(r => r.element === wkEl)?.percent}%). `
      + `${wkInfo.ko}은(는) ${wkInfo.season}의 기운으로, 약하면 ${wkInfo.organ} 기능이 저하될 수 있습니다. `
      + `${wkInfo.color} 계열의 옷이나 소품, ${wkInfo.direction} 방향으로 보충하면 좋습니다.`

  // ── ④ 월령 분석 ──
  const mEl = fiveElements.monthElement
  const mInfo = ELEMENT_INFO[mEl]
  const dayEl = fiveElements.dayStemElement

  let relation: string
  if (mEl === dayEl) {
    relation = `월령과 일간이 같은 오행(${mInfo.ko})으로 계절의 도움을 받습니다. 득령(得令)하여 기본 힘이 강합니다.`
  } else if (GENERATING[mEl] === dayEl) {
    relation = `월령(${mInfo.ko})이 일간(${ELEMENT_INFO[dayEl].ko})을 생(生)해줍니다. 계절의 도움을 받아 힘이 보강됩니다.`
  } else if (CONTROLLING[mEl] === dayEl) {
    relation = `월령(${mInfo.ko})이 일간(${ELEMENT_INFO[dayEl].ko})을 극(克)합니다. 계절의 기운이 나를 억제하여 도전이 많을 수 있습니다.`
  } else if (GENERATING[dayEl] === mEl) {
    relation = `일간(${ELEMENT_INFO[dayEl].ko})이 월령(${mInfo.ko})을 생(生)합니다. 내 에너지가 계절에 빠져나가 힘이 분산됩니다.`
  } else if (CONTROLLING[dayEl] === mEl) {
    relation = `일간(${ELEMENT_INFO[dayEl].ko})이 월령(${mInfo.ko})을 극(克)합니다. 내가 계절을 이기려 하여 에너지 소모가 있습니다.`
  } else {
    relation = `월령과 일간의 관계가 복합적입니다.`
  }

  const monthAnalysis = {
    element: mEl,
    ko: mInfo.ko,
    season: mInfo.season,
    description: MONTH_ELEMENT_TEXTS[mEl],
    relation,
  }

  // ── ⑤ 균형 진단 ──
  const scores = ALL.map(el => w[el])
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const range = totalWeight > 0 ? (maxScore - minScore) / avgScore : 0

  let balanceType: '균형' | '약간 편중' | '편중' | '심한 편중'
  let balanceScore: number
  let balanceDesc: string

  if (range < 0.8) {
    balanceType = '균형'
    balanceScore = Math.round(85 + (0.8 - range) * 18)
    balanceDesc = '오행이 비교적 균형 잡혀 있습니다. 큰 편중 없이 안정적인 구성입니다. '
      + '어떤 상황에서든 유연하게 대처할 수 있는 잠재력이 있습니다.'
  } else if (range < 1.5) {
    balanceType = '약간 편중'
    balanceScore = Math.round(60 + (1.5 - range) * 35)
    balanceDesc = `오행에 약간의 편중이 있습니다. ${ELEMENT_INFO[fiveElements.strongest].ko}이(가) 다소 강하고 `
      + `${ELEMENT_INFO[fiveElements.weakest].ko}이(가) 약합니다. `
      + `약한 오행을 보충하면 전체적인 균형이 개선됩니다.`
  } else if (range < 2.5) {
    balanceType = '편중'
    balanceScore = Math.round(35 + (2.5 - range) * 25)
    balanceDesc = `오행의 편중이 뚜렷합니다. ${ELEMENT_INFO[fiveElements.strongest].ko}에 기운이 집중되어 있어 `
      + `${ELEMENT_INFO[fiveElements.weakest].ko} 보충이 중요합니다. `
      + `생활 속에서 의식적으로 부족한 오행을 채워가세요.`
  } else {
    balanceType = '심한 편중'
    balanceScore = Math.max(10, Math.round(35 - (range - 2.5) * 10))
    balanceDesc = `오행이 심하게 편중되어 있습니다. ${ELEMENT_INFO[fiveElements.strongest].ko}이(가) 매우 강하고 `
      + `${ELEMENT_INFO[fiveElements.weakest].ko}이(가) 매우 약합니다. `
      + `적극적인 오행 보충이 필요하며, 건강 관리에 특히 신경 쓰세요.`
  }
  balanceScore = Math.max(0, Math.min(100, balanceScore))

  const balance = { type: balanceType, score: balanceScore, description: balanceDesc }

  // ── ⑥ 보충 추천 ──
  const supEl = fiveElements.weakest
  const supInfo = ELEMENT_INFO[supEl]
  const supplement = {
    element: supEl,
    ko: supInfo.ko,
    color: supInfo.color,
    direction: supInfo.direction,
    taste: supInfo.taste,
    activity: supInfo.activity,
    description: `${supInfo.ko} 기운을 보충하세요. `
      + `${supInfo.color} 계열의 옷이나 인테리어가 도움됩니다. `
      + `${supInfo.direction} 방향이 길하며, ${supInfo.taste} 음식을 적당히 섭취하세요. `
      + `${supInfo.activity}이(가) 좋습니다.`,
  }

  // ── ⑦ 위치별 오행 배치 해석 ──
  const positionKeys = ['년간', '월간', '일간', '시간']
  const positionAnalysis = fiveElements.details
    .filter(d => !d.isHidden && positionKeys.includes(d.position))
    .map(d => {
      const posInfo = POSITION_INFO[d.position] || { label: d.position, meaning: '' }
      const interp = POSITION_TEXTS[d.position]?.[d.element] || ''
      return {
        position: d.position,
        label: posInfo.label,
        char: d.char,
        element: d.element,
        elementKo: ELEMENT_INFO[d.element].ko,
        meaning: posInfo.meaning,
        interpretation: interp,
      }
    })

  return {
    scoreRanking,
    strongestText,
    weakestText,
    monthAnalysis,
    balance,
    supplement,
    positionAnalysis,
  }
}