import React from 'react'
import { weeks } from '../data/weeks'
import { WeekIcon, SparklesIcon, TargetIcon } from '../icons'

export default function NewWeekModal({ weekNumber, onDismiss, onOpenWeeks }) {
  const week = weeks.find(w => w.number === weekNumber)
  if (!week) return null

  const previewTasks = (week.missionTasks || []).slice(0, 3)

  return (
    <div className="new-week-backdrop" role="dialog" aria-modal="true">
      <div className="new-week-card">
        <div className="new-week-burst" aria-hidden>
          <SparklesIcon size={18} />
          <span>שבוע חדש נפתח!</span>
          <SparklesIcon size={18} />
        </div>

        <div className="new-week-hero">
          <div className="new-week-icon"><WeekIcon name={week.icon} size={42} /></div>
          <div>
            <div className="new-week-num">שבוע {week.number}</div>
            <h2 className="new-week-title">{week.title}</h2>
            <div className="new-week-theme">{week.theme}</div>
          </div>
        </div>

        {previewTasks.length > 0 && (
          <div className="new-week-tasks">
            <div className="new-week-tasks-head">
              <TargetIcon size={16} />
              <span>המשימות שלך השבוע</span>
            </div>
            <ul>
              {previewTasks.map(t => (
                <li key={t.id}>{t.short}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="new-week-actions">
          {onOpenWeeks && (
            <button className="btn-secondary" onClick={onOpenWeeks}>
              לפרטי השבוע
            </button>
          )}
          <button className="btn-primary" onClick={onDismiss}>
            יאללה, מתחילים!
          </button>
        </div>
      </div>
    </div>
  )
}
