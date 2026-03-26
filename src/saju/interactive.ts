// src/saju/interactive.ts
// 년월일시를 입력받아 사주 결과를 출력하는 대화형 도구
export {}

import { adjustTime } from './timeAdjustment'
import { getHourBranchIndex } from './hourBranch'
import { calculateDayPillar } from './dayPillar'
import { calculateHourPillar } from './hourPillar'
import { calculateYearPillar } from './yearPillar'
import { calculateMonthPillar } from './monthPillar'
import { BRANCHES } from './constants'

// 명령줄 인자 읽기
// 사용법: npx ts-node src/saju/interactive.ts 1990 5 15 7 20
const args = process.argv.slice(2)

if (args.length < 3) {
  console.log('')
  console.log('========================================')
  console.log(' 사주 계산기 - 사용법')
  console.log('========================================')
  console.log('')
  console.log('  npx ts-node src/saju/interactive.ts [년] [월] [일] [시] [분]')
  console.log('')
  console.log('  예시:')
  console.log('  npx ts-node src/saju/interactive.ts 1990 5 15 7 20')
  console.log('  npx ts-node src/saju/interactive.ts 2024 2 4 11 0')
  console.log('  npx ts-node src/saju/interactive.ts 1985 10 23 14 30')
  console.log('')
  console.log('  시간 모름:')
  console.log('  npx ts-node src/saju/interactive.ts 1990 5 15')
  console.log('')
  process.exit(0)
}

const year = parseInt(args[0])
const month = parseInt(args[1])
const day = parseInt(args[2])
const hour = args[3] !== undefined ? parseInt(args[3]) : null
const minute = args[4] !== undefined ? parseInt(args[4]) : 0
const birthTimeUnknown = hour === null

console.log('')
console.log('========================================')
console.log(' 사주 계산 결과')
console.log('========================================')
console.log('')

// 입력 정보
console.log('[ 입력 정보 ]')
console.log(`  양력: ${year}년 ${month}월 ${day}일${birthTimeUnknown ? ' (시간 모름)' : ` ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`}`)
console.log('')

// ------------------------------------------
// 시간 보정
// ------------------------------------------
let adjustedHour = hour
let adjustedMinute = minute
let effYear = year
let effMonth = month
let effDay = day

if (!birthTimeUnknown && hour !== null) {
  const timeResult = adjustTime(hour, minute, 'standard30')
  adjustedHour = timeResult.adjustedHour
  adjustedMinute = timeResult.adjustedMinute

  console.log('[ 시간 보정 (30분) ]')
  console.log(`  원본: ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  console.log(`  보정: ${String(adjustedHour).padStart(2, '0')}:${String(adjustedMinute!).padStart(2, '0')}`)
  console.log(`  설명: ${timeResult.description}`)

  if (timeResult.dateChanged) {
    const tempDate = new Date(year, month - 1, day)
    tempDate.setDate(tempDate.getDate() - 1)
    effYear = tempDate.getFullYear()
    effMonth = tempDate.getMonth() + 1
    effDay = tempDate.getDate()
    console.log(`  ⚠️ 날짜 변경: ${year}-${month}-${day} → ${effYear}-${effMonth}-${effDay}`)
  }
  console.log('')
}

// ------------------------------------------
// 년주
// ------------------------------------------
let yearPillar
try {
  if (!birthTimeUnknown && adjustedHour !== null) {
    yearPillar = calculateYearPillar(effYear, effMonth, effDay, adjustedHour, adjustedMinute!)
  } else {
    yearPillar = calculateYearPillar(effYear, effMonth, effDay)
  }
} catch (e: any) {
  console.log(`  ⚠️ 년주 계산 실패: ${e.message}`)
  process.exit(1)
}

// ------------------------------------------
// 월주
// ------------------------------------------
let monthResult
try {
  const h = adjustedHour !== null ? adjustedHour : 12
  const m = adjustedMinute !== null ? adjustedMinute : 0
  monthResult = calculateMonthPillar(effYear, effMonth, effDay, h, m, yearPillar.heavenlyStem.index)
} catch (e: any) {
  console.log(`  ⚠️ 월주 계산 실패: ${e.message}`)
  console.log(`     해당 연도(${effYear})의 절기 데이터가 없을 수 있습니다.`)
  process.exit(1)
}

// ------------------------------------------
// 일주
// ------------------------------------------
const dayPillar = calculateDayPillar(effYear, effMonth, effDay)

// ------------------------------------------
// 시주
// ------------------------------------------
let hourPillar = null
let hourBranchName = ''
if (!birthTimeUnknown && adjustedHour !== null && adjustedMinute !== null) {
  hourPillar = calculateHourPillar(adjustedHour, adjustedMinute, dayPillar.heavenlyStem.index, false)
  const branchIndex = getHourBranchIndex(adjustedHour, adjustedMinute)
  hourBranchName = BRANCHES[branchIndex].name
}

// ------------------------------------------
// 결과 출력
// ------------------------------------------
console.log('[ 사주팔자 ]')
console.log('')
console.log('  ┌──────┬──────┬──────┬──────┐')
console.log(`  │ 시주 │ 일주 │ 월주 │ 년주 │`)
console.log('  ├──────┼──────┼──────┼──────┤')

const hourStemChar = hourPillar ? hourPillar.heavenlyStem.char : '  '
const hourBranchChar = hourPillar ? hourPillar.earthlyBranch.char : '  '
const hourStemName = hourPillar ? hourPillar.heavenlyStem.name : '미정'
const hourBranchNameDisplay = hourPillar ? hourPillar.earthlyBranch.name : '미정'

console.log(`  │  ${hourStemChar}  │  ${dayPillar.heavenlyStem.char}  │  ${monthResult.pillar.heavenlyStem.char}  │  ${yearPillar.heavenlyStem.char}  │  ← 천간`)
console.log(`  │  ${hourBranchChar}  │  ${dayPillar.earthlyBranch.char}  │  ${monthResult.pillar.earthlyBranch.char}  │  ${yearPillar.earthlyBranch.char}  │  ← 지지`)
console.log('  └──────┴──────┴──────┴──────┘')
console.log('')
console.log(`  │ ${hourStemName}${hourBranchNameDisplay} │ ${dayPillar.heavenlyStem.name}${dayPillar.earthlyBranch.name} │ ${monthResult.pillar.heavenlyStem.name}${monthResult.pillar.earthlyBranch.name} │ ${yearPillar.heavenlyStem.name}${yearPillar.earthlyBranch.name} │`)
console.log('')

// ------------------------------------------
// 상세 정보
// ------------------------------------------
console.log('[ 상세 정보 ]')
console.log('')
console.log(`  년주: ${yearPillar.heavenlyStem.char}${yearPillar.earthlyBranch.char} (${yearPillar.heavenlyStem.name}${yearPillar.earthlyBranch.name})`)
console.log(`        천간: ${yearPillar.heavenlyStem.char}(${yearPillar.heavenlyStem.name}) ${yearPillar.heavenlyStem.elementKo}(${yearPillar.heavenlyStem.yinYangKo})`)
console.log(`        지지: ${yearPillar.earthlyBranch.char}(${yearPillar.earthlyBranch.name}) ${yearPillar.earthlyBranch.elementKo}(${yearPillar.earthlyBranch.yinYangKo})`)
console.log('')

console.log(`  월주: ${monthResult.pillar.heavenlyStem.char}${monthResult.pillar.earthlyBranch.char} (${monthResult.pillar.heavenlyStem.name}${monthResult.pillar.earthlyBranch.name})`)
console.log(`        천간: ${monthResult.pillar.heavenlyStem.char}(${monthResult.pillar.heavenlyStem.name}) ${monthResult.pillar.heavenlyStem.elementKo}(${monthResult.pillar.heavenlyStem.yinYangKo})`)
console.log(`        지지: ${monthResult.pillar.earthlyBranch.char}(${monthResult.pillar.earthlyBranch.name}) ${monthResult.pillar.earthlyBranch.elementKo}(${monthResult.pillar.earthlyBranch.yinYangKo})`)
console.log(`        절기: ${monthResult.solarTermName}`)
console.log('')

console.log(`  일주: ${dayPillar.heavenlyStem.char}${dayPillar.earthlyBranch.char} (${dayPillar.heavenlyStem.name}${dayPillar.earthlyBranch.name})`)
console.log(`        천간: ${dayPillar.heavenlyStem.char}(${dayPillar.heavenlyStem.name}) ${dayPillar.heavenlyStem.elementKo}(${dayPillar.heavenlyStem.yinYangKo}) ← 일간(나)`)
console.log(`        지지: ${dayPillar.earthlyBranch.char}(${dayPillar.earthlyBranch.name}) ${dayPillar.earthlyBranch.elementKo}(${dayPillar.earthlyBranch.yinYangKo})`)
console.log('')

if (hourPillar) {
  console.log(`  시주: ${hourPillar.heavenlyStem.char}${hourPillar.earthlyBranch.char} (${hourPillar.heavenlyStem.name}${hourPillar.earthlyBranch.name})`)
  console.log(`        천간: ${hourPillar.heavenlyStem.char}(${hourPillar.heavenlyStem.name}) ${hourPillar.heavenlyStem.elementKo}(${hourPillar.heavenlyStem.yinYangKo})`)
  console.log(`        지지: ${hourPillar.earthlyBranch.char}(${hourPillar.earthlyBranch.name}) ${hourPillar.earthlyBranch.elementKo}(${hourPillar.earthlyBranch.yinYangKo})`)
  console.log(`        ${hourBranchName}시`)
} else {
  console.log(`  시주: 미정 (출생 시간 모름)`)
}

console.log('')
console.log('========================================')
console.log('')