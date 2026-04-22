import React, { useState } from 'react'
import { useLocalStorage, todayKey, daysBetween } from './hooks/useLocalStorage'
import Dashboard from './components/Dashboard'
import WeekView from './components/WeekView'
import WaterTracker from './components/WaterTracker'
import RecipeList from './components/RecipeList'
import FoodLists from './components/FoodLists'
import EatingWindow from './components/EatingWindow'
import Emergency from './components/Emergency'
import LeptinShake from './components/LeptinShake'
import InstallAppButton from './components/InstallAppButton'

const TABS = [
  { id: 'home',    label: 'בית',      icon: '🏠' },
  { id: 'weeks',   label: 'שבועות',  icon: '📅' },
  { id: 'water',   label: 'מים',     icon: '💧' },
  { id: 'recipes', label: 'מתכונים', icon: '🍳' },
  { id: 'foods',   label: 'מאכלים',  icon: '🥗' },
  { id: 'window',  label: 'חלון',    icon: '⏰' },
  { id: 'sos',     label: 'SOS',     icon: '🆘' }
]

export default function App() {
  const [startDate, setStartDate] = useLocalStorage('startDate', null)
  const [tab, setTab] = useState('home')
  const [openRecipeId, setOpenRecipeId] = useState(null)
  const [favorites, setFavorites] = useLocalStorage('favorites', [])
  const [showOnboarding, setShowOnboarding] = useState(false)

  // compute current week
  const daysIn = startDate ? daysBetween(startDate) : 0
  const currentWeek = Math.min(8, Math.floor(daysIn / 7) + 1)

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const navigate = (target) => {
    setOpenRecipeId(null)
    setTab(target)
    window.scrollTo(0, 0)
  }

  const openRecipe = (id) => {
    setOpenRecipeId(id)
    setTab('recipes')
    window.scrollTo(0, 0)
  }

  if (!startDate || showOnboarding) {
    return (
      <Onboarding
        initial={startDate}
        onSave={(d) => { setStartDate(d); setShowOnboarding(false) }}
        onClose={startDate ? () => setShowOnboarding(false) : null}
      />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <InstallAppButton className="install-app-btn-header" />
        <h1> חכם הרזים</h1>
        <div className="sub">  שבוע {currentWeek}/8</div>
      </header>

      {tab === 'home' && (
        <Dashboard
          currentWeek={currentWeek}
          startDate={startDate}
          onNavigate={navigate}
          onChangeStart={() => setShowOnboarding(true)}
        />
      )}
      {tab === 'weeks' && (
        <WeekView
          currentWeek={currentWeek}
          onOpenRecipe={openRecipe}
        />
      )}
      {tab === 'water' && <WaterTracker />}
      {tab === 'recipes' && (
        <RecipeList
          openRecipeId={openRecipeId}
          setOpenRecipeId={setOpenRecipeId}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}
      {tab === 'foods' && <FoodLists />}
      {tab === 'window' && <EatingWindow />}
      {tab === 'sos' && <Emergency />}
      {tab === 'shake' && <LeptinShake />}

      <nav className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => navigate(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function Onboarding({ initial, onSave, onClose }) {
  const [date, setDate] = useState(initial || todayKey())

  return (
    <div className="app">
      <InstallAppButton className="install-app-btn-onboarding" />
      <div className="onboarding">
        <div style={{ fontSize: 54 }}>🌟</div>
        <h1>ברוך הבא לשיטה הלפטינית</h1>
        <p>
          אתגר החיטוב של צביקה עינב בצורה דיגיטלית.
          בחרו את תאריך ההתחלה — נעקוב אחריכם כל 8 השבועות.
        </p>
        <label style={{ display: 'block', textAlign: 'right', fontSize: 13, color: 'var(--gray-600)', marginBottom: 6 }}>
          תאריך התחלה:
        </label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          max={todayKey()}
        />
        <button className="btn-primary" onClick={() => onSave(date)}>
          {initial ? 'עדכן' : 'התחל!'}
        </button>
        {onClose && (
          <button className="link-btn" style={{ marginTop: 12 }} onClick={onClose}>
            ביטול
          </button>
        )}
      </div>
    </div>
  )
}
