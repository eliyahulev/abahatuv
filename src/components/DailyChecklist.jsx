import React from 'react'
import { CheckMarkIcon } from '../icons'
import { todayKey } from '../hooks/useLocalStorage'
import { useUserMapEntry } from '../hooks/useUserData'
import { getTasksForWeek } from '../lib/weekTasks'

export default function DailyChecklist({ weekNumber }) {
  const date = todayKey()
  const [done, setDone] = useUserMapEntry('tasks', date, {})
  const tasks = getTasksForWeek(weekNumber)

  const toggle = (id) => {
    setDone(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = tasks.filter(t => done[t.id]).length

  return (
    <div className="card">
      <div className="space-between" style={{ marginBottom: 10 }}>
        <h3 className="card-title" style={{ margin: 0 }}>
          משימות היום
        </h3>
        <span className="badge">{completedCount}/{tasks.length}</span>
      </div>
      <ul className="task-list">
        {tasks.map(t => (
          <li
            key={t.id}
            className={`task-item ${done[t.id] ? 'done' : ''}`}
            onClick={() => toggle(t.id)}
          >
            <div className="task-check">
              {done[t.id] && <CheckMarkIcon size={14} />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="task-text">{t.short}</div>
              {t.long && <div className="task-details">{t.long}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
