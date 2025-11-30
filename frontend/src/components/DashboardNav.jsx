import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import ProfileModal from './ProfileModal'

function getSessionName() {
  try {
    const raw = sessionStorage.getItem('auth.user')
    if (!raw) return null
    const u = JSON.parse(raw)
    const fn = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
    return fn || u.username || null
  } catch {
    return null
  }
}


export default function DashboardNav({ userName = 'User', active = 'Dashboard', items = [], role = '' }) {
  const name = userName && userName !== 'User' ? userName : (getSessionName() || 'User')
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function onClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open])

  function logout() {
    sessionStorage.removeItem('auth.user')
    navigate('/')
  }

  function getUserProfile() {
    try {
      const raw = sessionStorage.getItem('auth.user')
      if (!raw) return {}
      const u = JSON.parse(raw)
      // Map backend fields to profile modal fields
      return {
        name: [u.firstName, u.lastName].filter(Boolean).join(' ').trim(),
        email: u.email,
        contactNumber: u.contactNumber,
        birthDate: u.birthDate,
        street: u.street,
        barangay: u.barangay,
        municipality: u.municipality,
        province: u.province,
        profilePic: u.profilePic
      }
    } catch {
      return {}
    }
  }

  return (
    <>
      <header className="db-navbar">
        <div className="container db-nav-inner">
          <Link to="/" className="brand" aria-label="Check2Health home">
            <img src="/assets/logo.png" alt="Check2Health" className="brand-logo" />
          </Link>
          <nav className="db-links" aria-label="Dashboard">
            {items.map((label) => {
              let href = '#'
              if (label === 'Dashboard') {
                if (role === 'STAFF') href = '/dashboard/staff'
                else href = items.includes('My Appointments') ? '/dashboard/patient' : '/dashboard/doctor'
              }
              if (label === 'My Schedule') href = '/dashboard/doctor/schedule'
              if (label === 'Schedules' && role === 'STAFF') href = '/dashboard/staff/schedules'
              if (label === 'Analytics' && role === 'STAFF') href = '/dashboard/staff/analytics'
              if (label === 'My Appointments') {
                if (role === 'STAFF') href = '/dashboard/staff/appointments'
                else href = '/dashboard/patient/appointments'
              }
              return <a key={label} href={href} className={label === active ? 'active' : ''}>{label}</a>
            })}
          </nav>
          <div className="db-user" ref={navRef} style={{ position: 'relative' }}>
            <button className="avatar-btn" onClick={() => setOpen(v => !v)}>
              <span className="avatar">👤</span>
              <span className="name">{name}</span>
            </button>
            {open && (
              <div className="profile-menu">
                <button className="profile-menu-item profile-view" onClick={() => { setProfileOpen(true); setOpen(false) }}>View Profile</button>
                <button className="profile-menu-item profile-logout" onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
      {profileOpen && (
        <ProfileModal
          user={getUserProfile()}
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onSave={(data) => {
            // Save logic here (e.g., update sessionStorage, call backend)
            const raw = sessionStorage.getItem('auth.user')
            if (raw) {
              const u = JSON.parse(raw)
              const updated = { ...u, ...data }
              sessionStorage.setItem('auth.user', JSON.stringify(updated))
            }
            setProfileOpen(false)
          }}
        />
      )}
    </>
  )
}
