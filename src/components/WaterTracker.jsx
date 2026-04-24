import React, { useId } from 'react'
import { todayKey } from '../hooks/useLocalStorage'
import { useUserField } from '../hooks/useUserData'
import { ViewTitle, DropletIcon, DropletFilledIcon, WaterBottleIcon, WaterGlassIcon } from '../icons'

export const GOAL_CUPS = 12
export const STRETCH_CUPS = 16
const GOAL_LITERS = GOAL_CUPS * 0.25
const LITERS_PER_CUP = 0.25

function last7Days() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    days.push({ key, label: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][d.getDay()] })
  }
  return days
}

export function formatLiters(n) {
  const t = n.toFixed(1)
  return t.endsWith('.0') ? String(Math.round(n)) : t
}

export function WaterRingSection({
  cups,
  onAddCup,
  onAddBottle,
  onReset,
  compact,
  showReset
}) {
  const uid = useId().replace(/:/g, '')
  const gradId = `water-ring-grad-${uid}`
  const liters = cups * LITERS_PER_CUP
  const pct = Math.min(100, (liters / GOAL_LITERS) * 100)
  const r = 88
  const c = 2 * Math.PI * r
  const dashOffset = c * (1 - pct / 100)

  const ringSize = compact ? 168 : 240
  const vb = 200

  return (
    <div className={compact ? 'water-ring-panel water-ring-panel--compact' : 'water-ring-panel'}>
      <div className="water-ring-wrap">
        <svg
          className="water-ring-svg"
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${vb} ${vb}`}
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0070EA" />
              <stop offset="100%" stopColor="#0059BB" />
            </linearGradient>
          </defs>
          <circle
            className="water-ring-track"
            cx="100"
            cy="100"
            r={r}
            fill="none"
          />
          <circle
            className="water-ring-progress"
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.45s ease' }}
          />
        </svg>
        <div className="water-ring-center">
          <DropletFilledIcon size={compact ? 32 : 40} />
          <div className="water-ring-digits" dir="ltr">
            <span className="water-ring-goal">{formatLiters(GOAL_LITERS)}</span>
            <span className="water-ring-slash">/</span>
            <span className="water-ring-current">{formatLiters(liters)}</span>
          </div>
          <div className="water-ring-caption">ליטרים היום</div>
        </div>
      </div>

      <div className="water-add-cards">
        <button type="button" className="water-add-card" onClick={onAddCup}>
          <div className="water-add-card-icon">
            <WaterGlassIcon size={28} />
          </div>
          <div className="water-add-card-title">+250 מ״ל</div>
          <div className="water-add-card-sub">כוס מים</div>
        </button>
        <button type="button" className="water-add-card" onClick={onAddBottle}>
          <div className="water-add-card-icon">
            <WaterBottleIcon size={28} />
          </div>
          <div className="water-add-card-title">+500 מ״ל</div>
          <div className="water-add-card-sub">בקבוק קטן</div>
        </button>
      </div>

      {showReset && onReset && (
        <button type="button" className="link-btn water-ring-reset" onClick={onReset}>
          איפוס היום
        </button>
      )}
    </div>
  )
}

export function WaterWidget() {
  const date = todayKey()
  const [log, setLog] = useUserField('waterLog', {})
  const cups = log[date] || 0

  const update = (delta) => {
    setLog(prev => ({ ...prev, [date]: Math.max(0, (prev[date] || 0) + delta) }))
  }

  return (
    <div className="card water-widget-card">
      <div className="space-between" style={{ marginBottom: 12 }}>
        <h3 className="card-title card-title-with-icon" style={{ margin: 0 }}>
          <DropletIcon size={22} />
          מים היום
        </h3>
        <span className="badge">{formatLiters(cups * LITERS_PER_CUP)} ל׳</span>
      </div>
      <WaterRingSection
        cups={cups}
        onAddCup={() => update(1)}
        onAddBottle={() => update(2)}
        compact
        showReset={false}
      />
    </div>
  )
}

export default function WaterTracker() {
  const date = todayKey()
  const [log, setLog] = useUserField('waterLog', {})
  const cups = log[date] || 0
  const days = last7Days()
  const maxInWeek = Math.max(STRETCH_CUPS, ...days.map(d => log[d.key] || 0))

  const update = (delta) => {
    setLog(prev => ({ ...prev, [date]: Math.max(0, (prev[date] || 0) + delta) }))
  }

  const setTo = (n) => setLog(prev => ({ ...prev, [date]: n }))

  return (
    <div className="view water-tracker-view">
      <ViewTitle Icon={DropletIcon}>מעקב מים</ViewTitle>
      <p className="view-subtitle">
        יעד יומי {formatLiters(GOAL_LITERS)} ליטר · עד {formatLiters(STRETCH_CUPS * LITERS_PER_CUP)} ליטר בשבוע 1
      </p>

      <WaterRingSection
        cups={cups}
        onAddCup={() => update(1)}
        onAddBottle={() => update(2)}
        onReset={() => setTo(0)}
        showReset
      />

      <div className="water-chart">
        <h3>7 ימים אחרונים</h3>
        <div className="water-bars">
          {days.map(d => {
            const count = log[d.key] || 0
            const h = maxInWeek ? (count / maxInWeek) * 100 : 0
            const isToday = d.key === date
            return (
              <div key={d.key} className="water-bar-col">
                <div
                  className={`water-bar ${isToday ? 'today' : ''}`}
                  style={{ height: `${h}%` }}
                  title={`${formatLiters(count * LITERS_PER_CUP)} ל׳`}
                />
                <div className="water-bar-label">{d.label}</div>
                <div className="water-bar-label" style={{ fontWeight: 600 }}>
                  {formatLiters(count * LITERS_PER_CUP)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
