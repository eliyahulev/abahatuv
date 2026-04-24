import React from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall'

export default function InstallAppButton({ className = '' }) {
  const { canInstall, promptInstall } = usePwaInstall()
  if (!canInstall) return null
  return (
    <button
      type="button"
      className={`install-app-btn ${className}`.trim()}
      onClick={() => promptInstall()}
      aria-label="התקנת האפליקציה במכשיר"
      title="התקנה"
    >
      <svg className="install-app-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
