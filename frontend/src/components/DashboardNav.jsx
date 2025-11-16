import { Link } from 'react-router-dom'

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
  return (
    <header className="db-navbar">
      <div className="container db-nav-inner">
        <Link to="/" className="brand" aria-label="Check2Health home">
          <img src="/assets/logo.png" alt="Check2Health" className="brand-logo" />
        </Link>
        <nav className="db-links" aria-label="Dashboard">
          {items.map((label) => (
            <a key={label} href="#" className={label === active ? 'active' : ''}>{label}</a>
          ))}
        </nav>
        <div className="db-user">
          <span className="avatar">👤</span>
          <span className="name">{name}</span>
        </div>
      </div>
    </header>
  )
}
