import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const payload = {
      identifier: form.identifier.value,
      password: form.password.value,
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Login failed')
      }
      const data = await res.json()
      sessionStorage.setItem('auth.user', JSON.stringify(data))
      navigate('/dashboard/patient')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-card-inner">
          <img src="/assets/logo.png" alt="Check2Health" className="auth-logo" />
          <h1 className="auth-title">Sign In</h1>

          <form className="form-grid" onSubmit={submit}>
            <label className="form-label">Email or Username
              <input name="identifier" type="text" className="input" placeholder="" required />
            </label>

            <label className="form-label">Password
              <div className="input-with-action">
                <input
                  name="password"
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
