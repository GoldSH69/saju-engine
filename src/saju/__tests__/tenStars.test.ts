// src/saju/__tests__/tenStars.test.ts
export {};

import { getTenStar, getTenStarCategory, calculateTenStars } from '../tenStars';
import { TenStar } from '../types';

let passed = 0;
let failed = 0;
let total = 0;

function assertEqual(actual: any, expected: any, testName: string) {
  total++;
  if (actual === expected) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    console.log(`  ❌ ${testName}: expected "${expected}", got "${actual}"`);
  }
}

function assertDeepEqual(actual: any, expected: any, testName: string) {
  total++;
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    console.log(`  ❌ ${testName}`);
    console.log(`     expected: ${expectedStr}`);
    console.log(`     actual:   ${actualStr}`);
  }
}

// ============================================================
// 테스트 1: 기본 십성 판단 (getTenStar) - 甲 기준 전체 검증
// ============================================================
console.log('\n=== 테스트 1: 甲(갑, 양목) 기준 십성 ===');

// 甲 vs 10천간
assertEqual(getTenStar('甲', '甲'), '비견',  '甲-甲: 같은 오행+같은 음양 → 비견');
assertEqual(getTenStar('甲', '乙'), '겁재',  '甲-乙: 같은 오행+다른 음양 → 겁재');
assertEqual(getTenStar('甲', '丙'), '식신',  '甲-丙: 목생화+같은 음양 → 식신');
assertEqual(getTenStar('甲', '丁'), '상관',  '甲-丁: 목생화+다른 음양 → 상관');
assertEqual(getTenStar('甲', '戊'), '편재',  '甲-戊: 목극토+같은 음양 → 편재');
assertEqual(getTenStar('甲', '己'), '정재',  '甲-己: 목극토+다른 음양 → 정재');
assertEqual(getTenStar('甲', '庚'), '편관',  '甲-庚: 금극목+같은 음양 → 편관');
assertEqual(getTenStar('甲', '辛'), '정관',  '甲-辛: 금극목+다른 음양 → 정관');
assertEqual(getTenStar('甲', '壬'), '편인',  '甲-壬: 수생목+같은 음양 → 편인');
assertEqual(getTenStar('甲', '癸'), '정인',  '甲-癸: 수생목+다른 음양 → 정인');

// ============================================================
// 테스트 2: 丁(정, 음화) 기준 십성
// ============================================================
console.log('\n=== 테스트 2: 丁(정, 음화) 기준 십성 ===');

assertEqual(getTenStar('丁', '丙'), '겁재',  '丁-丙: 같은 오행+다른 음양 → 겁재');
assertEqual(getTenStar('丁', '丁'), '비견',  '丁-丁: 같은 오행+같은 음양 → 비견');
assertEqual(getTenStar('丁', '戊'), '상관',  '丁-戊: 화생토+다른 음양 → 상관');
assertEqual(getTenStar('丁', '己'), '식신',  '丁-己: 화생토+같은 음양 → 식신');
assertEqual(getTenStar('丁', '庚'), '정재',  '丁-庚: 화극금+다른 음양 → 정재');
assertEqual(getTenStar('丁', '辛'), '편재',  '丁-辛: 화극금+같은 음양 → 편재');
assertEqual(getTenStar('丁', '壬'), '정관',  '丁-壬: 수극화+다른 음양 → 정관');
assertEqual(getTenStar('丁', '癸'), '편관',  '丁-癸: 수극화+같은 음양 → 편관');
assertEqual(getTenStar('丁', '甲'), '정인',  '丁-甲: 목생화+다른 음양 → 정인');
assertEqual(getTenStar('丁', '乙'), '편인',  '丁-乙: 목생화+같은 음양 → 편인');

// ============================================================
// 테스트 3: 庚(경, 양금) 기준 십성
// ============================================================
console.log('\n=== 테스트 3: 庚(경, 양금) 기준 십성 ===');

assertEqual(getTenStar('庚', '庚'), '비견',  '庚-庚: 비견');
assertEqual(getTenStar('庚', '辛'), '겁재',  '庚-辛: 겁재');
assertEqual(getTenStar('庚', '壬'), '식신',  '庚-壬: 금생수 → 식신');
assertEqual(getTenStar('庚', '癸'), '상관',  '庚-癸: 금생수 → 상관');
assertEqual(getTenStar('庚', '甲'), '편재',  '庚-甲: 금극목 → 편재');
assertEqual(getTenStar('庚', '乙'), '정재',  '庚-乙: 금극목 → 정재');
assertEqual(getTenStar('庚', '丙'), '편관',  '庚-丙: 화극금 → 편관');
assertEqual(getTenStar('庚', '丁'), '정관',  '庚-丁: 화극금 → 정관');
assertEqual(getTenStar('庚', '戊'), '편인',  '庚-戊: 토생금 → 편인');
assertEqual(getTenStar('庚', '己'), '정인',  '庚-己: 토생금 → 정인');

// ============================================================
// 테스트 4: 카테고리 분류
// ============================================================
console.log('\n=== 테스트 4: 십성 카테고리 분류 ===');

assertEqual(getTenStarCategory('비견'), '비화', '비견 → 비화');
assertEqual(getTenStarCategory('겁재'), '비화', '겁재 → 비화');
assertEqual(getTenStarCategory('식신'), '식상', '식신 → 식상');
assertEqual(getTenStarCategory('상관'), '식상', '상관 → 식상');
assertEqual(getTenStarCategory('편재'), '재성', '편재 → 재성');
assertEqual(getTenStarCategory('정재'), '재성', '정재 → 재성');
assertEqual(getTenStarCategory('편인'), '인성', '편인 → 인성');
assertEqual(getTenStarCategory('정인'), '인성', '정인 → 인성');
assertEqual(getTenStarCategory('편관'), '관성', '편관 → 관성');
assertEqual(getTenStarCategory('정관'), '관성', '정관 → 관성');

// ============================================================
// 테스트 5: 실제 사주 통합 계산 - 1990년 5월 15일 7시 20분
// 사주: 庚午 辛巳 庚辰 庚卯 (추정, 만세력 기준)
// 일간: 庚 (경, 양금)
// ============================================================
console.log('\n=== 테스트 5: 실제 사주 십성 계산 ===');

// 예시 사주: 甲子 丙寅 庚辰 丙子
// 일간: 庚
console.log('\n--- 사주: 甲子年 丙寅月 庚辰日 丙子時 (일간: 庚) ---');
const result1 = calculateTenStars(
  '甲', '丙', '庚', '丙',  // 년간, 월간, 일간, 시간
  '子', '寅', '辰', '子'   // 년지, 월지, 일지, 시지
);

assertEqual(result1.dayStem, '庚', '일간 = 庚');
assertEqual(result1.yearStem.tenStar, '편재', '년간 甲 → 편재 (금극목, 같은 양)');
assertEqual(result1.monthStem.tenStar, '편관', '월간 丙 → 편관 (화극금, 같은 양)');
assertEqual(result1.hourStem.tenStar, '편관', '시간 丙 → 편관 (화극금, 같은 양)');

// 년지 子의 지장간: 壬(여기), 癸(정기)
// 庚-壬: 금생수+같은양 = 식신
// 庚-癸: 금생수+다른음양 = 상관
assertEqual(result1.yearBranchStars[0].tenStar, '식신', '년지 子 지장간 壬 → 식신');
assertEqual(result1.yearBranchStars[1].tenStar, '상관', '년지 子 지장간 癸 → 상관');

// 월지 寅의 지장간: 戊(여기), 丙(중기), 甲(정기)
// 庚-戊: 토생금+같은양 = 편인
// 庚-丙: 화극금+같은양 = 편관
// 庚-甲: 금극목+같은양 = 편재
assertEqual(result1.monthBranchStars[0].tenStar, '편인', '월지 寅 지장간 戊 → 편인');
assertEqual(result1.monthBranchStars[1].tenStar, '편관', '월지 寅 지장간 丙 → 편관');
assertEqual(result1.monthBranchStars[2].tenStar, '편재', '월지 寅 지장간 甲 → 편재');

// 일지 辰의 지장간: 乙(여기), 癸(중기), 戊(정기)
// 庚-乙: 금극목+다른음양 = 정재
// 庚-癸: 금생수+다른음양 = 상관
// 庚-戊: 토생금+같은양 = 편인
assertEqual(result1.dayBranchStars[0].tenStar, '정재', '일지 辰 지장간 乙 → 정재');
assertEqual(result1.dayBranchStars[1].tenStar, '상관', '일지 辰 지장간 癸 → 상관');
assertEqual(result1.dayBranchStars[2].tenStar, '편인', '일지 辰 지장간 戊 → 편인');

// ============================================================
// 테스트 6: 시간 모름 케이스
// ============================================================
console.log('\n=== 테스트 6: 시간 모름 케이스 ===');

const result2 = calculateTenStars(
  '甲', '丙', '庚', null,   // 시간 모름
  '子', '寅', '辰', null    // 시지 모름
);

assertEqual(result2.hourBranchStars.length, 0, '시지장간 없음 (시간 모름)');
// 시간 제외한 천간 3개 + 지장간 (년지2 + 월지3 + 일지3) = 11개
assertEqual(result2.allStars.length, 10, '전체 십성 10개 (시간 제외: 천간2 + 년지2 + 월지3 + 일지3)');

// ============================================================
// 테스트 7: 전체 음양 조합 대칭성 검증
// 모든 10천간을 일간으로, 모든 10천간을 대상으로 테스트
// ============================================================
console.log('\n=== 테스트 7: 10x10 전체 조합 오류 없음 검증 ===');

const allStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
let combinationErrors = 0;

for (const me of allStems) {
  for (const target of allStems) {
    try {
      const star = getTenStar(me, target);
      if (!star) combinationErrors++;
    } catch (e) {
      combinationErrors++;
      console.log(`  ❌ ${me}-${target} 오류: ${e}`);
    }
  }
}
total++;
if (combinationErrors === 0) {
  passed++;
  console.log(`  ✅ 10x10=100개 전체 조합 오류 없음`);
} else {
  failed++;
  console.log(`  ❌ ${combinationErrors}개 조합 오류 발생`);
}

// ============================================================
// 테스트 8: 십성 개수 집계 검증
// ============================================================
console.log('\n=== 테스트 8: 십성 개수 집계 ===');

// result1의 starCount 확인
// 천간: 편재1(甲), 편관1(丙), 편관1(丙) = 편재1, 편관2
// 년지장간: 식신1(壬), 상관1(癸)
// 월지장간: 편인1(戊), 편관1(丙), 편재1(甲) 
// 일지장간: 정재1(乙), 상관1(癸), 편인1(戊)
// 시지장간: 식신1(壬), 상관1(癸)

// 편재: 甲(년간) + 甲(월지장간) = 2
assertEqual(result1.starCount['편재'], 2, '편재 2개');
// 편관: 丙(월간) + 丙(시간) + 丙(월지장간) = 3
assertEqual(result1.starCount['편관'], 3, '편관 3개');
// 식신: 壬(년지장간) + 壬(시지장간) = 2
assertEqual(result1.starCount['식신'], 2, '식신 2개');
// 상관: 癸(년지장간) + 癸(일지장간) + 癸(시지장간) = 3
assertEqual(result1.starCount['상관'], 3, '상관 3개');
// 편인: 戊(월지장간) + 戊(일지장간) = 2
assertEqual(result1.starCount['편인'], 2, '편인 2개');
// 정재: 乙(일지장간) = 1
assertEqual(result1.starCount['정재'], 1, '정재 1개');

// 카테고리 합계
assertEqual(result1.categoryCount['비화'], 0, '비화 0개');
assertEqual(result1.categoryCount['식상'], 5, '식상 5개 (식신2+상관3)');
assertEqual(result1.categoryCount['재성'], 3, '재성 3개 (편재2+정재1)');
assertEqual(result1.categoryCount['인성'], 2, '인성 2개 (편인2)');
assertEqual(result1.categoryCount['관성'], 3, '관성 3개 (편관3)');

// 전체 합계 = 13 (천간3 + 지장간10)
const totalCount = Object.values(result1.starCount).reduce((a, b) => a + b, 0);
assertEqual(totalCount, 13, '전체 십성 합계 = 13');
assertEqual(result1.allStars.length, 13, 'allStars 배열 길이 = 13');

// ============================================================
// 테스트 9: 乙(음목) 기준 - 다른 음양 패턴 검증
// ============================================================
console.log('\n=== 테스트 9: 乙(을, 음목) 기준 십성 ===');

assertEqual(getTenStar('乙', '甲'), '겁재',  '乙-甲: 같은 오행+다른 음양 → 겁재');
assertEqual(getTenStar('乙', '乙'), '비견',  '乙-乙: 같은 오행+같은 음양 → 비견');
assertEqual(getTenStar('乙', '丙'), '상관',  '乙-丙: 목생화+다른 음양 → 상관');
assertEqual(getTenStar('乙', '丁'), '식신',  '乙-丁: 목생화+같은 음양 → 식신');
assertEqual(getTenStar('乙', '戊'), '정재',  '乙-戊: 목극토+다른 음양 → 정재');
assertEqual(getTenStar('乙', '己'), '편재',  '乙-己: 목극토+같은 음양 → 편재');
assertEqual(getTenStar('乙', '庚'), '정관',  '乙-庚: 금극목+다른 음양 → 정관');
assertEqual(getTenStar('乙', '辛'), '편관',  '乙-辛: 금극목+같은 음양 → 편관');
assertEqual(getTenStar('乙', '壬'), '정인',  '乙-壬: 수생목+다른 음양 → 정인');
assertEqual(getTenStar('乙', '癸'), '편인',  '乙-癸: 수생목+같은 음양 → 편인');

// ============================================================
// 결과 출력
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`십성 테스트 결과: ${passed}/${total} 통과`);
if (failed > 0) {
  console.log(`❌ ${failed}건 실패`);
  process.exit(1);
} else {
  console.log('✅ 전체 통과!');
}