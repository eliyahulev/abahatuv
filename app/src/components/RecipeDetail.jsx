import React from 'react'
import { StarIcon, ClockIcon, UtensilsIcon, LightbulbIcon } from '../icons'

export default function RecipeDetail({ recipe, onBack, isFavorite, onToggleFavorite }) {
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
        </div>

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
