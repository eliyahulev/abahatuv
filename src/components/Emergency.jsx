import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { comebackProtocol } from '../data/weeks'

export default function Emergency() {
  const [notes, setNotes] = useLocalStorage('breakNotes', [])
  const [showCamback, setShowCamback] = useState(false)
  const [draft, setDraft] = useState('')

  const addNote = () => {
    if (!draft.trim()) return
    setNotes(prev => [{ text: draft.trim(), date: new Date().toISOString() }, ...prev])
    setDraft('')
  }

  const deleteNote = (idx) => {
    setNotes(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="view">
      <h1 className="view-title">🆘 רגע של משבר</h1>
      <p className="view-subtitle">
        3 דרכי ההתמודדות הכי יעילות במצבים של שבירה
      </p>

      <div className="sos-card step1">
        <div className="sos-step">שלב 1</div>
        <div className="sos-title">הסחה</div>
        <div className="sos-body">
          הסחת דעת מכל סוג. לצאת להליכה, להתקלח, ללכת לשחק עם הילדים וכו\'.
          כל דבר שקוטע את הדפוס המנטלי והרגשי של האכילה הלא-בריאה.
          <strong> מפתיע כמה זה יעיל!</strong>
        </div>
      </div>

      <div className="sos-card step2">
        <div className="sos-step">שלב 2</div>
        <div className="sos-title">קרבה</div>
        <div className="sos-body">
          קרבה אנושית עוזרת מאד. לשתף אחרים בקושי שלנו באותו רגע (ולא בדיעבד).
          רגע לפני שאנחנו "שוברים את הכלים", מומלץ לשתף בהודעה בצ\'אט/בקבוצה/את הערב התומך
          או כל אחד שיעזור לך לצאת מזה.
        </div>
      </div>

      <div className="sos-card step3">
        <div className="sos-step">שלב 3</div>
        <div className="sos-title">דרך האמצע</div>
        <div className="sos-body">
          למצוא את האמצע ולפתוח "משא ומתן" עם הקול שרוצה לשבור את החוקים.
          למצוא פשרה כגון פרי או כפית חמאת בוטנים למשל.
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">✍️ יומן שבירה</h3>
        <p className="muted">כתוב לעצמך מה עבד לך טוב ברגע השבירה — כדי לראות לאורך זמן דפוסים.</p>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="מה קרה? מה בחרת? מה הרגשת?"
          style={{
            width: '100%', minHeight: 80, padding: 10,
            border: '1px solid var(--gray-300)', borderRadius: 10,
            resize: 'vertical', fontSize: 14
          }}
        />
        <button className="btn-primary" style={{ marginTop: 10 }} onClick={addNote}>
          שמור רישום
        </button>

        {notes.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {notes.map((n, i) => (
              <div key={i} style={{
                padding: 10, background: 'var(--gray-100)',
                borderRadius: 10, marginBottom: 8,
                fontSize: 13, lineHeight: 1.55
              }}>
                <div className="space-between" style={{ marginBottom: 4 }}>
                  <span className="muted small">
                    {new Date(n.date).toLocaleDateString('he-IL')}
                  </span>
                  <button className="link-btn" onClick={() => deleteNote(i)}>מחק</button>
                </div>
                {n.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="space-between">
          <h3 className="card-title" style={{ margin: 0 }}>📅 פרוטוקול הקאמבק (14 ימים)</h3>
          <button className="link-btn" onClick={() => setShowCamback(!showCamback)}>
            {showCamback ? 'הסתר' : 'הצג'}
          </button>
        </div>
        {showCamback && (
          <>
            <p className="muted" style={{ marginTop: 10 }}>{comebackProtocol.intro}</p>
            <ul className="section-list">
              {comebackProtocol.days.map(d => (
                <li key={d.day}>
                  <strong>יום {d.day}:</strong> {d.task}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
