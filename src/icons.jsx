import React from 'react'

function Svg({ size = 24, className, children, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

export function HomeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  )
}

export function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  )
}

export function DropletIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </Svg>
  )
}

export function DropletFilledIcon({ size = 40, className, fill = '#0070EA' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
        fill={fill}
      />
    </svg>
  )
}

export function WaterBottleIcon(props) {
  return (
    <Svg {...props}>
      <path d="M10 3h4a1 1 0 0 1 1 1v1h-6V4a1 1 0 0 1 1-1z" />
      <rect x="7" y="5" width="10" height="16" rx="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </Svg>
  )
}

export function WaterGlassIcon(props) {
  return (
    <Svg {...props}>
      <path d="M8 3h8l-1.2 16.2A2 2 0 0 1 12.8 21h-1.6a2 2 0 0 1-1.99-1.8L8 3z" />
      <path d="M9 8h6" opacity="0.45" />
      <path d="M10 14h4" opacity="0.45" />
    </Svg>
  )
}

export function CookIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </Svg>
  )
}

export function SaladIcon(props) {
  return (
    <Svg {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </Svg>
  )
}

export function ClockIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Svg>
  )
}

export function SosIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </Svg>
  )
}

export function StarIcon({ filled = false, size = 24, className, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function ShakeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M8 3h8l-1 15H9L8 3z" />
      <line x1="12" y1="3" x2="12" y2="1" />
      <path d="M10 10h4" />
    </Svg>
  )
}

export function SparklesIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3v4M12 17v4M5 12H1M23 12h-4" />
      <path d="m7.5 7.5-2.8-2.8M19.3 19.3l-2.8-2.8M7.5 16.5l-2.8 2.8M19.3 4.7l-2.8 2.8" />
    </Svg>
  )
}

export function BroccoliIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 22V12" />
      <path d="M5 12a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3c0 1.66-1.34 3-3 3H8c-1.66 0-3-1.34-3-3z" />
      <path d="M9 9a3 3 0 0 1 6 0" />
      <circle cx="7" cy="7" r="2" />
      <circle cx="17" cy="7" r="2" />
      <circle cx="12" cy="5" r="2" />
    </Svg>
  )
}

export function NoWheatIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <path d="M8 14h8M8 10h8M8 18h5" />
    </Svg>
  )
}

export function TubersIcon(props) {
  return (
    <Svg {...props}>
      <ellipse cx="12" cy="13" rx="7" ry="5" />
      <path d="M5 13c0-3 3-6 7-6s7 3 7 6" />
      <path d="M9 8l-1-3M15 8l1-3" />
    </Svg>
  )
}

export function AvocadoIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3c-2 4-4 7-4 10a4 4 0 0 0 8 0c0-3-2-6-4-10z" />
      <circle cx="12" cy="13" r="2" />
    </Svg>
  )
}

export function UtensilsIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2z" />
    </Svg>
  )
}

export function FlagIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1-1-4-1-5 2-8 2-4-1-4-1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </Svg>
  )
}

export function CheckCircleIcon(props) {
  return (
    <Svg {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </Svg>
  )
}

export function CheckMarkIcon(props) {
  return (
    <Svg {...props}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  )
}

export function BanIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </Svg>
  )
}

export function CupIcon(props) {
  return (
    <Svg {...props}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </Svg>
  )
}

export function LightbulbIcon(props) {
  return (
    <Svg {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.33V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.67A7 7 0 0 0 12 2z" />
    </Svg>
  )
}

export function TrophyIcon(props) {
  return (
    <Svg {...props}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
      <path d="M7 4H5a2 2 0 0 0 0 4h2M17 4h2a2 2 0 0 1 0 4h-2" />
    </Svg>
  )
}

export function TargetIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </Svg>
  )
}

export function DumbbellIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 6v12M18 6v12" />
      <path d="M3 9v6M21 9v6" />
      <path d="M6 12h12" />
    </Svg>
  )
}

export function UserIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  )
}

export function DnaIcon(props) {
  return (
    <Svg {...props}>
      <path d="M7 3c2 3.5 2 7.5 0 11M17 3c-2 3.5-2 7.5 0 11" />
      <path d="M7 8h4M13 16h4M9 12h6" />
    </Svg>
  )
}

export function PenIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </Svg>
  )
}

export function LockIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  )
}

export function StatusDotIcon({ color, size = 10, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={className}
      aria-hidden
    >
      <circle cx="6" cy="6" r="5" fill={color} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
    </svg>
  )
}

const TAB_ICONS = {
  home: HomeIcon,
  weeks: CalendarIcon,
  water: DropletIcon,
  recipes: CookIcon,
  foods: SaladIcon,
  window: ClockIcon,
  training: DumbbellIcon,
  sos: SosIcon
}

export function TabIcon({ tabId, size, className }) {
  const C = TAB_ICONS[tabId]
  return C ? <C size={size} className={className} /> : null
}

const WEEK_ICONS = {
  water: DropletIcon,
  broccoli: BroccoliIcon,
  'no-wheat': NoWheatIcon,
  tubers: TubersIcon,
  avocado: AvocadoIcon,
  clock: ClockIcon,
  meals: UtensilsIcon,
  finish: FlagIcon
}

export function WeekIcon({ name, size, className }) {
  const C = WEEK_ICONS[name]
  return C ? <C size={size} className={className} /> : null
}

export function ViewTitle({ Icon, iconSize = 28, children, className = 'view-title' }) {
  return (
    <h1 className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {Icon && <Icon size={iconSize} className="view-title-icon" />}
      <span>{children}</span>
    </h1>
  )
}

export function InlineIconRow({ Icon, iconSize = 20, gap = 8, children, style, className }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap, ...style }}>
      {Icon && <Icon size={iconSize} />}
      {children}
    </span>
  )
}
