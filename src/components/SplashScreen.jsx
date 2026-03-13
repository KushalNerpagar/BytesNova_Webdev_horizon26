import React, { useState, useEffect } from 'react'

export default function SplashScreen({ onComplete, logoSrc }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + 2
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => { setFadeOut(true); setTimeout(onComplete, 600) }, 300)
    }
  }, [progress, onComplete])

  const handleSkip = () => {
    setFadeOut(true)
    setTimeout(onComplete, 400)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(ellipse at 50% 40%, #0a1628 0%, #050a14 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.6s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all'
      }}
    >
      {/* Animated background grid */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.15
      }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00e5ff" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)',
        top: '20%', left: '50%', transform: 'translateX(-50%)'
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
        bottom: '20%', right: '20%'
      }} />

      {/* Logo */}
      <div style={{
        animation: 'splashPulse 2s ease-in-out infinite',
        marginBottom: 24,
        filter: 'drop-shadow(0 0 30px rgba(0,229,255,0.4))'
      }}>
        <img
          src={logoSrc}
          alt="OpsPulse"
          style={{ width: 140, height: 140, objectFit: 'contain' }}
        />
      </div>

      {/* Brand name */}
      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 42, fontWeight: 800,
        background: 'linear-gradient(135deg, #00e5ff, #3b82f6, #818cf8)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-1px', marginBottom: 8, textAlign: 'center'
      }}>
        OPSPULSE
      </h1>

      {/* Tagline */}
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 15, color: '#64748b',
        letterSpacing: '0.08em', marginBottom: 48, textAlign: 'center'
      }}>
        Your Finances. One Powerful Pulse.
      </p>

      {/* Progress bar */}
      <div style={{
        width: 280, height: 3,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 2, overflow: 'hidden', marginBottom: 16
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #00e5ff, #3b82f6)',
          borderRadius: 2,
          transition: 'width 0.1s linear',
          boxShadow: '0 0 10px rgba(0,229,255,0.6)'
        }} />
      </div>

      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, color: '#334155', marginBottom: 32
      }}>
        {progress < 100 ? `Initializing systems... ${progress}%` : 'Ready'}
      </p>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          padding: '8px 20px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          color: '#475569',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={e => { e.target.style.color = '#00e5ff'; e.target.style.borderColor = 'rgba(0,229,255,0.3)' }}
        onMouseOut={e => { e.target.style.color = '#475569'; e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        Skip →
      </button>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  )
}
