import React from 'react'

/**
 * Shelfry 品牌标记：与 src/app/icon.svg 同一套层叠图形。
 * 后台侧边栏、登录页 Logo 共用，避免出现旧品牌字母。
 */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flex: '0 0 auto',
        display: 'grid',
        placeItems: 'center',
        borderRadius: Math.round(size * 0.3),
        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
      }}
    >
      <svg viewBox="0 0 32 32" width={size * 0.72} height={size * 0.72} aria-hidden="true">
        <g fill="#fff">
          <path opacity="0.95" d="M16 7 23.5 11.2 16 15.4 8.5 11.2z" />
          <path opacity="0.7" d="M8.5 15 16 19.2 23.5 15v2L16 21.2 8.5 17z" />
          <path opacity="0.45" d="M8.5 19 16 23.2 23.5 19v2L16 25.2 8.5 21z" />
        </g>
      </svg>
    </span>
  )
}

export function Logo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: 'var(--theme-elevation-1000)',
      }}
    >
      <Mark size={30} />
      <span style={{ fontSize: 20, fontWeight: 650, letterSpacing: '-0.02em' }}>Shelfry</span>
    </div>
  )
}

export function Icon() {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id="os-icon-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#os-icon-gradient)" />
      <g fill="#ffffff">
        <path opacity="0.95" d="M16 7 23.5 11.2 16 15.4 8.5 11.2z" />
        <path opacity="0.7" d="M8.5 15 16 19.2 23.5 15v2L16 21.2 8.5 17z" />
        <path opacity="0.45" d="M8.5 19 16 23.2 23.5 19v2L16 25.2 8.5 21z" />
      </g>
    </svg>
  )
}
