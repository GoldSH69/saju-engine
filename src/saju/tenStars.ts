// src/saju/tenStars.ts

import { STEMS, GENERATES, OVERCOMES } from './constants';
import { getHiddenStems } from './hiddenStems';

// ============================================================
// 십성(十星) 타입 정의
// ============================================================

export type TenStar = 
  | '비견' | '겁재'
  | '식신' | '상관'
  | '편재' | '정재'
  | '편인' | '정인'
  | '편관' | '정관';

export type TenStarCategory = '비화' | '식상' | '재성' | '인성' | '관성';

export interface TenStarInfo {
  target: string;
  targetKorean: string;
  tenStar: TenStar;
  category: TenStarCategory;
  position: string;
}

export interface TenStarResult {
  dayStem: string;
  dayStemKorean: string;
  yearStem: TenStarInfo;
  monthStem: TenStarInfo;
  hourStem: TenStarInfo;
  yearBranchStars: TenStarInfo[];
  monthBranchStars: TenStarInfo[];
  dayBranchStars: TenStarInfo[];
  hourBranchStars: TenStarInfo[];
  allStars: TenStarInfo[];
  starCount: Record<TenStar, number>;
  categoryCount: Record<TenStarCategory, number>;
}

// ============================================================
// STEMS 배열에서 룩업 테이블 생성
// ============================================================

/** 천간 한자 → StemInfo 매핑 */
const STEM_MAP = new Map(STEMS.map(s => [s.char, s]));

/** 천간 한자 → 오행 (영어: 'wood','fire','earth','metal','water') */
function getElement(stemChar: string): string {
  const info = STEM_MAP.get(stemChar);
  if (!info) throw new Error(`유효하지 않은 천간: ${stemChar}`);
  return info.element;
}

/** 천간 한자 → 음양 ('yang' | 'yin') */
function getYinYang(stemChar: string): string {
  const info = STEM_MAP.get(stemChar);
  if (!info) throw new Error(`유효하지 않은 천간: ${stemChar}`);
  return info.yinYang;
}

/** 천간 한자 → 한글 이름 */
function getKoreanName(stemChar: string): string {
  const info = STEM_MAP.get(stemChar);
  return info ? info.name : stemChar;
}

// ============================================================
// 핵심 함수: 두 천간 사이의 십성 판단
// ============================================================

/**
 * 일간(me)을 기준으로 대상 천간(target)의 십성을 판단
 * @param me - 일간 한자 (예: '甲')
 * @param target - 대상 천간 한자 (예: '庚')
 */
export function getTenStar(me: string, target: string): TenStar {
  const myElement = getElement(me);        // 예: 'wood'
  const targetElement = getElement(target); // 예: 'metal'
  const sameYinYang = getYinYang(me) === getYinYang(target);

  // 1. 같은 오행 → 비화
  if (myElement === targetElement) {
    return sameYinYang ? '비견' : '겁재';
  }

  // 2. 내가 생하는 오행 → 식상 (GENERATES['wood'] === 'fire')
  if (GENERATES[myElement] === targetElement) {
    return sameYinYang ? '식신' : '상관';
  }

  // 3. 내가 극하는 오행 → 재성 (OVERCOMES['wood'] === 'earth')
  if (OVERCOMES[myElement] === targetElement) {
    return sameYinYang ? '편재' : '정재';
  }

  // 4. 나를 생하는 오행 → 인성 (GENERATES[targetElement] === myElement)
  if (GENERATES[targetElement] === myElement) {
    return sameYinYang ? '편인' : '정인';
  }

  // 5. 나를 극하는 오행 → 관성 (OVERCOMES[targetElement] === myElement)
  if (OVERCOMES[targetElement] === myElement) {
    return sameYinYang ? '편관' : '정관';
  }

  throw new Error(`십성 판단 실패: me=${me}(${myElement}), target=${target}(${targetElement})`);
}

/**
 * 십성의 카테고리를 반환
 */
export function getTenStarCategory(star: TenStar): TenStarCategory {
  switch (star) {
    case '비견': case '겁재': return '비화';
    case '식신': case '상관': return '식상';
    case '편재': case '정재': return '재성';
    case '편인': case '정인': return '인성';
    case '편관': case '정관': return '관성';
  }
}

// ============================================================
// 십성 정보 생성 헬퍼
// ============================================================

function createTenStarInfo(
  me: string, 
  target: string, 
  position: string
): TenStarInfo {
  const tenStar = getTenStar(me, target);
  return {
    target,
    targetKorean: getKoreanName(target),
    tenStar,
    category: getTenStarCategory(tenStar),
    position
  };
}

// ============================================================
// 전체 사주의 십성 분포 계산
// ============================================================

export function calculateTenStars(
  yearStem: string,
  monthStem: string,
  dayStem: string,
  hourStem: string | null,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string | null
): TenStarResult {
  const allStars: TenStarInfo[] = [];

  // === 천간 십성 ===
  const yearStemStar = createTenStarInfo(dayStem, yearStem, '년간');
  allStars.push(yearStemStar);

  const monthStemStar = createTenStarInfo(dayStem, monthStem, '월간');
  allStars.push(monthStemStar);

  let hourStemStar: TenStarInfo;
  if (hourStem) {
    hourStemStar = createTenStarInfo(dayStem, hourStem, '시간');
    allStars.push(hourStemStar);
  } else {
    hourStemStar = {
      target: '',
      targetKorean: '',
      tenStar: '비견',
      category: '비화',
      position: '시간'
    };
  }

  // === 지장간 십성 (h.char 사용) ===
  const yearHidden = getHiddenStems(yearBranch);
  const yearBranchStars = yearHidden.map(h => 
    createTenStarInfo(dayStem, h.char, `년지장간(${yearBranch})`)
  );
  allStars.push(...yearBranchStars);

  const monthHidden = getHiddenStems(monthBranch);
  const monthBranchStars = monthHidden.map(h => 
    createTenStarInfo(dayStem, h.char, `월지장간(${monthBranch})`)
  );
  allStars.push(...monthBranchStars);

  const dayHidden = getHiddenStems(dayBranch);
  const dayBranchStars = dayHidden.map(h => 
    createTenStarInfo(dayStem, h.char, `일지장간(${dayBranch})`)
  );
  allStars.push(...dayBranchStars);

  let hourBranchStars: TenStarInfo[] = [];
  if (hourBranch) {
    const hourHidden = getHiddenStems(hourBranch);
    hourBranchStars = hourHidden.map(h => 
      createTenStarInfo(dayStem, h.char, `시지장간(${hourBranch})`)
    );
    allStars.push(...hourBranchStars);
  }

  // === 집계 ===
  const starCount: Record<TenStar, number> = {
    '비견': 0, '겁재': 0,
    '식신': 0, '상관': 0,
    '편재': 0, '정재': 0,
    '편인': 0, '정인': 0,
    '편관': 0, '정관': 0
  };

  const categoryCount: Record<TenStarCategory, number> = {
    '비화': 0, '식상': 0, '재성': 0, '인성': 0, '관성': 0
  };

  for (const star of allStars) {
    starCount[star.tenStar]++;
    categoryCount[star.category]++;
  }

  return {
    dayStem,
    dayStemKorean: getKoreanName(dayStem),
    yearStem: yearStemStar,
    monthStem: monthStemStar,
    hourStem: hourStemStar,
    yearBranchStars,
    monthBranchStars,
    dayBranchStars,
    hourBranchStars,
    allStars,
    starCount,
    categoryCount
  };
}