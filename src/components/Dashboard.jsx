import React, { useState } from 'react'
import { weeks } from '../data/weeks'
import { WeekIcon, ClockIcon, ShakeIcon, CalendarIcon, SparklesIcon } from '../icons'
import { WaterWidget, formatLiters } from './WaterTracker'
import DailyChecklist, { getTasksForWeek } from './DailyChecklist'
import { useLocalStorage, todayKey, daysBetween } from '../hooks/useLocalStorage'
import { phrasesFor, getPhraseForDay } from '../data/motivation'

function MotivationCard({ gender }) {
  const [phrase, setPhrase] = useState(() => getPhraseForDay(gender, todayKey()))

  // if gender changes, refresh the daily phrase to the correct list
  React.useEffect(() => {
    setPhrase(getPhraseForDay(gender, todayKey()))
  }, [gender])

  const nextPhrase = () => {
    const list = phrasesFor(gender)
    let next = phrase
    while (next === phrase && list.length > 1) {
      next = list[Math.floor(Math.random() * list.length)]
    }
    setPhrase(next)
  }

  const refreshLabel = gender === 'male' ? 'תן לי עוד אחת' : 'תני לי עוד אחת'

  return (
    <div className="motivation-card">
      <div className="motivation-card-head">
        <SparklesIcon size={16} />
        <span>המחשבה של היום</span>
      </div>
      <p className="motivation-card-text">{phrase}</p>
      <button className="motivation-refresh" onClick={nextPhrase}>
        <SparklesIcon size={14} />
        <span>{refreshLabel}</span>
      </button>
    </div>
  )
}

function getStreak(log, goal = 8) {
  // consecutive days ending today (or yesterday) meeting water goal
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const cups = log[key] || 0
    if (cups >= goal) streak++
    else if (i !== 0) break // allow today to not be done yet
  }
  return streak
}

export default function Dashboard({ currentWeek, startDate, gender, onNavigate, onChangeStart }) {
  const [waterLog] = useLocalStorage('waterLog', {})
  const [tasksDone] = useLocalStorage(`tasks:${todayKey()}`, {})

  const week = weeks.find(w => w.number === currentWeek) || weeks[0]
  const dayOfWeek = startDate
    ? (daysBetween(startDate) % 7) + 1
    : 1
  const totalDays = startDate ? daysBetween(startDate) + 1 : 1
  const streak = getStreak(waterLog)

  const weekTasks = getTasksForWeek(currentWeek)
  const doneCount = weekTasks.filter(t => tasksDone[t.id]).length

  return (
    <div className="view">
      <div className="hero-week">
        <div className="big-icon"><WeekIcon name={week.icon} size={52} /></div>
        <div style={{ flex: 1 }}>
          <div className="hero-label">שבוע {week.number} · יום {dayOfWeek}</div>
          <h2>{week.title}</h2>
          <div className="theme">{week.theme}</div>
        </div>
      </div>

      <MotivationCard gender={gender} />

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{formatLiters((waterLog[todayKey()] || 0) * 0.25)}</div>
          <div className="stat-label">ליטר מים</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{doneCount}/{weekTasks.length}</div>
          <div className="stat-label">משימות היום</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{streak}</div>
          <div className="stat-label">ימי רצף</div>
        </div>
      </div>

      <WaterWidget />
      <DailyChecklist weekNumber={currentWeek} />

      {currentWeek >= 6 && (
        <div
          className="card"
          style={{ cursor: 'pointer', background: 'var(--purple-50)' }}
          onClick={() => onNavigate('window')}
        >
          <div className="space-between">
            <h3 className="card-title card-title-with-icon" style={{ margin: 0 }}>
              <ClockIcon size={22} /> חלון אכילה
            </h3>
            <span className="link-btn">פתח ←</span>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            בחר חלון של 8–12 שעות ועקוב אחר הצום.
          </p>
        </div>
      )}

      <div
        className="card"
        style={{ cursor: 'pointer', background: 'linear-gradient(135deg,#68D391,#38A169)', color: 'white' }}
        onClick={() => onNavigate('shake')}
      >
        <div className="space-between">
          <h3 className="card-title card-title-with-icon" style={{ margin: 0, color: 'white' }}>
            <ShakeIcon size={22} /> השייק הלפטיני
          </h3>
          <span style={{ color: 'white' }}>←</span>
        </div>
        <p style={{ marginTop: 8, opacity: 0.95, fontSize: 13 }}>
          המלכים הלפטיניים הגדולים — 4–5 דקות הכנה בלבד.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title card-title-with-icon">
          <CalendarIcon size={22} /> תאריך התחלה
        </h3>
        <p className="muted">{startDate || 'לא הוגדר'} · יום {totalDays}</p>
        <button className="btn-secondary" onClick={onChangeStart}>שנה תאריך התחלה</button>
      </div>
    </div>
  )
}
