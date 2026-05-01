import React from 'react'
import { guides } from '../data/guides'
import { ViewTitle, BookIcon } from '../icons'

export default function Guides({ openId, setOpenId }) {
  if (openId) {
    const guide = guides.find(g => g.id === openId)
    if (guide) {
      return <GuideDetail guide={guide} onBack={() => setOpenId(null)} />
    }
  }

  return (
    <div className="view">
      <ViewTitle Icon={BookIcon}>מדריכים</ViewTitle>
      <div className="guides-list">
        {guides.map(g => (
          <button
            key={g.id}
            type="button"
            className="guide-card"
            onClick={() => setOpenId(g.id)}
          >
            <div className="guide-card-icon">
              <BookIcon size={24} />
            </div>
            <div className="guide-card-text">
              <div className="guide-card-title">{g.title}</div>
              <div className="guide-card-sub">{g.subtitle}</div>
            </div>
            <span className="guide-card-chev">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function GuideDetail({ guide, onBack }) {
  return (
    <div className="view">
      <button type="button" className="recipe-back" onClick={onBack}>
        ← חזרה למדריכים
      </button>
      <ViewTitle Icon={BookIcon}>{guide.title}</ViewTitle>
      {guide.subtitle && <p className="view-subtitle">{guide.subtitle}</p>}
      <div className="guide-content">
        {guide.body.map((block, i) => <Block key={i} block={block} />)}
      </div>
    </div>
  )
}

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return <p className="guide-p">{renderInline(block.text)}</p>
    case 'h':
      return <h2 className="guide-h">{block.text}</h2>
    case 'h2':
      return <h3 className="guide-h2">{block.text}</h3>
    case 'ul':
      return (
        <ul className="guide-ul">
          {block.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </ul>
      )
    case 'ol':
      return (
        <ol className="guide-ol">
          {block.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </ol>
      )
    case 'callout':
      return <div className="guide-callout">{renderInline(block.text)}</div>
    case 'table':
      return (
        <div className="guide-table">
          {block.groups.map((g, i) => (
            <div key={i} className="guide-table-group">
              <div className="guide-table-kind">{g.kind}</div>
              <div className="guide-table-rows">
                {g.rows.map((r, j) => (
                  <div key={j} className="guide-table-row">
                    <div className="guide-table-q">{renderInline(r.problem)}</div>
                    <div className="guide-table-a">{renderInline(r.fix)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    default:
      return null
  }
}

function renderInline(text) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>
    }
    if (p.includes('\n')) {
      const lines = p.split('\n')
      return lines.map((line, j) => (
        <React.Fragment key={`${i}-${j}`}>
          {line}
          {j < lines.length - 1 && <br />}
        </React.Fragment>
      ))
    }
    return p
  })
}
