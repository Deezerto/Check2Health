import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

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


export default function DashboardNav({ userName = 'User', active = 'Dashboard', items = [] }) {
  const name = userName && userName !== 'User' ? userName : (getSessionName() || 'User')
  const [open, setOpen] = useState(false)
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

  return (
    <header className="db-navbar">
      <div className="container db-nav-inner">
        <Link to="/" className="brand" aria-label="Check2Health home">
          <img src="/assets/logo.png" alt="Check2Health" className="brand-logo" />
        </Link>
        <nav className="db-links" aria-label="Dashboard">
          {items.map((label) => {
            let href = '#'
            if (label === 'Dashboard') href = '/dashboard/doctor'
            if (label === 'My Schedule') href = '/dashboard/doctor/schedule'
            return <a key={label} href={href} className={label === active ? 'active' : ''}>{label}</a>
          })}
        </nav>
        <div className="db-user" ref={navRef} style={{position:'relative'}}>
          <button className="avatar-btn" onClick={()=>setOpen(v=>!v)}>
            <span className="avatar">👤</span>
            <span className="name">{name}</span>
          </button>
          {open && (
            <div className="profile-menu">
              <button className="profile-menu-item profile-view">View Profile</button>
              <button className="profile-menu-item profile-logout" onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
