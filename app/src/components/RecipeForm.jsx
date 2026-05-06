import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { GlobeIcon, LockIcon, XIcon } from '../icons'

const splitLines = (s) => s.split('\n').map(l => l.trim()).filter(Boolean)

export default function RecipeForm({ onClose }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [tips, setTips] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    const t = title.trim()
    if (!t) { setError('צריך כותרת למתכון'); return }
    const ingArr = splitLines(ingredients)
    const stepArr = splitLines(steps)
    if (ingArr.length === 0) { setError('צריך לפחות רכיב אחד'); return }
    if (stepArr.length === 0) { setError('צריך לפחות הוראת הכנה אחת'); return }
    if (!user) { setError('יש להתחבר'); return }
    setError(null)
    setBusy(true)
    try {
      await addDoc(collection(db, 'userRecipes'), {
        title: t,
        category: category.trim() || null,
        ingredients: ingArr,
        steps: stepArr,
        tips: splitLines(tips),
        isPublic,
        createdBy: user.uid,
        createdByName: user.displayName || user.email || null,
        createdAt: serverTimestamp()
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'שגיאה בשמירה')
      setBusy(false)
    }
  }

  return (
    <div className="recipe-form-backdrop" onClick={onClose}>
      <div className="recipe-form-card" onClick={e => e.stopPropagation()}>
        <button type="button" className="recipe-form-close" onClick={onClose} aria-label="סגור">
          <XIcon size={20} />
        </button>
        <h2 className="recipe-form-title">מתכון חדש</h2>

        <form onSubmit={submit} className="recipe-form">
          <label className="recipe-form-field">
            <span>שם המתכון</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              placeholder="למשל: סלט קינואה ים תיכוני"
              required
            />
          </label>

          <label className="recipe-form-field">
            <span>קטגוריה (אופציונלי)</span>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              maxLength={60}
              placeholder="ארוחת בוקר / עיקרית / חטיף..."
            />
          </label>

          <label className="recipe-form-field">
            <span>רכיבים — שורה לכל רכיב</span>
            <textarea
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              rows={6}
              placeholder={'כוס קינואה\n2 כוסות מים\nמלפפון קצוץ'}
              required
            />
          </label>

          <label className="recipe-form-field">
            <span>הכנה — שורה לכל שלב</span>
            <textarea
              value={steps}
              onChange={e => setSteps(e.target.value)}
              rows={6}
              placeholder={'שוטפים את הקינואה.\nמרתיחים במים 12 דקות.\nמערבבים עם הירקות.'}
              required
            />
          </label>

          <label className="recipe-form-field">
            <span>טיפים (אופציונלי) — שורה לכל טיפ</span>
            <textarea
              value={tips}
              onChange={e => setTips(e.target.value)}
              rows={3}
            />
          </label>

          <div className="recipe-form-visibility">
            <div className="recipe-form-visibility-label">נראות:</div>
            <div className="recipe-form-visibility-options">
              <button
                type="button"
                className={`recipe-form-vis-btn ${!isPublic ? 'active' : ''}`}
                onClick={() => setIsPublic(false)}
              >
                <LockIcon size={16} />
                <span>פרטי</span>
              </button>
              <button
                type="button"
                className={`recipe-form-vis-btn ${isPublic ? 'active' : ''}`}
                onClick={() => setIsPublic(true)}
              >
                <GlobeIcon size={16} />
                <span>שיתוף עם הקהילה</span>
              </button>
            </div>
            <div className="recipe-form-vis-hint">
              {isPublic
                ? 'המתכון יוצג לכל המשתמשים בלשונית "קהילה".'
                : 'רק את/ה תראה את המתכון.'}
            </div>
          </div>

          {error && <div className="recipe-form-error">{error}</div>}

          <div className="recipe-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
              ביטול
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'שומר…' : 'שמור מתכון'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
