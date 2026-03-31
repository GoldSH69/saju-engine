import { calculateStrength } from './strengthScore'

const result = calculateStrength('甲', '丙', '甲', '甲', '子', '寅', '午', '子')
console.log('=== 전체 키 ===')
console.log(Object.keys(result))
console.log('')
console.log('=== strength 값 ===')
console.log((result as any).strength)
console.log('')
console.log('=== strengthLevel 값 ===')
console.log((result as any).strengthLevel)
console.log('')
console.log('=== details 첫 항목 ===')
const details = (result as any).details
if (details && details.length > 0) {
  console.log(JSON.stringify(details[0], null, 2))
  console.log('details 키:', Object.keys(details[0]))
}
console.log('')
console.log('=== 전체 결과 ===')
console.log(JSON.stringify(result, null, 2))
