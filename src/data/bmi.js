// BMI helpers. Height in cm, weight in kg.

export function calcBmi(weightKg, heightCm) {
  const w = Number(weightKg)
  const h = Number(heightCm)
  if (!w || !h) return null
  const m = h / 100
  return w / (m * m)
}

export function bmiCategory(bmi) {
  if (bmi == null || Number.isNaN(bmi)) return null
  if (bmi < 18.5) return { key: 'under',  label: 'תת-משקל',    color: '#4299E1' }
  if (bmi < 25)   return { key: 'normal', label: 'משקל תקין',  color: '#48BB78' }
  if (bmi < 30)   return { key: 'over',   label: 'עודף משקל',  color: '#D69E2E' }
  return                    { key: 'obese',  label: 'השמנה',     color: '#F56565' }
}

export function formatBmi(bmi) {
  if (bmi == null || Number.isNaN(bmi)) return '—'
  return bmi.toFixed(1)
}
