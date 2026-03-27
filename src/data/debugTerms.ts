/**
 * 문제 연도 절기 디버그
 */
import * as Astronomy from 'astronomy-engine';

function debugSolarTerm(year: number, targetLongitude: number, termName: string) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🔍 ${year}년 ${termName} (목표 황경: ${targetLongitude}°)`);
  console.log('='.repeat(50));

  // 여러 시작점에서 검색해서 비교
  const searchStarts = [
    new Date(Date.UTC(year - 1, 11, 1)),  // 전년 12월 1일
    new Date(Date.UTC(year, 0, 1)),        // 1월 1일
    new Date(Date.UTC(year, 0, 15)),       // 1월 15일
    new Date(Date.UTC(year, 0, 25)),       // 1월 25일
  ];

  for (const startDate of searchStarts) {
    const astroTime = Astronomy.MakeTime(startDate);
    const result = Astronomy.SearchSunLongitude(targetLongitude, astroTime, 365);

    if (result) {
      const utcDate = result.date;
      const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

      console.log(`\n  검색 시작: ${startDate.toISOString().slice(0, 10)}`);
      console.log(`  UTC 결과: ${utcDate.toISOString()}`);
      console.log(`  KST 결과: ${kstDate.getUTCFullYear()}-${String(kstDate.getUTCMonth()+1).padStart(2,'0')}-${String(kstDate.getUTCDate()).padStart(2,'0')} ${String(kstDate.getUTCHours()).padStart(2,'0')}:${String(kstDate.getUTCMinutes()).padStart(2,'0')}`);

      // 해당 시점의 실제 태양 황경 확인
      const sunPos = Astronomy.SunPosition(result);
      console.log(`  실제 황경: ${sunPos.elon.toFixed(6)}°`);
    } else {
      console.log(`\n  검색 시작: ${startDate.toISOString().slice(0, 10)} → ❌ 못 찾음`);
    }
  }
}

// 문제 연도 디버그
debugSolarTerm(1990, 315, '입춘');
debugSolarTerm(2000, 315, '입춘');

// 정상 연도 비교용
debugSolarTerm(2024, 315, '입춘');
debugSolarTerm(1985, 315, '입춘');

console.log('\n\n📋 참고: 아래 만세력 사이트에서 교차 확인해주세요');
console.log('   https://astro.kasi.re.kr/life/pageView/8');
console.log('   (한국천문연구원 - 절기 시각표)');