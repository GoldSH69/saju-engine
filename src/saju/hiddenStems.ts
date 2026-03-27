// src/saju/hiddenStems.ts
// 지장간(地藏干) 추출 모듈
//
// 각 지지(地支) 안에 숨겨진 천간(天干)을 추출
// 역할: 여기(余氣) → 중기(中氣) → 정기(正氣)
// 정기 = 해당 지지의 본질적 오행을 대표하는 천간

import { STEMS, BRANCHES } from './constants'

// ============================================================
// 타입 정의
// ============================================================

export type HiddenStemRole = 'yeogi' | 'junggi' | 'jeonggi'

export interface HiddenStemEntry {
  /** 천간 한자 (甲, 乙, ...) */
  char: string
  /** 천간 인덱스 (0~9) */
  index: number
  /** 역할: 여기/중기/정기 */
  role: HiddenStemRole
  /** 역할 한글명 */
  roleName: string
  /** 사령 일수 (30일 기준) */
  days: number
}

export interface PillarHiddenStems {
  /** 지지 한자 */
  branch: string
  /** 지장간 목록 (여기 → 중기 → 정기 순서) */
  stems: HiddenStemEntry[]
  /** 정기(본기) 천간 */
  mainStem: HiddenStemEntry
}

// ============================================================
// 지장간 원본 데이터
// ============================================================

/**
 * 12지지별 지장간 데이터
 * 
 * 순서: 여기(余氣) → 중기(中氣) → 정기(正氣)
 * 일수: 30일 기준 사령(司令) 일수
 * 
 * 정기(正氣) = 해당 지지의 본기(本氣)
 *   → 오행/십성 판단의 핵심
 * 
 * 참고: 유파에 따라 일수에 ±1일 차이가 있을 수 있음
 *       본 데이터는 한국 명리학의 가장 보편적인 기준 사용
 */
interface RawHiddenStem {
  char: string
  role: HiddenStemRole
  days: number
}

const HIDDEN_STEMS_RAW: Record<string, RawHiddenStem[]> = {
  // ────────── 사계(四季) ──────────
  // 子 (자) - 수(水)
  '子': [
    { char: '壬', role: 'yeogi',   days: 10 },
    { char: '癸', role: 'jeonggi', days: 20 },
  ],
  // 丑 (축) - 토(土), 겨울→봄 환절기
  '丑': [
    { char: '癸', role: 'yeogi',   days: 9 },
    { char: '辛', role: 'junggi',  days: 3 },
    { char: '己', role: 'jeonggi', days: 18 },
  ],
  // 寅 (인) - 목(木)
  '寅': [
    { char: '戊', role: 'yeogi',   days: 7 },
    { char: '丙', role: 'junggi',  days: 7 },
    { char: '甲', role: 'jeonggi', days: 16 },
  ],
  // 卯 (묘) - 목(木)
  '卯': [
    { char: '甲', role: 'yeogi',   days: 10 },
    { char: '乙', role: 'jeonggi', days: 20 },
  ],
  // 辰 (진) - 토(土), 봄→여름 환절기
  '辰': [
    { char: '乙', role: 'yeogi',   days: 9 },
    { char: '癸', role: 'junggi',  days: 3 },
    { char: '戊', role: 'jeonggi', days: 18 },
  ],
  // 巳 (사) - 화(火)
  '巳': [
    { char: '戊', role: 'yeogi',   days: 7 },
    { char: '庚', role: 'junggi',  days: 7 },
    { char: '丙', role: 'jeonggi', days: 16 },
  ],
  // 午 (오) - 화(火)
  '午': [
    { char: '丙', role: 'yeogi',   days: 10 },
    { char: '己', role: 'junggi',  days: 9 },
    { char: '丁', role: 'jeonggi', days: 11 },
  ],
  // 未 (미) - 토(土), 여름→가을 환절기
  '未': [
    { char: '丁', role: 'yeogi',   days: 9 },
    { char: '乙', role: 'junggi',  days: 3 },
    { char: '己', role: 'jeonggi', days: 18 },
  ],
  // 申 (신) - 금(金)
  '申': [
    { char: '戊', role: 'yeogi',   days: 7 },
    { char: '壬', role: 'junggi',  days: 7 },
    { char: '庚', role: 'jeonggi', days: 16 },
  ],
  // 酉 (유) - 금(金)
  '酉': [
    { char: '庚', role: 'yeogi',   days: 10 },
    { char: '辛', role: 'jeonggi', days: 20 },
  ],
  // 戌 (술) - 토(土), 가을→겨울 환절기
  '戌': [
    { char: '辛', role: 'yeogi',   days: 9 },
    { char: '丁', role: 'junggi',  days: 3 },
    { char: '戊', role: 'jeonggi', days: 18 },
  ],
  // 亥 (해) - 수(水)
  '亥': [
    { char: '戊', role: 'yeogi',   days: 7 },
    { char: '甲', role: 'junggi',  days: 5 },
    { char: '壬', role: 'jeonggi', days: 18 },
  ],
}

// ============================================================
// 역할명 매핑
// ============================================================

const ROLE_NAMES: Record<HiddenStemRole, string> = {
  yeogi: '여기',
  junggi: '중기',
  jeonggi: '정기',
}

// ============================================================
// 천간 인덱스 조회 (constants.ts의 STEMS와 연동)
// ============================================================

function getStemIndex(char: string): number {
  const index = STEMS.findIndex(s => s.char === char)
  if (index === -1) {
    throw new Error(`알 수 없는 천간: ${char}`)
  }
  return index
}

// ============================================================
// 공개 함수
// ============================================================

/**
 * 특정 지지의 지장간 추출
 * 
 * @param branchChar 지지 한자 (子, 丑, 寅, ...)
 * @returns 지장간 배열 (여기 → 중기 → 정기 순서)
 * 
 * @example
 * getHiddenStems('寅')
 * // → [
 * //   { char: '戊', index: 4, role: 'yeogi',   roleName: '여기', days: 7  },
 * //   { char: '丙', index: 2, role: 'junggi',  roleName: '중기', days: 7  },
 * //   { char: '甲', index: 0, role: 'jeonggi', roleName: '정기', days: 16 },
 * // ]
 */
export function getHiddenStems(branchChar: string): HiddenStemEntry[] {
  const raw = HIDDEN_STEMS_RAW[branchChar]
  if (!raw) {
    throw new Error(`알 수 없는 지지: ${branchChar}`)
  }

  return raw.map(r => ({
    char: r.char,
    index: getStemIndex(r.char),
    role: r.role,
    roleName: ROLE_NAMES[r.role],
    days: r.days,
  }))
}

/**
 * 특정 지지의 정기(본기) 천간만 반환
 * 
 * @param branchChar 지지 한자
 * @returns 정기 천간 정보
 * 
 * @example
 * getMainHiddenStem('寅')  // → { char: '甲', index: 0, ... }
 */
export function getMainHiddenStem(branchChar: string): HiddenStemEntry {
  const stems = getHiddenStems(branchChar)
  const main = stems.find(s => s.role === 'jeonggi')
  if (!main) {
    throw new Error(`정기를 찾을 수 없음: ${branchChar}`)
  }
  return main
}

/**
 * 사주 4주(년월일시)의 지장간을 모두 추출
 * 
 * @param branches 4개 지지 한자 배열 [년지, 월지, 일지, 시지]
 * @returns 각 주(柱)별 지장간 정보
 * 
 * @example
 * extractAllHiddenStems(['辰', '午', '子', '寅'])
 */
export function extractAllHiddenStems(
  branches: string[]
): PillarHiddenStems[] {
  return branches.map(branch => {
    const stems = getHiddenStems(branch)
    const mainStem = stems.find(s => s.role === 'jeonggi')!

    return {
      branch,
      stems,
      mainStem,
    }
  })
}

/**
 * 사주 전체에서 모든 천간 추출 (천간 4개 + 지장간 전부)
 * → 오행 분포 계산의 입력값으로 사용
 * 
 * @param stemChars 4개 천간 [년간, 월간, 일간, 시간]
 * @param branchChars 4개 지지 [년지, 월지, 일지, 시지]
 * @returns 모든 천간 정보 (표면 천간 + 지장간)
 */
export interface AllStemsResult {
  /** 표면 천간 4개 (년간, 월간, 일간, 시간) */
  surfaceStems: { char: string; index: number; position: string }[]
  /** 지장간 전체 */
  hiddenStems: PillarHiddenStems[]
  /** 전체 천간 요약 (char → 총 등장 횟수) */
  stemCounts: Record<string, number>
}

export function extractAllStems(
  stemChars: string[],
  branchChars: string[]
): AllStemsResult {
  const positions = ['년간', '월간', '일간', '시간']

  // 1. 표면 천간
  const surfaceStems = stemChars.map((char, i) => ({
    char,
    index: getStemIndex(char),
    position: positions[i],
  }))

  // 2. 지장간
  const hiddenStems = extractAllHiddenStems(branchChars)

  // 3. 천간 등장 횟수 집계
  const stemCounts: Record<string, number> = {}

  // 표면 천간 집계
  for (const s of surfaceStems) {
    stemCounts[s.char] = (stemCounts[s.char] || 0) + 1
  }

  // 지장간 집계 (정기만 카운트하는 방식도 있지만, 여기서는 전체 카운트)
  for (const pillar of hiddenStems) {
    for (const stem of pillar.stems) {
      stemCounts[stem.char] = (stemCounts[stem.char] || 0) + 1
    }
  }

  return { surfaceStems, hiddenStems, stemCounts }
}

/**
 * 지장간 데이터를 보기 좋게 출력 (디버그용)
 */
export function formatHiddenStems(branchChar: string): string {
  const stems = getHiddenStems(branchChar)
  const parts = stems.map(s => `${s.char}(${s.roleName},${s.days}일)`)
  return `${branchChar}: ${parts.join(' → ')}`
}

/**
 * 12지지 전체 지장간 표 출력 (디버그용)
 */
export function printAllHiddenStems(): void {
  const branchChars = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

  console.log('\n┌────────────────────────────────────────────┐')
  console.log('│          12지지 지장간(地藏干) 표            │')
  console.log('├──────┬──────────────────────────────────────┤')
  console.log('│ 지지 │  여기(余氣) → 중기(中氣) → 정기(正氣) │')
  console.log('├──────┼──────────────────────────────────────┤')

  for (const branch of branchChars) {
    const stems = getHiddenStems(branch)
    const parts = stems.map(s => {
      const roleLabel = s.roleName.padEnd(2)
      return `${s.char}(${roleLabel},${String(s.days).padStart(2)}일)`
    })
    console.log(`│  ${branch}   │  ${parts.join(' → ').padEnd(36)} │`)
  }

  console.log('└──────┴──────────────────────────────────────┘')
}