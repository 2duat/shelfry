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
      <span style={{ fontSize: 20, fontWeight: 650, letterSpacing: '-0.02em' }}>OpenShelf</span>
    </div>
  )
}

export function Icon() {
  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      O
    </span>
  )
}
