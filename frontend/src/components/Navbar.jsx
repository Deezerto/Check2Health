import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="brand" to="/" aria-label="Check2Health home">
          <img src="/assets/logo.png" alt="Check2Health" className="brand-logo" />
          <span className="brand-text">Check2Health</span>
        </Link>
        <div className="nav-actions">
          <Link className="btn btn-ghost" to="/login">Log in</Link>
          <Link className="btn btn-blue" to="/register">Register</Link>
        </div>
      </div>
    </header>
  )
}
