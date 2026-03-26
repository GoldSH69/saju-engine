// src/saju/constants.ts
// 천간, 지지, 지장간 등 기초 데이터를 정의합니다.

import { StemInfo, BranchInfo, HiddenStemInfo } from './types'

/**
 * 천간 10개
 */
export const STEMS: StemInfo[] = [
  { index: 0, char: '甲', name: '갑', element: 'wood',  elementKo: '목', yinYang: 'yang', yinYangKo: '양' },
  { index: 1, char: '乙', name: '을', element: 'wood',  elementKo: '목', yinYang: 'yin',  yinYangKo: '음' },
  { index: 2, char: '丙', name: '병', element: 'fire',  elementKo: '화', yinYang: 'yang', yinYangKo: '양' },
  { index: 3, char: '丁', name: '정', element: 'fire',  elementKo: '화', yinYang: 'yin',  yinYangKo: '음' },
  { index: 4, char: '戊', name: '무', element: 'earth', elementKo: '토', yinYang: 'yang', yinYangKo: '양' },
  { index: 5, char: '己', name: '기', element: 'earth', elementKo: '토', yinYang: 'yin',  yinYangKo: '음' },
  { index: 6, char: '庚', name: '경', element: 'metal', elementKo: '금', yinYang: 'yang', yinYangKo: '양' },
  { index: 7, char: '辛', name: '신', element: 'metal', elementKo: '금', yinYang: 'yin',  yinYangKo: '음' },
  { index: 8, char: '壬', name: '임', element: 'water', elementKo: '수', yinYang: 'yang', yinYangKo: '양' },
  { index: 9, char: '癸', name: '계', element: 'water', elementKo: '수', yinYang: 'yin',  yinYangKo: '음' },
]

/**
 * 지지 12개
 */
export const BRANCHES: BranchInfo[] = [
  { index: 0,  char: '子', name: '자', element: 'water', elementKo: '수', yinYang: 'yang', yinYangKo: '양', originalTimeRange: '23:00~01:00', adjustedTimeRange: '23:30~01:30' },
  { index: 1,  char: '丑', name: '축', element: 'earth', elementKo: '토', yinYang: 'yin',  yinYangKo: '음', originalTimeRange: '01:00~03:00', adjustedTimeRange: '01:30~03:30' },
  { index: 2,  char: '寅', name: '인', element: 'wood',  elementKo: '목', yinYang: 'yang', yinYangKo: '양', originalTimeRange: '03:00~05:00', adjustedTimeRange: '03:30~05:30' },
  { index: 3,  char: '卯', name: '묘', element: 'wood',  elementKo: '목', yinYang: 'yin',  yinYangKo: '음', originalTimeRange: '05:00~07:00', adjustedTimeRange: '05:30~07:30' },
  { index: 4,  char: '辰', name: '진', element: 'earth', elementKo: '토', yinYang: 'yang', yinYangKo: '양', originalTimeRange: '07:00~09:00', adjustedTimeRange: '07:30~09:30' },
  { index: 5,  char: '巳', name: '사', element: 'fire',  elementKo: '화', yinYang: 'yin',  yinYangKo: '음', originalTimeRange: '09:00~11:00', adjustedTimeRange: '09:30~11:30' },
  { index: 6,  char: '午', name: '오', element: 'fire',  elementKo: '화', yinYang: 'yang', yinYangKo: '양', originalTimeRange: '11:00~13:00', adjustedTimeRange: '11:30~13:30' },
  { index: 7,  char: '未', name: '미', element: 'earth', elementKo: '토', yinYang: 'yin',  yinYangKo: '음', originalTimeRange: '13:00~15:00', adjustedTimeRange: '13:30~15:30' },
  { index: 8,  char: '申', name: '신', element: 'metal', elementKo: '금', yinYang: 'yang', yinYangKo: '양', originalTimeRange: '15:00~17:00', adjustedTimeRange: '15:30~17:30' },
  { index: 9,  char: '酉', name: '유', element: 'metal', elementKo: '금', yinYang: 'yin',  yinYangKo: '음', originalTimeRange: '17:00~19:00', adjustedTimeRange: '17:30~19:30' },
  { index: 10, char: '戌', name: '술', element: 'earth', elementKo: '토', yinYang: 'yang', yinYangKo: '양', originalTimeRange: '19:00~21:00', adjustedTimeRange: '19:30~21:30' },
  { index: 11, char: '亥', name: '해', element: 'water', elementKo: '수', yinYang: 'yin',  yinYangKo: '음', originalTimeRange: '21:00~23:00', adjustedTimeRange: '21:30~23:30' },
]

/**
 * 지장간 테이블
 * 각 지지(인덱스 0~11)에 대한 지장간 구성
 * stem: 천간 인덱스, type: 여기/중기/본기, weight: 비율
 */
export const HIDDEN_STEMS_TABLE: Record<number, { stemIndex: number; type: 'residual' | 'middle' | 'main'; weight: number }[]> = {
  0:  [{ stemIndex: 9, type: 'main', weight: 1.0 }],                                                                                       // 子: 癸
  1:  [{ stemIndex: 9, type: 'residual', weight: 0.3 }, { stemIndex: 7, type: 'middle', weight: 0.3 }, { stemIndex: 5, type: 'main', weight: 0.4 }],  // 丑: 癸辛己
  2:  [{ stemIndex: 4, type: 'residual', weight: 0.2 }, { stemIndex: 2, type: 'middle', weight: 0.3 }, { stemIndex: 0, type: 'main', weight: 0.5 }],  // 寅: 戊丙甲
  3:  [{ stemIndex: 1, type: 'main', weight: 1.0 }],                                                                                       // 卯: 乙
  4:  [{ stemIndex: 1, type: 'residual', weight: 0.3 }, { stemIndex: 9, type: 'middle', weight: 0.3 }, { stemIndex: 4, type: 'main', weight: 0.4 }],  // 辰: 乙癸戊
  5:  [{ stemIndex: 4, type: 'residual', weight: 0.2 }, { stemIndex: 6, type: 'middle', weight: 0.3 }, { stemIndex: 2, type: 'main', weight: 0.5 }],  // 巳: 戊庚丙
  6:  [{ stemIndex: 5, type: 'middle', weight: 0.3 }, { stemIndex: 3, type: 'main', weight: 0.7 }],                                        // 午: 己丁
  7:  [{ stemIndex: 3, type: 'residual', weight: 0.2 }, { stemIndex: 1, type: 'middle', weight: 0.3 }, { stemIndex: 5, type: 'main', weight: 0.5 }],  // 未: 丁乙己
  8:  [{ stemIndex: 5, type: 'residual', weight: 0.2 }, { stemIndex: 8, type: 'middle', weight: 0.3 }, { stemIndex: 6, type: 'main', weight: 0.5 }],  // 申: 己壬庚
  9:  [{ stemIndex: 7, type: 'main', weight: 1.0 }],                                                                                       // 酉: 辛
  10: [{ stemIndex: 7, type: 'residual', weight: 0.3 }, { stemIndex: 3, type: 'middle', weight: 0.3 }, { stemIndex: 4, type: 'main', weight: 0.4 }],  // 戌: 辛丁戊
  11: [{ stemIndex: 4, type: 'residual', weight: 0.3 }, { stemIndex: 8, type: 'main', weight: 0.7 }],                                      // 亥: 戊壬
}

/**
 * 오행 상생 관계
 * key가 value를 생한다 (목생화, 화생토, 토생금, 금생수, 수생목)
 */
export const GENERATES: Record<string, string> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood'
}

/**
 * 오행 상극 관계
 * key가 value를 극한다 (목극토, 토극수, 수극화, 화극금, 금극목)
 */
export const OVERCOMES: Record<string, string> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood'
}

/**
 * 오행 한글 매핑
 */
export const ELEMENT_KO: Record<string, string> = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수'
}

/**
 * 월간 시작 천간 (년간 그룹별)
 * 년간이 甲(0)또는 己(5) → 寅월 천간은 丙(2)부터
 * 년간이 乙(1)또는 庚(6) → 寅월 천간은 戊(4)부터
 * 년간이 丙(2)또는 辛(7) → 寅월 천간은 庚(6)부터
 * 년간이 丁(3)또는 壬(8) → 寅월 천간은 壬(8)부터
 * 년간이 戊(4)또는 癸(9) → 寅월 천간은 甲(0)부터
 */
export const MONTH_STEM_START: Record<number, number> = {
  0: 2,  // 甲/己 → 丙
  1: 4,  // 乙/庚 → 戊
  2: 6,  // 丙/辛 → 庚
  3: 8,  // 丁/壬 → 壬
  4: 0,  // 戊/癸 → 甲
}

/**
 * 시간 시작 천간 (일간 그룹별)
 * 일간이 甲(0)또는 己(5) → 子시 천간은 甲(0)부터
 * 일간이 乙(1)또는 庚(6) → 子시 천간은 丙(2)부터
 * 일간이 丙(2)또는 辛(7) → 子시 천간은 戊(4)부터
 * 일간이 丁(3)또는 壬(8) → 子시 천간은 庚(6)부터
 * 일간이 戊(4)또는 癸(9) → 子시 천간은 壬(8)부터
 */
export const HOUR_STEM_START: Record<number, number> = {
  0: 0,  // 甲/己 → 甲
  1: 2,  // 乙/庚 → 丙
  2: 4,  // 丙/辛 → 戊
  3: 6,  // 丁/壬 → 庚
  4: 8,  // 戊/癸 → 壬
}