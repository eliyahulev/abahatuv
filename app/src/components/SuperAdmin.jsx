import React, { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { getProgramProgress } from '../lib/programProgress'
import { getTasksForWeek } from '../lib/weekTasks'
import { trainingPlans } from '../data/training'
import { todayKey } from '../hooks/useLocalStorage'
import { GOAL_CUPS, formatLiters } from './WaterTracker'
import { ViewTitle, UserIcon } from '../icons'

const LITERS_PER_CUP = 0.25

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
  const [chats, setChats] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [usersSnap, chatsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'chats')).catch(() => ({ docs: [] }))
        ])
        if (cancelled) return
        setUsers(usersSnap.docs.map(d => ({ uid: d.id, ...d.data() })))
        setChats(chatsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setStatus('ready')
      } catch (e) {
        if (cancelled) return
        setError(e?.message || String(e))
        setStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [])

  const chatsByUid = useMemo(() => {
    const map = new Map()
    for (const c of chats) {
      if (!c.uid) continue
      const list = map.get(c.uid) || []
      list.push(c)
      map.set(c.uid, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const at = (a.updatedAt?.toMillis?.() || 0)
        const bt = (b.updatedAt?.toMillis?.() || 0)
        return bt - at
      })
    }
    return map
  }, [chats])

  const rows = useMemo(() => {
    const today = todayKey()
    return users.map(u => {
      const prog = getProgramProgress(u.startDate)
      const weights = (u.weights || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)))
      const first = weights[0]?.value
      const last = weights[weights.length - 1]?.value
      const delta = (typeof first === 'number' && typeof last === 'number')
        ? +(last - first).toFixed(1)
        : null
      const waterCups = (u.waterLog && u.waterLog[today]) || 0
      const planId = u.trainingPlan || null
      const planTitle = (planId && trainingPlans[planId]?.short) || null
      const taskList = getTasksForWeek(prog.currentWeek)
      const todayDone = (u.tasks && u.tasks[today]) || {}
      const tasksDone = taskList.reduce((n, t) => n + (todayDone[t.id] ? 1 : 0), 0)
      const tasksTotal = taskList.length
      return {
        ...u,
        prog,
        first,
        last,
        delta,
        weightCount: weights.length,
        waterCups,
        planId,
        planTitle,
        tasksDone,
        tasksTotal
      }
    }).sort((a, b) => {
      const aLast = new Date(a.lastLoginAt || 0).getTime() || 0
      const bLast = new Date(b.lastLoginAt || 0).getTime() || 0
      if (aLast !== bLast) return bLast - aLast
      if (a.prog.hasStarted !== b.prog.hasStarted) return a.prog.hasStarted ? -1 : 1
      return (b.prog.daysIn || 0) - (a.prog.daysIn || 0)
    })
  }, [users])

  const subscribers = useMemo(
    () => rows.reduce((sum, u) => sum + ((u.fcmTokens || []).length > 0 ? 1 : 0), 0),
    [rows]
  )

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
      <BroadcastCard subscribers={subscribers} />
      <div className="admin-list">
        {rows.map(u => <AdminRow key={u.uid} u={u} chats={chatsByUid.get(u.uid) || []} />)}
      </div>
    </div>
  )
}

function BroadcastCard({ subscribers }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const send = async () => {
    setFeedback(null)
    if (!title.trim() && !body.trim()) {
      setFeedback({ type: 'error', text: 'יש למלא כותרת או תוכן.' })
      return
    }
    if (!window.confirm(`לשלוח התראה ל-${subscribers} מנויים?`)) return
    setBusy(true)
    try {
      await addDoc(collection(db, 'pushBroadcasts'), {
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || null,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || null,
        createdByEmail: auth.currentUser?.email || null,
        status: 'pending'
      })
      setTitle('')
      setBody('')
      setUrl('')
      setFeedback({ type: 'ok', text: 'נשלח לתור. השליחה תתבצע בענן תוך מספר שניות.' })
    } catch (e) {
      setFeedback({ type: 'error', text: e?.message || 'השליחה נכשלה.' })
    } finally {
      setBusy(false)
    }
  }

  const titleTrimmed = title.trim()
  const bodyTrimmed = body.trim()
  const canSend = !busy && subscribers > 0 && (titleTrimmed.length > 0 || bodyTrimmed.length > 0)

  return (
    <div className="broadcast-card">
      <div className="broadcast-card-head">
        <div className="broadcast-card-icon" aria-hidden>
          <BellIcon />
        </div>
        <div className="broadcast-card-titles">
          <h3 className="broadcast-card-title">שליחת התראה לכלל המשתמשים</h3>
          <p className="broadcast-card-sub">הודעה אחת — נשלחת מיד לכל מי שהפעיל התראות.</p>
        </div>
        <span
          className={`broadcast-pill ${subscribers === 0 ? 'is-empty' : ''}`}
          title="מנויי התראות פעילים"
        >
          <span className="broadcast-pill-dot" aria-hidden />
          <span className="broadcast-pill-count">{subscribers}</span>
          <span className="broadcast-pill-label">מנויים</span>
        </span>
      </div>

      <div className="broadcast-field">
        <label className="broadcast-label">
          <span>כותרת</span>
          <span className="broadcast-counter">{title.length}/80</span>
        </label>
        <input
          type="text"
          className="broadcast-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={80}
          placeholder="לדוגמה: תזכורת — הגיע הזמן לשייק"
        />
      </div>

      <div className="broadcast-field">
        <label className="broadcast-label">
          <span>תוכן</span>
          <span className="broadcast-counter">{body.length}/300</span>
        </label>
        <textarea
          className="broadcast-input broadcast-textarea"
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="הודעה קצרה (עד 300 תווים)"
        />
      </div>

      <div className="broadcast-field">
        <label className="broadcast-label">
          <span>קישור <span className="broadcast-optional">(אופציונלי)</span></span>
        </label>
        <input
          type="text"
          className="broadcast-input"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="/ — ריק יפתח את העמוד הראשי"
          dir="ltr"
        />
      </div>

      {subscribers === 0 && (
        <div className="broadcast-hint">
          עדיין אין מנויים שהפעילו התראות. כל משתמש מפעיל בעצמו דרך עמוד הפרופיל.
        </div>
      )}

      <button
        type="button"
        className="broadcast-send"
        onClick={send}
        disabled={!canSend}
      >
        {busy
          ? 'שולח…'
          : subscribers === 0
            ? 'אין מנויים עדיין'
            : `שלח ל-${subscribers} ${subscribers === 1 ? 'מנוי' : 'מנויים'}`}
      </button>

      {feedback && (
        <div className={`broadcast-feedback is-${feedback.type}`}>
          {feedback.text}
        </div>
      )}
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function ChatsSection({ chats }) {
  const [open, setOpen] = useState(false)
  const [openIds, setOpenIds] = useState(() => new Set())

  if (!chats || chats.length === 0) return null

  const toggleChat = (id) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const fmtDate = (ts) => {
    const ms = ts?.toMillis?.()
    if (!ms) return ''
    return new Date(ms).toLocaleString('he-IL')
  }

  const totalTurns = chats.reduce((n, c) => n + Math.floor((c.messages || []).length / 2), 0)

  return (
    <div className="admin-chats">
      <button
        type="button"
        className="admin-chats-toggle"
        onClick={() => setOpen(o => !o)}
      >
        {open ? 'הסתר' : 'הצג'} צ'אטים ({chats.length} שיחות, {totalTurns} שאלות)
      </button>
      {open && (
        <div className="admin-chats-list">
          {chats.map(chat => {
            const msgs = chat.messages || []
            const firstUser = msgs.find(m => m.role === 'user')
            const preview = firstUser?.content?.slice(0, 60) || '(ריק)'
            const isOpen = openIds.has(chat.id)
            return (
              <div key={chat.id} className="admin-chat">
                <button
                  type="button"
                  className="admin-chat-head"
                  onClick={() => toggleChat(chat.id)}
                >
                  <span className="admin-chat-preview">{preview}</span>
                  <span className="admin-chat-meta">
                    {Math.floor(msgs.length / 2)} שאלות · {fmtDate(chat.updatedAt)}
                  </span>
                </button>
                {isOpen && (
                  <div className="admin-chat-body">
                    {msgs.map((m, i) => (
                      <div key={i} className={`admin-chat-msg is-${m.role}`}>
                        <div className="admin-chat-bubble">{m.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AdminRow({ u, chats }) {
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
          name={u.authDisplayName || u.name}
          seed={u.uid}
        />
        <div className="admin-card-id">
          <div className="admin-card-name">{u.authDisplayName || u.name || '(ללא שם)'}</div>
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
          <div className="admin-stat-k">מים היום</div>
          <div className="admin-stat-v">
            {formatLiters(u.waterCups * LITERS_PER_CUP)}/{formatLiters(GOAL_CUPS * LITERS_PER_CUP)} ל׳
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-k">תוכנית</div>
          <div className="admin-stat-v" title={u.planId ? (trainingPlans[u.planId]?.title || u.planId) : ''}>
            {u.planTitle || '—'}
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-k">משימות היום</div>
          <div className="admin-stat-v">
            {u.tasksTotal > 0 ? `${u.tasksDone}/${u.tasksTotal}` : '—'}
          </div>
        </div>
      </div>
      {u.startDate && (
        <div className="admin-card-foot">
          התחלה: {new Date(u.startDate).toLocaleDateString('he-IL')}
        </div>
      )}
      <ChatsSection chats={chats} />
    </div>
  )
}
