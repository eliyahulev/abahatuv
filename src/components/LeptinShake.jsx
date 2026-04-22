import React from 'react'
import { leptinShake } from '../data/shake'
import { ShakeIcon, LightbulbIcon } from '../icons'

export default function LeptinShake() {
  return (
    <div className="view">
      <div className="shake-hero">
        <div className="shake-hero-icon"><ShakeIcon size={56} /></div>
        <h2>{leptinShake.title}</h2>
        <p>{leptinShake.subtitle}</p>
      </div>

      <div className="card" style={{ background: 'var(--purple-50)' }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--purple-800)' }}>
          {leptinShake.science}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">רכיבים · {leptinShake.serves}</h3>
        <ul className="ingredients-list">
          {leptinShake.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
      </div>

      <div className="card">
        <h3 className="card-title">הכנה · {leptinShake.prepTime}</h3>
        <ol className="steps-list">
          {leptinShake.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </div>

      <div className="card">
        <h3 className="card-title card-title-with-icon"><LightbulbIcon size={22} />טיפים להצלחה</h3>
        <ul className="section-list">
          {leptinShake.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  )
}
