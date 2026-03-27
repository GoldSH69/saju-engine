// src/saju/tests/hiddenStems.test.ts
export {}

import {
  getHiddenStems,
  getMainHiddenStem,
  extractAllHiddenStems,
  extractAllStems,
  printAllHiddenStems,
} from '../hiddenStems'

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
console.log(' 지장간(地藏干) 추출 테스트')
console.log('========================================')

// ------------------------------------------
// 1. 12지지별 정기(본기) 확인
// ------------------------------------------
console.log('')
console.log('[ 1. 정기(正氣) 확인 ]')
console.log('')

const mainStemCases: [string, string][] = [
  ['子', '癸'],
  ['丑', '己'],
  ['寅', '甲'],
  ['卯', '乙'],
  ['辰', '戊'],
  ['巳', '丙'],
  ['午', '丁'],
  ['未', '己'],
  ['申', '庚'],
  ['酉', '辛'],
  ['戌', '戊'],
  ['亥', '壬'],
]

for (const [branch, expectedMain] of mainStemCases) {
  runTest(`${branch}의 정기 = ${expectedMain}`, () => {
    const result = getMainHiddenStem(branch)
    assertEqual(result.char, expectedMain, '정기')
    assertEqual(result.role, 'jeonggi', '역할')
  })
}

// ------------------------------------------
// 2. 지장간 개수 확인
// ------------------------------------------
console.log('')
console.log('[ 2. 지장간 개수 확인 ]')
console.log('')

const stemCountCases: [string, number][] = [
  ['子', 2],  // 壬, 癸
  ['丑', 3],  // 癸, 辛, 己
  ['寅', 3],  // 戊, 丙, 甲
  ['卯', 2],  // 甲, 乙
  ['辰', 3],  // 乙, 癸, 戊
  ['巳', 3],  // 戊, 庚, 丙
  ['午', 3],  // 丙, 己, 丁
  ['未', 3],  // 丁, 乙, 己
  ['申', 3],  // 戊, 壬, 庚
  ['酉', 2],  // 庚, 辛
  ['戌', 3],  // 辛, 丁, 戊
  ['亥', 3],  // 戊, 甲, 壬
]

for (const [branch, expectedCount] of stemCountCases) {
  runTest(`${branch}의 지장간 수 = ${expectedCount}개`, () => {
    const result = getHiddenStems(branch)
    assertEqual(result.length, expectedCount, '개수')
  })
}

// ------------------------------------------
// 3. 일수 합계 = 30일 확인
// ------------------------------------------
console.log('')
console.log('[ 3. 사령 일수 합계 = 30일 ]')
console.log('')

const allBranches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

for (const branch of allBranches) {
  runTest(`${branch} 일수 합계 = 30`, () => {
    const stems = getHiddenStems(branch)
    const total = stems.reduce((sum, s) => sum + s.days, 0)
    assertEqual(total, 30, '일수 합계')
  })
}

// ------------------------------------------
// 4. 지장간 상세 검증 (주요 지지)
// ------------------------------------------
console.log('')
console.log('[ 4. 상세 검증 ]')
console.log('')

runTest('寅: 戊(여기,7) → 丙(중기,7) → 甲(정기,16)', () => {
  const stems = getHiddenStems('寅')
  assertEqual(stems[0].char, '戊', '여기')
  assertEqual(stems[0].role, 'yeogi', '여기 역할')
  assertEqual(stems[0].days, 7, '여기 일수')
  assertEqual(stems[1].char, '丙', '중기')
  assertEqual(stems[1].role, 'junggi', '중기 역할')
  assertEqual(stems[1].days, 7, '중기 일수')
  assertEqual(stems[2].char, '甲', '정기')
  assertEqual(stems[2].role, 'jeonggi', '정기 역할')
  assertEqual(stems[2].days, 16, '정기 일수')
})

runTest('丑: 癸(여기,9) → 辛(중기,3) → 己(정기,18)', () => {
  const stems = getHiddenStems('丑')
  assertEqual(stems[0].char, '癸', '여기')
  assertEqual(stems[0].days, 9, '여기 일수')
  assertEqual(stems[1].char, '辛', '중기')
  assertEqual(stems[1].days, 3, '중기 일수')
  assertEqual(stems[2].char, '己', '정기')
  assertEqual(stems[2].days, 18, '정기 일수')
})

runTest('亥: 戊(여기,7) → 甲(중기,5) → 壬(정기,18)', () => {
  const stems = getHiddenStems('亥')
  assertEqual(stems[0].char, '戊', '여기')
  assertEqual(stems[0].days, 7, '여기 일수')
  assertEqual(stems[1].char, '甲', '중기')
  assertEqual(stems[1].days, 5, '중기 일수')
  assertEqual(stems[2].char, '壬', '정기')
  assertEqual(stems[2].days, 18, '정기 일수')
})

// ------------------------------------------
// 5. 사주 전체 추출 테스트
// ------------------------------------------
console.log('')
console.log('[ 5. 사주 전체 지장간 추출 ]')
console.log('')

runTest('4주 지장간 추출 (辰午子寅)', () => {
  const result = extractAllHiddenStems(['辰', '午', '子', '寅'])
  assertEqual(result.length, 4, '주 개수')
  assertEqual(result[0].mainStem.char, '戊', '년지 辰의 정기')
  assertEqual(result[1].mainStem.char, '丁', '월지 午의 정기')
  assertEqual(result[2].mainStem.char, '癸', '일지 子의 정기')
  assertEqual(result[3].mainStem.char, '甲', '시지 寅의 정기')
})

runTest('전체 천간 추출 (甲丙戊庚 + 辰午子寅)', () => {
  const result = extractAllStems(
    ['甲', '丙', '戊', '庚'],  // 표면 천간
    ['辰', '午', '子', '寅']   // 지지
  )
  assertEqual(result.surfaceStems.length, 4, '표면 천간 수')
  assertEqual(result.surfaceStems[0].char, '甲', '년간')
  assertEqual(result.surfaceStems[2].position, '일간', '일간 위치')

  // 지장간 포함 총 천간 수: 3+3+2+3 = 11개 지장간 + 4개 표면 = 15개
  const totalHidden = result.hiddenStems.reduce(
    (sum, p) => sum + p.stems.length, 0
  )
  assertEqual(totalHidden, 11, '지장간 총 수')
})

// ------------------------------------------
// 6. 지장간 전체 표 출력
// ------------------------------------------
console.log('')
console.log('[ 6. 전체 지장간 표 ]')
printAllHiddenStems()

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