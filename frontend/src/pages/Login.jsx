import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [show, setShow] = useState(false)

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-card-inner">
          <img src="/assets/logo.png" alt="Check2Health" className="auth-logo" />
          <h1 className="auth-title">Sign In</h1>

          <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
            <label className="form-label">Email Address
              <input type="email" className="input" placeholder="" required />
            </label>

            <label className="form-label">Password
              <div className="input-with-action">
                <input
                  type={show ? 'text' : 'password'}
                  className="input"
                  placeholder=""
                  required
                />
                <button type="button" className="input-action" onClick={() => setShow((s) => !s)}>
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <button className="btn btn-blue auth-primary" type="submit">LOG IN</button>
          </form>

          <div className="auth-links">
            <a href="#">Forgot Password?</a>
            <span>Don't have an account? <Link to="/register">Register here</Link></span>
          </div>

          <div className="auth-return">
            <Link to="/">← Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
