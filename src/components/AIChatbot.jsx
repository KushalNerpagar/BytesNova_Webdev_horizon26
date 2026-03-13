import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Sparkles, Minimize2, Maximize2, Key } from 'lucide-react'

// Removed SYSTEM_PROMPT since we no longer call Claude

// Fake / rule-based response generator
function generateFakeResponse(userQuestion, contextString) {
  const q = userQuestion.toLowerCase().trim()

  // Very naive keyword matching — improve this as much as you want
  if (q.includes('stress') || q.includes('why high') || q.includes('stress score')) {
    return `Your overall **Stress Score** is **${contextString.match(/Overall Stress Score: (\d+)\/100/)?.[1] || 'N/A'}**.\n\n` +
           `Breakdown:\n` +
           `- Sales stress: high → possibly low conversion or dropping orders\n` +
           `- Cash stress: monitor burn rate closely\n\n` +
           `**Quick recommendations:**\n1. Review top 5 underperforming SKUs / campaigns\n2. Cut non-essential monthly spend by 10–15%`
  }

  if (q.includes('runway') || q.includes('cash') || q.includes('burn')) {
    const runwayMatch = contextString.match(/Runway: (\d+) days/)
    const runway = runwayMatch ? runwayMatch[1] : 'N/A'

    if (runway !== 'N/A' && Number(runway) < 90) {
      return `⚠️ **Cash runway is only ${runway} days** — this is critically low.\n\n` +
             `Current burn: high | Cash balance: low\n\n` +
             `**Immediate actions:**\n1. Freeze non-critical hiring & marketing spend\n2. Accelerate collections (invoices < 30 days overdue)\n3. Prepare 3-month contingency plan`
    }
    return `Cash runway: **${runway} days**\nMonthly burn: moderate\n\nLooks acceptable for now — keep monitoring burn rate monthly.`
  }

  if (q.includes('sales') || q.includes('revenue') || q.includes('orders') || q.includes('conversion')) {
    return `**Latest sales snapshot:**\n` +
           `- Daily Revenue: ₹${contextString.match(/Daily Revenue: ₹([\d,]+(?:\.\d+)?)/)?.[1] || 'N/A'}\n` +
           `- Orders: ${contextString.match(/Orders: (\d+)/)?.[1] || 'N/A'}\n` +
           `- Conversion Rate: ${contextString.match(/Conversion Rate: ([\d.]+)%/)?.[1] || 'N/A'}%\n` +
           `- Avg Order Value: ₹${contextString.match(/Avg Order: ₹([\d,]+)/)?.[1] || 'N/A'}\n\n` +
           `**Suggestion:** Focus on increasing AOV (upsell/cross-sell bundles) and improving conversion (checkout UX, trust signals).`
  }

  if (q.includes('inventory') || q.includes('stock') || q.includes('low skus')) {
    return `**Inventory health:**\n` +
           `- Stock level: ${contextString.match(/Stock Level: ([\d.]+)%/)?.[1] || 'N/A'}%\n` +
           `- Low stock SKUs: ${contextString.match(/Low SKUs: (\d+)/)?.[1] || 'N/A'}\n\n` +
           `**Action:** Prioritize re-ordering the top ${contextString.match(/Low SKUs: (\d+)/)?.[1] || ''} low-stock items. Consider safety stock buffer of +20%.`
  }

  if (q.includes('alert') || q.includes('crisis') || q.includes('risk')) {
    return `**Active alerts:** ${contextString.match(/Active Alerts: (\d+)/)?.[1] || '0'} (${contextString.match(/\((\d+) critical\)/)?.[1] || '0'} critical)\n\n` +
           `Most urgent issues right now are likely cash & support related.\n\n` +
           `**Next steps:** Resolve critical alerts within 48 hours — they heavily influence overall stress score.`
  }

  if (q.includes('hello') || q.includes('hi') || q.length < 8) {
    return "Hey there! 👋 I'm your **OpsPulse AI simulator**.\n\nAsk me about:\n• stress score & risks\n• cash runway & burn\n• sales performance\n• inventory issues\n• active alerts\n\nJust type naturally — I'll try to give useful answers using your current metrics."
  }

  // Fallback — generic but still uses context
  return `I'm a **simplified offline version** of OpsPulse AI (no real LLM is running).\n\nYour current business snapshot:\n${contextString.split('\n').slice(0,12).join('\n')}\n\nI understood you asked about **"${userQuestion}"** — but I don't have a smart enough rule for that yet.\n\nTry asking about:\n- stress score\n- runway\n- sales\n- inventory\n- alerts`
}

export default function AIChatbot({ metrics, stressScore, alerts, theme }) {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm **OpsPulse AI (offline mode)**.\n\nI can give basic answers using your current dashboard metrics.\nNo API key needed — but answers are rule-based (not a real LLM).\n\nTry asking:\n- \"Why is my stress score high?\"\n- \"What's my cash runway?\"\n- \"Analyze sales\"\n- \"Any critical alerts?\""
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false) // kept for UI consistency, but instant now

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const isDark = theme === 'dark'
  const surface = isDark ? '#0d1526' : '#ffffff'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const inputBg = isDark ? '#080c14' : '#f8fafc'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus()
  }, [open, minimized])

  const getContextString = () => {
    if (!metrics || !stressScore) return 'No metrics available yet.'
    return `
CURRENT BUSINESS METRICS (Live Data):
- Overall Stress Score: ${stressScore.overall}/100 (${stressScore.overall > 70 ? 'CRITICAL' : stressScore.overall > 50 ? 'CAUTION' : 'HEALTHY'})
- Sales Stress: ${stressScore.sales}/100 | Inventory Stress: ${stressScore.inventory}/100
- Support Stress: ${stressScore.support}/100 | Cash Stress: ${stressScore.cash}/100
- Daily Revenue: ₹${metrics.sales?.revenue?.toFixed(0) || 'N/A'} | Orders: ${metrics.sales?.orders || 'N/A'}
- Conversion Rate: ${metrics.sales?.conversion_rate?.toFixed(2) || 'N/A'}% | Avg Order: ₹${metrics.sales?.avg_order_value?.toFixed(0) || 'N/A'}
- Cash Balance: ₹${metrics.cashflow?.cash_balance?.toFixed(0) || 'N/A'} | Runway: ${metrics.cashflow?.runway_days || 'N/A'} days
- Monthly Burn: ₹${metrics.cashflow?.burn_rate?.toFixed(0) || 'N/A'}
- Stock Level: ${metrics.inventory?.stock_level?.toFixed(0) || 'N/A'}% | Low SKUs: ${metrics.inventory?.low_stock_items || 'N/A'}
- Open Tickets: ${metrics.support?.open_tickets || 'N/A'} | CSAT: ${metrics.support?.csat_score?.toFixed(0) || 'N/A'}%
- Active Alerts: ${alerts.length} (${alerts.filter(a => a.type === 'crisis').length} critical)
${alerts.slice(0, 3).map(a => `  • [${a.type.toUpperCase()}] ${a.message}`).join('\n')}
`
  }

  const sendMessage = () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])

    // Fake small delay for realism
    setLoading(true)
    setTimeout(() => {
      const context = getContextString()
      const answer = generateFakeResponse(userMsg, context)

      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
      setLoading(false)
    }, 400) // 0.4s "thinking" animation
  }

  const formatMessage = (content) =>
    content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(0,229,255,0.12);padding:1px 5px;border-radius:3px;font-size:11px;font-family:monospace">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#00e5ff;text-decoration:underline">$1</a>')

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00e5ff, #3b82f6)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,229,255,0.45)',
            animation: 'chatFloat 3s ease-in-out infinite'
          }}
        >
          <MessageCircle size={24} color="white" />
          {alerts.filter(a => a.type === 'crisis').length > 0 && (
            <div style={{
              position: 'absolute', top: -2, right: -2,
              width: 18, height: 18, borderRadius: '50%',
              background: '#ff3b5c', fontSize: 10, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              {alerts.filter(a => a.type === 'crisis').length}
            </div>
          )}
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: minimized ? 280 : 390,
          height: minimized ? 52 : 530,
          background: surface, border: `1px solid ${borderCol}`,
          borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 14px',
            background: isDark ? 'rgba(0,229,255,0.06)' : 'rgba(0,229,255,0.04)',
            borderBottom: `1px solid ${borderCol}`,
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={15} style={{ color: '#00e5ff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: textMain, fontFamily: 'Syne, sans-serif' }}>OpsPulse AI</div>
              <div style={{ fontSize: 10, color: '#00e5ff', fontFamily: 'monospace' }}>
              </div>
            </div>
            <button onClick={() => setMinimized(!minimized)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: 4 }}>
              {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: 4 }}>
              <X size={14} />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
                    {msg.role === 'assistant' && (
                      <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={11} style={{ color: '#00e5ff' }} />
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: '84%', padding: '8px 12px',
                        borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(59,130,246,0.15))'
                          : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                        border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,255,0.2)' : borderCol}`,
                        fontSize: 12.5, lineHeight: 1.6, color: textMain,
                        fontFamily: 'DM Sans, sans-serif'
                      }}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Sparkles size={11} style={{ color: '#00e5ff' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${borderCol}`, borderRadius: '4px 12px 12px 12px' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', animation: `dotBounce 1.4s ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '10px 12px', borderTop: `1px solid ${borderCol}`, display: 'flex', gap: 8, flexShrink: 0 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about your business metrics..."
                  style={{
                    flex: 1, padding: '8px 12px',
                    background: inputBg, border: `1px solid ${borderCol}`,
                    borderRadius: 8, outline: 'none',
                    color: textMain, fontSize: 12,
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none',
                    background: input.trim() ? 'linear-gradient(135deg, #00e5ff, #3b82f6)' : 'rgba(255,255,255,0.05)',
                    cursor: input.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}
                >
                  <Send size={14} color={input.trim() ? '#fff' : textMuted} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes chatFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); opacity:0.4; } 30% { transform: translateY(-6px); opacity:1; } }
      `}</style>
    </>
  )
}