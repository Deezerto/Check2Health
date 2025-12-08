import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Login() {

  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.message) {
      alert(location.state.message)
      // Clear state to prevent showing alert again on refresh (replace history)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const submit = async (e) => {
    e.preventDefault()
    setError("")
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
        let msg = 'Login failed'
        try {
          const data = await res.json()
          msg = data.message || data.error || msg
        } catch {
          const txt = await res.text()
          if (txt && txt.length < 200) msg = txt
        }
        if (msg.includes('Invalid credentials')) msg = 'Invalid email/username or password.'
        setError(msg)
        return
      }
      const data = await res.json()
      sessionStorage.setItem('auth.user', JSON.stringify(data))
      if (data.role === 'DOCTOR') {
        navigate('/dashboard/doctor')
      } else if (data.role === 'PATIENT') {
        navigate('/dashboard/patient')
      } else if (data.role === 'STAFF' || data.role === 'ADMIN') { // Redirect ADMIN to staff dashboard
        navigate('/dashboard/staff')
      } else {
        // Fallback to patient dashboard if role not provided or unrecognized
        navigate('/dashboard/patient')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card login-redesign">
        <div className="auth-card-inner">
          <img src="/assets/logo.png" alt="Check2Health" className="auth-logo" />
          <h1 className="auth-title" style={{fontWeight:800, fontSize:'2.2rem', marginTop:'10px', marginBottom:'18px'}}>Sign In</h1>

          <form className="form-grid" onSubmit={submit} style={{gap:'16px'}}>
            <label className="form-label">Email Address
              <input name="identifier" type="email" className="input" required />
            </label>

            <label className="form-label">Password
              <div className="input-with-action">
                <input
                  name="password"
                  type={show ? 'text' : 'password'}
                  className="input"
                  required
                />
                <button type="button" className="input-action" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
              </div>
              <div style={{marginTop:'4px',textAlign:'right',fontSize:'.8rem'}}>
                <Link to="/forgot-password" style={{color:'#2563eb',textDecoration:'none'}}>Forgot Password?</Link>
              </div>
            </label>

            <button className="btn btn-blue auth-primary" type="submit" style={{marginTop:'18px',fontSize:'1.15rem'}}>LOG IN</button>
            {error && <div className="form-error" style={{color:'#dc2626',marginTop:'10px',fontWeight:600}}>{error}</div>}
          </form>
          <div style={{marginTop:'18px',textAlign:'center',fontSize:'.98rem',color:'#64748b'}}>
            Don't have an account? <Link to="/register" style={{color:'#2563eb',fontWeight:600}}>Register here</Link>
          </div>
          <div className="auth-return" style={{marginTop:'10px',textAlign:'left'}}>
            <Link to="/">← Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
