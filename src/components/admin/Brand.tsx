import React from 'react'

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
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
        }}
      >
        O
      </span>
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
