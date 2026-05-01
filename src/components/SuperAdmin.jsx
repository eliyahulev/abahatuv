import React, { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getProgramProgress } from '../lib/programProgress'
import { ViewTitle, UserIcon } from '../icons'

const AVATAR_PALETTE = [
  '#0070ea', '#48bb78', '#d69e2e', '#9f7aea',
  '#38b2ac', '#ed8936', '#e53e3e', '#3182ce'
]

function avatarColor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}

function avatarInitial(name) {
  const trimmed = (name || '').trim()
  return trimmed ? trimmed[0].toUpperCase() : '?'
}

function formatLastSeen(iso) {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return null
  const diff = Date.now() - then
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < hour) {
    const m = Math.max(0, Math.floor(diff / minute))
    if (m <= 1) return 'לפני רגע'
    return `לפני ${m} דקות`
  }
  if (diff < day) {
    const h = Math.floor(diff / hour)
    return h === 1 ? 'לפני שעה' : `לפני ${h} שעות`
  }
  const days = Math.floor(diff / day)
  if (days === 1) return 'אתמול'
  if (days < 7) return `לפני ${days} ימים`
  if (days < 30) {
    const w = Math.floor(days / 7)
    return w === 1 ? 'לפני שבוע' : `לפני ${w} שבועות`
  }
  if (days < 365) {
    const m = Math.floor(days / 30)
    return m === 1 ? 'לפני חודש' : `לפני ${m} חודשים`
  }
  const y = Math.floor(days / 365)
  return y === 1 ? 'לפני שנה' : `לפני ${y} שנים`
}

function lastSeenTone(iso) {
  if (!iso) return 'stale'
  const diff = Date.now() - new Date(iso).getTime()
  const day = 24 * 60 * 60 * 1000
  if (diff < 2 * day) return 'fresh'
  if (diff < 7 * day) return 'warm'
  return 'stale'
}

function Avatar({ photoURL, name, seed }) {
  const [failed, setFailed] = useState(false)
  if (photoURL && !failed) {
    return (
      <img
        className="admin-card-photo"
        src={photoURL}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div
      className="admin-card-photo-fallback"
      style={{ background: avatarColor(seed) }}
    >
      {name ? avatarInitial(name) : <UserIcon size={20} />}
    </div>
  )
}

export default function SuperAdmin() {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const snap = await getDocs(collection(db, 'users'))
        if (cancelled) return
        setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
        setStatus('ready')
      } catch (e) {
        if (cancelled) return
        setError(e?.message || String(e))
        setStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [])

  const rows = useMemo(() => {
    return users.map(u => {
      const prog = getProgramProgress(u.startDate)
      const weights = (u.weights || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)))
      const first = weights[0]?.value
      const last = weights[weights.length - 1]?.value
      const delta = (typeof first === 'number' && typeof last === 'number')
        ? +(last - first).toFixed(1)
        : null
      return { ...u, prog, first, last, delta, weightCount: weights.length }
    }).sort((a, b) => {
      if (a.prog.hasStarted !== b.prog.hasStarted) return a.prog.hasStarted ? -1 : 1
      if (a.prog.hasStarted) return (b.prog.daysIn || 0) - (a.prog.daysIn || 0)
      return String(b.lastLoginAt || '').localeCompare(String(a.lastLoginAt || ''))
    })
  }, [users])

  if (status === 'loading') {
    return (
      <div className="view">
        <ViewTitle Icon={UserIcon}>סופר אדמין</ViewTitle>
        <p className="muted">טוען רשימת משתמשים…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="view">
        <ViewTitle Icon={UserIcon}>סופר אדמין</ViewTitle>
        <div className="card">
          <p className="muted">לא ניתן לקרוא את כל המשתמשים. ייתכן שכללי ה-Firestore חוסמים את הגישה.</p>
          <p className="muted small" style={{ direction: 'ltr', textAlign: 'left' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <ViewTitle Icon={UserIcon}>סופר אדמין</ViewTitle>
      <p className="view-subtitle">{rows.length} משתמשים</p>
      <div className="admin-list">
        {rows.map(u => <AdminRow key={u.uid} u={u} />)}
      </div>
    </div>
  )
}

function AdminRow({ u }) {
  const { hasStarted, currentWeek, daysIn, daysUntilStart } = u.prog

  let weekLabel
  if (hasStarted) weekLabel = `שבוע ${currentWeek}/8`
  else if (u.startDate) weekLabel = `מתחיל בעוד ${daysUntilStart} ימים`
  else weekLabel = 'טרם התחיל'

  const deltaClass = u.delta == null ? '' : u.delta < 0 ? 'down' : u.delta > 0 ? 'up' : ''
  const deltaText = u.delta == null ? '—' : `${u.delta > 0 ? '+' : ''}${u.delta} ק"ג`

  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <Avatar
          photoURL={u.photoURL}
          name={u.name || u.authDisplayName || u.email}
          seed={u.uid}
        />
        <div className="admin-card-id">
          <div className="admin-card-name">{u.name || u.authDisplayName || '(ללא שם)'}</div>
          {u.email && <div className="admin-card-email">{u.email}</div>}
        </div>
        <div className="admin-card-week">{weekLabel}</div>
      </div>
      {u.lastLoginAt && (
        <div className={`admin-card-active tone-${lastSeenTone(u.lastLoginAt)}`}>
          <span className="admin-card-active-dot" aria-hidden />
          <span className="admin-card-active-k">פעילות אחרונה:</span>
          <span
            className="admin-card-active-v"
            title={new Date(u.lastLoginAt).toLocaleString('he-IL')}
          >
            {formatLastSeen(u.lastLoginAt)}
          </span>
        </div>
      )}
      <div className="admin-card-stats">
        <div className="admin-stat">
          <div className="admin-stat-k">ימים</div>
          <div className="admin-stat-v">{hasStarted ? daysIn : '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-k">משקל ראשון</div>
          <div className="admin-stat-v">{u.first ?? '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-k">משקל אחרון</div>
          <div className="admin-stat-v">{u.last ?? '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-k">שינוי</div>
          <div className={`admin-stat-v ${deltaClass}`}>{deltaText}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-k">שקילות</div>
          <div className="admin-stat-v">{u.weightCount || 0}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-k">מין</div>
          <div className="admin-stat-v">{u.gender === 'female' ? 'נקבה' : u.gender === 'male' ? 'זכר' : '—'}</div>
        </div>
      </div>
      {u.startDate && (
        <div className="admin-card-foot">
          התחלה: {new Date(u.startDate).toLocaleDateString('he-IL')}
        </div>
      )}
    </div>
  )
}
