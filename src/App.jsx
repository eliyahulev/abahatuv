import React, { useEffect, useState } from 'react'
import { startsInLabel } from './hooks/useLocalStorage'
import { getProgramProgress } from './lib/programProgress'
import { useUserField, useUserDataReady } from './hooks/useUserData'
import { useAuth } from './hooks/useAuth'
import Dashboard from './components/Dashboard'
import WeekView from './components/WeekView'
import WaterTracker from './components/WaterTracker'
import RecipeList from './components/RecipeList'
import FoodLists from './components/FoodLists'
import EatingWindow from './components/EatingWindow'
import Emergency from './components/Emergency'
import MiluFitShake from './components/MiluFitShake'
import Training from './components/Training'
import Profile from './components/Profile'
import OnboardingWizard from './components/OnboardingWizard'
import InstallAppButton from './components/InstallAppButton'
import LoginScreen from './components/LoginScreen'
import NewWeekModal from './components/NewWeekModal'
import { TabIcon, UserIcon } from './icons'

const TABS = [
  { id: 'home',     label: 'בית' },
  { id: 'weeks',    label: 'תוכנית' },
  { id: 'training', label: 'אימון' },
  { id: 'water',    label: 'מים' },
  { id: 'recipes',  label: 'מתכונים' },
  { id: 'foods',    label: 'מאכלים' },
  { id: 'window',   label: 'חלון' },
  { id: 'sos',      label: 'SOS' }
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
  const [lastSeenWeek, setLastSeenWeek] = useUserField('lastSeenWeek', null)
  const [tab, setTab] = useState('home')
  const [openRecipeId, setOpenRecipeId] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const { hasStarted, daysIn, daysUntilStart, currentWeek } =
    getProgramProgress(startDate)

  // Initialize lastSeenWeek the first time this user reaches the app, so the
  // "new week" modal does not fire on initial signup. After that, any time
  // currentWeek advances past lastSeenWeek the modal shows once. When the
  // user picks a future start date this initializes to 0, so week 1 fires
  // its modal once the start day arrives.
  useEffect(() => {
    if (startDate && lastSeenWeek == null) {
      setLastSeenWeek(currentWeek)
    }
  }, [startDate, lastSeenWeek, currentWeek, setLastSeenWeek])

  const showNewWeek =
    hasStarted && lastSeenWeek != null && currentWeek > lastSeenWeek

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
        <h1> מילופיט</h1>
        <div className="sub">
          {hasStarted ? `שבוע ${currentWeek}/8` : startsInLabel(daysUntilStart)}
        </div>
      </header>

      {tab === 'home' && (
        <Dashboard
          currentWeek={currentWeek}
          startDate={startDate}
          gender={gender}
          name={name}
          hasStarted={hasStarted}
          daysUntilStart={daysUntilStart}
          onNavigate={navigate}
        />
      )}
      {tab === 'weeks' && (
        <WeekView
          currentWeek={currentWeek}
          daysIn={daysIn}
          hasStarted={hasStarted}
          daysUntilStart={daysUntilStart}
          onOpenRecipe={openRecipe}
          onNavigate={navigate}
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
      {tab === 'shake' && <MiluFitShake />}
      {tab === 'training' && <Training />}
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

      {showNewWeek && (
        <NewWeekModal
          weekNumber={currentWeek}
          onDismiss={() => setLastSeenWeek(currentWeek)}
          onOpenWeeks={() => {
            setLastSeenWeek(currentWeek)
            navigate('weeks')
          }}
        />
      )}
    </div>
  )
}
