// ============================================================
// 사주 엔진 타입 정의
// ============================================================

// --- 천간 ---
export interface StemInfo {
  index: number;
  char: string;
  name: string;
  element: string;
  elementKo: string;
  yinYang: string;
  yinYangKo: string;
}

// --- 지지 ---
export interface BranchInfo {
  index: number;
  char: string;
  name: string;
  element: string;
  elementKo: string;
  yinYang: string;
  yinYangKo: string;
  originalTimeRange: string;
  adjustedTimeRange: string;
}

// --- 기둥 (주) ---
export interface Pillar {
  heavenlyStem: StemInfo;
  earthlyBranch: BranchInfo;
}

// --- 시간 보정 ---
export interface TimeAdjustmentResult {
  originalHour: number;
  originalMinute: number;
  adjustedHour: number;
  adjustedMinute: number;
  adjustmentType: 'standard30' | 'trueSolar' | 'none';
  adjustmentMinutes: number;
  description: string;
  dateChanged: boolean;
}

// --- 신강/신약 상세 항목 ---
export interface StrengthDetail {
  position: string;
  stem: string;
  stemName: string;
  tenStar: string;
  category: string;
  isSupporting: boolean;
  weight: number;
  score: number;
}

// --- 신강/신약 판단 결과 ---
export interface StrengthResult {
  dayStem: string;
  dayStemName: string;
  dayElement: string;
  dayElementKo: string;
  deukryeong: boolean;
  monthBranch: string;
  monthMainStem: string;
  monthMainElement: string;
  supportScore: number;
  restrainScore: number;
  totalScore: number;
  strength: string;
  strengthLevel: number;
  details: StrengthDetail[];
  summary: string;
}

// --- (하위호환용 별칭) ---
export type StrengthFactor = StrengthDetail;

// --- 십성 ---
export type TenStar = '비견'|'겁재'|'식신'|'상관'|'편재'|'정재'|'편인'|'정인'|'편관'|'정관';
export type TenStarCategory = '비화'|'식상'|'재성'|'인성'|'관성';

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

// --- 지장간 ---
export interface HiddenStemEntry {
  char: string;
  index: number;
  role: string;
  roleName: string;
  days: number;
}

// --- 오행 분석 ---
export interface FiveElementCount {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface FiveElementAnalysis {
  counts: FiveElementCount;
  dominant: string;
  weak: string;
  missing: string[];
  balance: string;
}

export type HiddenStemInfo = HiddenStemEntry;
