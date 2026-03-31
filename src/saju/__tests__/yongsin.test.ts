export {}

import { calculateYongsin, formatYongsin, YongsinResult, FiveElement } from '../yongsin'
import { STEMS, BRANCHES, ELEMENT_KO } from '../constants'

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

// ─── 테스트 실행 ─────────────────────────────────────────
function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════╗')
  console.log('║       용신(用神) 계산 테스트              ║')
  console.log('╚═══════════════════════════════════════════╝\n')

  const allElements: FiveElement[] = ['wood', 'fire', 'earth', 'metal', 'water']
  const validRoles = ['용신', '희신', '기신', '구신', '한신']

  // ═══ 그룹 1: 기본 구조 검증 ═══
  console.log('── [1] 기본 구조 검증 ──')

  {
    // 甲(목, 양) 일간, 寅월(봄), 신강
    const result = calculateYongsin(0, 2, 'strong', 30, 60, 40)
    assertNotNull(result, '결과 존재')
    assertNotNull(result.yongsin, 'yongsin 존재')
    assertNotNull(result.yongsinKo, 'yongsinKo 존재')
    assertTrue(allElements.includes(result.yongsin), `용신이 유효한 오행: ${result.yongsin}`)
    assertNotNull(result.fiveSin, 'fiveSin 존재')
    assertEqual(result.fiveSin.length, 5, '5신 = 5개')
    assertNotNull(result.eokbu, '억부 존재')
    assertNotNull(result.johu, '조후 존재')
    assertNotNull(result.guide, '가이드 존재')
    assertEqual(result.method, 'combined', '기본 method = combined')
  }
  console.log('')

  // ═══ 그룹 2: 5신 배정 검증 ═══
  console.log('── [2] 5신 배정 검증 ──')

  {
    const result = calculateYongsin(0, 2, 'strong', 30, 60, 40)

    // 5신 각각 존재하는지
    for (const role of validRoles) {
      const found = result.fiveSin.find(f => f.role === role)
      assertNotNull(found, `${role} 존재`)
    }

    // 5신이 모두 다른 오행인지
    const elements = result.fiveSin.map(f => f.element)
    const uniqueElements = [...new Set(elements)]
    assertEqual(uniqueElements.length, 5, '5신이 모두 다른 오행')

    // 용신 오행과 결과 일치
    const yongsinEntry = result.fiveSin.find(f => f.role === '용신')
    assertEqual(yongsinEntry?.element, result.yongsin, '용신 항목의 오행 = 최종 용신')
  }
  console.log('')

  // ═══ 그룹 3: 신강 → 설기/극 ═══
  console.log('── [3] 신강 → 식상/재성이 용신 ──')

  {
    // 甲(목) 신강 → 억부용신: 화(식상) 또는 토(재성)
    const result = calculateYongsin(0, 2, 'strong', 30, 65, 35)
    const eokbuYongsin = result.eokbu.yongsin
    // 목 → 식상=화, 재성=토
    assertTrue(
      eokbuYongsin === 'fire' || eokbuYongsin === 'earth',
      `甲 신강 억부용신: ${ELEMENT_KO[eokbuYongsin]}(${eokbuYongsin})`
    )
    console.log(`    甲 신강: 억부=${ELEMENT_KO[eokbuYongsin]}, 최종=${result.yongsinKo}`)
  }

  {
    // 丙(화) 신강 → 토(식상) 또는 금(재성)
    const result = calculateYongsin(2, 5, 'strong', 25, 60, 40)
    const eokbuYongsin = result.eokbu.yongsin
    assertTrue(
      eokbuYongsin === 'earth' || eokbuYongsin === 'metal',
      `丙 신강 억부용신: ${ELEMENT_KO[eokbuYongsin]}`
    )
    console.log(`    丙 신강: 억부=${ELEMENT_KO[eokbuYongsin]}, 최종=${result.yongsinKo}`)
  }
  console.log('')

  // ═══ 그룹 4: 신약 → 인성/비화 ═══
  console.log('── [4] 신약 → 인성/비화가 용신 ──')

  {
    // 甲(목) 신약 → 억부용신: 수(인성) 또는 목(비화)
    const result = calculateYongsin(0, 8, 'weak', -30, 35, 65)
    const eokbuYongsin = result.eokbu.yongsin
    assertTrue(
      eokbuYongsin === 'water' || eokbuYongsin === 'wood',
      `甲 신약 억부용신: ${ELEMENT_KO[eokbuYongsin]}`
    )
    console.log(`    甲 신약: 억부=${ELEMENT_KO[eokbuYongsin]}, 최종=${result.yongsinKo}`)
  }

  {
    // 庚(금) 신약 → 토(인성) 또는 금(비화)
    const result = calculateYongsin(6, 5, 'weak', -25, 38, 62)
    const eokbuYongsin = result.eokbu.yongsin
    assertTrue(
      eokbuYongsin === 'earth' || eokbuYongsin === 'metal',
      `庚 신약 억부용신: ${ELEMENT_KO[eokbuYongsin]}`
    )
    console.log(`    庚 신약: 억부=${ELEMENT_KO[eokbuYongsin]}, 최종=${result.yongsinKo}`)
  }
  console.log('')

  // ═══ 그룹 5: 조후용신 계절별 ═══
  console.log('── [5] 조후용신 계절별 검증 ──')

  {
    // 겨울(子월) 목 → 화 필요
    const result = calculateYongsin(0, 0, 'weak', -10, 45, 55)
    assertEqual(result.johu.primary, 'fire', '겨울 甲 → 조후 1순위 화')
    assertEqual(result.johu.season, '겨울(冬)', '계절 = 겨울')
    console.log(`    겨울 甲: 조후=${result.johu.primaryKo}, 2순위=${result.johu.secondaryKo}`)
  }

  {
    // 여름(午월) 목 → 수 필요
    const result = calculateYongsin(0, 6, 'strong', 20, 55, 45)
    assertEqual(result.johu.primary, 'water', '여름 甲 → 조후 1순위 수')
    assertEqual(result.johu.season, '여름(夏)', '계절 = 여름')
    console.log(`    여름 甲: 조후=${result.johu.primaryKo}, 2순위=${result.johu.secondaryKo}`)
  }

  {
    // 가을(酉월) 화 → 목 필요
    const result = calculateYongsin(2, 9, 'weak', -20, 40, 60)
    assertEqual(result.johu.primary, 'wood', '가을 丙 → 조후 1순위 목')
    console.log(`    가을 丙: 조후=${result.johu.primaryKo}`)
  }

  {
    // 봄(卯월) 수 → 화 필요
    const result = calculateYongsin(8, 3, 'weak', -15, 42, 58)
    assertEqual(result.johu.primary, 'fire', '봄 壬 → 조후 1순위 화')
    console.log(`    봄 壬: 조후=${result.johu.primaryKo}`)
  }
  console.log('')

  // ═══ 그룹 6: method 옵션 ═══
  console.log('── [6] method 옵션 테스트 ──')

  {
    const combined = calculateYongsin(0, 2, 'strong', 30, 60, 40, { method: 'combined' })
    assertEqual(combined.method, 'combined', 'method = combined')
    assertNotNull(combined.combinedScores, 'combinedScores 존재')
    assertTrue((combined.combinedScores?.length || 0) === 5, 'combinedScores 5개')

    const eokbu = calculateYongsin(0, 2, 'strong', 30, 60, 40, { method: 'eokbu' })
    assertEqual(eokbu.method, 'eokbu', 'method = eokbu')
    assertEqual(eokbu.yongsin, eokbu.eokbu.yongsin, '억부 모드: 최종=억부')

    const johu = calculateYongsin(0, 2, 'strong', 30, 60, 40, { method: 'johu' })
    assertEqual(johu.method, 'johu', 'method = johu')
    assertEqual(johu.yongsin, johu.johu.primary, '조후 모드: 최종=조후 1순위')
  }
  console.log('')

  // ═══ 그룹 7: 특수격국 (옵션) ═══
  console.log('── [7] 특수격국 (옵션) ──')

  {
    // 옵션 꺼짐 (기본) → specialPattern 없음
    const normal = calculateYongsin(0, 2, 'strong', 30, 60, 40)
    assertTrue(normal.specialPattern === undefined, '기본: specialPattern 없음')
  }

  {
    // 옵션 켜짐 + 보통 사주 → normal
    const result = calculateYongsin(0, 2, 'strong', 30, 60, 40, { includeSpecialPattern: true })
    assertNotNull(result.specialPattern, 'specialPattern 존재')
    assertEqual(result.specialPattern?.patternType, 'normal', '보통 사주 = normal')
  }

  {
    // 극단적 신강 (helpRatio 85%) → 종강격
    const result = calculateYongsin(0, 2, 'strong', 80, 85, 15, { includeSpecialPattern: true })
    assertEqual(result.specialPattern?.patternType, 'jonggang', '극단적 신강 = 종강격')
    console.log(`    종강격: 용신=${result.yongsinKo}`)
  }

  {
    // 극단적 신약 (helpRatio 15%) → 종격
    const result = calculateYongsin(0, 8, 'weak', -80, 15, 85, { includeSpecialPattern: true })
    assertTrue(
      result.specialPattern?.isSpecial === true,
      `극단적 신약 = 종격: ${result.specialPattern?.patternName}`
    )
    console.log(`    종격: ${result.specialPattern?.patternName}, 용신=${result.yongsinKo}`)
  }
  console.log('')

  // ═══ 그룹 8: 실용 가이드 ═══
  console.log('── [8] 실용 가이드 검증 ──')

  {
    const result = calculateYongsin(0, 2, 'strong', 30, 60, 40)
    assertTrue(result.guide.favorableElements.length > 0, '좋은 오행 존재')
    assertTrue(result.guide.unfavorableElements.length > 0, '나쁜 오행 존재')
    assertTrue(result.guide.favorableColors.length > 0, '좋은 색상 존재')
    assertTrue(result.guide.favorableDirections.length > 0, '좋은 방향 존재')
    assertTrue(result.guide.favorableSeasons.length > 0, '좋은 계절 존재')

    console.log(`    좋은 오행: ${result.guide.favorableElements.join(', ')}`)
    console.log(`    나쁜 오행: ${result.guide.unfavorableElements.join(', ')}`)
    console.log(`    좋은 색상: ${result.guide.favorableColors.join(', ')}`)
    console.log(`    좋은 방향: ${result.guide.favorableDirections.join(', ')}`)
    console.log(`    좋은 계절: ${result.guide.favorableSeasons.join(', ')}`)
  }
  console.log('')

  // ═══ 그룹 9: 모든 일간 × 신강/신약 조합 ═══
  console.log('── [9] 전체 일간 × 신강/신약 스모크 테스트 ──')

  for (let stemIdx = 0; stemIdx < 10; stemIdx++) {
    for (const str of ['strong', 'weak'] as const) {
      const monthBranch = str === 'strong' ? 2 : 8  // 봄 vs 가을
      const help = str === 'strong' ? 62 : 38
      const restrain = str === 'strong' ? 38 : 62
      const level = str === 'strong' ? 25 : -25

      try {
        const result = calculateYongsin(stemIdx, monthBranch, str, level, help, restrain)
        assertTrue(
          allElements.includes(result.yongsin),
          `${STEMS[stemIdx].char}(${STEMS[stemIdx].name}) ${str === 'strong' ? '신강' : '신약'} → 용신: ${result.yongsinKo}`
        )
      } catch (err: any) {
        failed++
        console.log(`  ❌ ${STEMS[stemIdx].char} ${str}: ${err.message}`)
        failures.push(`${STEMS[stemIdx].char} ${str}: ${err.message}`)
      }
    }
  }
  console.log('')

  // ═══ 그룹 10: 모든 월지 조후 테스트 ═══
  console.log('── [10] 모든 월지 조후 테스트 (甲 일간) ──')

  for (let branchIdx = 0; branchIdx < 12; branchIdx++) {
    const result = calculateYongsin(0, branchIdx, 'weak', -10, 45, 55)
    assertTrue(
      allElements.includes(result.johu.primary),
      `甲 + ${BRANCHES[branchIdx].char}(${BRANCHES[branchIdx].name})월 → 조후: ${result.johu.primaryKo} (${result.johu.season})`
    )
  }
  console.log('')

  // ═══ 그룹 11: 중화(neutral) ═══
  console.log('── [11] 중화(neutral) 판단 ──')

  {
    // 약간 강한 쪽
    const result1 = calculateYongsin(0, 2, 'neutral', 5, 52, 48)
    assertNotNull(result1.yongsin, `중화(+5): 용신=${result1.yongsinKo}`)

    // 약간 약한 쪽
    const result2 = calculateYongsin(0, 2, 'neutral', -5, 48, 52)
    assertNotNull(result2.yongsin, `중화(-5): 용신=${result2.yongsinKo}`)

    console.log(`    중화(+5): 용신=${result1.yongsinKo}`)
    console.log(`    중화(-5): 용신=${result2.yongsinKo}`)
  }
  console.log('')

  // ═══ 그룹 12: detailLevel 옵션 ═══
  console.log('── [12] detailLevel 옵션 ──')

  {
    const full = calculateYongsin(0, 2, 'strong', 30, 60, 40, { detailLevel: 'full' })
    const simple = calculateYongsin(0, 2, 'strong', 30, 60, 40, { detailLevel: 'simple' })

    // 둘 다 동일한 용신
    assertEqual(full.yongsin, simple.yongsin, 'full과 simple 용신 동일')
    assertTrue(full.fiveSin.length === 5, 'full: 5신 5개')
    assertTrue(simple.fiveSin.length === 5, 'simple: 5신 5개')
  }
  console.log('')

  // ═══ 그룹 13: 포맷 출력 ═══
  console.log('── [13] 포맷 출력 테스트 ──')

  {
    const result = calculateYongsin(0, 2, 'strong', 30, 60, 40)
    const formatted = formatYongsin(result)
    assertTrue(formatted.length > 100, '포맷 출력 길이 > 100')
    assertTrue(formatted.includes('용신'), '포맷에 "용신" 포함')
    assertTrue(formatted.includes('희신'), '포맷에 "희신" 포함')
    assertTrue(formatted.includes('기신'), '포맷에 "기신" 포함')

    console.log('\n' + formatted + '\n')
  }
  console.log('')

  // ═══ 그룹 14: 종합 샘플 출력 ═══
  console.log('── [14] 종합 샘플 출력 ──')

  const sampleCases = [
    { stemIdx: 0, branch: 2,  str: 'strong' as const, level: 30,  h: 62, r: 38, label: '甲목 봄 신강' },
    { stemIdx: 0, branch: 8,  str: 'weak' as const,   level: -25, h: 38, r: 62, label: '甲목 가을 신약' },
    { stemIdx: 2, branch: 6,  str: 'strong' as const, level: 40,  h: 70, r: 30, label: '丙화 여름 신강' },
    { stemIdx: 4, branch: 0,  str: 'weak' as const,   level: -20, h: 40, r: 60, label: '戊토 겨울 신약' },
    { stemIdx: 6, branch: 9,  str: 'strong' as const, level: 35,  h: 65, r: 35, label: '庚금 가을 신강' },
    { stemIdx: 8, branch: 11, str: 'weak' as const,   level: -30, h: 35, r: 65, label: '壬수 겨울 신약' },
  ]

  for (const sc of sampleCases) {
    const result = calculateYongsin(sc.stemIdx, sc.branch, sc.str, sc.level, sc.h, sc.r
            )
    console.log(`  ${sc.label}:`)
    console.log(`    억부: ${result.eokbu.yongsinKo} | 조후: ${result.johu.primaryKo}(${result.johu.season}) | 최종: ${result.yongsinKo}`)
    console.log(`    좋은 오행: ${result.guide.favorableElements.join(',')} | 나쁜 오행: ${result.guide.unfavorableElements.join(',')}`)
    assertTrue(allElements.includes(result.yongsin), `${sc.label} 용신 유효`)
  }
  console.log('')

  // ═══ 그룹 15: 특수격국 전체 타입 확인 ═══
  console.log('── [15] 특수격국 전체 타입 ──')

  {
    // 종강격: 극단 신강
    const jonggang = calculateYongsin(0, 2, 'strong', 80, 85, 15, { includeSpecialPattern: true })
    assertEqual(jonggang.specialPattern?.patternType, 'jonggang', '종강격')
    console.log(`    종강격: 용신=${jonggang.yongsinKo}, ${jonggang.specialPattern?.description}`)
  }

  {
    // 종격: 극단 신약 (금왕 월 = 가을)
    // 甲목 + 酉월(금왕) + 극단 신약 → 금극목 → 종살격
    const jongsal = calculateYongsin(0, 9, 'weak', -80, 12, 88, { includeSpecialPattern: true })
    assertTrue(jongsal.specialPattern?.isSpecial === true, '종살격 is special')
    console.log(`    ${jongsal.specialPattern?.patternName}: 용신=${jongsal.yongsinKo}`)
  }

  {
    // 보통격: 일반 사주
    const normal = calculateYongsin(0, 2, 'strong', 20, 55, 45, { includeSpecialPattern: true })
    assertEqual(normal.specialPattern?.patternType, 'normal', '보통격')
    assertEqual(normal.specialPattern?.isSpecial, false, '보통격 isSpecial=false')
  }
  console.log('')

  // ═══ 그룹 16: combined 점수 순서 검증 ═══
  console.log('── [16] combined 점수 순서 검증 ──')

  {
    const result = calculateYongsin(0, 6, 'strong', 30, 60, 40)
    if (result.combinedScores) {
      // 내림차순 정렬 확인
      for (let i = 1; i < result.combinedScores.length; i++) {
        assertTrue(
          result.combinedScores[i - 1].totalScore >= result.combinedScores[i].totalScore,
          `점수 내림차순: ${result.combinedScores[i - 1].totalScore} >= ${result.combinedScores[i].totalScore}`
        )
      }

      // 1위가 최종 용신
      assertEqual(
        result.combinedScores[0].element,
        result.yongsin,
        `1위(${result.combinedScores[0].element}) = 최종 용신(${result.yongsin})`
      )
    }
  }
  console.log('')

  // ═══ 그룹 17: 억부와 조후가 일치/불일치 ═══
  console.log('── [17] 억부/조후 일치·불일치 케이스 ──')

  {
    // 겨울 甲목 신약: 억부=수(인성), 조후=화(따뜻함) → 불일치
    const result = calculateYongsin(0, 0, 'weak', -20, 40, 60)
    const eokbu = result.eokbu.yongsin
    const johu = result.johu.primary

    if (eokbu === johu) {
      console.log(`    겨울 甲 신약: 억부=조후=${ELEMENT_KO[eokbu]} (일치)`)
    } else {
      console.log(`    겨울 甲 신약: 억부=${ELEMENT_KO[eokbu]}, 조후=${ELEMENT_KO[johu]} (불일치) → 최종: ${result.yongsinKo}`)
    }
    assertTrue(allElements.includes(result.yongsin), '최종 용신 유효')
  }

  {
    // 여름 壬수 신약: 억부=금(인성), 조후=금(생수) → 일치
    const result = calculateYongsin(8, 6, 'weak', -25, 38, 62)
    const eokbu = result.eokbu.yongsin
    const johu = result.johu.primary

    if (eokbu === johu) {
      console.log(`    여름 壬 신약: 억부=조후=${ELEMENT_KO[eokbu]} (일치)`)
    } else {
      console.log(`    여름 壬 신약: 억부=${ELEMENT_KO[eokbu]}, 조후=${ELEMENT_KO[johu]} (불일치) → 최종: ${result.yongsinKo}`)
    }
    assertTrue(allElements.includes(result.yongsin), '최종 용신 유효')
  }
  console.log('')

  // ═══ 그룹 18: 경계값 테스트 ═══
  console.log('── [18] 경계값 테스트 ──')

  {
    // 도움 점수 = 억제 점수 (완전 균형)
    const result = calculateYongsin(0, 2, 'neutral', 0, 50, 50)
    assertNotNull(result.yongsin, `완전 균형: 용신=${result.yongsinKo}`)
  }

  {
    // 도움 점수 = 0 (극단적 신약, specialPattern 끔)
    const result = calculateYongsin(0, 2, 'weak', -90, 5, 95)
    assertNotNull(result.yongsin, `극단 신약: 용신=${result.yongsinKo}`)
  }

  {
    // 억제 점수 = 0 (극단적 신강, specialPattern 끔)
    const result = calculateYongsin(0, 2, 'strong', 90, 95, 5)
    assertNotNull(result.yongsin, `극단 신강: 용신=${result.yongsinKo}`)
  }
  console.log('')

  // ═══ 그룹 19: 전체 일간 × 전체 월지 매트릭스 (120케이스) ═══
  console.log('── [19] 전체 매트릭스 스모크 (10일간 × 12월지 = 120) ──')

  let matrixPass = 0
  let matrixFail = 0

  for (let stemIdx = 0; stemIdx < 10; stemIdx++) {
    for (let branchIdx = 0; branchIdx < 12; branchIdx++) {
      try {
        const r1 = calculateYongsin(stemIdx, branchIdx, 'strong', 25, 60, 40)
        const r2 = calculateYongsin(stemIdx, branchIdx, 'weak', -25, 40, 60)
        if (allElements.includes(r1.yongsin) && allElements.includes(r2.yongsin)) {
          matrixPass += 2
        } else {
          matrixFail += 2
        }
      } catch {
        matrixFail += 2
      }
    }
  }

  assertTrue(matrixFail === 0, `매트릭스 240케이스: ${matrixPass} 통과, ${matrixFail} 실패`)
  passed += matrixPass - 1  // assertTrue에서 1개 이미 카운트
  failed += matrixFail
  console.log(`    (내부: ${matrixPass} 통과, ${matrixFail} 실패)`)
  console.log('')

  // ═══ 그룹 20: 전체 포맷 샘플 (특수격국 포함) ═══
  console.log('── [20] 전체 포맷 샘플 (특수격국 포함) ──')

  {
    const result = calculateYongsin(0, 6, 'strong', 30, 60, 40, {
      method: 'combined',
      includeSpecialPattern: true,
      detailLevel: 'full',
    })
    const formatted = formatYongsin(result)
    console.log('\n' + formatted + '\n')
    assertTrue(formatted.includes('격국'), '특수격국 포함 시 "격국" 출력')
  }
  console.log('')

  // ═══ 최종 요약 ═══
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  용신 테스트 결과: ${passed}건 통과, ${failed}건 실패`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (failures.length > 0) {
    console.log('\n  실패 목록:')
    failures.forEach(f => console.log(f))
  }
  console.log('')
}

runAllTests()