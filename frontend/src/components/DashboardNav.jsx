import { Link } from 'react-router-dom'

export default function DashboardNav({ userName = 'User', active = 'Dashboard', items = [] }) {
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
          <span className="name">{userName}</span>
        </div>
      </div>
    </header>
  )
}
