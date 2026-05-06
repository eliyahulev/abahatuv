import React from 'react'
import { milufitShake } from '../data/shake'
import { ShakeIcon, LightbulbIcon } from '../icons'

export default function MiluFitShake() {
  return (
    <div className="view">
      <div className="shake-hero">
        <div className="shake-hero-icon"><ShakeIcon size={56} /></div>
        <h2>{milufitShake.title}</h2>
        <p>{milufitShake.subtitle}</p>
      </div>

      <div className="card" style={{ background: 'var(--purple-50)' }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--purple-800)' }}>
          {milufitShake.science}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">רכיבים · {milufitShake.serves}</h3>
        <ul className="ingredients-list">
          {milufitShake.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
      </div>

      <div className="card">
        <h3 className="card-title">הכנה · {milufitShake.prepTime}</h3>
        <ol className="steps-list">
          {milufitShake.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </div>

      <div className="card">
        <h3 className="card-title card-title-with-icon"><LightbulbIcon size={22} />טיפים להצלחה</h3>
        <ul className="section-list">
          {milufitShake.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  )
}
