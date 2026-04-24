import React, { useState, useMemo } from 'react'
import { useLocalStorage, todayKey, daysBetween } from '../hooks/useLocalStorage'
import { calcBmi, bmiCategory, formatBmi } from '../data/bmi'
import { CalendarIcon, DnaIcon, TargetIcon, TrophyIcon } from '../icons'

function sortWeights(list) {
  return [...list].sort((a, b) => a.date.localeCompare(b.date))
}

function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

export default function Profile({ startDate, gender, name, currentWeek, onNavigate, onEditProfile }) {
  const [height] = useLocalStorage('height', null)
  const [weights, setWeights] = useLocalStorage('weights', [])
  const [newDate, setNewDate] = useState(todayKey())
  const [newValue, setNewValue] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const sorted = useMemo(() => sortWeights(weights), [weights])
  const latest = sorted[sorted.length - 1]
  const first = sorted[0]
  const delta = latest && first ? latest.value - first.value : 0
  const bmi = latest && height ? calcBmi(latest.value, height) : null
  const cat = bmi != null ? bmiCategory(bmi) : null

  const totalDays = startDate ? daysBetween(startDate) + 1 : 0

  const addWeight = () => {
    const v = Number(newValue)
    if (!v || v < 25 || v > 300) return
    const next = [...weights.filter(w => w.date !== newDate), { date: newDate, value: v }]
    setWeights(next)
    setNewValue('')
    setShowAdd(false)
  }

  const removeEntry = (date) => {
    setWeights(weights.filter(w => w.date !== date))
  }

  return (
    <div className="view">
      <div className="profile-header">
        <button className="link-btn profile-back" onClick={() => onNavigate('home')}>→ חזרה</button>
        <h2>{name ? `הפרופיל של ${name}` : 'הפרופיל שלי'}</h2>
        <button className="link-btn" onClick={onEditProfile}>ערוך</button>
      </div>

      <div className="profile-hero">
        <div className="profile-hero-main">
          <div className="profile-hero-label">BMI</div>
          <div className="profile-hero-value">{formatBmi(bmi)}</div>
          {cat && <span className="bmi-pill" style={{ background: cat.color }}>{cat.label}</span>}
        </div>
        <div className="profile-hero-side">
          <div className="profile-side-row">
            <span className="profile-side-k">משקל נוכחי</span>
            <span className="profile-side-v">{latest ? `${latest.value} ק"ג` : '—'}</span>
          </div>
          <div className="profile-side-row">
            <span className="profile-side-k">שינוי מאז ההתחלה</span>
            <span className="profile-side-v" style={{ color: delta < 0 ? '#48BB78' : delta > 0 ? '#F56565' : 'inherit' }}>
              {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} ק"ג`}
            </span>
          </div>
          <div className="profile-side-row">
            <span className="profile-side-k">גובה</span>
            <span className="profile-side-v">{height ? `${height} ס"מ` : '—'}</span>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{currentWeek}</div>
          <div className="stat-label">שבוע</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalDays}</div>
          <div className="stat-label">ימים במסע</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{sorted.length}</div>
          <div className="stat-label">מדידות</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title card-title-with-icon">
          <DnaIcon size={22} /> פרטים אישיים
        </h3>
        <div className="summary-grid">
          {name && (
            <div className="summary-row">
              <span className="summary-k">שם</span>
              <span className="summary-v">{name}</span>
            </div>
          )}
          <div className="summary-row">
            <span className="summary-k">מגדר</span>
            <span className="summary-v">{gender === 'male' ? 'זכר' : 'נקבה'}</span>
          </div>
          <div className="summary-row">
            <span className="summary-k">תאריך התחלה</span>
            <span className="summary-v">{startDate ? formatDate(startDate) : '—'}</span>
          </div>
          <div className="summary-row">
            <span className="summary-k">גובה</span>
            <span className="summary-v">{height ? `${height} ס"מ` : '—'}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="space-between" style={{ marginBottom: 10 }}>
          <h3 className="card-title card-title-with-icon" style={{ margin: 0 }}>
            <TargetIcon size={22} /> מעקב משקל
          </h3>
          <button className="link-btn" onClick={() => setShowAdd(v => !v)}>
            {showAdd ? 'סגור' : '+ הוסף מדידה'}
          </button>
        </div>

        {showAdd && (
          <div className="weight-add">
            <label className="wizard-label">תאריך</label>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              max={todayKey()}
            />
            <label className="wizard-label">משקל (ק"ג)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="25"
              max="300"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="לדוגמה: 72.5"
            />
            <button className="btn-primary" onClick={addWeight}>שמור</button>
          </div>
        )}

        <WeightChart data={sorted} />

        {sorted.length === 0 ? (
          <p className="muted" style={{ marginTop: 10 }}>עדיין אין מדידות. הוסיפו את המשקל הראשון.</p>
        ) : (
          <ul className="weight-list">
            {[...sorted].reverse().map((w, i) => {
              const prev = sorted[sorted.length - 1 - i - 1]
              const d = prev ? w.value - prev.value : 0
              return (
                <li key={w.date} className="weight-list-row">
                  <span className="weight-date">{formatDate(w.date)}</span>
                  <span className="weight-value">{w.value} ק"ג</span>
                  <span className="weight-delta" style={{ color: d < 0 ? '#48BB78' : d > 0 ? '#F56565' : 'var(--gray-500)' }}>
                    {prev ? `${d > 0 ? '+' : ''}${d.toFixed(1)}` : '—'}
                  </span>
                  <button className="weight-remove" onClick={() => removeEntry(w.date)} aria-label="הסר">×</button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {sorted.length >= 2 && (
        <div className="card">
          <h3 className="card-title card-title-with-icon">
            <TrophyIcon size={22} /> סיכום
          </h3>
          <div className="summary-grid">
            <div className="summary-row">
              <span className="summary-k">משקל התחלתי</span>
              <span className="summary-v">{first.value} ק"ג</span>
            </div>
            <div className="summary-row">
              <span className="summary-k">משקל נוכחי</span>
              <span className="summary-v">{latest.value} ק"ג</span>
            </div>
            <div className="summary-row">
              <span className="summary-k">שינוי כולל</span>
              <span className="summary-v" style={{ color: delta < 0 ? '#48BB78' : delta > 0 ? '#F56565' : 'inherit' }}>
                {delta > 0 ? '+' : ''}{delta.toFixed(1)} ק"ג
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WeightChart({ data }) {
  if (!data || data.length === 0) return null

  const W = 600
  const H = 220
  const padL = 40
  const padR = 12
  const padT = 16
  const padB = 28

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const yMin = min - range * 0.15
  const yMax = max + range * 0.15
  const yRange = yMax - yMin || 1

  const xs = data.map((d, i) => padL + (i * (W - padL - padR)) / Math.max(1, data.length - 1))
  const ys = data.map(d => padT + ((yMax - d.value) * (H - padT - padB)) / yRange)

  const path = data.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ')
  const areaPath = `${path} L ${xs[xs.length - 1]} ${H - padB} L ${xs[0]} ${H - padB} Z`

  const yTicks = 4
  const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (yRange * i) / yTicks)

  return (
    <div className="weight-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="weight-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#0070EA" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0070EA" stopOpacity="0" />
          </linearGradient>
        </defs>

        {tickVals.map((v, i) => {
          const y = padT + ((yMax - v) * (H - padT - padB)) / yRange
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#718096">
                {v.toFixed(1)}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#weightFill)" />
        <path d={path} fill="none" stroke="#0070EA" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <g key={d.date}>
            <circle cx={xs[i]} cy={ys[i]} r="4" fill="#0070EA" stroke="white" strokeWidth="2" />
          </g>
        ))}

        {data.length <= 8 && data.map((d, i) => (
          <text
            key={`lbl-${d.date}`}
            x={xs[i]}
            y={H - padB + 16}
            textAnchor="middle"
            fontSize="10"
            fill="#718096"
          >
            {formatDate(d.date)}
          </text>
        ))}
      </svg>
    </div>
  )
}
