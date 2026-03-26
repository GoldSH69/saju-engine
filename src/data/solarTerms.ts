// src/data/solarTerms.ts
// 절기 절입시각 데이터
// 형식: "YYYY-MM-DDTHH:mm" (한국 표준시 KST 기준)

export interface SolarTermEntry {
  name: string
  dateTime: string
}

export interface YearSolarTerms {
  year: number
  terms: SolarTermEntry[]
}

export const SOLAR_TERMS_DATA: YearSolarTerms[] = [
  {
    year: 1969,
    terms: [
      { name: '소한', dateTime: '1969-01-05T22:28' },
      { name: '입춘', dateTime: '1969-02-04T03:59' },
      { name: '경칩', dateTime: '1969-03-05T21:47' },
      { name: '청명', dateTime: '1969-04-05T02:53' },
      { name: '입하', dateTime: '1969-05-05T20:21' },
      { name: '망종', dateTime: '1969-06-06T00:55' },
      { name: '소서', dateTime: '1969-07-07T11:25' },
      { name: '입추', dateTime: '1969-08-07T21:09' },
      { name: '백로', dateTime: '1969-09-07T23:44' },
      { name: '한로', dateTime: '1969-10-08T15:31' },
      { name: '입동', dateTime: '1969-11-07T18:14' },
      { name: '대설', dateTime: '1969-12-07T11:03' },
    ]
  },
  {
    year: 1970,
    terms: [
      { name: '소한', dateTime: '1970-01-06T04:36' },
      { name: '입춘', dateTime: '1970-02-04T09:46' },
      { name: '경칩', dateTime: '1970-03-06T03:43' },
      { name: '청명', dateTime: '1970-04-05T08:50' },
      { name: '입하', dateTime: '1970-05-06T02:13' },
      { name: '망종', dateTime: '1970-06-06T06:38' },
      { name: '소서', dateTime: '1970-07-07T17:09' },
      { name: '입추', dateTime: '1970-08-08T03:02' },
      { name: '백로', dateTime: '1970-09-08T05:39' },
      { name: '한로', dateTime: '1970-10-08T21:25' },
      { name: '입동', dateTime: '1970-11-08T00:17' },
      { name: '대설', dateTime: '1970-12-07T17:08' },
    ]
  },
  {
    year: 1984,
    terms: [
      { name: '소한', dateTime: '1984-01-06T12:19' },
      { name: '입춘', dateTime: '1984-02-04T18:19' },
      { name: '경칩', dateTime: '1984-03-05T12:21' },
      { name: '청명', dateTime: '1984-04-04T17:25' },
      { name: '입하', dateTime: '1984-05-05T10:52' },
      { name: '망종', dateTime: '1984-06-05T15:18' },
      { name: '소서', dateTime: '1984-07-07T01:44' },
      { name: '입추', dateTime: '1984-08-07T11:32' },
      { name: '백로', dateTime: '1984-09-07T14:06' },
      { name: '한로', dateTime: '1984-10-08T05:48' },
      { name: '입동', dateTime: '1984-11-07T08:34' },
      { name: '대설', dateTime: '1984-12-07T01:18' },
    ]
  },
  {
    year: 1985,
    terms: [
      { name: '소한', dateTime: '1985-01-05T18:23' },
      { name: '입춘', dateTime: '1985-02-04T00:12' },
      { name: '경칩', dateTime: '1985-03-05T18:14' },
      { name: '청명', dateTime: '1985-04-04T23:25' },
      { name: '입하', dateTime: '1985-05-05T16:54' },
      { name: '망종', dateTime: '1985-06-05T21:25' },
      { name: '소서', dateTime: '1985-07-07T07:54' },
      { name: '입추', dateTime: '1985-08-07T17:36' },
      { name: '백로', dateTime: '1985-09-07T20:06' },
      { name: '한로', dateTime: '1985-10-08T11:47' },
      { name: '입동', dateTime: '1985-11-07T14:36' },
      { name: '대설', dateTime: '1985-12-07T07:19' },
    ]
  },
  {
    year: 1989,
    terms: [
      { name: '소한', dateTime: '1989-01-05T17:48' },
      { name: '입춘', dateTime: '1989-02-03T23:27' },
      { name: '경칩', dateTime: '1989-03-05T17:22' },
      { name: '청명', dateTime: '1989-04-04T22:28' },
      { name: '입하', dateTime: '1989-05-05T15:55' },
      { name: '망종', dateTime: '1989-06-05T20:21' },
      { name: '소서', dateTime: '1989-07-07T06:45' },
      { name: '입추', dateTime: '1989-08-07T16:33' },
      { name: '백로', dateTime: '1989-09-07T19:06' },
      { name: '한로', dateTime: '1989-10-08T10:53' },
      { name: '입동', dateTime: '1989-11-07T13:37' },
      { name: '대설', dateTime: '1989-12-07T06:26' },
    ]
  },
  {
    year: 1990,
    terms: [
      { name: '소한', dateTime: '1990-01-05T23:59' },
      { name: '입춘', dateTime: '1990-02-04T05:46' },
      { name: '경칩', dateTime: '1990-03-05T23:43' },
      { name: '청명', dateTime: '1990-04-05T04:43' },
      { name: '입하', dateTime: '1990-05-05T22:12' },
      { name: '망종', dateTime: '1990-06-06T02:33' },
      { name: '소서', dateTime: '1990-07-07T13:02' },
      { name: '입추', dateTime: '1990-08-07T22:54' },
      { name: '백로', dateTime: '1990-09-08T01:28' },
      { name: '한로', dateTime: '1990-10-08T17:14' },
      { name: '입동', dateTime: '1990-11-07T19:57' },
      { name: '대설', dateTime: '1990-12-07T12:41' },
    ]
  },
  {
    year: 1999,
    terms: [
      { name: '소한', dateTime: '1999-01-06T03:00' },
      { name: '입춘', dateTime: '1999-02-04T08:57' },
      { name: '경칩', dateTime: '1999-03-06T02:58' },
      { name: '청명', dateTime: '1999-04-05T08:02' },
      { name: '입하', dateTime: '1999-05-06T01:15' },
      { name: '망종', dateTime: '1999-06-06T05:24' },
      { name: '소서', dateTime: '1999-07-07T15:58' },
      { name: '입추', dateTime: '1999-08-08T01:51' },
      { name: '백로', dateTime: '1999-09-08T04:17' },
      { name: '한로', dateTime: '1999-10-08T19:52' },
      { name: '입동', dateTime: '1999-11-07T22:36' },
      { name: '대설', dateTime: '1999-12-07T15:18' },
    ]
  },
  {
    year: 2000,
    terms: [
      { name: '소한', dateTime: '2000-01-06T09:24' },
      { name: '입춘', dateTime: '2000-02-04T15:14' },
      { name: '경칩', dateTime: '2000-03-05T09:07' },
      { name: '청명', dateTime: '2000-04-04T14:07' },
      { name: '입하', dateTime: '2000-05-05T07:30' },
      { name: '망종', dateTime: '2000-06-05T11:49' },
      { name: '소서', dateTime: '2000-07-06T22:17' },
      { name: '입추', dateTime: '2000-08-07T08:07' },
      { name: '백로', dateTime: '2000-09-07T10:27' },
      { name: '한로', dateTime: '2000-10-08T01:59' },
      { name: '입동', dateTime: '2000-11-07T04:37' },
      { name: '대설', dateTime: '2000-12-06T21:25' },
    ]
  },
  {
    year: 2023,
    terms: [
      { name: '소한', dateTime: '2023-01-05T23:05' },
      { name: '입춘', dateTime: '2023-02-04T04:43' },
      { name: '경칩', dateTime: '2023-03-05T22:36' },
      { name: '청명', dateTime: '2023-04-05T03:13' },
      { name: '입하', dateTime: '2023-05-05T20:19' },
      { name: '망종', dateTime: '2023-06-06T00:18' },
      { name: '소서', dateTime: '2023-07-07T10:31' },
      { name: '입추', dateTime: '2023-08-07T20:23' },
      { name: '백로', dateTime: '2023-09-07T23:27' },
      { name: '한로', dateTime: '2023-10-08T15:16' },
      { name: '입동', dateTime: '2023-11-07T18:36' },
      { name: '대설', dateTime: '2023-12-07T11:33' },
    ]
  },
  {
    year: 2024,
    terms: [
      { name: '소한', dateTime: '2024-01-06T04:49' },
      { name: '입춘', dateTime: '2024-02-04T10:27' },
      { name: '경칩', dateTime: '2024-03-05T04:23' },
      { name: '청명', dateTime: '2024-04-04T09:02' },
      { name: '입하', dateTime: '2024-05-05T02:10' },
      { name: '망종', dateTime: '2024-06-05T06:10' },
      { name: '소서', dateTime: '2024-07-06T16:20' },
      { name: '입추', dateTime: '2024-08-07T02:09' },
      { name: '백로', dateTime: '2024-09-07T05:12' },
      { name: '한로', dateTime: '2024-10-08T03:00' },
      { name: '입동', dateTime: '2024-11-07T06:20' },
      { name: '대설', dateTime: '2024-12-06T23:17' },
    ]
  },
  {
    year: 2025,
    terms: [
      { name: '소한', dateTime: '2025-01-05T10:33' },
      { name: '입춘', dateTime: '2025-02-03T16:10' },
      { name: '경칩', dateTime: '2025-03-05T10:07' },
      { name: '청명', dateTime: '2025-04-04T15:02' },
      { name: '입하', dateTime: '2025-05-05T08:09' },
      { name: '망종', dateTime: '2025-06-05T12:56' },
      { name: '소서', dateTime: '2025-07-06T22:05' },
      { name: '입추', dateTime: '2025-08-07T07:52' },
      { name: '백로', dateTime: '2025-09-07T10:52' },
      { name: '한로', dateTime: '2025-10-08T02:41' },
      { name: '입동', dateTime: '2025-11-07T06:04' },
      { name: '대설', dateTime: '2025-12-07T04:53' },
    ]
  },
]

/**
 * 특정 연도의 절기 데이터를 조회합니다.
 */
export function getSolarTermsForYear(year: number): YearSolarTerms | undefined {
  return SOLAR_TERMS_DATA.find(d => d.year === year)
}

/**
 * 특정 연도의 특정 절기 시각을 조회합니다.
 */
export function getSolarTermDateTime(year: number, termName: string): Date | null {
  const yearData = getSolarTermsForYear(year)
  if (!yearData) return null

  const term = yearData.terms.find(t => t.name === termName)
  if (!term) return null

  return new Date(term.dateTime + ':00+09:00')
}