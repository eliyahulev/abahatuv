import React, { useEffect, useRef, useState } from 'react'
import { trainingGoals, trainingPrinciples, trainingPlans, trainingPlanOrder } from '../data/training'
import { ViewTitle, TrophyIcon, TargetIcon, LightbulbIcon, CheckMarkIcon, DumbbellIcon } from '../icons'
import { useUserField } from '../hooks/useUserData'

const todayKey = () => new Date().toISOString().slice(0, 10)

export default function Training() {
  const [planId, setPlanId] = useUserField('trainingPlan', 'weights-3')
  const [workoutTicks, setWorkoutTicks] = useUserField('workoutTicks', {})
  const [runningLog, setRunningLog] = useUserField('runningLog', [])
  const [openWorkoutIdx, setOpenWorkoutIdx] = useState(0)
  const plan = trainingPlans[planId] || trainingPlans['weights-3']

  const today = todayKey()
  const todayMap = (workoutTicks && workoutTicks[today]) || {}

  const ticksFor = (workoutIdx) =>
    todayMap[`${planId}-${workoutIdx}`] || []

  const toggleTick = (workoutIdx, exIdx) => {
    setWorkoutTicks((prev) => {
      const all = { ...(prev || {}) }
      const day = { ...(all[today] || {}) }
      const key = `${planId}-${workoutIdx}`
      const list = day[key] || []
      day[key] = list.includes(exIdx)
        ? list.filter((i) => i !== exIdx)
        : [...list, exIdx].sort((a, b) => a - b)
      if (day[key].length === 0) delete day[key]
      all[today] = day
      return all
    })
  }

  const resetWorkout = (workoutIdx) => {
    setWorkoutTicks((prev) => {
      const all = { ...(prev || {}) }
      const day = { ...(all[today] || {}) }
      delete day[`${planId}-${workoutIdx}`]
      all[today] = day
      return all
    })
  }

  return (
    <div className="view">
      <ViewTitle Icon={TrophyIcon}>אימוני כוח</ViewTitle>

      <div className="card training-plan-info" role="note">
        <p className="training-plan-info-body">
          <strong>בחרו תוכנית אחת מהרשימה למטה</strong> והמשיכו איתה עד הסוף — אל תחליפו באמצע בין תוכניות.
        </p>
      </div>

      <div className="card training-goals">
        <h3 className="card-title card-title-with-icon">
          <TargetIcon size={20} /> מטרות אימוני הכושר
        </h3>
        <ol className="training-goal-list">
          {trainingGoals.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ol>
      </div>

      <PlanDropdown
        value={planId}
        options={trainingPlanOrder.map((id) => trainingPlans[id])}
        onChange={(id) => {
          setPlanId(id)
          setOpenWorkoutIdx(0)
        }}
      />

      <div className="card plan-summary-card">
        <h3 className="card-title" style={{ margin: 0 }}>{plan.title}</h3>
        <p className="muted" style={{ margin: '6px 0 0' }}>{plan.summary}</p>
      </div>

      <div className="workout-list">
        {plan.workouts.map((w, idx) => {
          const isOpen = openWorkoutIdx === idx
          const ticks = ticksFor(idx)
          const total = w.exercises.length
          const done = ticks.length
          const pct = total ? Math.round((done / total) * 100) : 0
          const isComplete = total > 0 && done === total
          return (
            <div
              key={`${plan.id}-${idx}`}
              className={`workout-card ${isOpen ? 'open' : ''} ${isComplete ? 'complete' : ''}`}
            >
              <button
                type="button"
                className="workout-head"
                onClick={() => setOpenWorkoutIdx(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
              >
                <span className="workout-name">{w.name}</span>
                <span className="workout-meta">
                  {done}/{total}
                </span>
                <span className={`workout-chev ${isOpen ? 'open' : ''}`} aria-hidden>▾</span>
              </button>
              {isOpen && (
                <>
                  <div className="workout-progress" aria-hidden>
                    <div
                      className={`workout-progress-bar ${isComplete ? 'complete' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="workout-progress-meta">
                    <span>{done} מתוך {total} הושלמו היום</span>
                    {done > 0 && (
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => resetWorkout(idx)}
                      >
                        איפוס
                      </button>
                    )}
                  </div>
                  <ul className="exercise-list">
                    {w.exercises.map((e, i) => {
                      const checked = ticks.includes(i)
                      return (
                        <li key={i} className={`exercise-row ${checked ? 'is-done' : ''}`}>
                          <button
                            type="button"
                            className={`exercise-check ${checked ? 'checked' : ''}`}
                            onClick={() => toggleTick(idx, i)}
                            aria-label={checked ? 'בטל סימון' : 'סמן הושלם'}
                            aria-pressed={checked}
                          >
                            {checked && <CheckMarkIcon size={14} />}
                          </button>
                          <div className="exercise-name">{e.name}</div>
                          <div className="exercise-nums">
                            <span className="exercise-sets">{e.sets}</span>
                            <span className="exercise-sep">·</span>
                            <span className="exercise-reps">{e.reps}</span>
                          </div>
                          {e.notes && <div className="exercise-notes">{e.notes}</div>}
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          )
        })}
      </div>

      <RunningLog
        log={runningLog || []}
        onAdd={(entry) =>
          setRunningLog((prev) => [{ id: Date.now(), ...entry }, ...(prev || [])])
        }
        onRemove={(id) =>
          setRunningLog((prev) => (prev || []).filter((r) => r.id !== id))
        }
      />

      <div className="card">
        <h3 className="card-title card-title-with-icon">
          <LightbulbIcon size={22} /> עקרונות התוכנית
        </h3>
        <ol className="principles-list">
          {trainingPrinciples.map((p, i) => (
            <li key={i}>
              <div className="principle-title">{p.title}</div>
              <div className="principle-body">{p.body}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function PlanDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find((o) => o.id === value) || options[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      className={`plan-dd ${open ? 'open' : ''} ${value === 'miluim' ? 'is-miluim' : ''}`}
      ref={ref}
    >
      <button
        type="button"
        className="plan-dd-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="plan-dd-label">{current?.title}</span>
        <span className="plan-dd-chev" aria-hidden>▾</span>
      </button>
      {open && (
        <ul className="plan-dd-list" role="listbox">
          {options.map((o) => {
            const isSelected = o.id === value
            return (
              <li
                key={o.id}
                role="option"
                aria-selected={isSelected}
                className={`plan-dd-opt ${o.id === 'miluim' ? 'opt-miluim' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => { onChange(o.id); setOpen(false) }}
              >
                <span className="plan-dd-opt-title">{o.title}</span>
                {isSelected && <span className="plan-dd-opt-check" aria-hidden>✓</span>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function RunningLog({ log, onAdd, onRemove }) {
  const [date, setDate] = useState(todayKey())
  const [distance, setDistance] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [notes, setNotes] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const distanceKm = parseFloat(distance)
    const durationSec =
      (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0)
    if (!distanceKm || distanceKm <= 0 || durationSec <= 0) return
    onAdd({
      date,
      distanceKm: +distanceKm.toFixed(2),
      durationSec,
      notes: notes.trim() || undefined,
    })
    setDistance('')
    setMinutes('')
    setSeconds('')
    setNotes('')
    setDate(todayKey())
  }

  const sorted = [...log].sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  )

  const totalKm = sorted.reduce((s, r) => s + (r.distanceKm || 0), 0)
  const totalSec = sorted.reduce((s, r) => s + (r.durationSec || 0), 0)

  return (
    <div className="card running-log">
      <h3 className="card-title card-title-with-icon">
        <DumbbellIcon size={20} /> יומן ריצה
      </h3>

      <form className="running-log-form" onSubmit={submit}>
        <div className="running-log-form-row">
          <label className="running-log-field">
            <span className="running-log-form-k">תאריך</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label className="running-log-field">
            <span className="running-log-form-k">מרחק (ק"מ)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="5.0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="running-log-form-row">
          <label className="running-log-field">
            <span className="running-log-form-k">דקות</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="30"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>
          <label className="running-log-field">
            <span className="running-log-form-k">שניות</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="59"
              placeholder="00"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </label>
        </div>
        <input
          type="text"
          className="running-log-notes-input"
          placeholder="הערות (אופציונלי)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit" className="btn-primary">הוסף ריצה</button>
      </form>

      {sorted.length === 0 ? (
        <p className="muted" style={{ marginTop: 14 }}>עוד לא נוספו ריצות</p>
      ) : (
        <>
          <div className="running-log-totals">
            <span>סה״כ {sorted.length} ריצות</span>
            <span>·</span>
            <span>{totalKm.toFixed(1)} ק״מ</span>
            <span>·</span>
            <span>{formatDuration(totalSec)}</span>
          </div>
          <ul className="running-log-list">
            {sorted.map((r) => (
              <RunningLogRow key={r.id} run={r} onRemove={() => onRemove(r.id)} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function RunningLogRow({ run, onRemove }) {
  const time = formatDuration(run.durationSec)
  const pace = run.distanceKm > 0
    ? formatDuration(Math.round(run.durationSec / run.distanceKm))
    : '—'
  return (
    <li className="running-log-row">
      <div className="running-log-row-head">
        <span className="running-log-date">
          {new Date(run.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <button type="button" className="link-btn" onClick={onRemove}>מחק</button>
      </div>
      <div className="running-log-row-stats">
        <div className="running-log-stat">
          <div className="running-log-stat-k">מרחק</div>
          <div className="running-log-stat-v">{run.distanceKm} ק"מ</div>
        </div>
        <div className="running-log-stat">
          <div className="running-log-stat-k">זמן</div>
          <div className="running-log-stat-v">{time}</div>
        </div>
        <div className="running-log-stat">
          <div className="running-log-stat-k">קצב</div>
          <div className="running-log-stat-v">{pace} /ק"מ</div>
        </div>
      </div>
      {run.notes && <div className="running-log-row-notes">{run.notes}</div>}
    </li>
  )
}

function formatDuration(totalSec) {
  if (!totalSec || totalSec < 0) return '0:00'
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
