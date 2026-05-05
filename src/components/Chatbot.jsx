import React, { useEffect, useRef, useState } from 'react'
import { auth } from '../lib/firebase'
import { ViewTitle, ChatIcon } from '../icons'

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL

const INITIAL_BOT_GREETING =
  'שלום! אני העוזר של מילופיט. אפשר לשאול אותי על התוכנית, התזונה, האימונים והצומות. במה אפשר לעזור?'

async function streamChat({ messages, onDelta, onError }) {
  if (!CHATBOT_URL) {
    onError('הצ׳אטבוט עדיין לא הוגדר. יש להגדיר את VITE_CHATBOT_URL ולפרוס את ה-Cloud Function.')
    return
  }
  const user = auth.currentUser
  if (!user) {
    onError('יש להתחבר כדי להשתמש בצ׳אטבוט.')
    return
  }
  const idToken = await user.getIdToken()

  const resp = await fetch(CHATBOT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ messages })
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    onError(text || `הבקשה נכשלה (${resp.status})`)
    return
  }

  const reader = resp.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buf = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let sep
    while ((sep = buf.indexOf('\n\n')) !== -1) {
      const raw = buf.slice(0, sep)
      buf = buf.slice(sep + 2)
      let event = 'message'
      let data = ''
      for (const line of raw.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim()
        else if (line.startsWith('data: ')) data += line.slice(6)
      }
      if (!data) continue
      let parsed
      try { parsed = JSON.parse(data) } catch { continue }
      if (event === 'delta' && parsed.text) onDelta(parsed.text)
      else if (event === 'error') onError(parsed.message || 'שגיאה')
      else if (event === 'done') return
    }
  }
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: INITIAL_BOT_GREETING }
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, busy])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setError(null)

    const next = [...messages, { role: 'user', content: text }, { role: 'assistant', content: '' }]
    setMessages(next)
    setInput('')
    setBusy(true)

    const history = next
      .filter(m => !(m.role === 'assistant' && m.content === INITIAL_BOT_GREETING))
      .filter((m, i, arr) => !(m.role === 'assistant' && m.content === '' && i === arr.length - 1))

    try {
      await streamChat({
        messages: history,
        onDelta: (delta) => {
          setMessages(prev => {
            const copy = prev.slice()
            const last = copy[copy.length - 1]
            if (last && last.role === 'assistant') {
              copy[copy.length - 1] = { ...last, content: last.content + delta }
            }
            return copy
          })
        },
        onError: (msg) => { setError(msg) }
      })
    } catch (e) {
      setError(e?.message || 'שגיאה בלתי צפויה')
    } finally {
      setBusy(false)
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant' && last.content === '') {
          return prev.slice(0, -1)
        }
        return prev
      })
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="view chatbot-view">
      <ViewTitle Icon={ChatIcon}>שאל את מילופיט</ViewTitle>
      <p className="view-subtitle">שואל ועונה על בסיס המדריך</p>

      <div className="chatbot-thread" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chatbot-msg is-${m.role}`}>
            <div className="chatbot-bubble">
              {m.content || (m.role === 'assistant' && busy && i === messages.length - 1
                ? <span className="chatbot-typing"><span/><span/><span/></span>
                : null)}
            </div>
          </div>
        ))}
        {error && <div className="chatbot-error">{error}</div>}
      </div>

      <div className="chatbot-composer">
        <textarea
          className="chatbot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="שאלה בקצרה..."
          rows={2}
          maxLength={1000}
          disabled={busy}
        />
        <button
          type="button"
          className="chatbot-send"
          onClick={send}
          disabled={busy || !input.trim()}
        >
          {busy ? '…' : 'שלח'}
        </button>
      </div>
    </div>
  )
}
