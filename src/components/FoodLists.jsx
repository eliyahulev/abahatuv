import React, { useState } from 'react'
import {
  vegetables,
  notVegetables,
  proteins,
  carbsAllowedWeek3,
  carbsAllowedWeek4,
  fats,
  foreverForbidden,
  drinks
} from '../data/foods'

export default function FoodLists() {
  const [tab, setTab] = useState('allowed')

  return (
    <div className="view">
      <h1 className="view-title">🥗 מאכלים</h1>
      <p className="view-subtitle">רשימות מאושרות ואסורות לפי שלב בתוכנית</p>

      <div className="tabs">
        <div
          className={`tab-pill ${tab === 'allowed' ? 'active' : ''}`}
          onClick={() => setTab('allowed')}
        >✅ מותר</div>
        <div
          className={`tab-pill ${tab === 'forbidden' ? 'active' : ''}`}
          onClick={() => setTab('forbidden')}
        >🚫 אסור</div>
        <div
          className={`tab-pill ${tab === 'drinks' ? 'active' : ''}`}
          onClick={() => setTab('drinks')}
        >🥤 משקאות</div>
      </div>

      {tab === 'allowed' && (
        <>
          <Group title={vegetables.title} subtitle={vegetables.subtitle}>
            <div className="food-chips">
              {vegetables.list.map(v => <span key={v} className="food-chip allowed">{v}</span>)}
            </div>
          </Group>

          <Group title={notVegetables.title} subtitle={notVegetables.subtitle}>
            {notVegetables.groups.map(g => (
              <div key={g.label}>
                <h4>{g.label}</h4>
                <div className="food-chips">
                  {g.items.map(i => <span key={i} className="food-chip">{i}</span>)}
                </div>
              </div>
            ))}
          </Group>

          <Group title={proteins.title}>
            <div className="food-chips">
              {proteins.list.map(p => <span key={p} className="food-chip allowed">{p}</span>)}
            </div>
          </Group>

          <Group title={carbsAllowedWeek3.title}>
            <div className="food-chips">
              {carbsAllowedWeek3.list.map(c => <span key={c} className="food-chip allowed">{c}</span>)}
            </div>
          </Group>

          <Group title={carbsAllowedWeek4.title} subtitle={carbsAllowedWeek4.subtitle}>
            <ul className="section-list">
              {carbsAllowedWeek4.list.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </Group>

          <Group title={fats.title} subtitle={fats.subtitle}>
            <div className="card" style={{ background: 'var(--purple-50)', marginBottom: 10 }}>
              <h4 style={{ margin: '0 0 6px', color: 'var(--purple-800)' }}>מדידות:</h4>
              <ul className="section-list" style={{ margin: 0 }}>
                {fats.measurements.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
            <div className="food-chips">
              {fats.list.map(f => <span key={f} className="food-chip allowed">{f}</span>)}
            </div>
          </Group>
        </>
      )}

      {tab === 'forbidden' && (
        <Group title={foreverForbidden.title} subtitle="להתרחק לכל אורך התוכנית">
          <ul className="section-list forbidden">
            {foreverForbidden.list.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </Group>
      )}

      {tab === 'drinks' && (
        <>
          <Group title={drinks.allowed.title}>
            <div className="food-chips">
              {drinks.allowed.list.map(d => <span key={d} className="food-chip allowed">{d}</span>)}
            </div>
          </Group>
          <Group title={drinks.forbidden.title}>
            <div className="food-chips">
              {drinks.forbidden.list.map(d => <span key={d} className="food-chip forbidden">{d}</span>)}
            </div>
          </Group>
        </>
      )}
    </div>
  )
}

function Group({ title, subtitle, children }) {
  return (
    <div className="card">
      <h3 style={{ color: 'var(--purple-800)', margin: '0 0 4px' }}>{title}</h3>
      {subtitle && <p className="muted" style={{ marginTop: 0, marginBottom: 10 }}>{subtitle}</p>}
      {children}
    </div>
  )
}
