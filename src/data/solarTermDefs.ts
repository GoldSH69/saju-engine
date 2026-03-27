/**
 * 24절기 정의
 * 태양 황경(Sun Ecliptic Longitude) 기준
 * 
 * 절기(節氣) = 월의 시작을 결정하는 12절기
 * 중기(中氣) = 월의 중간 (월주 계산에는 직접 사용하지 않음)
 * 
 * 월주 계산에는 12절기(isJeol=true)만 사용
 * 24절기 전체를 생성해두면 향후 확장에 유리
 */

export interface SolarTermDef {
  index: number;        // 0~23 순번
  name: string;         // 한글명
  hanja: string;        // 한자명
  longitude: number;    // 태양 황경 (도)
  isJeol: boolean;      // 절기(節) 여부 (true=절, false=중)
  month: number;        // 해당 월 (인월=1 기준이 아니라 양력 월)
}

/**
 * 24절기 배열 (태양 황경 순서)
 * 
 * 춘분(0°)부터 시작하는 천문학적 순서가 아니라,
 * 전통적인 소한(1월)부터 시작하는 역법 순서 사용
 * 
 * 태양 황경:
 *   춘분 = 0°, 이후 15°씩 증가
 *   소한 = 285°
 */
export const SOLAR_TERM_DEFS: SolarTermDef[] = [
  // 1월
  { index: 0,  name: '소한',   hanja: '小寒',   longitude: 285, isJeol: true,  month: 1  },
  { index: 1,  name: '대한',   hanja: '大寒',   longitude: 300, isJeol: false, month: 1  },
  // 2월
  { index: 2,  name: '입춘',   hanja: '立春',   longitude: 315, isJeol: true,  month: 2  },
  { index: 3,  name: '우수',   hanja: '雨水',   longitude: 330, isJeol: false, month: 2  },
  // 3월
  { index: 4,  name: '경칩',   hanja: '驚蟄',   longitude: 345, isJeol: true,  month: 3  },
  { index: 5,  name: '춘분',   hanja: '春分',   longitude: 0,   isJeol: false, month: 3  },
  // 4월
  { index: 6,  name: '청명',   hanja: '清明',   longitude: 15,  isJeol: true,  month: 4  },
  { index: 7,  name: '곡우',   hanja: '穀雨',   longitude: 30,  isJeol: false, month: 4  },
  // 5월
  { index: 8,  name: '입하',   hanja: '立夏',   longitude: 45,  isJeol: true,  month: 5  },
  { index: 9,  name: '소만',   hanja: '小滿',   longitude: 60,  isJeol: false, month: 5  },
  // 6월
  { index: 10, name: '망종',   hanja: '芒種',   longitude: 75,  isJeol: true,  month: 6  },
  { index: 11, name: '하지',   hanja: '夏至',   longitude: 90,  isJeol: false, month: 6  },
  // 7월
  { index: 12, name: '소서',   hanja: '小暑',   longitude: 105, isJeol: true,  month: 7  },
  { index: 13, name: '대서',   hanja: '大暑',   longitude: 120, isJeol: false, month: 7  },
  // 8월
  { index: 14, name: '입추',   hanja: '立秋',   longitude: 135, isJeol: true,  month: 8  },
  { index: 15, name: '처서',   hanja: '處暑',   longitude: 150, isJeol: false, month: 8  },
  // 9월
  { index: 16, name: '백로',   hanja: '白露',   longitude: 165, isJeol: true,  month: 9  },
  { index: 17, name: '추분',   hanja: '秋分',   longitude: 180, isJeol: false, month: 9  },
  // 10월
  { index: 18, name: '한로',   hanja: '寒露',   longitude: 195, isJeol: true,  month: 10 },
  { index: 19, name: '상강',   hanja: '霜降',   longitude: 210, isJeol: false, month: 10 },
  // 11월
  { index: 20, name: '입동',   hanja: '立冬',   longitude: 225, isJeol: true,  month: 11 },
  { index: 21, name: '소설',   hanja: '小雪',   longitude: 240, isJeol: false, month: 11 },
  // 12월
  { index: 22, name: '대설',   hanja: '大雪',   longitude: 255, isJeol: true,  month: 12 },
  { index: 23, name: '동지',   hanja: '冬至',   longitude: 270, isJeol: false, month: 12 },
];

/**
 * 월주 계산용 12절기만 추출
 */
export const JEOL_TERMS = SOLAR_TERM_DEFS.filter(t => t.isJeol);