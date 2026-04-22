import React, { useState, useMemo } from 'react'
import { recipes } from '../data/recipes'
import { leptinShake } from '../data/shake'
import RecipeDetail from './RecipeDetail'

const allRecipes = [leptinShake, ...recipes]

const filters = [
  { id: 'all', label: 'הכל' },
  { id: 'favorites', label: '⭐ מועדפים' },
  { id: 'shake', label: '🥤 שייק' },
  { id: 3, label: 'שבוע 3' },
  { id: 4, label: 'שבוע 4' },
  { id: 5, label: 'שבוע 5' },
  { id: 6, label: 'שבוע 6' },
  { id: 7, label: 'שבוע 7' },
  { id: 0, label: 'נספחים' }
]

export default function RecipeList({ openRecipeId, setOpenRecipeId, favorites, toggleFavorite }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    let list = allRecipes
    if (filter === 'shake') list = [leptinShake]
    else if (filter === 'favorites') list = allRecipes.filter(r => favorites.includes(r.id))
    else if (typeof filter === 'number') list = recipes.filter(r => r.week === filter)
    if (query) list = list.filter(r => r.title.includes(query) || (r.category || '').includes(query))
    return list
  }, [filter, query, favorites])

  if (openRecipeId) {
    const r = allRecipes.find(x => x.id === openRecipeId)
    if (r) return (
      <RecipeDetail
        recipe={r}
        onBack={() => setOpenRecipeId(null)}
        isFavorite={favorites.includes(r.id)}
        onToggleFavorite={() => toggleFavorite(r.id)}
      />
    )
  }

  return (
    <div className="view">
      <h1 className="view-title">🍳 מתכונים</h1>
      <p className="view-subtitle">{allRecipes.length} מתכונים מנצחים מהמדריך</p>

      <input
        className="search-bar"
        placeholder="חיפוש מתכון..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <div className="filter-chips">
        {filters.map(f => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card center muted">
          אין מתכונים התואמים לחיפוש.
        </div>
      ) : (
        <div className="recipe-grid">
          {visible.map(r => (
            <div
              key={r.id}
              className="recipe-tile"
              onClick={() => setOpenRecipeId(r.id)}
            >
              {r.week > 0 && (
                <div className="recipe-tile-week">שבוע {r.week}</div>
              )}
              {r.id === 'leptin-shake' && (
                <div className="recipe-tile-week" style={{ color: 'var(--accent-green)' }}>⭐ המומלץ</div>
              )}
              <div className="recipe-tile-title">
                {favorites.includes(r.id) && '⭐ '}
                {r.title}
              </div>
              {r.category && <div className="recipe-tile-cat">{r.category}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
