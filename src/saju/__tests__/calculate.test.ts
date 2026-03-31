export {}

import { calculateSaju, formatSajuResult, toResultJson, CalculateResult } from '../calculate'
import { STEMS, BRANCHES } from '../constants'

// ─── 테스트 유틸 ─────────────────────────────────────────
let passed = 0
let failed = 0
const failures: string[] = []

function assertEqual(actual: any, expected: any, label: string) {
  if (actual === expected) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    const msg = `  ❌ ${label} — expected: ${expected}, got: ${actual}`
    console.log(msg)
    failures.push(msg)
  }
}

function assertTrue(condition: boolean, label: string) {
  if (condition) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    const msg = `  ❌ ${label} — condition was false`
    console.log(msg)
    failures.push(msg)
  }
}

function assertNotNull(actual: any, label: string) {
  if (actual !== null && actual !== undefined) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    const msg = `  ❌ ${label} — was null/undefined`
    console.log(msg)
    failures.push(msg)
  }
}

// ─── 간지 헬퍼 ──────────────────────────────────────────
function getGanji(p: any): string {
  return `${p.heavenlyStem.char}${p.earthlyBranch.char}`
}

// ─── 테스트 실행 ─────────────────────────────────────────
function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════╗')
  console.log('║     통합 계산 테스트 (calculate.ts)       ║')
  console.log('╚═══════════════════════════════════════════╝\n')

  // ═══ 그룹 1: 기본 구조 검증 ═══
  console.log('── [1] 기본 구조 검증 ──')

  {
    const result = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20, gender: 'male',
    })
    assertNotNull(result, '결과 존재')
    assertNotNull(result.input, 'input 존재')
    assertNotNull(result.adjustedTime, 'adjustedTime 존재')
    assertNotNull(result.effectiveDate, 'effectiveDate 존재')
    assertNotNull(result.fourPillars, 'fourPillars 존재')
    assertNotNull(result.fourPillars.year, 'year pillar 존재')
    assertNotNull(result.fourPillars.month, 'month pillar 존재')
    assertNotNull(result.fourPillars.day, 'day pillar 존재')
    assertNotNull(result.fourPillars.hour, 'hour pillar 존재')
    assertNotNull(result.dayStem, 'dayStem 존재')
    assertNotNull(result.hiddenStems, 'hiddenStems 존재')
    assertNotNull(result.fiveElements, 'fiveElements 존재')
    assertNotNull(result.tenStars, 'tenStars 존재')
    assertNotNull(result.strength, 'strength 존재')
    assertNotNull(result.yongsin, 'yongsin 존재')
    assertNotNull(result.daewoon, 'daewoon 존재')
    assertNotNull(result.monthSolarTerm, 'monthSolarTerm 존재')
    assertNotNull(result.meta, 'meta 존재')
  }
  console.log('')

  // ═══ 그룹 2: 일주 정확성 (만세력 교차 검증) ═══
  console.log('── [2] 일주 정확성 (만세력 교차 검증) ──')

  const dayPillarCases = [
    { y: 2024, m: 1, d: 1, expected: '甲子', label: '기준일' },
    { y: 2024, m: 2, d: 4, expected: '戊戌', label: '입춘 당일' },
    { y: 2000, m: 1, d: 1, expected: '戊午', label: '밀레니엄' },
    { y: 1990, m: 5, d: 15, expected: '庚辰', label: '1990' },
    { y: 1985, m: 10, d: 23, expected: '乙未', label: '1985' },
    { y: 1970, m: 1, d: 1, expected: '辛巳', label: '1970' },
    { y: 2023, m: 12, d: 31, expected: '癸亥', label: '2023말' },
    { y: 1950, m: 6, d: 15, expected: '辛巳', label: '1950' },
    { y: 1980, m: 3, d: 20, expected: '壬辰', label: '1980' },
  ]

  for (const tc of dayPillarCases) {
    const result = calculateSaju({ year: tc.y, month: tc.m, day: tc.d, hour: 12, minute: 0 })
    assertEqual(getGanji(result.fourPillars.day), tc.expected, `${tc.label}: ${tc.y}-${tc.m}-${tc.d} → ${tc.expected}`)
  }
  console.log('')

  // ═══ 그룹 3: 년주 입춘 경계 ═══
  console.log('── [3] 년주 입춘 경계 ──')

  {
    // 입춘 전 → 전년도
    const before = calculateSaju({ year: 2024, month: 2, day: 3, hour: 10, minute: 0 })
    assertEqual(getGanji(before.fourPillars.year), '癸卯', '입춘 전(2/3) → 癸卯(2023)')

    // 입춘 후 → 당년도
    const after = calculateSaju({ year: 2024, month: 2, day: 5, hour: 10, minute: 0 })
    assertEqual(getGanji(after.fourPillars.year), '甲辰', '입춘 후(2/5) → 甲辰(2024)')
  }
  console.log('')

  // ═══ 그룹 4: 시간 보정 ═══
  console.log('── [4] 시간 보정 검증 ──')

  {
    const result = calculateSaju({ year: 1990, month: 5, day: 15, hour: 7, minute: 20 })
    assertEqual(result.adjustedTime?.adjustedHour, 6, '07:20 → 보정 시: 6')
    assertEqual(result.adjustedTime?.adjustedMinute, 50, '07:20 → 보정 분: 50')
    assertEqual(result.adjustedTime?.adjustmentType, 'standard30', 'standard30 적용')
  }

  {
    const result = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20,
      timeOption: 'none',
    })
    assertEqual(result.adjustedTime?.adjustedHour, 7, '보정 없음: 시 7')
    assertEqual(result.adjustedTime?.adjustedMinute, 20, '보정 없음: 분 20')
  }
  console.log('')

  // ═══ 그룹 5: 시간 모름 ═══
  console.log('── [5] 시간 모름 (birthTimeUnknown) ──')

  {
    const result = calculateSaju({ year: 1990, month: 5, day: 15 })
    assertTrue(result.input.birthTimeUnknown, 'birthTimeUnknown = true')
    assertEqual(result.fourPillars.hour, null, '시주 = null')
    assertEqual(result.hiddenStems.hour, null, '시지 지장간 = null')
    assertNotNull(result.fourPillars.year, '년주 존재')
    assertNotNull(result.fourPillars.month, '월주 존재')
    assertNotNull(result.fourPillars.day, '일주 존재')
    assertNotNull(result.daewoon, '대운 존재 (12:00 기준)')
    assertTrue(
      result.meta.warnings.some(w => w.includes('시간')),
      '시간 미입력 경고'
    )
  }
  console.log('')

  // ═══ 그룹 6: 일간 정보 ═══
  console.log('── [6] 일간 정보 ──')

  {
    const result = calculateSaju({ year: 1990, month: 5, day: 15, hour: 7, minute: 20 })
    assertEqual(result.dayStem.char, '庚', '일간 = 庚')
    assertEqual(result.dayStem.element, 'metal', '일간 오행 = metal')
    assertEqual(result.dayStem.yinYang, 'yang', '일간 음양 = yang')
    assertEqual(result.dayStem.elementKo, '금', '일간 오행 한글 = 금')
  }
  console.log('')

  // ═══ 그룹 7: 지장간 ═══
  console.log('── [7] 지장간 검증 ──')

  {
    const result = calculateSaju({ year: 1990, month: 5, day: 15, hour: 7, minute: 20 })
    assertTrue(result.hiddenStems.year.length > 0, '년지 지장간 존재')
    assertTrue(result.hiddenStems.month.length > 0, '월지 지장간 존재')
    assertTrue(result.hiddenStems.day.length > 0, '일지 지장간 존재')
    assertNotNull(result.hiddenStems.hour, '시지 지장간 존재')
    assertTrue((result.hiddenStems.hour?.length ?? 0) > 0, '시지 지장간 1개 이상')
  }
  console.log('')

  // ═══ 그룹 8: 신강/신약 ═══
  console.log('── [8] 신강/신약 ──')

  {
        const result = calculateSaju({ year: 1990, month: 5, day: 15, hour: 7, minute: 20 })
    assertTrue(
      ['신강', '신약', '중화'].includes(result.strength.strength),
      `신강/신약 유효: ${result.strength.strength}`
    )
    assertNotNull(result.strength.totalScore, '점수 존재')
    assertNotNull(result.strength.supportScore, 'helpScore 존재')
    assertNotNull(result.strength.restrainScore, 'restrainScore 존재')
  }
  console.log('')

  // ═══ 그룹 9: 용신 ═══
  console.log('── [9] 용신 ──')

  {
    const result = calculateSaju({ year: 1990, month: 5, day: 15, hour: 7, minute: 20 })
    assertNotNull(result.yongsin.yongsin, '용신 존재')
    assertEqual(result.yongsin.fiveSin.length, 5, '5신 5개')
    assertNotNull(result.yongsin.guide, '가이드 존재')
    assertTrue(result.yongsin.guide.favorableElements.length > 0, '좋은 오행 존재')
    console.log(`    용신: ${result.yongsin.yongsinKo}, 방법: ${result.yongsin.method}`)
  }
  console.log('')

  // ═══ 그룹 10: 대운 ═══
  console.log('── [10] 대운 ──')

  {
    const result = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20, gender: 'male',
    })
    assertNotNull(result.daewoon, '대운 존재')
    assertEqual(result.daewoon?.entries.length, 10, '대운 10개')
    assertTrue(
      result.daewoon?.direction === 'forward' || result.daewoon?.direction === 'backward',
      `순행/역행: ${result.daewoon?.direction}`
    )
    console.log(`    방향: ${result.daewoon?.direction}, 시작: ${result.daewoon?.startAge.description}`)
  }
  console.log('')

  // ═══ 그룹 11: 운세 조회 ═══
  console.log('── [11] 운세 조회 (세운/월운/일운) ──')

  {
    const result = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20,
      fortuneTargetYear: 2024,
      fortuneTargetMonth: 6,
      fortuneTargetDay: 15,
    })
    assertNotNull(result.fortune, '운세 존재')
    assertNotNull(result.fortune?.yearly, '세운 존재')
    assertNotNull(result.fortune?.monthly, '월운 존재')
    assertNotNull(result.fortune?.daily, '일운 존재')

    assertEqual(result.fortune?.yearly?.targetYear, 2024, '세운 2024')
    assertEqual(result.fortune?.monthly?.targetMonth, 6, '월운 6월')
    assertEqual(result.fortune?.daily?.targetDay, 15, '일운 15일')
  }
  console.log('')

  // ═══ 그룹 12: 성별 차이 (대운 방향) ═══
  console.log('── [12] 성별 차이 (대운 방향) ──')

  {
    const male = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20, gender: 'male',
    })
    const female = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20, gender: 'female',
    })

    // 같은 사주, 다른 성별 → 대운 방향 반대
    assertTrue(
      male.daewoon?.direction !== female.daewoon?.direction,
      `남/여 대운 방향 다름: 남=${male.daewoon?.direction}, 여=${female.daewoon?.direction}`
    )

    // 나머지는 동일
    assertEqual(getGanji(male.fourPillars.day), getGanji(female.fourPillars.day), '일주 동일')
    assertEqual(male.yongsin.yongsin, female.yongsin.yongsin, '용신 동일')
  }
  console.log('')

  // ═══ 그룹 13: 옵션 전달 ═══
  console.log('── [13] 옵션 전달 ──')

  {
    const result = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20,
      daewoonCount: 8,
      yongsinMethod: 'eokbu',
      includeSpecialPattern: true,
    })
    assertEqual(result.daewoon?.entries.length, 8, '대운 8개')
    assertEqual(result.yongsin.method, 'eokbu', '용신 method = eokbu')
    assertNotNull(result.yongsin.specialPattern, '특수격국 존재')
  }
  console.log('')

  // ═══ 그룹 14: 다양한 연도 스모크 ═══
  console.log('── [14] 다양한 연도 스모크 테스트 ──')

  const smokeCases = [
    { y: 1920, m: 6, d: 15, h: 12, min: 0, g: 'male' as const },
    { y: 1950, m: 3, d: 10, h: 8,  min: 0, g: 'female' as const },
    { y: 1970, m: 1, d: 1,  h: 6,  min: 0, g: 'male' as const },
    { y: 1985, m: 10, d: 23, h: 14, min: 30, g: 'female' as const },
    { y: 2000, m: 6, d: 1,  h: 12, min: 0, g: 'male' as const },
    { y: 2010, m: 9, d: 15, h: 6,  min: 30, g: 'female' as const },
    { y: 2024, m: 1, d: 1,  h: 12, min: 0, g: 'male' as const },
    { y: 2040, m: 7, d: 20, h: 16, min: 0, g: 'female' as const },
  ]

  for (const tc of smokeCases) {
    try {
      const result = calculateSaju({
        year: tc.y, month: tc.m, day: tc.d,
        hour: tc.h, minute: tc.min, gender: tc.g,
      })
      assertTrue(
        getGanji(result.fourPillars.day).length === 2,
        `${tc.y}-${tc.m}-${tc.d} ${tc.g} → 일주: ${getGanji(result.fourPillars.day)}, 용신: ${result.yongsin.yongsinKo}`
      )
    } catch (err: any) {
      failed++
      console.log(`  ❌ ${tc.y}-${tc.m}-${tc.d} 실패: ${err.message}`)
      failures.push(`${tc.y}: ${err.message}`)
    }
  }
  console.log('')

  // ═══ 그룹 15: formatSajuResult ═══
  console.log('── [15] 포맷 출력 ──')

  {
    const result = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20, gender: 'male',
      fortuneTargetYear: 2024, fortuneTargetMonth: 6,
    })
    const formatted = formatSajuResult(result)
    assertTrue(formatted.length > 200, '포맷 길이 > 200')
    assertTrue(formatted.includes('사주팔자'), '"사주팔자" 포함')
    assertTrue(formatted.includes('일간'), '"일간" 포함')
    assertTrue(formatted.includes('용신'), '"용신" 포함')
    assertTrue(formatted.includes('대운'), '"대운" 포함')

    console.log('\n' + formatted + '\n')
  }
  console.log('')

  // ═══ 그룹 16: toResultJson ═══
  console.log('── [16] JSON 직렬화 ──')

  {
    const result = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 7, minute: 20, gender: 'male',
    })
    const json = toResultJson(result)
    assertNotNull(json, 'JSON 존재')
    const jsonStr = JSON.stringify(json)
    assertTrue(jsonStr.length > 500, 'JSON 길이 > 500')
    assertTrue(!jsonStr.includes('undefined'), 'undefined 없음')
    assertTrue(jsonStr.includes('1990'), '연도 포함')
    assertTrue(jsonStr.includes('yongsin'), '용신 포함')
    assertTrue(jsonStr.includes('daewoon'), '대운 포함')
  }
  console.log('')

  // ═══ 그룹 17: 야자시 ═══
  console.log('── [17] 야자시 테스트 ──')

  {
    const result = calculateSaju({
      year: 1990, month: 5, day: 15, hour: 23, minute: 30, gender: 'male',
    })
    assertTrue(
      result.meta.warnings.some(w => w.includes('야자시') || w.includes('자시')),
      '야자시 경고 존재'
    )
    assertNotNull(result.fourPillars.hour, '시주 존재')
  }
  console.log('')

  // ═══ 그룹 18: 입력값 저장 확인 ═══
  console.log('── [18] 입력값 저장 확인 ──')

  {
    const result = calculateSaju({
      year: 1988, month: 4, day: 20, hour: 9, minute: 30, gender: 'female',
    })
    assertEqual(result.input.year, 1988, 'input.year')
    assertEqual(result.input.month, 4, 'input.month')
    assertEqual(result.input.day, 20, 'input.day')
    assertEqual(result.input.hour, 9, 'input.hour')
    assertEqual(result.input.minute, 30, 'input.minute')
    assertEqual(result.input.gender, 'female', 'input.gender')
    assertEqual(result.input.timeOption, 'standard30', 'input.timeOption')
    assertEqual(result.input.birthTimeUnknown, false, 'birthTimeUnknown = false')
  }
  console.log('')

  // ═══ 최종 요약 ═══
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  통합 계산 테스트 결과: ${passed}건 통과, ${failed}건 실패`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (failures.length > 0) {
    console.log('\n  실패 목록:')
    failures.forEach(f => console.log(f))
  }
  console.log('')
}

runAllTests()