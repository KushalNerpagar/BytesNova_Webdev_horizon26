// src/lib/managerRegistry.js
// Owner-controlled approved managers list — stored in localStorage

const REGISTRY_KEY = 'opspulse_approved_managers'

export function getApprovedManagers() {
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '[]')
  } catch (_) { return [] }
}

export function addApprovedManager(email, name) {
  const list = getApprovedManagers()
  if (list.find(m => m.email.toLowerCase() === email.toLowerCase())) return false
  const updated = [...list, {
    id: Date.now(),
    email: email.trim().toLowerCase(),
    name: name.trim(),
    addedAt: new Date().toISOString(),
    status: 'active',       // 'active' | 'suspended'
    registered: false,      // becomes true once manager completes Supabase signup
    registeredAt: null,
  }]
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(updated))
  return true
}

// Called from LoginPage after successful Supabase signUp
export function markManagerRegistered(email, name) {
  const list = getApprovedManagers()
  const updated = list.map(m =>
    m.email === email.trim().toLowerCase()
      ? { ...m, registered: true, registeredAt: new Date().toISOString(), name: name || m.name }
      : m
  )
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(updated))
}

export function removeApprovedManager(id) {
  const updated = getApprovedManagers().filter(m => m.id !== id)
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(updated))
}

export function toggleManagerStatus(id) {
  const updated = getApprovedManagers().map(m =>
    m.id === id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m
  )
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(updated))
}

export function isManagerApproved(email) {
  const list = getApprovedManagers()
  const match = list.find(m => m.email === email.trim().toLowerCase())
  return match ? match.status === 'active' : false
}