// src/saju/__tests__/fiveElements.test.ts
export {}

import {
  getStemElement,
  getBranchElement,
  analyzeFiveElements,
  formatFiveElements,
  FiveElement,
} from '../fiveElements'

let passCount = 0
let failCount = 0
const errorList: string[] = []

function assertEqual(actual: any, expected: any, label: string): void {
  if (actual !== expected) {
    throw new Error(`[${label}] 기대값: ${expected}, 실제값: ${actual}`)
  }
}

function runTest(name: string, fn: () => void): void {
  try {
    fn()
    passCount++
    console.log(`  ✅ ${name}`)
  } catch (error: any) {
    failCount++
    console.log(`  ❌ ${name}`)
    console.log(`     ${error.message}`)
    errorList.push(`${name}: ${error.message}`)
  }
}

console.log('')
console.log('========================================')
console.log(' 오행(五行) 분포 계산 테스트')
console.log('========================================')

// ------------------------------------------
// 1. 천간 오행 매핑
// ------------------------------------------
console.log('')
console.log('[ 1. 천간 → 오행 매핑 ]')
console.log('')

const stemCases: [string, FiveElement, string][] = [
  ['甲', '木', '양'],
  ['乙', '木', '음'],
  ['丙', '火', '양'],
  ['丁', '火', '음'],
  ['戊', '土', '양'],
  ['己', '土', '음'],
  ['庚', '金', '양'],
  ['辛', '金', '음'],
  ['壬', '水', '양'],
  ['癸', '水', '음'],
]

for (const [char, expectedElement, expectedYY] of stemCases) {
  runTest(`${char} → ${expectedElement}(${expectedYY})`, () => {
    const info = getStemElement(char)
    assertEqual(info.element, expectedElement, '오행')
    assertEqual(info.yinYang, expectedYY, '음양')
  })
}

// ------------------------------------------
// 2. 지지 오행 매핑
// ------------------------------------------
console.log('')
console.log('[ 2. 지지 → 오행 매핑 ]')
console.log('')

const branchCases: [string, FiveElement][] = [
  ['子', '水'],
  ['丑', '土'],
  ['寅', '木'],
  ['卯', '木'],
  ['辰', '土'],
  ['巳', '火'],
  ['午', '火'],
  ['未', '土'],
  ['申', '金'],
  ['酉', '金'],
  ['戌', '土'],
  ['亥', '水'],
]

for (const [char, expectedElement] of branchCases) {
  runTest(`${char} → ${expectedElement}`, () => {
    const info = getBranchElement(char)
    assertEqual(info.element, expectedElement, '오행')
  })
}

// ------------------------------------------
// 3. 사주 전체 오행 분석
// ------------------------------------------
console.log('')
console.log('[ 3. 사주 전체 오행 분석 ]')
console.log('')

// 테스트 케이스 1: 모든 오행 골고루
runTest('甲丙戊庚 + 辰午子寅 분석', () => {
  const result = analyzeFiveElements(
    ['甲', '丙', '戊', '庚'],
    ['辰', '午', '子', '寅']
  )

  // 표면 천간: 甲=木, 丙=火, 戊=土, 庚=金
  assertEqual(result.stemElements['木'], 1, '천간 木')
  assertEqual(result.stemElements['火'], 1, '천간 火')
  assertEqual(result.stemElements['土'], 1, '천간 土')
  assertEqual(result.stemElements['金'], 1, '천간 金')
  assertEqual(result.stemElements['水'], 0, '천간 水')

  // 일간 = 戊 = 토
  assertEqual(result.dayStemElement, '土', '일간 오행')
  assertEqual(result.dayStemYinYang, '양', '일간 음양')
})

// 테스트 케이스 2: 목(木) 편중
runTest('甲乙甲乙 + 寅卯寅卯 (木 편중) 분석', () => {
  const result = analyzeFiveElements(
    ['甲', '乙', '甲', '乙'],
    ['寅', '卯', '寅', '卯']
  )

  // 표면 천간 전부 木
  assertEqual(result.stemElements['木'], 4, '천간 木')
  assertEqual(result.stemElements['火'], 0, '천간 火')

  // 최강 오행 = 木
  assertEqual(result.strongest, '木', '최강')

  // 일간 = 甲 = 목
  assertEqual(result.dayStemElement, '木', '일간 오행')
})

// 테스트 케이스 3: 부재 오행 확인
runTest('甲乙丙丁 + 寅卯巳午 (金水 부재) 분석', () => {
  const result = analyzeFiveElements(
    ['甲', '乙', '丙', '丁'],
    ['寅', '卯', '巳', '午']
  )

  // 표면 천간: 木木火火
  assertEqual(result.stemElements['木'], 2, '천간 木')
  assertEqual(result.stemElements['火'], 2, '천간 火')
  assertEqual(result.stemElements['金'], 0, '천간 金')
  assertEqual(result.stemElements['水'], 0, '천간 水')

  // 부재 오행: 지장간에 없는 것만 missing
  // 寅 지장간: 戊(토), 丙(화), 甲(목)
  // 卯 지장간: 甲(목), 乙(목)
  // 巳 지장간: 戊(토), 庚(금), 丙(화)
  // 午 지장간: 丙(화), 己(토), 丁(화)
  // → 금(庚)이 巳에 있으므로 金은 missing 아님
  // → 수(水)는 어디에도 없으므로 missing
  assertEqual(result.missing.length, 1, '부재 오행 수')
  assertEqual(result.missing[0], '水', '부재 오행')
})

// 테스트 케이스 4: 실제 사주 예시
runTest('실제 사주: 庚午 丙戌 甲子 乙丑', () => {
  const result = analyzeFiveElements(
    ['庚', '丙', '甲', '乙'],   // 년간, 월간, 일간, 시간
    ['午', '戌', '子', '丑']    // 년지, 월지, 일지, 시지
  )

  // 일간 = 甲 = 양목
  assertEqual(result.dayStemElement, '木', '일간 오행')
  assertEqual(result.dayStemYinYang, '양', '일간 음양')

  // 표면 천간: 庚=金, 丙=火, 甲=木, 乙=木
  assertEqual(result.stemElements['木'], 2, '천간 木')
  assertEqual(result.stemElements['火'], 1, '천간 火')
  assertEqual(result.stemElements['金'], 1, '천간 金')
})

// ------------------------------------------
// 4. 포맷 출력 테스트
// ------------------------------------------
console.log('')
console.log('[ 4. 포맷 출력 ]')
console.log('')

runTest('포맷 출력 정상 동작', () => {
  const result = analyzeFiveElements(
    ['庚', '丙', '甲', '乙'],
    ['午', '戌', '子', '丑']
  )
  const formatted = formatFiveElements(result)
  // 출력이 문자열이면 OK
  assertEqual(typeof formatted, 'string', '타입')
  assertEqual(formatted.includes('오행'), true, '제목 포함')
})

// 실제 출력 보기
console.log('')
console.log('  📋 출력 예시: 庚午 丙戌 甲子 乙丑')
const sampleResult = analyzeFiveElements(
  ['庚', '丙', '甲', '乙'],
  ['午', '戌', '子', '丑']
)
console.log(formatFiveElements(sampleResult))

// ------------------------------------------
// 5. 상세 내역 확인
// ------------------------------------------
console.log('')
console.log('[ 5. 상세 내역 확인 ]')
console.log('')

runTest('상세 내역 개수 확인', () => {
  const result = analyzeFiveElements(
    ['甲', '丙', '戊', '庚'],
    ['辰', '午', '子', '寅']
  )

  // 표면: 4천간 + 4지지 = 8개
  // 지장간: 辰(3) + 午(3) + 子(2) + 寅(3) = 11개
  // 합계: 19개
  assertEqual(result.details.length, 19, '상세 내역 수')

  // 표면 천간 = isHidden false
  const surface = result.details.filter(d => !d.isHidden)
  assertEqual(surface.length, 8, '표면 글자 수')

  // 지장간 = isHidden true
  const hidden = result.details.filter(d => d.isHidden)
  assertEqual(hidden.length, 11, '지장간 수')
})

// ------------------------------------------
// 결과 요약
// ------------------------------------------
console.log('')
console.log('========================================')
if (failCount === 0) {
  console.log(` ✅ 전체 통과: ${passCount}개 성공`)
} else {
  console.log(` ❌ 결과: ${passCount}개 통과, ${failCount}개 실패`)
  console.log('')
  console.log(' 실패 목록:')
  errorList.forEach(e => console.log(`   - ${e}`))
}
console.log('========================================')
console.log('')

if (failCount > 0) {
  process.exit(1)
}