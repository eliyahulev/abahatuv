import React, { useState } from 'react'
import { daysBetween } from './hooks/useLocalStorage'
import { useUserField, useUserDataReady } from './hooks/useUserData'
import { useAuth } from './hooks/useAuth'
import Dashboard from './components/Dashboard'
import WeekView from './components/WeekView'
import WaterTracker from './components/WaterTracker'
import RecipeList from './components/RecipeList'
import FoodLists from './components/FoodLists'
import EatingWindow from './components/EatingWindow'
import Emergency from './components/Emergency'
import LeptinShake from './components/LeptinShake'
import Profile from './components/Profile'
import OnboardingWizard from './components/OnboardingWizard'
import InstallAppButton from './components/InstallAppButton'
import LoginScreen from './components/LoginScreen'
import { TabIcon, UserIcon } from './icons'

const TABS = [
  { id: 'home',    label: 'בית' },
  { id: 'weeks',   label: 'שבועות' },
  { id: 'water',   label: 'מים' },
  { id: 'recipes', label: 'מתכונים' },
  { id: 'foods',   label: 'מאכלים' },
  { id: 'window',  label: 'חלון' },
  { id: 'sos',     label: 'SOS' }
]

function BootLoader() {
  return (
    <div className="app-boot-loader" role="status" aria-live="polite">
      <div className="app-boot-loader-spinner" aria-hidden="true" />
      <span className="app-boot-loader-text">טוען…</span>
    </div>
  )
}

export default function App() {
  const { user, status } = useAuth()
  const ready = useUserDataReady()

  if (status === 'loading') return <BootLoader />
  if (!user) return <LoginScreen />
  if (!ready) return <BootLoader />

  return <AppAuthed />
}

function AppAuthed() {
  const [startDate, setStartDate] = useUserField('startDate', null)
  const [name, setName] = useUserField('name', '')
  const [gender, setGender] = useUserField('gender', 'male')
  const [height, setHeight] = useUserField('height', null)
  const [weights, setWeights] = useUserField('weights', [])
  const [favorites, setFavorites] = useUserField('favorites', [])
  const [tab, setTab] = useState('home')
  const [openRecipeId, setOpenRecipeId] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const daysIn = startDate ? daysBetween(startDate) : 0
  const currentWeek = Math.min(8, Math.floor(daysIn / 7) + 1)

  const profileIncomplete = !startDate || !height || (weights || []).length === 0 || !name

  const toggleFavorite = (id) => {
    setFavorites(prev => (prev || []).includes(id) ? (prev || []).filter(x => x !== id) : [...(prev || []), id])
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

  const saveProfile = ({ date, gender: g, height: h, weight: w, name: n }) => {
    setStartDate(date)
    setName(n)
    setGender(g)
    setHeight(h)
    setWeights(prev => {
      const others = (prev || []).filter(x => x.date !== date)
      return [...others, { date, value: w }].sort((a, b) => a.date.localeCompare(b.date))
    })
    setShowOnboarding(false)
  }

  if (profileIncomplete || showOnboarding) {
    const firstWeight = [...(weights || [])].sort((a, b) => a.date.localeCompare(b.date))[0]
    return (
      <OnboardingWizard
        initial={{
          date: startDate || undefined,
          name: name || undefined,
          gender,
          height: height || undefined,
          weight: firstWeight?.value
        }}
        onSave={saveProfile}
        onClose={!profileIncomplete ? () => setShowOnboarding(false) : null}
      />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <InstallAppButton className="install-app-btn-header" />
        <button
          type="button"
          className={`profile-btn-header ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => navigate(tab === 'profile' ? 'home' : 'profile')}
          aria-label="הפרופיל שלי"
          title="הפרופיל שלי"
        >
          <UserIcon size={16} />
        </button>
        <h1> חכם הרזים</h1>
        <div className="sub">  שבוע {currentWeek}/8</div>
      </header>

      {tab === 'home' && (
        <Dashboard
          currentWeek={currentWeek}
          startDate={startDate}
          gender={gender}
          name={name}
          onNavigate={navigate}
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
          favorites={favorites || []}
          toggleFavorite={toggleFavorite}
        />
      )}
      {tab === 'foods' && <FoodLists />}
      {tab === 'window' && <EatingWindow />}
      {tab === 'sos' && <Emergency />}
      {tab === 'shake' && <LeptinShake />}
      {tab === 'profile' && (
        <Profile
          startDate={startDate}
          gender={gender}
          name={name}
          currentWeek={currentWeek}
          onNavigate={navigate}
          onEditProfile={() => setShowOnboarding(true)}
        />
      )}

      <nav className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => navigate(t.id)}
          >
            <span className="tab-icon"><TabIcon tabId={t.id} /></span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
