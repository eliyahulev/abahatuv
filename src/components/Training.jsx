import React, { useEffect, useRef, useState } from 'react'
import { trainingGoals, trainingPrinciples, trainingPlans, trainingPlanOrder } from '../data/training'
import { ViewTitle, TrophyIcon, TargetIcon, LightbulbIcon, CheckMarkIcon } from '../icons'
import { useUserField } from '../hooks/useUserData'

export default function Training() {
  const [planId, setPlanId] = useUserField('trainingPlan', 'weights-3')
  const [openWorkoutIdx, setOpenWorkoutIdx] = useState(0)
  const plan = trainingPlans[planId] || trainingPlans['weights-3']

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
          return (
            <div key={`${plan.id}-${idx}`} className={`workout-card ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="workout-head"
                onClick={() => setOpenWorkoutIdx(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
              >
                <span className="workout-name">{w.name}</span>
                <span className="workout-meta">{w.exercises.length} תרגילים</span>
                <span className={`workout-chev ${isOpen ? 'open' : ''}`} aria-hidden>▾</span>
              </button>
              {isOpen && (
                <ul className="exercise-list">
                  {w.exercises.map((e, i) => (
                    <li key={i} className="exercise-row">
                      <div className="exercise-name">
                        <span className="exercise-bullet"><CheckMarkIcon size={12} /></span>
                        {e.name}
                      </div>
                      <div className="exercise-nums">
                        <span className="exercise-sets">{e.sets}</span>
                        <span className="exercise-sep">·</span>
                        <span className="exercise-reps">{e.reps}</span>
                      </div>
                      {e.notes && <div className="exercise-notes">{e.notes}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

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
