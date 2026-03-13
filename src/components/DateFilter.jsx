import React, { useState } from 'react'
import { Calendar, ChevronDown, X } from 'lucide-react'

const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Quarter', value: 'quarter' },
  { label: 'Custom', value: 'custom' },
]

export default function DateFilter({ value, onChange, theme }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState({ from: '', to: '' })
  const isDark = theme === 'dark'
  const surface = isDark ? '#0d1526' : '#ffffff'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'

  const selected = PRESETS.find(p => p.value === value) || PRESETS[0]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: surface,
          border: `1px solid ${borderCol}`,
          borderRadius: 8, cursor: 'pointer',
          color: textMain, fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace'
        }}
      >
        <Calendar size={12} style={{ color: '#00e5ff' }} />
        <span>{selected.label}</span>
        <ChevronDown size={12} style={{ color: textMuted }} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 100,
            background: surface, border: `1px solid ${borderCol}`,
            borderRadius: 12, padding: 8, width: 200,
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            {PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => { onChange(p.value); if (p.value !== 'custom') setOpen(false) }}
                style={{
                  width: '100%', padding: '8px 12px',
                  background: value === p.value ? 'rgba(0,229,255,0.1)' : 'none',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  color: value === p.value ? '#00e5ff' : textMuted,
                  fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
                  textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                {p.label}
                {value === p.value && <span style={{ fontSize: 10, color: '#00e5ff' }}>✓</span>}
              </button>
            ))}

            {value === 'custom' && (
              <div style={{ padding: '8px 12px', borderTop: `1px solid ${borderCol}`, marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace', display: 'block', marginBottom: 4 }}>FROM</label>
                  <input type="date" value={custom.from}
                    onChange={e => setCustom(p => ({ ...p, from: e.target.value }))}
                    style={{ width: '100%', padding: '4px 8px', background: isDark ? '#080c14' : '#f1f5f9', border: `1px solid ${borderCol}`, borderRadius: 6, color: textMain, fontSize: 11 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace', display: 'block', marginBottom: 4 }}>TO</label>
                  <input type="date" value={custom.to}
                    onChange={e => setCustom(p => ({ ...p, to: e.target.value }))}
                    style={{ width: '100%', padding: '4px 8px', background: isDark ? '#080c14' : '#f1f5f9', border: `1px solid ${borderCol}`, borderRadius: 6, color: textMain, fontSize: 11 }}
                  />
                </div>
                <button onClick={() => setOpen(false)} style={{
                  width: '100%', marginTop: 8, padding: '6px',
                  background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)',
                  borderRadius: 6, color: '#00e5ff', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace'
                }}>Apply Range</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
