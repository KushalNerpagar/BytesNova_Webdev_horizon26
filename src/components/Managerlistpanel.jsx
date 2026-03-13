// src/components/ManagerListPanel.jsx
import React, { useState, useEffect } from 'react'
import { Users, Plus, ShieldOff, ShieldCheck, ChevronDown, ChevronUp, Mail, User, AlertCircle, CheckCircle, Clock, UserCheck, UserX } from 'lucide-react'
import { getApprovedManagers, addApprovedManager, toggleManagerStatus } from '../lib/managerRegistry'

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString()
}

export default function ManagerListPanel({ theme }) {
  const isDark = theme === 'dark'
  const [managers, setManagers] = useState([])
  const [expanded, setExpanded] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'registered' | 'pending' | 'suspended'

  const surface    = isDark ? '#0d1526' : '#ffffff'
  const borderCol  = isDark ? '#1a2540' : '#e2e8f0'
  const textMain   = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted  = isDark ? '#4a6080' : '#64748b'
  const subSurface = isDark ? '#0a0f1e' : '#f8fafc'
  const inputBg    = isDark ? '#080c14' : '#f8fafc'

  const refresh = () => setManagers(getApprovedManagers())

  useEffect(() => {
    refresh()
    // Poll every 5s so owner sees when a manager registers in real-time
    const t = setInterval(refresh, 5000)
    return () => clearInterval(t)
  }, [])

  const handleAdd = () => {
    setError('')
    setSuccess('')
    if (!name.trim()) return setError('Please enter manager name.')
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.')
    const added = addApprovedManager(email, name)
    if (!added) return setError('This email is already in the approved list.')
    setSuccess(`${name} added. They can now register and log in.`)
    setName('')
    setEmail('')
    setShowForm(false)
    refresh()
  }

  const handleToggle = (id) => {
    toggleManagerStatus(id)
    refresh()
  }

  const counts = {
    all: managers.length,
    registered: managers.filter(m => m.registered && m.status === 'active').length,
    pending: managers.filter(m => !m.registered && m.status === 'active').length,
    suspended: managers.filter(m => m.status === 'suspended').length,
  }

  const filtered = managers.filter(m => {
    if (filter === 'registered') return m.registered && m.status === 'active'
    if (filter === 'pending') return !m.registered && m.status === 'active'
    if (filter === 'suspended') return m.status === 'suspended'
    return true
  })

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'registered', label: '✓ Registered' },
    { key: 'pending', label: '⏳ Pending' },
    { key: 'suspended', label: '⊘ Suspended' },
  ]

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: surface, borderColor: borderCol }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b cursor-pointer"
        style={{ background: subSurface, borderColor: borderCol }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Users size={14} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: textMain }}>
            Approved Managers
          </span>
          <div className="flex items-center gap-1.5">
            {counts.registered > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                {counts.registered} registered
              </span>
            )}
            {counts.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {counts.pending} pending
              </span>
            )}
            {counts.suspended > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                {counts.suspended} suspended
              </span>
            )}
            {managers.length === 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
                No managers added
              </span>
            )}
          </div>
        </div>
        <span style={{ color: textMuted }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">

          {/* Success / Error */}
          {success && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-green-500/30 bg-green-500/10">
              <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-body text-green-400">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-body text-red-400">{error}</p>
            </div>
          )}

          {/* Add Manager Form */}
          {showForm ? (
            <div className="rounded-xl border p-4 space-y-3" style={{ background: subSurface, borderColor: '#00e5ff30' }}>
              <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Add New Manager</p>

              <div>
                <label className="block text-[10px] font-mono mb-1" style={{ color: textMuted }}>FULL NAME</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); setSuccess('') }}
                    placeholder="Manager's full name"
                    className="w-full pl-8 pr-4 py-2 rounded-lg border text-xs outline-none transition-all font-body"
                    style={{ background: inputBg, borderColor: borderCol, color: textMain }}
                    onFocus={e => e.target.style.borderColor = '#00e5ff'}
                    onBlur={e => e.target.style.borderColor = borderCol}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono mb-1" style={{ color: textMuted }}>EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); setSuccess('') }}
                    placeholder="manager@company.com"
                    className="w-full pl-8 pr-4 py-2 rounded-lg border text-xs outline-none transition-all font-body"
                    style={{ background: inputBg, borderColor: borderCol, color: textMain }}
                    onFocus={e => e.target.style.borderColor = '#00e5ff'}
                    onBlur={e => e.target.style.borderColor = borderCol}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #00e5ff, #00ff88)', color: '#080c14' }}
                >
                  Add Manager →
                </button>
                <button
                  onClick={() => { setShowForm(false); setError(''); setSuccess(''); setName(''); setEmail('') }}
                  className="px-4 py-2 rounded-lg text-xs font-mono border transition-all"
                  style={{ borderColor: borderCol, color: textMuted }}
                >
                  Cancel
                </button>
              </div>

              <p className="text-[10px] font-body" style={{ color: textMuted }}>
                💡 Share the OpsPulse URL with the manager. They must register using this exact email to appear as Registered.
              </p>
            </div>
          ) : (
            <button
              onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono font-bold border-2 border-dashed transition-all hover:border-cyan-500/50 hover:text-cyan-400"
              style={{ borderColor: borderCol, color: textMuted }}
            >
              <Plus size={13} />
              Add New Manager
            </button>
          )}

          {/* Filter tabs */}
          {managers.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className="px-3 py-1 rounded-lg text-[10px] font-mono transition-all border"
                  style={{
                    background: filter === tab.key ? '#00e5ff18' : 'transparent',
                    borderColor: filter === tab.key ? '#00e5ff40' : borderCol,
                    color: filter === tab.key ? '#00e5ff' : textMuted,
                  }}
                >
                  {tab.label} {counts[tab.key] > 0 ? `(${counts[tab.key]})` : ''}
                </button>
              ))}
            </div>
          )}

          {/* Manager list */}
          {managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Users size={24} style={{ color: textMuted }} />
              <p className="text-sm font-mono" style={{ color: textMuted }}>No managers added yet</p>
              <p className="text-xs font-body text-center" style={{ color: textMuted }}>
                Add a manager above. Only approved emails can register and log in.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs font-mono py-4" style={{ color: textMuted }}>
              No managers in this filter.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map(manager => (
                <div
                  key={manager.id}
                  className="rounded-xl border p-3 transition-all"
                  style={{
                    background: manager.status === 'suspended'
                      ? (isDark ? '#ff3b5c08' : '#fff5f5')
                      : subSurface,
                    borderColor: manager.status === 'suspended'
                      ? '#ff3b5c20'
                      : manager.registered
                        ? '#00ff8820'
                        : borderCol,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">

                    {/* Avatar + info */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-display font-bold flex-shrink-0"
                        style={{
                          background: manager.status === 'suspended'
                            ? '#ff3b5c20'
                            : manager.registered
                              ? '#00ff8820'
                              : '#ffb80020',
                          color: manager.status === 'suspended'
                            ? '#ff3b5c'
                            : manager.registered
                              ? '#00ff88'
                              : '#ffb800',
                        }}
                      >
                        {manager.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Name + email + badges */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-mono font-semibold" style={{ color: textMain }}>
                            {manager.name}
                          </p>

                          {/* Registration status badge */}
                          {manager.status !== 'suspended' && (
                            manager.registered ? (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                <UserCheck size={8} /> Registered
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <UserX size={8} /> Pending
                              </span>
                            )
                          )}

                          {/* Suspended badge */}
                          {manager.status === 'suspended' && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              ⊘ Suspended
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] font-mono mt-0.5 truncate" style={{ color: textMuted }}>
                          {manager.email}
                        </p>

                        {/* Timestamps */}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-mono" style={{ color: textMuted }}>
                            <Clock size={7} className="inline mr-0.5" />
                            Added {timeAgo(manager.addedAt)}
                          </span>
                          {manager.registered && manager.registeredAt && (
                            <span className="text-[9px] font-mono text-green-500">
                              <UserCheck size={7} className="inline mr-0.5" />
                              Joined {timeAgo(manager.registeredAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(manager.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all"
                        style={{ borderColor: borderCol, color: textMuted }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = manager.status === 'active' ? '#ffb800' : '#00ff88'
                          e.currentTarget.style.color = manager.status === 'active' ? '#ffb800' : '#00ff88'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = borderCol
                          e.currentTarget.style.color = textMuted
                        }}
                        title={manager.status === 'active' ? 'Suspend manager' : 'Reactivate manager'}
                      >
                        {manager.status === 'active' ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                      </button>


                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}