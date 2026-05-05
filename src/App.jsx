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
import Guides from './components/Guides'
import SuperAdmin from './components/SuperAdmin'
import MiluFitShake from './components/MiluFitShake'
import Training from './components/Training'
import Profile from './components/Profile'
import OnboardingWizard from './components/OnboardingWizard'
import InstallAppButton from './components/InstallAppButton'
import LoginScreen from './components/LoginScreen'
import NewWeekModal from './components/NewWeekModal'
import NotificationPrompt from './components/NotificationPrompt'
import { TabIcon, UserIcon, MenuIcon, XIcon, SosIcon, BookIcon } from './icons'
import { isAdmin } from './lib/admin'
import { pushSupportStatus } from './lib/messaging'

const NOTIF_PROMPT_KEY = 'milufit:notifPromptShown'

const TABS = [
  { id: 'home',     label: 'בית' },
  { id: 'weeks',    label: 'תוכנית' },
  { id: 'training', label: 'אימון' },
  { id: 'water',    label: 'מים' },
  { id: 'recipes',  label: 'מתכונים' },
  { id: 'foods',    label: 'מאכלים' },
  { id: 'window',   label: 'חלון' }
]

const MENU_ITEMS = [
  { id: 'guides', label: 'מדריכים', Icon: BookIcon },
  { id: 'sos', label: 'SOS', Icon: SosIcon }
]

const ADMIN_MENU_ITEM = { id: 'admin', label: 'סופר אדמין', Icon: UserIcon }

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
  const { user } = useAuth()
  const [startDate, setStartDate] = useUserField('startDate', null)
  const [name, setName] = useUserField('name', '')
  const [gender, setGender] = useUserField('gender', 'male')
  const [height, setHeight] = useUserField('height', null)
  const [weights, setWeights] = useUserField('weights', [])
  const [favorites, setFavorites] = useUserField('favorites', [])
  const [lastSeenWeek, setLastSeenWeek] = useUserField('lastSeenWeek', null)
  const [tab, setTab] = useState('home')
  const [openRecipeId, setOpenRecipeId] = useState(null)
  const [openGuideId, setOpenGuideId] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNotifPrompt, setShowNotifPrompt] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pushSupportStatus() !== 'default') return
    if (localStorage.getItem(NOTIF_PROMPT_KEY)) return
    setShowNotifPrompt(true)
  }, [])

  const dismissNotifPrompt = () => {
    try { localStorage.setItem(NOTIF_PROMPT_KEY, '1') } catch { /* ignore */ }
    setShowNotifPrompt(false)
  }

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
    if (target !== 'guides') setOpenGuideId(null)
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
        <button
          type="button"
          className={`profile-btn-header ${tab === 'profile' ? 'active' : ''} ${user?.photoURL ? 'has-photo' : ''}`}
          onClick={() => navigate(tab === 'profile' ? 'home' : 'profile')}
          aria-label="הפרופיל שלי"
          title="הפרופיל שלי"
        >
          {user?.photoURL ? (
            <img
              className="profile-btn-photo"
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserIcon size={16} />
          )}
          {name && <span className="profile-btn-name">{name.split(' ')[0]}</span>}
        </button>
        <button
          type="button"
          className="menu-btn-header"
          onClick={() => setMenuOpen(true)}
          aria-label="תפריט"
          title="תפריט"
        >
          <MenuIcon size={16} />
        </button>
        <div className="app-header-title">
          <h1>מילופיט</h1>
          <div className="sub">
            {hasStarted ? `שבוע ${currentWeek}/8` : startsInLabel(daysUntilStart)}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <aside
            className="drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="תפריט"
          >
            <div className="drawer-head">
              <span className="drawer-title">תפריט</span>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setMenuOpen(false)}
                aria-label="סגור"
              >
                <XIcon size={20} />
              </button>
            </div>
            <nav className="drawer-nav">
              {(isAdmin(user) ? [...MENU_ITEMS, ADMIN_MENU_ITEM] : MENU_ITEMS).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`drawer-item ${tab === id ? 'active' : ''}`}
                  onClick={() => {
                    setMenuOpen(false)
                    navigate(id)
                  }}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
              <InstallAppButton
                className="drawer-item"
                label="התקנת האפליקציה"
                iconSize={20}
                onActivate={() => setMenuOpen(false)}
              />
            </nav>
          </aside>
        </div>
      )}

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
      {tab === 'guides' && (
        <Guides openId={openGuideId} setOpenId={setOpenGuideId} />
      )}
      {tab === 'sos' && <Emergency />}
      {tab === 'admin' && isAdmin(user) && <SuperAdmin />}
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

      {showNotifPrompt && !showNewWeek && (
        <NotificationPrompt onClose={dismissNotifPrompt} />
      )}
    </div>
  )
}
