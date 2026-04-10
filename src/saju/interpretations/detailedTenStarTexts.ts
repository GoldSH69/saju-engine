/**
 * 십성 상세 분석 — C2
 *
 * blur 영역 ⑨에서 광고 후 제공되는 상세 해석을 생성합니다.
 *
 * 포함 내용:
 *   ① 위치별 십성 해석 (년간/월간/시간이 어디에 있느냐에 따라 의미 다름)
 *   ② 카테고리 종합 분석 (비겁/식상/재성/관성/인성 비율)
 *   ③ 십성 조합 패턴 (식상생재, 관인상생 등)
 *   ④ 인생 테마 종합
 */

import type { TenStarResult, TenStar, TenStarCategory } from '../types'

// ─── 위치별 십성 의미 ───────────────────────────────────

const POSITION_MEANINGS: Record<string, string> = {
  '년간': '사회적 활동 · 조상운 · 초년운(1~20세)',
  '월간': '직업 · 부모운 · 청년운(20~40세)',
  '시간': '자녀 · 제자 · 말년운(50세 이후)',
}

/** 십성이 특정 위치에 있을 때의 해석 */
const POSITION_STAR_TEXTS: Record<string, Record<string, string>> = {
  '년간': {
    '비견': '어린 시절 형제나 또래 친구의 영향이 큽니다. 사회적으로 독립적인 이미지를 가집니다.',
    '겁재': '초년에 경쟁이 많고 재물 변동이 있을 수 있습니다. 사회적으로 대담한 인상을 줍니다.',
    '식신': '조상 덕이 있고 어린 시절 먹을 복이 있습니다. 사회적으로 여유롭고 편안한 이미지입니다.',
    '상관': '어린 시절 자유분방하고 특이한 경험이 많습니다. 사회적으로 창의적이고 독특한 이미지입니다.',
    '편재': '조상이 사업을 했거나 활동적이었습니다. 사회적으로 사교적이고 수완 좋은 이미지입니다.',
    '정재': '조상이 근면했고 안정적인 가정 환경입니다. 사회적으로 성실하고 믿음직한 이미지입니다.',
    '편관': '어린 시절 규율이 엄격하거나 어려움이 있었습니다. 사회적으로 카리스마 있는 이미지입니다.',
    '정관': '명문 집안이거나 사회적 체면을 중시하는 가풍입니다. 사회적으로 품위 있는 이미지입니다.',
    '편인': '조상 중 학자나 종교인이 있을 수 있습니다. 사회적으로 학문적이고 독창적인 이미지입니다.',
    '정인': '조상의 도움과 보호를 받으며 자랐습니다. 사회적으로 지적이고 인자한 이미지입니다.',
  },
  '월간': {
    '비견': '직업적으로 독립성이 강합니다. 동업보다 단독 사업이 유리하며, 동료와 경쟁 관계가 생기기 쉽습니다.',
    '겁재': '직업적으로 승부욕이 강합니다. 영업이나 경쟁이 있는 분야에서 두각을 나타내지만 재물 관리에 주의하세요.',
    '식신': '직업적으로 전문 기술이나 재능을 살리면 좋습니다. 요리, 예술, 교육 등 표현하는 일에 유리합니다.',
    '상관': '직업적으로 틀에 박히지 않은 일이 맞습니다. 프리랜서, 예술가, 기획자 등 창의적 분야가 유리합니다.',
    '편재': '직업적으로 사업 수완이 뛰어납니다. 여러 수입원을 만들거나 영업, 무역 등 활동적인 일이 유리합니다.',
    '정재': '직업적으로 안정적인 직장이 맞습니다. 회계, 금융, 관리직 등 꼼꼼함이 필요한 일이 유리합니다.',
    '편관': '직업적으로 도전적인 환경에서 성장합니다. 군인, 경찰, 소방관, 경영자 등 결단력이 필요한 일이 유리합니다.',
    '정관': '직업적으로 조직 생활에 잘 맞습니다. 공무원, 대기업, 법조계 등 안정적이고 명예로운 일이 유리합니다.',
    '편인': '직업적으로 특수 분야에 재능이 있습니다. 연구, 의학, 종교, 철학 등 전문적인 일이 유리합니다.',
    '정인': '직업적으로 학문과 교육에 인연이 있습니다. 교사, 교수, 연구원, 문서 관련 일이 유리합니다.',
  },
  '시간': {
    '비견': '말년에 독립적이고 자녀와 대등한 관계입니다. 노후에도 활동적이며 자기 일을 합니다.',
    '겁재': '말년에 재물 변동에 주의하세요. 자녀가 대담하고 활동적이지만 경쟁심이 강할 수 있습니다.',
    '식신': '말년이 편안하고 먹을 복이 있습니다. 자녀가 효도하며 여유로운 노후를 보냅니다.',
    '상관': '말년에 자유롭고 창의적인 활동을 합니다. 자녀가 독특하고 예술적 재능이 있습니다.',
    '편재': '말년에 사업이나 재테크로 활동적입니다. 자녀가 사업 수완이 있고 활발합니다.',
    '정재': '말년에 경제적으로 안정됩니다. 자녀가 성실하고 알뜰하여 부모를 잘 모십니다.',
    '편관': '말년에 건강 관리에 주의하세요. 자녀가 강한 성격이며 권위 있는 직업을 가질 수 있습니다.',
    '정관': '말년에 명예롭고 존경받습니다. 자녀가 사회적으로 성공하며 효심이 깊습니다.',
    '편인': '말년에 학문이나 종교에 심취합니다. 자녀가 독특한 재능이 있지만 외로움에 주의하세요.',
    '정인': '말년에 학문적 업적을 남기거나 귀인의 도움이 있습니다. 자녀가 지적이고 효성스럽습니다.',
  },
}

// ─── 카테고리 종합 해석 ─────────────────────────────────

const CATEGORY_TEXTS: Record<TenStarCategory, {
  label: string
  hanja: string
  theme: string
  strong: string
  weak: string
}> = {
  '비화': {
    label: '비겁', hanja: '比劫', theme: '자아 · 독립 · 경쟁',
    strong: '자아가 강하고 독립심이 넘칩니다. 자기 주장이 확고하며 남에게 의존하지 않습니다. 다만 고집이 세고 재물이 분산되기 쉬우니, 양보하는 지혜가 필요합니다.',
    weak: '자아가 약하고 주변 영향을 많이 받습니다. 남의 도움이 필요하며 독립적으로 행동하기 어렵습니다. 자신감을 키우고 주체성을 강화하는 노력이 필요합니다.',
  },
  '식상': {
    label: '식상', hanja: '食傷', theme: '표현 · 재능 · 창작',
    strong: '표현력과 창의력이 뛰어납니다. 말솜씨가 좋고 예술적 재능이 있습니다. 하지만 말이 많아지거나 상사와 부딪히기 쉬우니, 입조심이 필요합니다.',
    weak: '표현이 서투르고 자기 감정을 드러내기 어렵습니다. 창의적 활동보다 정해진 틀에서 일하는 것을 선호합니다. 표현력을 기르는 활동(글쓰기, 말하기)이 도움됩니다.',
  },
  '재성': {
    label: '재성', hanja: '財星', theme: '재물 · 현실 · 사업',
    strong: '돈에 대한 감각이 뛰어나고 현실적입니다. 사업 수완이 좋고 재테크에 관심이 많습니다. 하지만 물질에 집착하거나 이성 문제에 주의가 필요합니다.',
    weak: '재물에 대한 욕심이 적고 비현실적일 수 있습니다. 돈 관리가 서투르고 경제 관념이 약합니다. 실질적인 재무 계획을 세우는 습관이 필요합니다.',
  },
  '관성': {
    label: '관성', hanja: '官星', theme: '직장 · 명예 · 규율',
    strong: '사회적 규범을 잘 지키고 조직 생활에 적합합니다. 명예와 출세에 관심이 많지만, 스트레스와 압박도 큽니다. 적절한 스트레스 해소가 중요합니다.',
    weak: '규율에 얽매이기 싫어하고 자유를 추구합니다. 직장보다 자유업이나 프리랜서가 맞을 수 있습니다. 기본적인 사회 규범은 지키되 자신만의 길을 찾으세요.',
  },
  '인성': {
    label: '인성', hanja: '印星', theme: '학문 · 귀인 · 어머니',
    strong: '학문적 재능이 뛰어나고 귀인의 도움을 받습니다. 자격증이나 학위에 유리하며 지적 호기심이 강합니다. 하지만 실천보다 생각에 치우치기 쉬우니 행동으로 옮기세요.',
    weak: '학업 운이 약하고 귀인의 도움이 부족합니다. 독학이나 실전 경험으로 실력을 키워야 합니다. 스스로 길을 개척하는 강인함이 필요합니다.',
  },
}

// ─── 십성 조합 패턴 ─────────────────────────────────────

interface CombinationPattern {
  name: string
  condition: (cats: Record<TenStarCategory, number>) => boolean
  description: string
}

const PATTERNS: CombinationPattern[] = [
  {
    name: '식상생재(食傷生財)',
    condition: (c) => c['식상'] >= 2 && c['재성'] >= 2,
    description: '재능과 표현력으로 돈을 벌 수 있는 구조입니다. 기술직, 예술, 요식업 등에서 크게 성공할 수 있습니다. 자기 능력으로 부를 만들어가는 타입입니다.',
  },
  {
    name: '관인상생(官印相生)',
    condition: (c) => c['관성'] >= 1 && c['인성'] >= 2,
    description: '직장에서 인정받고 학업으로 출세하는 구조입니다. 공무원, 교수, 전문직에 매우 유리합니다. 안정적인 사회적 지위를 얻을 수 있습니다.',
  },
  {
    name: '재관쌍미(財官雙美)',
    condition: (c) => c['재성'] >= 2 && c['관성'] >= 1,
    description: '재물과 명예를 모두 갖출 수 있는 구조입니다. 사업을 하면서도 사회적 지위가 높고, 경제적으로 안정됩니다.',
  },
  {
    name: '상관견관(傷官見官)',
    condition: (c) => c['식상'] >= 2 && c['관성'] >= 2,
    description: '창의성과 규율이 충돌하는 구조입니다. 직장 생활에서 갈등이 생기기 쉽지만, 이 에너지를 잘 활용하면 혁신적인 성과를 냅니다. 자유로운 환경에서 능력을 발휘하세요.',
  },
  {
    name: '비겁쟁재(比劫爭財)',
    condition: (c) => c['비화'] >= 3 && c['재성'] >= 1,
    description: '경쟁이 치열하고 재물이 분산되기 쉬운 구조입니다. 동업이나 공동 투자는 피하고, 독립적으로 사업하는 것이 유리합니다.',
  },
  {
    name: '인성과다(印星過多)',
    condition: (c) => c['인성'] >= 3,
    description: '생각이 많고 실행이 부족한 구조입니다. 공부는 잘하지만 사회 진출이 늦어질 수 있습니다. 배운 것을 실천으로 옮기는 노력이 필요합니다.',
  },
]

// ─── 결과 타입 ──────────────────────────────────────────

export interface DetailedTenStarResult {
  /** 위치별 십성 해석 (년간/월간/시간) */
  positionAnalysis: {
    position: string
    star: string
    target: string
    positionMeaning: string
    interpretation: string
  }[]

  /** 카테고리 종합 분석 */
  categoryAnalysis: {
    category: string
    hanja: string
    theme: string
    count: number
    percent: number
    status: '과다' | '강함' | '보통' | '약함' | '없음'
    description: string
  }[]

  /** 발견된 십성 조합 패턴 */
  patterns: {
    name: string
    description: string
  }[]

  /** 인생 테마 종합 */
  lifeTheme: string
}

// ─── 메인 함수 ──────────────────────────────────────────

/**
 * 십성 상세 해석 생성
 *
 * @param tenStars buildTenStarAnalysis()의 반환값
 * @returns 상세 십성 분석 결과 (⑨ blur 영역용)
 */
export function generateDetailedTenStarAnalysis(
  tenStars: TenStarResult
): DetailedTenStarResult {

  // ── ① 위치별 십성 해석 ──
  const positionEntries = [
    { position: '년간', star: tenStars.yearStem.tenStar, target: tenStars.yearStem.target },
    { position: '월간', star: tenStars.monthStem.tenStar, target: tenStars.monthStem.target },
  ]
  // 시간은 target이 있을 때만
  if (tenStars.hourStem.target) {
    positionEntries.push({ position: '시간', star: tenStars.hourStem.tenStar, target: tenStars.hourStem.target })
  }

  const positionAnalysis = positionEntries.map(entry => ({
    position: entry.position,
    star: entry.star,
    target: entry.target,
    positionMeaning: POSITION_MEANINGS[entry.position] || '',
    interpretation: POSITION_STAR_TEXTS[entry.position]?.[entry.star] || '',
  }))

  // ── ② 카테고리 종합 분석 ──
  const catKeys: TenStarCategory[] = ['비화', '식상', '재성', '관성', '인성']
  const cc = tenStars.categoryCount
  // '비화'를 '비겁'으로 표시하기 위해 매핑
  const adjustedCC: Record<string, number> = { ...cc }
  if (adjustedCC['비겁'] === undefined && adjustedCC['비화'] !== undefined) {
    adjustedCC['비겁'] = adjustedCC['비화']
  }

  const totalStars = Object.values(cc).reduce((a, b) => a + b, 0)

  const categoryAnalysis = catKeys.map(cat => {
    const info = CATEGORY_TEXTS[cat]
    const count = cc[cat] || 0
    const percent = totalStars > 0 ? Math.round((count / totalStars) * 100) : 0

    let status: '과다' | '강함' | '보통' | '약함' | '없음'
    if (count === 0) status = '없음'
    else if (count >= 4) status = '과다'
    else if (count >= 3) status = '강함'
    else if (count === 1) status = '약함'
    else status = '보통'

    const description = count >= 3 ? info.strong : count === 0 ? info.weak : ''

    return {
      category: info.label,
      hanja: info.hanja,
      theme: info.theme,
      count,
      percent,
      status,
      description,
    }
  })

  // ── ③ 십성 조합 패턴 ──
  const patterns = PATTERNS
    .filter(p => p.condition(cc))
    .map(p => ({ name: p.name, description: p.description }))

  // ── ④ 인생 테마 종합 ──
  const sorted = [...categoryAnalysis].sort((a, b) => b.count - a.count)
  const top = sorted[0]
  const second = sorted[1]

  let lifeTheme: string
  if (top.count >= 4) {
    lifeTheme = `${top.category}(${top.theme})의 기운이 매우 강하여, 인생 전반에 걸쳐 이 에너지가 주도적으로 작용합니다. `
      + `${top.category}의 긍정적 측면을 잘 활용하되, 과다한 기운을 조절하는 것이 중요합니다.`
  } else if (top.count >= 3) {
    lifeTheme = `${top.category}(${top.theme})이(가) 주도적이고 ${second.category}(${second.theme})이(가) 보조합니다. `
      + `이 두 에너지의 조화가 인생의 핵심 테마입니다.`
  } else {
    lifeTheme = `특별히 두드러지는 십성이 없어 다방면의 가능성이 열려 있습니다. `
      + `시기에 따라 유연하게 대처할 수 있는 균형 잡힌 구조입니다.`
  }

  if (patterns.length > 0) {
    lifeTheme += `\n\n특히 ${patterns.map(p => p.name).join(', ')} 구조가 발견되어, 이를 잘 활용하면 큰 성과를 거둘 수 있습니다.`
  }

  return {
    positionAnalysis,
    categoryAnalysis,
    patterns,
    lifeTheme,
  }
}