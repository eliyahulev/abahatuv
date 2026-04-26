import React, { useState } from 'react'
import InstallAppButton from './InstallAppButton'
import { SparklesIcon } from '../icons'
import { todayKey } from '../hooks/useLocalStorage'
import { calcBmi, bmiCategory, formatBmi } from '../data/bmi'

const STEPS = [
  { id: 'name',   label: 'שם' },
  { id: 'gender', label: 'מגדר' },
  { id: 'body',   label: 'גובה ומשקל' },
  { id: 'date',   label: 'תאריך התחלה' },
  { id: 'review', label: 'סיכום' }
]

export default function OnboardingWizard({ initial, onSave, onClose }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [name, setName] = useState(initial?.name || '')
  const [gender, setGender] = useState(initial?.gender || 'male')
  const [height, setHeight] = useState(initial?.height ? String(initial.height) : '')
  const [weight, setWeight] = useState(initial?.weight ? String(initial.weight) : '')
  const [date, setDate] = useState(initial?.date || todayKey())

  const step = STEPS[stepIdx]
  const isLast = stepIdx === STEPS.length - 1

  const trimmedName = name.trim()
  const heightNum = Number(height)
  const weightNum = Number(weight)
  const heightOk = heightNum >= 100 && heightNum <= 230
  const weightOk = weightNum >= 25 && weightNum <= 300
  const bmi = calcBmi(weightNum, heightNum)
  const cat = bmiCategory(bmi)

  const canProceed = (() => {
    if (step.id === 'name')   return trimmedName.length >= 2
    if (step.id === 'gender') return !!gender
    if (step.id === 'body')   return heightOk && weightOk
    if (step.id === 'date')   return !!date
    return true
  })()

  const next = () => {
    if (!canProceed) return
    if (isLast) {
      onSave({ date, gender, height: heightNum, weight: weightNum, name: trimmedName })
    } else {
      setStepIdx(i => i + 1)
    }
  }
  const back = () => setStepIdx(i => Math.max(0, i - 1))

  return (
    <div className="app">
      <InstallAppButton className="install-app-btn-onboarding" />
      <div className="onboarding onboarding-wizard">
        <div className="onboarding-icon-wrap"><SparklesIcon size={52} /></div>
        <h1>ברוך הבא למילופיט</h1>

        <div className="wizard-progress" aria-hidden>
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`wizard-dot ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}
            />
          ))}
        </div>
        <div className="wizard-step-label">שלב {stepIdx + 1}/{STEPS.length} · {step.label}</div>

        {step.id === 'name' && (
          <div className="wizard-panel">
            <p className="wizard-question">איך קוראים לך?</p>
            <label className="wizard-label">שם</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="לדוגמה: דנה"
              maxLength={40}
              autoFocus
            />
            {name && !canProceed && (
              <div className="wizard-hint">יש להזין לפחות 2 תווים</div>
            )}
          </div>
        )}

        {step.id === 'gender' && (
          <div className="wizard-panel">
            <p className="wizard-question">
              {trimmedName ? `${trimmedName}, איך לפנות אליך?` : 'איך לפנות אליך?'}
            </p>
            <div className="gender-picker">
              <button
                type="button"
                className={`gender-option ${gender === 'female' ? 'active' : ''}`}
                onClick={() => setGender('female')}
              >
                <span className="gender-emoji" aria-hidden>👩</span>
                <span>נקבה</span>
              </button>
              <button
                type="button"
                className={`gender-option ${gender === 'male' ? 'active' : ''}`}
                onClick={() => setGender('male')}
              >
                <span className="gender-emoji" aria-hidden>👨</span>
                <span>זכר</span>
              </button>
            </div>
          </div>
        )}

        {step.id === 'body' && (
          <div className="wizard-panel">
            <p className="wizard-question">ספר/י על עצמך</p>
            <label className="wizard-label">גובה (ס"מ)</label>
            <input
              type="number"
              inputMode="numeric"
              min="100"
              max="230"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="לדוגמה: 170"
            />
            <label className="wizard-label">משקל נוכחי (ק"ג)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="25"
              max="300"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="לדוגמה: 72"
            />
            {(height || weight) && !canProceed && (
              <div className="wizard-hint">מלא/י גובה 100–230 ס"מ ומשקל 25–300 ק"ג</div>
            )}
          </div>
        )}

        {step.id === 'date' && (
          <div className="wizard-panel">
            <p className="wizard-question">מתי התחלת?</p>
            <label className="wizard-label">תאריך התחלה</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={todayKey()}
            />
          </div>
        )}

        {step.id === 'review' && (
          <div className="wizard-panel">
            <p className="wizard-question">
              {trimmedName ? `${trimmedName}, הכל מוכן — לבדיקה אחרונה` : 'הכל מוכן — לבדיקה אחרונה'}
            </p>
            <div className="summary-grid">
              <div className="summary-row">
                <span className="summary-k">שם</span>
                <span className="summary-v">{trimmedName}</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">מגדר</span>
                <span className="summary-v">{gender === 'male' ? 'זכר' : 'נקבה'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">גובה</span>
                <span className="summary-v">{heightNum} ס"מ</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">משקל</span>
                <span className="summary-v">{weightNum} ק"ג</span>
              </div>
              <div className="summary-row">
                <span className="summary-k">תאריך התחלה</span>
                <span className="summary-v">{date}</span>
              </div>
              {bmi != null && cat && (
                <div className="summary-row bmi-row">
                  <span className="summary-k">BMI</span>
                  <span className="summary-v">
                    <strong>{formatBmi(bmi)}</strong>
                    <span className="bmi-pill" style={{ background: cat.color }}>{cat.label}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="wizard-nav">
          {stepIdx > 0 && (
            <button className="btn-secondary" onClick={back}>הקודם</button>
          )}
          <button className="btn-primary" onClick={next} disabled={!canProceed}>
            {isLast ? (initial?.date ? 'עדכן' : 'התחל!') : 'הבא'}
          </button>
        </div>
        {onClose && (
          <button className="link-btn" style={{ marginTop: 12 }} onClick={onClose}>
            ביטול
          </button>
        )}
      </div>
    </div>
  )
}
