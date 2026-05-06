import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth'
import OpenAI from 'openai'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

initializeApp()

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')

const ADMIN_EMAILS = ['eliyahu.lev@gmail.com']
const FCM_BATCH = 500

export const sendBroadcastPush = onDocumentCreated(
  { document: 'pushBroadcasts/{id}', region: 'us-central1' },
  async (event) => {
    const snap = event.data
    if (!snap) return
    const broadcast = snap.data() || {}
    const db = getFirestore()
    const ref = snap.ref

    if (!ADMIN_EMAILS.includes((broadcast.createdByEmail || '').toLowerCase())) {
      await ref.update({
        status: 'rejected',
        error: 'createdByEmail is not an admin',
        finishedAt: FieldValue.serverTimestamp()
      })
      return
    }

    const usersSnap = await db.collection('users').get()
    const tokenToUid = new Map()
    usersSnap.forEach(doc => {
      const tokens = (doc.data().fcmTokens || []).filter(Boolean)
      for (const t of tokens) tokenToUid.set(t, doc.id)
    })
    const tokens = [...tokenToUid.keys()]

    if (tokens.length === 0) {
      await ref.update({
        status: 'sent',
        sentCount: 0,
        failureCount: 0,
        finishedAt: FieldValue.serverTimestamp()
      })
      return
    }

    const message = {
      notification: {
        title: broadcast.title || 'מילופיט',
        body: broadcast.body || ''
      },
      data: {
        ...(broadcast.url ? { url: String(broadcast.url) } : {}),
        broadcastId: ref.id
      },
      webpush: {
        notification: {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          dir: 'rtl',
          lang: 'he'
        },
        fcmOptions: broadcast.url ? { link: String(broadcast.url) } : undefined
      }
    }

    let sentCount = 0
    let failureCount = 0
    const invalidTokens = []

    for (let i = 0; i < tokens.length; i += FCM_BATCH) {
      const chunk = tokens.slice(i, i + FCM_BATCH)
      const res = await getMessaging().sendEachForMulticast({ ...message, tokens: chunk })
      sentCount += res.successCount
      failureCount += res.failureCount
      res.responses.forEach((r, idx) => {
        if (!r.success) {
          const code = r.error?.code || ''
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(chunk[idx])
          }
        }
      })
    }

    if (invalidTokens.length) {
      const byUid = new Map()
      for (const t of invalidTokens) {
        const uid = tokenToUid.get(t)
        if (!uid) continue
        if (!byUid.has(uid)) byUid.set(uid, [])
        byUid.get(uid).push(t)
      }
      const cleanup = [...byUid.entries()].map(([uid, ts]) =>
        db.collection('users').doc(uid).update({
          fcmTokens: FieldValue.arrayRemove(...ts)
        }).catch(() => {})
      )
      await Promise.all(cleanup)
    }

    await ref.update({
      status: 'sent',
      sentCount,
      failureCount,
      invalidTokensRemoved: invalidTokens.length,
      finishedAt: FieldValue.serverTimestamp()
    })
  }
)

// ---------------------------------------------------------------------------
// Chatbot — OpenAI-backed streaming HTTPS endpoint, grounded in the PDFs.
// PDFs are extracted to text once at cold-start and embedded in the system
// prompt so OpenAI's automatic prompt caching handles repeated requests.
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url))

let docsPromptPromise = null
function loadDocsPrompt() {
  if (!docsPromptPromise) {
    docsPromptPromise = (async () => {
      const [dataBuf, tzomBuf] = await Promise.all([
        readFile(join(__dirname, 'data', 'data.pdf')),
        readFile(join(__dirname, 'data', 'tzom.pdf'))
      ])
      const [dataParsed, tzomParsed] = await Promise.all([
        pdfParse(dataBuf),
        pdfParse(tzomBuf)
      ])
      return `אתה עוזר וירטואלי של אפליקציית מילופיט — תוכנית בריאות, תזונה ואימונים בעברית.
ענה בעברית בלבד, בטון חברי וברור, ובקצרה (משפט עד שלושה משפטים אלא אם כן השאלה דורשת יותר).
ענה אך ורק על בסיס המסמכים המצורפים בהמשך, ועל בסיס נתוני המשתמש הספציפי שיופיעו בסוף ההנחיה. אם התשובה לא נמצאת במסמכים — אמור בכנות "אין לי את המידע הזה במדריך, מומלץ להתייעץ עם המאמן/ה."
אל תמציא נתונים, מינונים, מספרים או הנחיות שאינם כתובים במפורש במסמכים.
כשהמשתמש שואל "אני" / "שלי" / "אני בשבוע כמה" / "מה המשקל שלי" — השתמש בנתונים האישיים שיופיעו בסוף.

=== מדריך מילופיט ===
${dataParsed.text}

=== מדריך צום ===
${tzomParsed.text}`
    })()
  }
  return docsPromptPromise
}

const TOTAL_WEEKS = 8
const DAY_MS = 24 * 60 * 60 * 1000

function daysBetween(fromIso, today = new Date()) {
  if (!fromIso) return 0
  const [y, m, d] = String(fromIso).split('-').map(Number)
  if (!y || !m || !d) return 0
  const fromUtc = Date.UTC(y, m - 1, d)
  const toUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.floor((toUtc - fromUtc) / DAY_MS)
}

function todayKey(today = new Date()) {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fmtNum(n, digits = 1) {
  return typeof n === 'number' && !Number.isNaN(n) ? +n.toFixed(digits) : null
}

function buildUserContext(uid, data) {
  if (!data) return `=== הנתונים שלך ===\nאין נתוני פרופיל זמינים.`

  const today = new Date()
  const tk = todayKey(today)
  const lines = []

  lines.push(`היום: ${tk}`)
  if (data.name) lines.push(`שם: ${data.name}`)
  if (data.gender === 'female') lines.push('מגדר: נקבה')
  else if (data.gender === 'male') lines.push('מגדר: זכר')
  if (typeof data.height === 'number') lines.push(`גובה: ${data.height} ס"מ`)

  if (data.startDate) {
    const rawDays = daysBetween(data.startDate, today)
    if (rawDays < 0) {
      lines.push(`התוכנית מתחילה ב-${data.startDate} (בעוד ${-rawDays} ימים).`)
    } else {
      const week = Math.min(TOTAL_WEEKS, Math.floor(rawDays / 7) + 1)
      const dayOfWeek = (rawDays % 7) + 1
      lines.push(`תאריך התחלה: ${data.startDate}`)
      lines.push(`יום בתוכנית: ${rawDays + 1} (שבוע ${week}/${TOTAL_WEEKS}, יום ${dayOfWeek}/7)`)
    }
  } else {
    lines.push('עוד לא נקבע תאריך התחלה.')
  }

  const weights = Array.isArray(data.weights) ? data.weights.slice() : []
  weights.sort((a, b) => String(a.date).localeCompare(String(b.date)))
  if (weights.length > 0) {
    const first = weights[0]
    const last = weights[weights.length - 1]
    const firstVal = fmtNum(first?.value)
    const lastVal = fmtNum(last?.value)
    if (firstVal != null) lines.push(`משקל ראשון: ${firstVal} ק"ג (${first.date})`)
    if (lastVal != null) lines.push(`משקל אחרון: ${lastVal} ק"ג (${last.date})`)
    if (firstVal != null && lastVal != null) {
      const delta = fmtNum(lastVal - firstVal)
      const sign = delta > 0 ? '+' : ''
      lines.push(`שינוי במשקל: ${sign}${delta} ק"ג`)
    }
    lines.push(`מספר שקילות: ${weights.length}`)
  } else {
    lines.push('אין שקילות מתועדות.')
  }

  if (data.trainingPlan) lines.push(`תוכנית אימון נבחרת: ${data.trainingPlan}`)

  const cups = (data.waterLog && typeof data.waterLog[tk] === 'number') ? data.waterLog[tk] : 0
  lines.push(`כוסות מים היום: ${cups}/8 (${(cups * 0.25).toFixed(2)} ל׳)`)

  return `=== הנתונים שלך ===\n${lines.join('\n')}`
}

async function loadUserContext(uid) {
  try {
    const snap = await getFirestore().collection('users').doc(uid).get()
    return buildUserContext(uid, snap.exists ? snap.data() : null)
  } catch (e) {
    console.error('loadUserContext failed', e)
    return `=== הנתונים שלך ===\nשגיאה בטעינת נתוני המשתמש.`
  }
}

export const chatbot = onRequest(
  { region: 'us-central1', secrets: [OPENAI_API_KEY], cors: true, timeoutSeconds: 120, memory: '1GiB' },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method not allowed' })
      return
    }

    const authHeader = req.headers.authorization || ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!idToken) {
      res.status(401).json({ error: 'missing auth token' })
      return
    }
    let uid = null
    try {
      const decoded = await getAuth().verifyIdToken(idToken)
      uid = decoded.uid
    } catch {
      res.status(401).json({ error: 'invalid auth token' })
      return
    }

    const userMessages = Array.isArray(req.body?.messages) ? req.body.messages : null
    if (!userMessages || userMessages.length === 0) {
      res.status(400).json({ error: 'messages required' })
      return
    }

    const cleaned = userMessages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
      .slice(-20)

    if (cleaned.length === 0 || cleaned[0].role !== 'user') {
      res.status(400).json({ error: 'first message must be user' })
      return
    }

    const lastUserTurn = [...cleaned].reverse().find(m => m.role === 'user')

    const rawChatId = typeof req.body?.chatId === 'string' ? req.body.chatId : ''
    const chatId = /^[A-Za-z0-9_-]{8,64}$/.test(rawChatId) ? rawChatId : null

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders?.()

    const send = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    let assistantText = ''
    try {
      const [docsPrompt, userContext] = await Promise.all([
        loadDocsPrompt(),
        loadUserContext(uid)
      ])
      const system = `${docsPrompt}\n\n${userContext}`
      const client = new OpenAI({ apiKey: OPENAI_API_KEY.value() })
      const stream = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1024,
        stream: true,
        messages: [
          { role: 'system', content: system },
          ...cleaned
        ]
      })

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) {
          assistantText += delta
          send('delta', { text: delta })
        }
      }
      send('done', {})
    } catch (err) {
      console.error('chatbot error', err)
      send('error', { message: err?.message || 'chatbot failed' })
    } finally {
      res.end()
    }

    if (chatId && lastUserTurn && assistantText) {
      try {
        const db = getFirestore()
        const ref = db.collection('chats').doc(chatId)
        const snap = await ref.get()
        const ts = new Date().toISOString()
        await ref.set({
          uid,
          updatedAt: FieldValue.serverTimestamp(),
          ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
          messages: FieldValue.arrayUnion(
            { role: 'user', content: lastUserTurn.content, ts },
            { role: 'assistant', content: assistantText, ts }
          )
        }, { merge: true })
      } catch (e) {
        console.error('chat persist failed', e)
      }
    }
  }
)
