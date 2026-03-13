import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, BellOff, Volume2, VolumeX, History, X, Filter, Clock, CheckCircle, AlertTriangle, Zap, TrendingUp, Trash2 } from 'lucide-react'

// Sound generation using Web Audio API
function createAlertSound(type = 'crisis') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'crisis') {
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } else if (type === 'anomaly') {
      osc.frequency.setValueAtTime(660, ctx.currentTime)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } else {
      osc.frequency.setValueAtTime(520, ctx.currentTime)
      osc.frequency.setValueAtTime(720, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    }
  } catch (e) { /* silent fail */ }
}

export function useSoundAlerts(alerts) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const prevAlertsRef = useRef([])
  const [alertHistory, setAlertHistory] = useState([])
  const [dispatched, setDispatched] = useState([])

  useEffect(() => {
    const prevIds = new Set(prevAlertsRef.current.map(a => a.id || a.message))
    const newAlerts = alerts.filter(a => !prevIds.has(a.id || a.message))

    if (newAlerts.length > 0) {
      const now = new Date()
      newAlerts.forEach(alert => {
        const histEntry = {
          id: Date.now() + Math.random(),
          type: alert.type,
          message: alert.message,
          vertical: alert.vertical,
          detail: alert.detail,
          timestamp: now,
          timestampStr: now.toLocaleTimeString(),
          dateStr: now.toLocaleDateString(),
          resolved: false
        }
        setAlertHistory(prev => [histEntry, ...prev].slice(0, 100))
        setDispatched(prev => [histEntry, ...prev].slice(0, 50))
        if (soundEnabled) {
          createAlertSound(alert.type)
        }
      })
    }
    prevAlertsRef.current = alerts
  }, [alerts, soundEnabled])

  return { soundEnabled, setSoundEnabled, alertHistory, dispatched, setDispatched }
}

export default function AlertHistoryPanel({ dispatched, setDispatched, theme, soundEnabled, setSoundEnabled }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [showUnreadBadge, setShowUnreadBadge] = useState(0)

  const isDark = theme === 'dark'
  const surface = isDark ? '#0d1526' : '#ffffff'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'

  useEffect(() => {
    if (!open) setShowUnreadBadge(dispatched.filter(d => !d.seen).length)
  }, [dispatched, open])

  const handleOpen = () => {
    setOpen(true)
    setDispatched(prev => prev.map(d => ({ ...d, seen: true })))
    setShowUnreadBadge(0)
  }

  const filtered = filter === 'all' ? dispatched : dispatched.filter(d => d.type === filter)

  const typeConfig = {
    crisis: { color: '#ff3b5c', bg: 'rgba(255,59,92,0.1)', icon: AlertTriangle, label: 'CRISIS' },
    anomaly: { color: '#ffb800', bg: 'rgba(255,184,0,0.1)', icon: Zap, label: 'ANOMALY' },
    opportunity: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)', icon: TrendingUp, label: 'OPP.' }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: surface,
          border: `1px solid ${borderCol}`,
          borderRadius: 8, cursor: 'pointer',
          color: textMuted, fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace'
        }}
        title="Alert History"
      >
        <History size={12} />
        <span className="hidden sm:inline">History</span>
        {showUnreadBadge > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ff3b5c', color: 'white',
            fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold'
          }}>{showUnreadBadge > 9 ? '9+' : showUnreadBadge}</span>
        )}
      </button>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: surface,
          border: `1px solid ${borderCol}`,
          cursor: 'pointer', color: soundEnabled ? '#00e5ff' : textMuted,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title={soundEnabled ? 'Mute alerts' : 'Unmute alerts'}
      >
        {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
      </button>

      {/* Slide-in panel */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'flex-end'
        }} onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div style={{
            width: 420, height: '100vh',
            background: surface,
            borderLeft: `1px solid ${borderCol}`,
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.3s ease'
          }}>
            {/* Header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${borderCol}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <History size={16} style={{ color: '#00e5ff' }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: textMain, fontFamily: 'Syne, sans-serif' }}>
                    Dispatched Alerts
                  </span>
                  <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: 10 }}>
                    {dispatched.length} total
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setDispatched([])}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff3b5c', padding: 4 }}
                    title="Clear all"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'crisis', 'anomaly', 'opportunity'].map(f => (
                  <button key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      cursor: 'pointer', fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                      background: filter === f
                        ? f === 'crisis' ? 'rgba(255,59,92,0.2)'
                          : f === 'anomaly' ? 'rgba(255,184,0,0.2)'
                            : f === 'opportunity' ? 'rgba(0,255,136,0.2)'
                              : 'rgba(0,229,255,0.2)'
                        : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      color: filter === f
                        ? f === 'crisis' ? '#ff3b5c' : f === 'anomaly' ? '#ffb800' : f === 'opportunity' ? '#00ff88' : '#00e5ff'
                        : textMuted
                    }}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    {f !== 'all' && (
                      <span style={{ marginLeft: 4 }}>({dispatched.filter(d => d.type === f).length})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: textMuted }}>
                  <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontFamily: 'monospace', fontSize: 13 }}>No alerts dispatched yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filtered.map((alert) => {
                    const cfg = typeConfig[alert.type] || typeConfig.anomaly
                    const Icon = cfg.icon
                    return (
                      <div key={alert.id} style={{
                        padding: '10px 14px',
                        background: alert.resolved ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') : cfg.bg,
                        border: `1px solid ${alert.resolved ? borderCol : cfg.color + '40'}`,
                        borderRadius: 10,
                        opacity: alert.resolved ? 0.5 : 1
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <Icon size={14} style={{ color: cfg.color, flexShrink: 0, marginTop: 2 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                              <span style={{ fontSize: 10, fontFamily: 'monospace', color: cfg.color, fontWeight: 700 }}>
                                {cfg.label}
                              </span>
                              <span style={{ fontSize: 10, fontFamily: 'monospace', color: textMuted }}>
                                {alert.timestampStr}
                              </span>
                            </div>
                            <p style={{ fontSize: 13, color: textMain, margin: '0 0 2px', lineHeight: 1.4 }}>
                              {alert.message}
                            </p>
                            {alert.vertical && (
                              <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>
                                {alert.vertical} · {alert.dateStr}
                              </span>
                            )}
                          </div>
                          {!alert.resolved && (
                            <button
                              onClick={() => setDispatched(prev => prev.map(d => d.id === alert.id ? { ...d, resolved: true } : d))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00ff88', padding: 2 }}
                              title="Mark resolved"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  )
}
