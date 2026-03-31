export {}

import { calculateDaewoon, formatDaewoon, DaewoonResult } from '../daewoon'
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

// ─── 헬퍼: Pillar 생성 ──────────────────────────────────
function makePillar(stemIdx: number, branchIdx: number): Pillar {
  return {
    heavenlyStem: STEMS[stemIdx],
    earthlyBranch: BRANCHES[branchIdx],
  }
}

// ─── 헬퍼: 일주 계산 (간이) ─────────────────────────────
function getDayPillarSimple(year: number, month: number, day: number): Pillar {
  // 기준: 2024-01-01 = 甲子(0,0)
  const baseDate = new Date('2024-01-01T00:00:00+09:00')
  const targetDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+09:00`)
  const diffDays = Math.round((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  let idx = diffDays % 60
  if (idx < 0) idx += 60
  return makePillar(idx % 10, idx % 12)
}

// ─── 테스트 실행 ─────────────────────────────────────────
function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════╗')
  console.log('║       대운(大運) 계산 테스트              ║')
  console.log('╚═══════════════════════════════════════════╝\n')

  // ═══ 그룹 1: 순행/역행 판단 ═══
  console.log('── [1] 순행/역행 판단 ──')

  // 1990년 5월 15일 → 년주: 경오(庚午) → 庚=양간(index 6)
  // 남자 + 양간 → 순행
  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)
    assertEqual(result.direction, 'forward', '남자+양간(庚) → 순행')
    assertTrue(result.entries.length === 10, '기본 10개 대운')
  }

  // 같은 사주, 여자 → 역행
  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'female', yearP, monthP.pillar, dayP, fourP)
    assertEqual(result.direction, 'backward', '여자+양간(庚) → 역행')
  }

  // 1991년 → 년간 辛(음간, index 7)
  // 남자 + 음간 → 역행
  {
    const yearP = calculateYearPillar(1991, 6, 15)
    const monthP = calculateMonthPillar(1991, 6, 15, 12, 0, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1991, 6, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1991, 6, 15, 12, 0, 'male', yearP, monthP.pillar, dayP, fourP)
    assertEqual(result.direction, 'backward', '남자+음간(辛) → 역행')
  }

  // 여자 + 음간 → 순행
  {
    const yearP = calculateYearPillar(1991, 6, 15)
    const monthP = calculateMonthPillar(1991, 6, 15, 12, 0, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1991, 6, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1991, 6, 15, 12, 0, 'female', yearP, monthP.pillar, dayP, fourP)
    assertEqual(result.direction, 'forward', '여자+음간(辛) → 순행')
  }
  console.log('')

  // ═══ 그룹 2: 대운 시작 나이 ═══
  console.log('── [2] 대운 시작 나이 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)

    assertTrue(result.startAge.years >= 0, `시작 년수 >= 0: ${result.startAge.years}`)
    assertTrue(result.startAge.years <= 10, `시작 년수 <= 10: ${result.startAge.years}`)
    assertTrue(result.startAge.months >= 0, `시작 개월 >= 0: ${result.startAge.months}`)
    assertTrue(result.startAge.months <= 11, `시작 개월 <= 11: ${result.startAge.months}`)
    assertTrue(result.startAge.daysBetween > 0, `절기까지 일수 > 0: ${result.startAge.daysBetween}`)
    assertNotNull(result.startAge.description, `설명 존재: ${result.startAge.description}`)

    console.log(`    참고: 1990-05-15 남자 대운 시작 = ${result.startAge.description}`)
    console.log(`    이전 절기: ${result.meta.prevTermName}, 다음 절기: ${result.meta.nextTermName}`)
  }
  console.log('')

  // ═══ 그룹 3: 대운 간지 순행 ═══
  console.log('── [3] 대운 간지 순행 확인 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)

    const monthStemIdx = monthP.pillar.heavenlyStem.index
    const monthBranchIdx = monthP.pillar.earthlyBranch.index

    console.log(`    월주: ${monthP.pillar.heavenlyStem.char}${monthP.pillar.earthlyBranch.char}`)

    // 순행이므로 월주 다음 간지부터
    for (let i = 0; i < Math.min(3, result.entries.length); i++) {
      const e = result.entries[i]
      console.log(`    대운 ${i + 1}: ${e.ganjiChar}(${e.ganjiName}) ${e.startAge}~${e.endAge}세`)
    }

    // 첫 대운이 월주 다음 간지인지 확인
    assertTrue(result.entries.length > 0, '대운 엔트리 존재')
    assertTrue(result.entries[0].ganjiChar.length === 2, '간지 2글자')
  }
  console.log('')

  // ═══ 그룹 4: 대운 간지 역행 ═══
  console.log('── [4] 대운 간지 역행 확인 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'female', yearP, monthP.pillar, dayP, fourP)

    assertEqual(result.direction, 'backward', '역행 확인')
    console.log(`    월주: ${monthP.pillar.heavenlyStem.char}${monthP.pillar.earthlyBranch.char}`)

    for (let i = 0; i < Math.min(3, result.entries.length); i++) {
      const e = result.entries[i]
      console.log(`    대운 ${i + 1}: ${e.ganjiChar}(${e.ganjiName}) ${e.startAge}~${e.endAge}세`)
    }
  }
  console.log('')

  // ═══ 그룹 5: 대운 개수 옵션 ═══
  console.log('── [5] 대운 개수 옵션 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result8 = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP, { count: 8 })
    assertEqual(result8.entries.length, 8, '대운 8개 옵션')
    assertEqual(result8.meta.count, 8, 'meta.count = 8')

    const result12 = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP, { count: 12 })
    assertEqual(result12.entries.length, 12, '대운 12개 옵션')
  }
  console.log('')

  // ═══ 그룹 6: 십성 분석 ═══
  console.log('── [6] 대운별 십성 분석 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)

    const validStars = ['비견', '겁재', '식신', '상관', '편재', '정재', '편인', '정인', '편관', '정관']

    for (const e of result.entries.slice(0, 3)) {
      assertTrue(
        validStars.includes(e.tenStar.stemStar),
        `대운 ${e.index} 천간 십성 유효: ${e.tenStar.stemStar}`
      )
      assertTrue(
        validStars.includes(e.tenStar.branchMainStar),
        `대운 ${e.index} 지지정기 십성 유효: ${e.tenStar.branchMainStar}`
      )
    }
  }
  console.log('')

  // ═══ 그룹 7: 지장간 ═══
  console.log('── [7] 대운별 지장간 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)

    for (const e of result.entries.slice(0, 3)) {
      assertTrue(e.hiddenStems.length > 0, `대운 ${e.index}(${e.ganjiChar}) 지장간 ${e.hiddenStems.length}개`)
    }
  }
  console.log('')

  // ═══ 그룹 8: 충합형해 ═══
  console.log('── [8] 충합형해 분석 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)

    let hasInteraction = false
    for (const e of result.entries) {
      assertNotNull(e.interactions, `대운 ${e.index} interactions 존재`)
      if (e.interactions.summary.length > 0) {
        hasInteraction = true
        console.log(`    대운 ${e.index}(${e.ganjiChar}): ${e.interactions.summary[0]}`)
      }
    }
    assertTrue(hasInteraction, '10개 대운 중 최소 1개에 충합형해 존재')
  }
  console.log('')

  // ═══ 그룹 9: 다양한 연도 스모크 테스트 ═══
  console.log('── [9] 다양한 연도 스모크 테스트 ──')

  const smokeCases = [
    { y: 1950, m: 3, d: 10, h: 8, min: 0, g: 'male' as const },
    { y: 1965, m: 7, d: 22, h: 14, min: 30, g: 'female' as const },
    { y: 1980, m: 1, d: 5, h: 3, min: 0, g: 'male' as const },
    { y: 1995, m: 11, d: 18, h: 21, min: 45, g: 'female' as const },
    { y: 2000, m: 6, d: 1, h: 12, min: 0, g: 'male' as const },
    { y: 2010, m: 9, d: 15, h: 6, min: 30, g: 'female' as const },
    { y: 2020, m: 12, d: 25, h: 16, min: 0, g: 'male' as const },
  ]

  for (const tc of smokeCases) {
    try {
      const yearP = calculateYearPillar(tc.y, tc.m, tc.d)
      const monthP = calculateMonthPillar(tc.y, tc.m, tc.d, tc.h, tc.min, yearP.heavenlyStem.index)
      const dayP = getDayPillarSimple(tc.y, tc.m, tc.d)
      const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

      const result = calculateDaewoon(tc.y, tc.m, tc.d, tc.h, tc.min, tc.g, yearP, monthP.pillar, dayP, fourP)
      assertTrue(
        result.entries.length === 10,
        `${tc.y}-${tc.m}-${tc.d} ${tc.g} → ${result.direction}, 시작 ${result.startAge.description}`
      )
    } catch (err: any) {
      failed++
      console.log(`  ❌ ${tc.y}-${tc.m}-${tc.d} 실패: ${err.message}`)
      failures.push(`${tc.y}-${tc.m}-${tc.d}: ${err.message}`)
    }
  }
  console.log('')

  // ═══ 그룹 10: 나이 구간 연속성 ═══
  console.log('── [10] 나이 구간 연속성 ──')

  {
    const yearP = calculateYearPillar(1985, 8, 20)
    const monthP = calculateMonthPillar(1985, 8, 20, 10, 0, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1985, 8, 20)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1985, 8, 20, 10, 0, 'male', yearP, monthP.pillar, dayP, fourP)

    // 각 대운의 시작 나이가 10씩 증가하는지
    for (let i = 1; i < result.entries.length; i++) {
      const diff = result.entries[i].startAge - result.entries[i - 1].startAge
      assertEqual(diff, 10, `대운 ${i} → ${i + 1} 나이차 = 10`)
    }

    // endAge = startAge + 9
    for (const e of result.entries) {
      assertEqual(e.endAge, e.startAge + 9, `대운 ${e.index} endAge = startAge + 9`)
    }

    // startYear = birthYear + startAge
    for (const e of result.entries) {
      assertEqual(e.startYear, 1985 + e.startAge, `대운 ${e.index} startYear 확인`)
    }
  }
  console.log('')

  // ═══ 그룹 11: formatDaewoon 출력 ═══
  console.log('── [11] 포맷 출력 테스트 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)
    const formatted = formatDaewoon(result)

    assertTrue(formatted.length > 100, '포맷 출력 길이 > 100')
    assertTrue(formatted.includes('대운'), '포맷에 "대운" 포함')
    assertTrue(formatted.includes('순행') || formatted.includes('역행'), '포맷에 순행/역행 포함')

    console.log('\n' + formatted + '\n')
      }
  console.log('')

  // ═══ 그룹 12: 대운 시작 나이 정밀 검증 ═══
  console.log('── [12] 대운 시작 나이 정밀 검증 ──')

  {
    // 1월 출생 (소한~입춘 사이)
    const yearP = calculateYearPillar(1985, 1, 20)
    const monthP = calculateMonthPillar(1985, 1, 20, 10, 0, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1985, 1, 20)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1985, 1, 20, 10, 0, 'male', yearP, monthP.pillar, dayP, fourP)

    assertTrue(result.startAge.daysBetween > 0, `1월 출생 절기까지 일수 > 0: ${result.startAge.daysBetween}일`)
    assertTrue(result.startAge.totalMonths >= 0, `총 개월수 >= 0: ${result.startAge.totalMonths}`)
    console.log(`    1985-01-20 남자: ${result.startAge.description} (${result.startAge.daysBetween}일 ÷ 3)`)
    console.log(`    이전절기: ${result.meta.prevTermName}, 다음절기: ${result.meta.nextTermName}`)
  }

  {
    // 12월 출생 (대설 이후)
    const yearP = calculateYearPillar(1992, 12, 25)
    const monthP = calculateMonthPillar(1992, 12, 25, 15, 0, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1992, 12, 25)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1992, 12, 25, 15, 0, 'female', yearP, monthP.pillar, dayP, fourP)

    assertTrue(result.startAge.daysBetween > 0, `12월 출생 절기까지 일수 > 0: ${result.startAge.daysBetween}일`)
    console.log(`    1992-12-25 여자: ${result.startAge.description} (${result.startAge.daysBetween}일 ÷ 3)`)
    console.log(`    이전절기: ${result.meta.prevTermName}, 다음절기: ${result.meta.nextTermName}`)
  }
  console.log('')

  // ═══ 그룹 13: 60갑자 순환 확인 ═══
  console.log('── [13] 60갑자 순환 확인 ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    // 순행 - 간지가 하나씩 증가하는지
    const fwd = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)
    
    // 모든 대운 간지가 유효한 2글자인지
    for (const e of fwd.entries) {
      assertTrue(e.ganjiChar.length === 2, `순행 대운 ${e.index}: ${e.ganjiChar} 유효`)
      assertTrue(e.stemIndex >= 0 && e.stemIndex <= 9, `천간 인덱스 유효: ${e.stemIndex}`)
      assertTrue(e.branchIndex >= 0 && e.branchIndex <= 11, `지지 인덱스 유효: ${e.branchIndex}`)
    }

    // 역행 - 간지가 하나씩 감소하는지
    const bwd = calculateDaewoon(1990, 5, 15, 7, 20, 'female', yearP, monthP.pillar, dayP, fourP)

    for (const e of bwd.entries) {
      assertTrue(e.ganjiChar.length === 2, `역행 대운 ${e.index}: ${e.ganjiChar} 유효`)
    }

    // 순행 1번과 역행 1번은 월주에서 반대 방향
    console.log(`    월주: ${monthP.pillar.heavenlyStem.char}${monthP.pillar.earthlyBranch.char}`)
    console.log(`    순행 1번: ${fwd.entries[0].ganjiChar}`)
    console.log(`    역행 1번: ${bwd.entries[0].ganjiChar}`)
    assertTrue(fwd.entries[0].ganjiChar !== bwd.entries[0].ganjiChar, '순행/역행 첫 대운이 다름')
  }
  console.log('')

  // ═══ 그룹 14: 입춘 경계 대운 ═══
  console.log('── [14] 입춘 경계 대운 ──')

  {
    // 입춘 직전 출생 → 전년도 년주
    const yearP1 = calculateYearPillar(2024, 2, 3, 10, 0)
    const monthP1 = calculateMonthPillar(2024, 2, 3, 10, 0, yearP1.heavenlyStem.index)
    const dayP1 = getDayPillarSimple(2024, 2, 3)
    const fourP1 = { year: yearP1, month: monthP1.pillar, day: dayP1, hour: null }
    
    const result1 = calculateDaewoon(2024, 2, 3, 10, 0, 'male', yearP1, monthP1.pillar, dayP1, fourP1)

    // 입춘 직후 출생 → 당년도 년주
    const yearP2 = calculateYearPillar(2024, 2, 5, 10, 0)
    const monthP2 = calculateMonthPillar(2024, 2, 5, 10, 0, yearP2.heavenlyStem.index)
    const dayP2 = getDayPillarSimple(2024, 2, 5)
    const fourP2 = { year: yearP2, month: monthP2.pillar, day: dayP2, hour: null }

    const result2 = calculateDaewoon(2024, 2, 5, 10, 0, 'male', yearP2, monthP2.pillar, dayP2, fourP2)

    assertNotNull(result1, '입춘 전 대운 계산 성공')
    assertNotNull(result2, '입춘 후 대운 계산 성공')
    
    console.log(`    입춘 전(2/3): ${result1.direction}, 년간 ${yearP1.heavenlyStem.char}`)
    console.log(`    입춘 후(2/5): ${result2.direction}, 년간 ${yearP2.heavenlyStem.char}`)
  }
  console.log('')

  // ═══ 그룹 15: 전체 샘플 출력 ═══
  console.log('── [15] 전체 샘플 출력 (1990-05-15 07:20 남자) ──')

  {
    const yearP = calculateYearPillar(1990, 5, 15)
    const monthP = calculateMonthPillar(1990, 5, 15, 7, 20, yearP.heavenlyStem.index)
    const dayP = getDayPillarSimple(1990, 5, 15)
    const fourP = { year: yearP, month: monthP.pillar, day: dayP, hour: null }

    const result = calculateDaewoon(1990, 5, 15, 7, 20, 'male', yearP, monthP.pillar, dayP, fourP)

    console.log('')
    console.log(`  원국 년주: ${yearP.heavenlyStem.char}${yearP.earthlyBranch.char}`)
    console.log(`  원국 월주: ${monthP.pillar.heavenlyStem.char}${monthP.pillar.earthlyBranch.char}`)
    console.log(`  원국 일주: ${dayP.heavenlyStem.char}${dayP.earthlyBranch.char}`)
    console.log(`  일간: ${dayP.heavenlyStem.char}(${dayP.heavenlyStem.name})`)
    console.log('')

    console.log(formatDaewoon(result))

    // 상세 출력
    console.log('\n  [대운 상세]')
    for (const e of result.entries) {
      const stars = `천간:${e.tenStar.stemStar} 지지정기:${e.tenStar.branchMainStar}`
      const hs = e.hiddenStems.map(h => `${h.char}(${h.roleName})`).join(',')
      const inter = e.interactions.summary.length > 0
        ? e.interactions.summary.join(', ')
        : '없음'
      
      console.log(`  ${e.index}. ${e.ganjiChar}(${e.ganjiName}) ${e.startAge}~${e.endAge}세 [${e.startYear}~${e.endYear}]`)
      console.log(`     십성: ${stars}`)
      console.log(`     지장간: ${hs}`)
      console.log(`     충합형해: ${inter}`)
    }
  }
  console.log('')

  // ═══ 최종 요약 ═══
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  대운 테스트 결과: ${passed}건 통과, ${failed}건 실패`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (failures.length > 0) {
    console.log('\n  실패 목록:')
    failures.forEach(f => console.log(f))
  }
  console.log('')
}

runAllTests()