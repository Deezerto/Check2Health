export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <a className="brand" href="#" aria-label="Check2Health home">
          <img src="/assets/logo.png" alt="Check2Health" className="brand-logo" />
          <span className="brand-text">Check2Health</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#">Contact Us</a>
          <a href="#">About Us</a>
          <a href="#">Log in</a>
        </nav>
        <a className="btn btn-primary" href="#">Register</a>
      </div>
    </header>
  )
}
