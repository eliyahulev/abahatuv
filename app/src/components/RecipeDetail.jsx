import React, { useState } from 'react'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { StarIcon, ClockIcon, UtensilsIcon, LightbulbIcon, GlobeIcon, LockIcon, TrashIcon } from '../icons'

export default function RecipeDetail({ recipe, onBack, isFavorite, onToggleFavorite }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const togglePublic = async () => {
    if (busy || !recipe._docId) return
    setBusy(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'userRecipes', recipe._docId), { isPublic: !recipe.isPublic })
    } catch (e) {
      setError(e?.message || 'שגיאה בעדכון')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (busy || !recipe._docId) return
    if (!window.confirm('למחוק את המתכון?')) return
    setBusy(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'userRecipes', recipe._docId))
      onBack()
    } catch (e) {
      setError(e?.message || 'שגיאה במחיקה')
      setBusy(false)
    }
  }

  return (
    <div className="view">
      <button className="recipe-back" onClick={onBack}>← חזרה למתכונים</button>
      <div className="recipe-detail">
        <div className="space-between" style={{ alignItems: 'flex-start' }}>
          <h2>{recipe.title}</h2>
          <button
            className="chip"
            onClick={onToggleFavorite}
            style={{ flexShrink: 0, marginRight: 8 }}
          >
            <span className="chip-label-with-icon">
              <StarIcon size={16} filled={isFavorite} />
              <span>{isFavorite ? 'מועדף' : 'הוסף למועדפים'}</span>
            </span>
          </button>
        </div>
        {recipe.subtitle && <p className="muted" style={{ marginTop: -4 }}>{recipe.subtitle}</p>}

        <div className="recipe-meta">
          {recipe.week > 0 && <span>שבוע {recipe.week}</span>}
          {recipe.category && <span>{recipe.category}</span>}
          {recipe.prepTime && (
            <span className="recipe-meta-item"><ClockIcon size={14} />{recipe.prepTime}</span>
          )}
          {recipe.serves && (
            <span className="recipe-meta-item"><UtensilsIcon size={14} />{recipe.serves}</span>
          )}
          {recipe._isCustom && (
            <span className="recipe-meta-item">
              {recipe.isPublic ? <GlobeIcon size={14} /> : <LockIcon size={14} />}
              {recipe.isPublic ? 'ציבורי' : 'פרטי'}
            </span>
          )}
          {recipe._isCustom && !recipe._isMine && recipe.createdByName && (
            <span>מאת: {recipe.createdByName}</span>
          )}
        </div>

        {recipe._isMine && (
          <div className="recipe-owner-actions">
            <button
              type="button"
              className="recipe-owner-btn"
              onClick={togglePublic}
              disabled={busy}
            >
              {recipe.isPublic
                ? <><LockIcon size={14} /><span>הפוך לפרטי</span></>
                : <><GlobeIcon size={14} /><span>שתף עם הקהילה</span></>}
            </button>
            <button
              type="button"
              className="recipe-owner-btn recipe-owner-btn--danger"
              onClick={remove}
              disabled={busy}
            >
              <TrashIcon size={14} />
              <span>מחק</span>
            </button>
            {error && <span className="recipe-owner-error">{error}</span>}
          </div>
        )}

        {recipe.science && (
          <div className="card" style={{ background: 'var(--purple-50)', marginBottom: 16 }}>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--purple-800)' }}>
              {recipe.science}
            </div>
          </div>
        )}

        <h3 style={{ color: 'var(--purple-700)', marginBottom: 8 }}>רכיבים</h3>
        <ul className="ingredients-list">
          {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>

        <h3 style={{ color: 'var(--purple-700)', marginTop: 20, marginBottom: 8 }}>הכנה</h3>
        <ol className="steps-list">
          {recipe.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>

        {recipe.tips && recipe.tips.length > 0 && (
          <>
            <h3 className="recipe-detail-subh" style={{ color: 'var(--purple-700)', marginTop: 20, marginBottom: 8 }}>
              <LightbulbIcon size={20} />
              <span>טיפים</span>
            </h3>
            <ul className="section-list">
              {recipe.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
