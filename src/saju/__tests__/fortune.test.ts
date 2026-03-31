export {}

import {
  calculateYearlyFortune,
  calculateYearlyFortuneRange,
  calculateMonthlyFortune,
  calculateMonthlyFortuneRange,
  calculateDailyFortune,
  calculateDailyFortuneRange,
  formatYearlyFortune,
  formatMonthlyFortune,
  formatDailyFortune,
  formatYearlyFortuneRange,
  formatMonthlyFortuneRange,
  YearlyFortuneResult,
  MonthlyFortuneResult,
  DailyFortuneResult,
} from '../fortune'
import { STEMS, BRANCHES } from '../constants'
import { Pillar } from '../types'
import { calculateYearPillar } from '../yearPillar'
import { calculateMonthPillar } from '../monthPillar'

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

// ─── 헬퍼 ───────────────────────────────────────────────
function makePillar(stemIdx: number, branchIdx: number): Pillar {
  return {
    heavenlyStem: STEMS[stemIdx],
    earthlyBranch: BRANCHES[branchIdx],
  }
}

function getDayPillarSimple(year: number, month: number, day: number): Pillar {
  const baseDate = new Date('2024-01-01T00:00:00+09:00')
  const targetDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+09:00`)
  const diffDays = Math.round((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  let idx = diffDays % 60
  if (idx < 0) idx += 60
  return makePillar(idx % 10, idx % 12)
}

// 테스트용 원국 (1990-05-15 07:20 남자)
function getTestFourPillars() {
  const yearP = calculateYearPillar(1990, 5, 15)
  const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
  const dayP = getDayPillarSimple(1990, 5, 15)
  const hourP = makePillar(5, 3)  // 임의 시주
  return {
    yearP,
    monthP: monthP.pillar,
    dayP,
    fourPillars: { year: yearP, month: monthP.pillar, day: dayP, hour: hourP },
    dayStemIndex: dayP.heavenlyStem.index,
  }
}

// ─── 테스트 실행 ─────────────────────────────────────────
function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════╗')
  console.log('║   세운/월운/일운 테스트 (fortune.ts)      ║')
  console.log('╚═══════════════════════════════════════════╝\n')

  const { dayP, fourPillars, dayStemIndex } = getTestFourPillars()

  // ═══ 그룹 1: 세운 기본 ═══
  console.log('── [1] 세운 기본 테스트 ──')

  {
    const result = calculateYearlyFortune(2024, dayStemIndex, fourPillars)
    assertNotNull(result, '2024년 세운 결과 존재')
    assertEqual(result.targetYear, 2024, 'targetYear = 2024')
    assertTrue(result.fortune.ganjiChar.length === 2, '간지 2글자')
    assertNotNull(result.fortune.stem, 'stem 존재')
    assertNotNull(result.fortune.branch, 'branch 존재')
    assertNotNull(result.fortune.tenStar, 'tenStar 존재')
    assertNotNull(result.fortune.interactions, 'interactions 존재')
    assertTrue(result.fortune.hiddenStems.length > 0, '지장간 존재')

    // 2024년 = 甲辰
    assertEqual(result.fortune.ganjiChar, '甲辰', '2024년 = 甲辰')
  }
  console.log('')

  // ═══ 그룹 2: 세운 간지 정확성 ═══
  console.log('── [2] 세운 간지 정확성 ──')

  const yearCases: { year: number; expected: string }[] = [
    { year: 2020, expected: '庚子' },
    { year: 2021, expected: '辛丑' },
    { year: 2022, expected: '壬寅' },
    { year: 2023, expected: '癸卯' },
    { year: 2024, expected: '甲辰' },
    { year: 2025, expected: '乙巳' },
    { year: 1990, expected: '庚午' },
    { year: 2000, expected: '庚辰' },
  ]

  for (const tc of yearCases) {
    const result = calculateYearlyFortune(tc.year, dayStemIndex, fourPillars)
    assertEqual(result.fortune.ganjiChar, tc.expected, `${tc.year}년 = ${tc.expected}`)
  }
  console.log('')

  // ═══ 그룹 3: 세운 범위 ═══
  console.log('── [3] 세운 범위 테스트 ──')

  {
    const range = calculateYearlyFortuneRange(2020, 2030, dayStemIndex, fourPillars)
    assertEqual(range.startYear, 2020, 'startYear = 2020')
    assertEqual(range.endYear, 2030, 'endYear = 2030')
    assertEqual(range.fortunes.length, 11, '2020~2030 = 11개')

    // 연도 순서 확인
    for (let i = 0; i < range.fortunes.length; i++) {
      assertEqual(range.fortunes[i].targetYear, 2020 + i, `${i}번째 = ${2020 + i}년`)
    }
  }
  console.log('')

  // ═══ 그룹 4: 세운 십성 유효성 ═══
  console.log('── [4] 세운 십성 유효성 ──')

  {
    const validStars = ['비견', '겁재', '식신', '상관', '편재', '정재', '편인', '정인', '편관', '정관']
    const range = calculateYearlyFortuneRange(2020, 2030, dayStemIndex, fourPillars)

    for (const yr of range.fortunes) {
      assertTrue(
        validStars.includes(yr.fortune.tenStar.stemStar),
        `${yr.targetYear} 천간 십성 유효: ${yr.fortune.tenStar.stemStar}`
      )
      assertTrue(
        validStars.includes(yr.fortune.tenStar.branchMainStar),
        `${yr.targetYear} 지지 십성 유효: ${yr.fortune.tenStar.branchMainStar}`
      )
    }
  }
  console.log('')

  // ═══ 그룹 5: 월운 기본 ═══
  console.log('── [5] 월운 기본 테스트 ──')

  {
    const result = calculateMonthlyFortune(2024, 6, dayStemIndex, fourPillars)
    assertNotNull(result, '2024-06 월운 결과 존재')
    assertEqual(result.targetYear, 2024, 'targetYear = 2024')
    assertEqual(result.targetMonth, 6, 'targetMonth = 6')
    assertTrue(result.fortune.ganjiChar.length === 2, '간지 2글자')
    assertNotNull(result.solarTermName, '절기명 존재')
    assertNotNull(result.solarTermDateTime, '절기시각 존재')
    assertTrue(result.fortune.hiddenStems.length > 0, '지장간 존재')

    console.log(`    2024-06 월운: ${result.fortune.ganjiChar} (${result.solarTermName})`)
  }
  console.log('')

  // ═══ 그룹 6: 월운 12개월 ═══
  console.log('── [6] 월운 12개월 테스트 ──')

  {
    const range = calculateMonthlyFortuneRange(2024, dayStemIndex, fourPillars)
    assertEqual(range.targetYear, 2024, 'targetYear = 2024')
    assertEqual(range.fortunes.length, 12, '12개월')

    for (let i = 0; i < 12; i++) {
      const mr = range.fortunes[i]
      assertEqual(mr.targetMonth, i + 1, `${i + 1}월`)
      assertTrue(mr.fortune.ganjiChar.length === 2, `${i + 1}월 간지 유효: ${mr.fortune.ganjiChar}`)
      assertNotNull(mr.solarTermName, `${i + 1}월 절기명: ${mr.solarTermName}`)
    }
  }
  console.log('')

  // ═══ 그룹 7: 월운 절기 순서 ═══
  console.log('── [7] 월운 절기 순서 확인 ──')

  {
    const expectedTerms = ['소한', '입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설']
    const range = calculateMonthlyFortuneRange(2024, dayStemIndex, fourPillars)

    for (let i = 0; i < 12; i++) {
      assertEqual(range.fortunes[i].solarTermName, expectedTerms[i], `${i + 1}월 절기 = ${expectedTerms[i]}`)
    }
  }
  console.log('')

  // ═══ 그룹 8: 일운 기본 ═══
  console.log('── [8] 일운 기본 테스트 ──')

  {
    // 2024-01-01 = 甲子 (기준일)
    const result = calculateDailyFortune(2024, 1, 1, dayStemIndex, fourPillars)
    assertNotNull(result, '2024-01-01 일운 결과 존재')
    assertEqual(result.targetYear, 2024, 'targetYear')
    assertEqual(result.targetMonth, 1, 'targetMonth')
    assertEqual(result.targetDay, 1, 'targetDay')
    assertEqual(result.fortune.ganjiChar, '甲子', '2024-01-01 = 甲子')
    assertTrue(result.fortune.hiddenStems.length > 0, '지장간 존재')
  }
  console.log('')

  // ═══ 그룹 9: 일운 정확성 ═══
  console.log('── [9] 일운 간지 정확성 ──')

  const dayCases: { y: number; m: number; d: number; expected: string }[] = [
    { y: 2024, m: 1, d: 1, expected: '甲子' },
    { y: 2024, m: 2, d: 4, expected: '戊戌' },
    { y: 2000, m: 1, d: 1, expected: '戊午' },
    { y: 1990, m: 5, d: 15, expected: '庚辰' },
    { y: 2023, m: 12, d: 31, expected: '癸亥' },
  ]

  for (const tc of dayCases) {
    const result = calculateDailyFortune(tc.y, tc.m, tc.d, dayStemIndex, fourPillars)
    assertEqual(result.fortune.ganjiChar, tc.expected, `${tc.y}-${tc.m}-${tc.d} = ${tc.expected}`)
  }
  console.log('')

  // ═══ 그룹 10: 일운 범위 ═══
  console.log('── [10] 일운 범위 테스트 (7일) ──')

  {
    const range = calculateDailyFortuneRange(2024, 1, 1, 7, dayStemIndex, fourPillars)
    assertEqual(range.length, 7, '7일분')

    // 연속 일자 확인
    for (let i = 0; i < range.length; i++) {
      assertEqual(range[i].targetDay, 1 + i, `${i}번째 = ${1 + i}일`)
    }

    // 간지가 매일 하나씩 진행하는지
    for (let i = 1; i < range.length; i++) {
      const prevStem = range[i - 1].fortune.stemIndex
      const currStem = range[i].fortune.stemIndex
      assertEqual((prevStem + 1) % 10, currStem, `일간 순행: ${i - 1}→${i}`)
    }
  }
  console.log('')

  // ═══ 그룹 11: 충합형해 존재 확인 ═══
  console.log('── [11] 충합형해 존재 확인 ──')

  {
    // 10년치 세운에서 최소 1개 충합형해 있는지
    const range = calculateYearlyFortuneRange(2020, 2030, dayStemIndex, fourPillars)
    let hasInteraction = false
    for (const yr of range.fortunes) {
      if (yr.fortune.interactions.summary.length > 0) {
        hasInteraction = true
        console.log(`    ${yr.targetYear} ${yr.fortune.ganjiChar}: ${yr.fortune.interactions.summary[0]}`)
      }
    }
    assertTrue(hasInteraction, '10년 세운 중 최소 1개 충합형해')
  }

  {
    // 12개월 월운에서도 확인
    const range = calculateMonthlyFortuneRange(2024, dayStemIndex, fourPillars)
    let hasInteraction = false
    for (const mr of range.fortunes) {
      if (mr.fortune.interactions.summary.length > 0) {
        hasInteraction = true
      }
    }
    assertTrue(hasInteraction, '12개월 월운 중 최소 1개 충합형해')
  }
  console.log('')

  // ═══ 그룹 12: 포맷 출력 ═══
  console.log('── [12] 포맷 출력 테스트 ──')

  {
    const yr = calculateYearlyFortune(2024, dayStemIndex, fourPillars)
    const yrFmt = formatYearlyFortune(yr)
    assertTrue(yrFmt.includes('2024'), '세운 포맷에 연도 포함')
    assertTrue(yrFmt.includes('세운'), '세운 포맷에 "세운" 포함')
    console.log(`    ${yrFmt}`)
  }

  {
    const mr = calculateMonthlyFortune(2024, 6, dayStemIndex, fourPillars)
    const mrFmt = formatMonthlyFortune(mr)
    assertTrue(mrFmt.includes('월운'), '월운 포맷에 "월운" 포함')
    console.log(`    ${mrFmt}`)
  }

  {
    const dr = calculateDailyFortune(2024, 1, 1, dayStemIndex, fourPillars)
    const drFmt = formatDailyFortune(dr)
    assertTrue(drFmt.includes('일운'), '일운 포맷에 "일운" 포함')
    console.log(`    ${drFmt}`)
  }
  console.log('')

  // ═══ 그룹 13: 세운 범위 표 출력 ═══
  console.log('── [13] 세운 범위 표 출력 ──')

  {
    const range = calculateYearlyFortuneRange(2020, 2030, dayStemIndex, fourPillars)
    const table = formatYearlyFortuneRange(range, dayP.heavenlyStem.char)
    assertTrue(table.length > 100, '세운 표 출력 길이 > 100')
    console.log('\n' + table + '\n')
  }
  console.log('')

  // ═══ 그룹 14: 월운 범위 표 출력 ═══
  console.log('── [14] 월운 범위 표 출력 ──')

  {
    const range = calculateMonthlyFortuneRange(2024, dayStemIndex, fourPillars)
    const table = formatMonthlyFortuneRange(range, dayP.heavenlyStem.char)
    assertTrue(table.length > 100, '월운 표 출력 길이 > 100')
    console.log('\n' + table + '\n')
  }
  console.log('')

  // ═══ 그룹 15: 다양한 연도 스모크 ═══
  console.log('── [15] 다양한 연도 스모크 테스트 ──')

  const smokeYears = [1920, 1950, 1980, 2000, 2024, 2040, 2050]
  for (const y of smokeYears) {
    try {
      const yr = calculateYearlyFortune(y, dayStemIndex, fourPillars)
      assertTrue(yr.fortune.ganjiChar.length === 2, `${y}년 세운 성공: ${yr.fortune.ganjiChar}`)

      const mr = calculateMonthlyFortune(y, 6, dayStemIndex, fourPillars)
      assertTrue(mr.fortune.ganjiChar.length === 2, `${y}-06 월운 성공: ${mr.fortune.ganjiChar}`)

      const dr = calculateDailyFortune(y, 6, 15, dayStemIndex, fourPillars)
      assertTrue(dr.fortune.ganjiChar.length === 2, `${y}-06-15 일운 성공: ${dr.fortune.ganjiChar}`)
    } catch (err: any) {
      failed++
      console.log(`  ❌ ${y}년 실패: ${err.message}`)
      failures.push(`${y}년: ${err.message}`)
    }
  }
  console.log('')

  // ═══ 그룹 16: 일운 30일 연속 출력 ═══
  console.log('── [16] 일운 30일 연속 (2024-01) ──')

  {
    const range = calculateDailyFortuneRange(2024, 1, 1, 30, dayStemIndex, fourPillars)
    assertEqual(range.length, 30, '30일분')

    // 처음 7일만 출력
    for (let i = 0; i < 7; i++) {
      const dr = range[i]
      const stars = `${dr.fortune.tenStar.stemStar}/${dr.fortune.tenStar.branchMainStar}`
      console.log(`    ${dr.targetMonth}/${dr.targetDay} ${dr.fortune.ganjiChar}(${dr.fortune.ganjiName}) [${stars}]`)
    }
    console.log('    ... (이하 생략)')
  }
  console.log('')

  // ═══ 최종 요약 ═══
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  세운/월운/일운 테스트 결과: ${passed}건 통과, ${failed}건 실패`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (failures.length > 0) {
    console.log('\n  실패 목록:')
    failures.forEach(f => console.log(f))
  }
  console.log('')
}

runAllTests()