import React, { useState, useMemo, useEffect } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { recipes } from '../data/recipes'
import { milufitShake } from '../data/shake'
import RecipeDetail from './RecipeDetail'
import RecipeForm from './RecipeForm'
import { ViewTitle, CookIcon, StarIcon, ShakeIcon, PlusIcon, GlobeIcon, LockIcon, UserIcon } from '../icons'

const builtInRecipes = [milufitShake, ...recipes]

const filters = [
  { id: 'all', label: 'הכל' },
  { id: 'mine', label: 'שלי', Icon: UserIcon },
  { id: 'community', label: 'קהילה', Icon: GlobeIcon },
  { id: 'favorites', label: 'מועדפים', Icon: StarIcon },
  { id: 'shake', label: 'שייק', Icon: ShakeIcon },
  { id: 3, label: 'שבוע 3' },
  { id: 4, label: 'שבוע 4' },
  { id: 5, label: 'שבוע 5' },
  { id: 6, label: 'שבוע 6' },
  { id: 7, label: 'שבוע 7' },
  { id: 0, label: 'נספחים' }
]

const customRecipeId = (docId) => `u:${docId}`

const docToRecipe = (d, isMine) => ({
  id: customRecipeId(d.id),
  _docId: d.id,
  _isCustom: true,
  _isMine: isMine,
  ...d.data()
})

export default function RecipeList({ openRecipeId, setOpenRecipeId, favorites, toggleFavorite }) {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [myRecipes, setMyRecipes] = useState([])
  const [publicRecipes, setPublicRecipes] = useState([])

  useEffect(() => {
    if (!user) {
      setMyRecipes([])
      setPublicRecipes([])
      return
    }
    const col = collection(db, 'userRecipes')
    const unsubMine = onSnapshot(
      query(col, where('createdBy', '==', user.uid)),
      snap => setMyRecipes(snap.docs.map(d => docToRecipe(d, true))),
      err => console.error('userRecipes mine listen failed', err)
    )
    const unsubPublic = onSnapshot(
      query(col, where('isPublic', '==', true)),
      snap => setPublicRecipes(
        snap.docs
          .filter(d => d.data().createdBy !== user.uid)
          .map(d => docToRecipe(d, false))
      ),
      err => console.error('userRecipes public listen failed', err)
    )
    return () => { unsubMine(); unsubPublic() }
  }, [user?.uid])

  const allRecipes = useMemo(
    () => [...builtInRecipes, ...myRecipes, ...publicRecipes],
    [myRecipes, publicRecipes]
  )

  const visible = useMemo(() => {
    let list = allRecipes
    if (filter === 'shake') list = [milufitShake]
    else if (filter === 'mine') list = myRecipes
    else if (filter === 'community') list = publicRecipes
    else if (filter === 'favorites') list = allRecipes.filter(r => favorites.includes(r.id))
    else if (typeof filter === 'number') list = recipes.filter(r => r.week === filter)
    if (searchText) list = list.filter(r => r.title.includes(searchText) || (r.category || '').includes(searchText))
    return list
  }, [filter, searchText, favorites, allRecipes, myRecipes, publicRecipes])

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
      <ViewTitle Icon={CookIcon}>מתכונים</ViewTitle>
      <p className="view-subtitle">{allRecipes.length} מתכונים</p>

      <div className="recipe-toolbar">
        <input
          className="search-bar recipe-toolbar-search"
          placeholder="חיפוש מתכון..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <button
          type="button"
          className="recipe-add-btn"
          onClick={() => setShowForm(true)}
        >
          <PlusIcon size={18} />
          <span>מתכון חדש</span>
        </button>
      </div>

      <div className="filter-chips">
        {filters.map(f => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            <span className="chip-label-with-icon">
              {f.Icon && <f.Icon size={16} />}
              <span>{f.label}</span>
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card center muted">
          {filter === 'mine'
            ? 'עדיין לא הוספת מתכונים. לחץ על "מתכון חדש" כדי להתחיל.'
            : 'אין מתכונים התואמים לחיפוש.'}
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
              {r.id === 'milufit-shake' && (
                <div className="recipe-tile-week recipe-tile-badge-rec" style={{ color: 'var(--accent-green)' }}>
                  <StarIcon size={12} filled />
                  <span>המומלץ</span>
                </div>
              )}
              {r._isCustom && (
                <div className={`recipe-tile-custom-badge ${r._isMine ? 'mine' : 'community'}`}>
                  {r._isMine
                    ? (r.isPublic ? <GlobeIcon size={12} /> : <LockIcon size={12} />)
                    : <GlobeIcon size={12} />}
                  <span>{r._isMine ? (r.isPublic ? 'שלי · ציבורי' : 'שלי · פרטי') : 'קהילה'}</span>
                </div>
              )}
              <div className="recipe-tile-title">
                <span className="recipe-tile-title-inner">
                  {favorites.includes(r.id) && <StarIcon size={14} filled className="recipe-tile-fav-star" />}
                  {r.title}
                </span>
              </div>
              {r.category && <div className="recipe-tile-cat">{r.category}</div>}
            </div>
          ))}
        </div>
      )}

      {showForm && <RecipeForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
