import React, { useState } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall'

export default function InstallAppButton({ className = '' }) {
  const { canInstall, hasNativePrompt, promptInstall, isIOS, isSafari } = usePwaInstall()
  const [showHint, setShowHint] = useState(false)

  if (!canInstall) return null

  const handleClick = async () => {
    if (hasNativePrompt) {
      await promptInstall()
    } else {
      setShowHint(true)
    }
  }

  return (
    <>
      <button
        type="button"
        className={`install-app-btn ${className}`.trim()}
        onClick={handleClick}
        aria-label="התקנת האפליקציה במכשיר"
        title="התקנת האפליקציה"
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
      {showHint && (
        <InstallHintModal
          onClose={() => setShowHint(false)}
          isIOS={isIOS}
          isSafari={isSafari}
        />
      )}
    </>
  )
}

function InstallHintModal({ onClose, isIOS, isSafari }) {
  return (
    <div className="install-hint-backdrop" onClick={onClose}>
      <div className="install-hint-card" onClick={(e) => e.stopPropagation()}>
        <h3>התקנת האפליקציה</h3>
        {isIOS ? (
          <ol className="install-hint-steps">
            <li>לחצו על כפתור <strong>שיתוף</strong> (הריבוע עם החץ למעלה) בתחתית הדפדפן.</li>
            <li>גללו ובחרו <strong>הוסף למסך הבית</strong>.</li>
            <li>אשרו — והאפליקציה תופיע אצלכם כמו אפליקציה רגילה.</li>
          </ol>
        ) : isSafari ? (
          <ol className="install-hint-steps">
            <li>פתחו את תפריט <strong>שיתוף</strong> בסרגל הכלים של ספארי.</li>
            <li>בחרו <strong>הוסף ל-Dock</strong>.</li>
          </ol>
        ) : (
          <ol className="install-hint-steps">
            <li>בסרגל הכתובת של הדפדפן יש סמל התקנה קטן (מחשב עם חץ).</li>
            <li>לחצו עליו ואשרו <strong>התקן</strong>.</li>
            <li>אם הסמל לא מופיע, פתחו את תפריט הדפדפן (⋮) ובחרו <strong>התקן את מילופיט</strong>.</li>
          </ol>
        )}
        <button className="btn-primary" onClick={onClose}>הבנתי</button>
      </div>
    </div>
  )
}
