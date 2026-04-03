/**
 * 해석 템플릿 모듈 테스트
 *
 * 실행: cd saju-engine
 *       npx ts-node src/saju/__tests__/interpretations.test.ts
 */

import {
  getDayStemText,
  getFiveElementText,
  analyzeFiveElementTexts,
  getTenStarText,
  analyzeTenStarTexts,
  getStrengthText,
  getDailyFortuneText,
  generateInterpretation,
  DAY_STEM_TEXTS,
  FIVE_ELEMENT_TEXTS,
  TEN_STAR_TEXTS,
  STRENGTH_TEXTS,
  DAILY_FORTUNE_TEXTS,
} from '../interpretations'

import { calculateSaju } from '../calculate'

let passed = 0
let failed = 0

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++
    console.log(`  ✅ ${msg}`)
  } else {
    failed++
    console.log(`  ❌ ${msg}`)
  }
}

// ─── 1. 일간 성격 템플릿 (10개) ─────────────────────────

console.log('\n=== 1. 일간 성격 템플릿 ===')

const stemChars = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

for (const char of stemChars) {
  const text = getDayStemText(char)
  assert(text !== null, `${char} 템플릿 존재`)
  assert(text!.char === char, `${char} char 일치`)
  assert(text!.short.length > 0, `${char} short 비어있지 않음`)
  assert(text!.detail.length > 0, `${char} detail 비어있지 않음`)
  assert(text!.keywords.length > 0, `${char} keywords 1개 이상`)
  assert(text!.symbol.length > 0, `${char} symbol 비어있지 않음`)
}

assert(Object.keys(DAY_STEM_TEXTS).length === 10, '일간 템플릿 총 10개')

// 없는 키 조회
assert(getDayStemText('X') === null, '없는 키 → null')

// ─── 2. 오행 과다/부족 템플릿 (5개) ─────────────────────

console.log('\n=== 2. 오행 과다/부족 템플릿 ===')

const elements = ['wood', 'fire', 'earth', 'metal', 'water']

for (const el of elements) {
  const text = getFiveElementText(el)
  assert(text !== null, `${el} 템플릿 존재`)
  assert(text!.excessShort.length > 0, `${el} excessShort 비어있지 않음`)
  assert(text!.excessDetail.length > 0, `${el} excessDetail 비어있지 않음`)
  assert(text!.lackShort.length > 0, `${el} lackShort 비어있지 않음`)
  assert(text!.lackDetail.length > 0, `${el} lackDetail 비어있지 않음`)
}

assert(Object.keys(FIVE_ELEMENT_TEXTS).length === 5, '오행 템플릿 총 5개')
assert(getFiveElementText('unknown') === null, '없는 오행 → null')

// analyzeFiveElementTexts 테스트
const counts1 = { wood: 4, fire: 1, earth: 2, metal: 0, water: 1 }
const analysis1 = analyzeFiveElementTexts(counts1)
assert(analysis1.excess.length === 1, '목 4개 → 과다 1개')
assert(analysis1.excess[0].element === 'wood', '과다 오행: wood')
assert(analysis1.lack.length === 1, '금 0개 → 부족 1개')
assert(analysis1.lack[0].element === 'metal', '부족 오행: metal')

const counts2 = { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 }
const analysis2 = analyzeFiveElementTexts(counts2)
assert(analysis2.excess.length === 0, '균형 → 과다 없음')
assert(analysis2.lack.length === 0, '균형 → 부족 없음')

const counts3 = { wood: 0, fire: 0, earth: 8, metal: 0, water: 0 }
const analysis3 = analyzeFiveElementTexts(counts3)
assert(analysis3.excess.length === 1, '토 8개 → 과다 1개')
assert(analysis3.lack.length === 4, '나머지 4개 오행 부족')

// 커스텀 threshold
const analysis4 = analyzeFiveElementTexts({ wood: 2, fire: 2, earth: 2, metal: 2, water: 0 }, 2)
assert(analysis4.excess.length === 4, 'threshold 2 → 과다 4개')

// ─── 3. 십성 키워드 템플릿 (10개) ────────────────────────

console.log('\n=== 3. 십성 키워드 템플릿 ===')

const stars = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인']

for (const star of stars) {
  const text = getTenStarText(star)
  assert(text !== null, `${star} 템플릿 존재`)
  assert(text!.star === star, `${star} star 일치`)
  assert(text!.short.length > 0, `${star} short 비어있지 않음`)
  assert(text!.detail.length > 0, `${star} detail 비어있지 않음`)
  assert(text!.excess.length > 0, `${star} excess 비어있지 않음`)
  assert(text!.lack.length > 0, `${star} lack 비어있지 않음`)
  assert(text!.category.length > 0, `${star} category 비어있지 않음`)
  assert(text!.keywords.length > 0, `${star} keywords 1개 이상`)
}

assert(Object.keys(TEN_STAR_TEXTS).length === 10, '십성 템플릿 총 10개')
assert(getTenStarText('없는별') === null, '없는 십성 → null')

// analyzeTenStarTexts 테스트
const starCount1: Record<string, number> = {
  '비견': 4, '겁재': 0, '식신': 1, '상관': 1,
  '편재': 1, '정재': 0, '편관': 1, '정관': 0,
  '편인': 1, '정인': 0,
}
const starAnalysis1 = analyzeTenStarTexts(starCount1)
assert(starAnalysis1.excess.length === 1, '비견 4개 → 과다 1개')
assert(starAnalysis1.excess[0].star === '비견', '과다 십성: 비견')
assert(starAnalysis1.lack.length === 4, '겁재/정재/정관/정인 0개 → 부족 4개')
assert(starAnalysis1.dominant !== null, 'dominant 존재')
assert(starAnalysis1.dominant!.star === '비견', 'dominant: 비견')
assert(starAnalysis1.dominant!.count === 4, 'dominant count: 4')

// 모두 0개
const starCount2: Record<string, number> = {
  '비견': 0, '겁재': 0, '식신': 0, '상관': 0,
  '편재': 0, '정재': 0, '편관': 0, '정관': 0,
  '편인': 0, '정인': 0,
}
const starAnalysis2 = analyzeTenStarTexts(starCount2)
assert(starAnalysis2.excess.length === 0, '전부 0 → 과다 없음')
assert(starAnalysis2.lack.length === 10, '전부 0 → 부족 10개')

// ─── 4. 신강/신약 템플릿 (3개) ──────────────────────────

console.log('\n=== 4. 신강/신약 템플릿 ===')

const strengths = ['신강', '신약', '중화']

for (const s of strengths) {
  const text = getStrengthText(s)
  assert(text !== null, `${s} 템플릿 존재`)
  assert(text!.result === s, `${s} result 일치`)
  assert(text!.short.length > 0, `${s} short 비어있지 않음`)
  assert(text!.detail.length > 0, `${s} detail 비어있지 않음`)
  assert(text!.career.length > 0, `${s} career 비어있지 않음`)
  assert(text!.relationship.length > 0, `${s} relationship 비어있지 않음`)
  assert(text!.wealth.length > 0, `${s} wealth 비어있지 않음`)
  assert(text!.health.length > 0, `${s} health 비어있지 않음`)
  assert(text!.advice.length > 0, `${s} advice 비어있지 않음`)
  assert(text!.keywords.length > 0, `${s} keywords 1개 이상`)
}

assert(Object.keys(STRENGTH_TEXTS).length === 3, '신강/신약 템플릿 총 3개')
assert(getStrengthText('없음') === null, '없는 키 → null')

// ─── 5. 오늘의 운세 템플릿 (10개) ────────────────────────

console.log('\n=== 5. 오늘의 운세 템플릿 ===')

for (const star of stars) {
  const text = getDailyFortuneText(star)
  assert(text !== null, `${star} 운세 템플릿 존재`)
  assert(text!.star === star, `${star} star 일치`)
  assert(text!.theme.length > 0, `${star} theme 비어있지 않음`)
  assert(text!.rating >= 1 && text!.rating <= 5, `${star} rating 1~5 범위`)
  assert(text!.ratingEmoji.length > 0, `${star} ratingEmoji 비어있지 않음`)
  assert(text!.short.length > 0, `${star} short 비어있지 않음`)
  assert(text!.detail.length > 0, `${star} detail 비어있지 않음`)
  assert(text!.advice.length > 0, `${star} advice 비어있지 않음`)
  assert(text!.lucky.color.length > 0, `${star} lucky.color 비어있지 않음`)
  assert(text!.lucky.direction.length > 0, `${star} lucky.direction 비어있지 않음`)
  assert(text!.lucky.number.length > 0, `${star} lucky.number 비어있지 않음`)
  assert(text!.lucky.time.length > 0, `${star} lucky.time 비어있지 않음`)
  assert(text!.caution.length > 0, `${star} caution 비어있지 않음`)
}

assert(Object.keys(DAILY_FORTUNE_TEXTS).length === 10, '운세 템플릿 총 10개')
assert(getDailyFortuneText('없는별') === null, '없는 십성 → null')

// ─── 6. 통합 generateInterpretation ─────────────────────

console.log('\n=== 6. generateInterpretation 통합 ===')

// 6-1: calculateSaju 결과로 통합 해석
const sajuResult = calculateSaju({
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: 'male',
  fortuneTargetYear: new Date().getFullYear(),
  fortuneTargetMonth: new Date().getMonth() + 1,
  fortuneTargetDay: new Date().getDate(),
})

const interp1 = generateInterpretation(sajuResult)

assert(interp1.dayStem !== null, '일간 해석 존재')
assert(interp1.dayStem!.char.length > 0, '일간 char 존재')
assert(interp1.dayStem!.short.length > 0, '일간 short 존재')
assert(interp1.dayStem!.detail.length > 0, '일간 detail 존재')

assert(interp1.fiveElements !== null, '오행 해석 존재')
assert(
  interp1.fiveElements.excess.length >= 0,
  `오행 과다 ${interp1.fiveElements.excess.length}개`
)
assert(
  interp1.fiveElements.lack.length >= 0,
  `오행 부족 ${interp1.fiveElements.lack.length}개`
)

assert(interp1.tenStars !== null, '십성 해석 존재')
assert(interp1.tenStars.dominant !== null, '주요 십성 존재')
assert(interp1.tenStars.dominant!.star.length > 0, '주요 십성 이름 존재')

assert(interp1.strength !== null, '신강/신약 해석 존재')
assert(
  ['신강', '신약', '중화'].includes(interp1.strength!.result),
  `신강/신약 결과: ${interp1.strength!.result}`
)
assert(interp1.strength!.career.length > 0, '직업 적성 해석 존재')
assert(interp1.strength!.advice.length > 0, '조언 존재')

assert(interp1.dailyFortune !== null, '오늘의 운세 존재')
assert(interp1.dailyFortune!.theme.length > 0, '운세 테마 존재')
assert(interp1.dailyFortune!.rating >= 1, '운세 등급 존재')
assert(interp1.dailyFortune!.lucky.color.length > 0, '행운 색상 존재')

console.log(`\n  📋 해석 요약 (1990.05.15 14:30 남)`)
console.log(`     일간: ${interp1.dayStem!.char}(${interp1.dayStem!.name}) - ${interp1.dayStem!.symbol}`)
console.log(`     성격: ${interp1.dayStem!.short.substring(0, 30)}...`)
console.log(`     신강/신약: ${interp1.strength!.result}`)
console.log(`     주요 십성: ${interp1.tenStars.dominant!.star} (${interp1.tenStars.dominant!.count}개)`)
console.log(`     오늘 운세: ${interp1.dailyFortune!.theme} ${interp1.dailyFortune!.ratingEmoji}`)

// 6-2: 시간 미상으로 통합 해석
const sajuResult2 = calculateSaju({
  year: 1985,
  month: 12,
  day: 25,
  hour: null,
  gender: 'female',
})

const interp2 = generateInterpretation(sajuResult2)

assert(interp2.dayStem !== null, '시간미상: 일간 해석 존재')
assert(interp2.strength !== null, '시간미상: 신강/신약 해석 존재')
assert(interp2.dailyFortune === null, '시간미상 + 운세미요청: 운세 null')

// 6-3: 다른 생년월일로 통합 해석
const sajuResult3 = calculateSaju({
  year: 2000,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  gender: 'female',
  fortuneTargetYear: new Date().getFullYear(),
  fortuneTargetMonth: new Date().getMonth() + 1,
  fortuneTargetDay: new Date().getDate(),
})

const interp3 = generateInterpretation(sajuResult3)

assert(interp3.dayStem !== null, '2000.01.01: 일간 해석 존재')
assert(interp3.strength !== null, '2000.01.01: 신강/신약 존재')
assert(interp3.dailyFortune !== null, '2000.01.01: 오늘 운세 존재')

console.log(`\n  📋 해석 요약 (2000.01.01 00:00 여)`)
console.log(`     일간: ${interp3.dayStem!.char}(${interp3.dayStem!.name}) - ${interp3.dayStem!.symbol}`)
console.log(`     신강/신약: ${interp3.strength!.result}`)
console.log(`     오늘 운세: ${interp3.dailyFortune!.theme} ${interp3.dailyFortune!.ratingEmoji}`)

// ─── 7. API 응답 형태 호환 테스트 ────────────────────────

console.log('\n=== 7. API 응답 형태 호환 ===')

// route.ts에서 보내는 형태와 유사한 객체로 테스트
const apiResponse = {
  dayStem: { char: '甲', name: '갑' },
  fiveElements: { counts: { wood: 3, fire: 2, earth: 1, metal: 1, water: 1 } },
  tenStars: {
    starCount: {
      '비견': 2, '겁재': 1, '식신': 1, '상관': 0,
      '편재': 1, '정재': 1, '편관': 0, '정관': 1,
      '편인': 1, '정인': 0,
    },
  },
  strength: { result: '신강' },
  fortune: {
    daily: {
      fortune: {
        tenStar: { stemStar: '식신' },
      },
    },
  },
}

const interp4 = generateInterpretation(apiResponse)
assert(interp4.dayStem !== null, 'API형태: 일간 해석 존재')
assert(interp4.dayStem!.char === '甲', 'API형태: 일간 甲')
assert(interp4.fiveElements.excess.length === 1, 'API형태: 목 3개 과다')
assert(interp4.strength !== null, 'API형태: 신강 해석 존재')
assert(interp4.strength!.result === '신강', 'API형태: 신강')
assert(interp4.dailyFortune !== null, 'API형태: 식신 운세 존재')
assert(interp4.dailyFortune!.star === '식신', 'API형태: 식신 운세')
assert(interp4.dailyFortune!.rating === 5, 'API형태: 식신 등급 5')

// ─── 8. 템플릿 총 개수 확인 ─────────────────────────────

console.log('\n=== 8. 템플릿 총 개수 확인 ===')

const totalTemplates =
  Object.keys(DAY_STEM_TEXTS).length          // 10
  + Object.keys(FIVE_ELEMENT_TEXTS).length     // 5
  + Object.keys(TEN_STAR_TEXTS).length         // 10
  + Object.keys(STRENGTH_TEXTS).length         // 3
  + Object.keys(DAILY_FORTUNE_TEXTS).length    // 10

assert(totalTemplates === 38, `총 템플릿: ${totalTemplates}개 (기대: 38)`)

console.log(`\n  일간 성격: ${Object.keys(DAY_STEM_TEXTS).length}개`)
console.log(`  오행 과다/부족: ${Object.keys(FIVE_ELEMENT_TEXTS).length}개 (× 과다/부족 = 10해석)`)
console.log(`  십성 키워드: ${Object.keys(TEN_STAR_TEXTS).length}개`)
console.log(`  신강/신약: ${Object.keys(STRENGTH_TEXTS).length}개`)
console.log(`  오늘의 운세: ${Object.keys(DAILY_FORTUNE_TEXTS).length}개`)
console.log(`  합계: ${totalTemplates}개 데이터 / 43개 해석`)

// ─── 결과 ─────────────────────────────────────────────

console.log('\n' + '='.repeat(50))
console.log(`총 ${passed + failed}건: ✅ ${passed}건 통과, ❌ ${failed}건 실패`)
if (failed === 0) {
  console.log('🎉 해석 템플릿 모듈 전체 테스트 통과!')
} else {
  console.log('⚠️ 실패한 테스트가 있습니다!')
  process.exit(1)
}