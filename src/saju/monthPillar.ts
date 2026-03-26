// src/saju/monthPillar.ts
// 월주(月柱) 계산 모듈
//
// 기준: 12절기 절입시각
// 각 절기 이후 ~ 다음 절기 이전까지가 해당 월

import { STEMS, BRANCHES, MONTH_STEM_START } from './constants'
import { Pillar } from './types'
import { getSolarTermDateTime } from '../data/solarTerms'

/**
 * 절기와 월지의 매핑
 */
const TERM_TO_BRANCH: { termName: string; branchIndex: number }[] = [
  { termName: '입춘', branchIndex: 2 },   // 寅월
  { termName: '경칩', branchIndex: 3 },   // 卯월
  { termName: '청명', branchIndex: 4 },   // 辰월
  { termName: '입하', branchIndex: 5 },   // 巳월
  { termName: '망종', branchIndex: 6 },   // 午월
  { termName: '소서', branchIndex: 7 },   // 未월
  { termName: '입추', branchIndex: 8 },   // 申월
  { termName: '백로', branchIndex: 9 },   // 酉월
  { termName: '한로', branchIndex: 10 },  // 戌월
  { termName: '입동', branchIndex: 11 },  // 亥월
  { termName: '대설', branchIndex: 0 },   // 子월
  { termName: '소한', branchIndex: 1 },   // 丑월
]

/**
 * 월주(月柱)를 계산합니다.
 *
 * @param year       양력 연도
 * @param month      양력 월
 * @param day        양력 일
 * @param hour       시 (0~23)
 * @param minute     분 (0~59)
 * @param yearStemIndex  년주 천간 인덱스 (월간 계산에 필요)
 * @returns 월주 (천간 + 지지) + 사용된 절기 정보
 */
export function calculateMonthPillar(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  yearStemIndex: number
): { pillar: Pillar; solarTermName: string; solarTermDateTime: string } {

  // 출생일시를 Date로 변환
  const birthDate = new Date(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+09:00`
  )

  // 해당 월지를 결정하기 위해 절기 데이터를 역순으로 확인
  // 해당 연도 + 다음해 소한까지 체크
  let monthBranchIndex = -1
  let usedTermName = ''
  let usedTermDateTime = ''

  // 해당 연도의 절기를 역순으로 확인
  // 대설(12월) → 입동(11월) → ... → 입춘(1월)
  const termsToCheck: { termName: string; branchIndex: number; year: number }[] = []

  // 다음해 소한
  termsToCheck.push({ termName: '소한', branchIndex: 1, year: year + 1 })

  // 해당 연도 절기 (역순)
  for (let i = TERM_TO_BRANCH.length - 1; i >= 0; i--) {
    termsToCheck.push({ ...TERM_TO_BRANCH[i], year: year })
  }

  // 전년도 대설, 소한 (1~2월 출생자 대응)
  termsToCheck.push({ termName: '대설', branchIndex: 0, year: year - 1 })
  termsToCheck.push({ termName: '소한', branchIndex: 1, year: year })

  // 정렬: 날짜 내림차순 (가장 최근 절기부터 확인)
  const termsWithDate: { termName: string; branchIndex: number; date: Date; dateStr: string }[] = []

  for (const t of termsToCheck) {
    const termDate = getSolarTermDateTime(t.year, t.termName)
    if (termDate) {
      termsWithDate.push({
        termName: t.termName,
        branchIndex: t.branchIndex,
        date: termDate,
        dateStr: termDate.toISOString()
      })
    }
  }

  // 날짜 내림차순 정렬
  termsWithDate.sort((a, b) => b.date.getTime() - a.date.getTime())

  // 출생일시보다 이전인 가장 가까운 절기를 찾음
  for (const t of termsWithDate) {
    if (birthDate >= t.date) {
      monthBranchIndex = t.branchIndex
      usedTermName = t.termName
      usedTermDateTime = t.dateStr
      break
    }
  }

  // 절기 데이터가 없는 경우 (데이터 범위 밖)
  if (monthBranchIndex === -1) {
    throw new Error(`절기 데이터를 찾을 수 없습니다: ${year}-${month}-${day}`)
  }

  // 월간 계산
  // 년간 그룹에 따라 寅월(branchIndex=2)의 시작 천간이 결정됨
  const yearGroup = yearStemIndex % 5
  const startStemIndex = MONTH_STEM_START[yearGroup]

  // 寅월(2)부터의 오프셋
  const monthOffset = (monthBranchIndex - 2 + 12) % 12
  const monthStemIndex = (startStemIndex + monthOffset) % 10

  return {
    pillar: {
      heavenlyStem: STEMS[monthStemIndex],
      earthlyBranch: BRANCHES[monthBranchIndex]
    },
    solarTermName: usedTermName,
    solarTermDateTime: usedTermDateTime
  }
}