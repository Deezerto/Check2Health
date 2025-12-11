import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import ProfileModal from './ProfileModal'
import { useAuth } from '../context/AuthContext'

export default function DashboardNav({ userName = 'User', active = 'Dashboard', items = [], role = '' }) {
  const { user, logout } = useAuth()

  // Derive display name from context user, or fallback to props
  const displayName = user
    ? ([user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.username)
    : (userName !== 'User' ? userName : 'User')

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

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  function getUserProfile() {
    if (!user) return {}
    return {
      name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
      email: user.email,
      contactNumber: user.phoneNumber, // Backend sends phoneNumber, frontend expected contactNumber?
      birthDate: user.dateOfBirth,
      street: user.street,
      barangay: user.barangay,
      municipality: user.municipality,
      province: user.province,
      profilePic: user.profilePic // Backend might not send this yet
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
              if (label === 'Manage Appointments' && role === 'STAFF') href = '/dashboard/staff/appointments'
              return <Link key={label} to={href} className={label === active ? 'active' : ''}>{label}</Link>
            })}
          </nav>
          <div className="db-user" ref={navRef} style={{ position: 'relative' }}>
            <button className="avatar-btn" onClick={() => setOpen(v => !v)}>
              <span className="avatar">👤</span>
              <span className="name">{displayName}</span>
            </button>
            {open && (
              <div className="profile-menu">
                <button className="profile-menu-item profile-view" onClick={() => { setProfileOpen(true); setOpen(false) }}>View Profile</button>
                <button className="profile-menu-item profile-logout" onClick={handleLogout}>Logout</button>
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
            // TODO: Implement backend update for profile
            console.warn("Profile update not implemented in backend yet. Changes are volatile.")
            setProfileOpen(false)
          }}
        />
      )}
    </>
  )
}
