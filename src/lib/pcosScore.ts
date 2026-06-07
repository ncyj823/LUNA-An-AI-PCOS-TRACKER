function checkCycleIrregularity(cycles: any[]): number {
  if (cycles.length === 0) return 0

  const lengths = cycles.map(cycle => cycle.cycle_length).filter(Boolean) as number[]

  if (lengths.length === 0) return 0

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length

  let score = 0
  if (avg > 35) score += 25

  const max = Math.max(...lengths)
  const min = Math.min(...lengths)
  if (max - min > 7) score += 10

  return score
}

function checkFacialHair(logs: any[]): number {
  if (logs.length === 0) return 0

  const total = logs.length
  const severeCount = logs.filter(log => log.facial_hair === 'severe').length
  const moderateCount = logs.filter(log => log.facial_hair === 'moderate').length
  const mildCount = logs.filter(log => log.facial_hair === 'mild').length

  let score = 0

  if (severeCount / total > 0.3) score += 20
  if (moderateCount / total > 0.3) score += 15
  if (mildCount / total > 0.3) score += 8

  return score
}

function checkAcne(logs: any[]): number {
  if (logs.length === 0) return 0

  const total = logs.length
  const acneCount = logs.filter(log => log.skin_condition === 'acne').length

  return acneCount / total > 0.4 ? 15 : 0
}

function checkMood(logs: any[]): number {
  if (logs.length === 0) return 0

  const total = logs.length
  const moodCount = logs.filter(log => ['irritable', 'depressed', 'anxious'].includes(log.mood)).length

  return moodCount / total > 0.5 ? 10 : 0
}

function checkSpotting(logs: any[]): number {
  if (logs.length === 0) return 0

  const total = logs.length
  const spottingCount = logs.filter(log => log.spotting === true).length

  return spottingCount / total > 0.2 ? 10 : 0
}

function checkBloodClotting(logs: any[]): number {
  if (logs.length === 0) return 0

  const total = logs.length
  const clottingCount = logs.filter(log => log.blood_clotting === true).length

  return clottingCount / total > 0.2 ? 10 : 0
}

export function calculatePCOSScore(logs: any[], cycles: any[]): number {
  let score = 0

  score += checkCycleIrregularity(cycles)
  score += checkFacialHair(logs)
  score += checkAcne(logs)
  score += checkMood(logs)
  score += checkSpotting(logs)
  score += checkBloodClotting(logs)

  return Math.min(score, 100)
}

export function getPCOSRiskLevel(score: number): 'low' | 'moderate' | 'high' {
  if (score < 30) return 'low'
  if (score < 60) return 'moderate'
  return 'high'
}

export { checkCycleIrregularity, checkFacialHair, checkAcne, checkMood, checkSpotting, checkBloodClotting }