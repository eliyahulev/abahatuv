import React, { useState } from 'react'
import { weeks, sixPrinciples } from '../data/weeks'
import {
  WeekIcon,
  TargetIcon,
  DnaIcon,
  LightbulbIcon,
  BanIcon,
  CheckCircleIcon,
  CupIcon,
  CookIcon,
  ShakeIcon,
  TrophyIcon,
  DumbbellIcon,
  LockIcon
} from '../icons'
import { trainingPlans } from '../data/training'
import { useUserField } from '../hooks/useUserData'
import { startsInLabel } from '../hooks/useLocalStorage'

export default function WeekView({
  currentWeek,
  daysIn = 0,
  hasStarted = true,
  daysUntilStart = 0,
  onOpenRecipe,
  onNavigate
}) {
  const [planId] = useUserField('trainingPlan', 'weights-3')
  const plan = trainingPlans[planId] || trainingPlans['weights-3']
  const [expanded, setExpanded] = useState(currentWeek || 1)

  // Day 7 of the current week → tomorrow a new week opens. Used to flag the
  // next (still locked) row with a "opens tomorrow" hint.
  const dayOfWeek = (daysIn % 7) + 1
  const opensTomorrow = hasStarted && dayOfWeek === 7 && currentWeek < 8

  return (
    <div className="view">
      <h1 className="view-title">שבועות התוכנית</h1>
      <p className="view-subtitle">
        לחץ על שבוע כדי לראות משימות, מדע, טיפים ומתכונים.
      </p>

      {onNavigate && (
        <div
          className="card training-link-card"
          onClick={() => onNavigate('training')}
          role="button"
        >
          <div className="space-between">
            <h3 className="card-title card-title-with-icon" style={{ margin: 0 }}>
              <DumbbellIcon size={22} /> אימוני כוח
            </h3>
            <span className="link-btn">פתח ←</span>
          </div>
          <p className="muted" style={{ marginTop: 6 }}>
            התוכנית הנוכחית: <strong>{plan.short}</strong> · {plan.workouts.length} אימונים
          </p>
        </div>
      )}

      {weeks.map(w => {
        // When the user's start date is still in the future, every week —
        // including week 1 — is locked. Week 1 gets a "starts in N days"
        // badge that mirrors the opens-tomorrow style on the day before.
        const isLocked = !hasStarted || w.number > currentWeek
        const isExpanded = !isLocked && expanded === w.id
        const isCurrent = hasStarted && currentWeek === w.number
        const isNextUp = hasStarted && w.number === currentWeek + 1
        const isFirstUpPreStart = !hasStarted && w.number === 1
        const showOpensTomorrow =
          (isNextUp && opensTomorrow) ||
          (isFirstUpPreStart && daysUntilStart === 1)
        const showStartsBadge = isFirstUpPreStart && daysUntilStart > 1

        const rowClass = [
          'week-row',
          isExpanded ? 'expanded' : '',
          isCurrent ? 'active' : '',
          isLocked ? 'locked' : '',
          showOpensTomorrow ? 'opens-tomorrow' : '',
          showStartsBadge ? 'starts-soon' : ''
        ].filter(Boolean).join(' ')

        return (
          <div key={w.id} className={rowClass}>
            <div
              className="week-row-header"
              onClick={() => {
                if (isLocked) return
                setExpanded(isExpanded ? null : w.id)
              }}
              aria-disabled={isLocked}
            >
              <div className="week-row-number">
                {isLocked
                  ? <LockIcon size={20} />
                  : (w.icon ? <WeekIcon name={w.icon} size={22} /> : w.number)}
              </div>
              <div className="week-row-body">
                <div className="week-row-title">
                  {w.title}
                  {isCurrent && <span className="badge" style={{ marginRight: 8 }}>השבוע שלך</span>}
                  {showOpensTomorrow && (
                    <span className="badge badge-soon" style={{ marginRight: 8 }}>
                      {isFirstUpPreStart ? 'מתחיל מחר' : 'נפתח מחר'}
                    </span>
                  )}
                  {showStartsBadge && (
                    <span className="badge badge-soon" style={{ marginRight: 8 }}>
                      {startsInLabel(daysUntilStart)}
                    </span>
                  )}
                  {isLocked && !showOpensTomorrow && !showStartsBadge && (
                    <span className="badge badge-locked" style={{ marginRight: 8 }}>נעול</span>
                  )}
                </div>
                <div className="week-row-theme">{w.theme}</div>
              </div>
              {isLocked
                ? <div className="week-row-chevron week-row-lock-chevron"><LockIcon size={16} /></div>
                : <div className="week-row-chevron">‹</div>}
            </div>

            {isExpanded && (
              <div className="week-row-content">
                <div className="section-title section-title-with-icon"><TargetIcon size={18} /><span>משימות השבוע</span></div>
                <ul className="section-list">
                  {w.missionTasks.map(t => (
                    <li key={t.id}>
                      <strong>{t.short}</strong>
                      {t.long && <div className="task-details">{t.long}</div>}
                    </li>
                  ))}
                </ul>

                {w.physiology && w.physiology.length > 0 && (
                  <>
                    <div className="section-title section-title-with-icon"><DnaIcon size={18} /><span>חשיבות המשימה הראתה הפיזיולוגית</span></div>
                    <ul className="section-list">
                      {w.physiology.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </>
                )}

                {w.tips && w.tips.length > 0 && (
                  <>
                    <div className="section-title section-title-with-icon"><LightbulbIcon size={18} /><span>דגשים נוספים לגבי השבוע</span></div>
                    <ul className="section-list">
                      {w.tips.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </>
                )}

                {w.newForbidden && w.newForbidden.length > 0 && (
                  <>
                    <div className="section-title section-title-with-icon"><BanIcon size={18} /><span>נחסם השבוע</span></div>
                    <ul className="section-list forbidden">
                      {w.newForbidden.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </>
                )}

                {w.newAllowed && w.newAllowed.length > 0 && (
                  <>
                    <div className="section-title section-title-with-icon"><CheckCircleIcon size={18} /><span>מותר / נוסף השבוע</span></div>
                    <ul className="section-list">
                      {w.newAllowed.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </>
                )}

                {w.allowedDrinks && (
                  <>
                    <div className="section-title section-title-with-icon"><CupIcon size={18} /><span>משקאות מותרים</span></div>
                    <ul className="section-list">
                      {w.allowedDrinks.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </>
                )}

                {w.forbiddenDrinks && (
                  <>
                    <div className="section-title section-title-with-icon"><BanIcon size={18} /><span>משקאות לא מומלצים</span></div>
                    <ul className="section-list forbidden">
                      {w.forbiddenDrinks.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </>
                )}

                {w.recipeIds && w.recipeIds.length > 0 && (
                  <>
                    <div className="section-title section-title-with-icon"><CookIcon size={18} /><span>מתכונים לשבוע</span></div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {w.recipeIds.map(rid => (
                        <button
                          key={rid}
                          className="chip"
                          onClick={() => onOpenRecipe && onOpenRecipe(rid)}
                        >
                          {rid === 'milufit-shake' ? (
                            <span className="chip-label-with-icon"><ShakeIcon size={16} /><span>שייק</span></span>
                          ) : (
                            recipeTitle(rid)
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title card-title-with-icon"><TrophyIcon size={24} /><span>6 עקרונות-העל לשמירה For Life</span></h2>
        <p className="muted">לאחר סיום 8 השבועות — אלו הכלים לשמר את ההישגים לטווח ארוך.</p>
        {sixPrinciples.map((p, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: i < sixPrinciples.length - 1 ? '1px solid var(--gray-200)' : 'none' }}>
            <div style={{ fontWeight: 700, color: 'var(--purple-700)', marginBottom: 4 }}>
              {i + 1}. {p.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.55 }}>{p.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// small helper — won't import recipes here to keep chunk small
function recipeTitle(id) {
  const map = {
    'cocoa-oatmeal': 'דייסת קוואקר שוקולדית',
    'oven-salmon': 'סלמון בתנור',
    'milufit-shakshuka': 'שקשוקה',
    'tahini-bread': 'לחם טחינה',
    'artichoke-chips': 'צ\'יפס ארטישוק',
    'lentil-stew': 'תבשיל עדשים',
    'cauliflower-rice': '"אורז" כרובית',
    'cloud-bread': 'לחם ענן',
    'argentinian-meat-bread': 'לחם בשר ארגנטינאי',
    'avocado-eggs-pan': 'חביתת מלכים ואבוקדו',
    'oatmeal-ricotta': 'מעדן שיבולת שועל',
    'simple-tofu': 'טופו פשוט',
    'coconut-curry': 'קארי מהמם',
    'milufit-bean-soup': 'מרק שעועית במיוחד',
    'spinach-pastida': 'פשטידת תרד',
    'home-ketchup': 'קטשופ ביתי',
    'tofu-chicken-spinach': 'טופו/עוף ותרד',
    'tomato-eggs': 'טונה וירקות',
    'oatmeal-yogurt': 'שיבולת שועל ויוגורט',
    'iced-coffee': 'אייס קפה',
    'cocoa-shock': 'שוקו מפתיע',
    'roasted-cauliflower': 'כרובית בתנור'
  }
  return map[id] || id
}
