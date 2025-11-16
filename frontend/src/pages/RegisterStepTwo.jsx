import { Link, useNavigate } from 'react-router-dom'

function Progress({ step }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track success" />
      <div className={`progress-dot active`} style={{ left: '14px' }} />
      <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} style={{ right: '14px' }} />
    </div>
  )
}

export default function RegisterStepTwo() {
  const navigate = useNavigate()
  const step1 = (() => {
    try { return JSON.parse(sessionStorage.getItem('reg.step1') || '{}') } catch { return {} }
  })()
  const submit = async (e) => {
    e.preventDefault()
    if(!step1.email || !step1.password){
      alert('Please complete Step 1 first.');
      navigate('/register');
      return;
    }
    const form = e.currentTarget
    const payload = {
      email: step1.email,
      password: step1.password,
      username: form.username.value,
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      dateOfBirth: form.dateOfBirth.value || null,
      age: form.age.value ? parseInt(form.age.value,10) : null,
      street: form.street.value,
      province: form.province.value,
      municipality: form.city.value,
      gender: form.gender.value,
      phoneNumber: form.phone.value
    }
    try {
      const res = await fetch('/api/auth/register-patient', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if(!res.ok){
        const txt = await res.text()
        throw new Error(txt || 'Registration failed')
      }
      sessionStorage.removeItem('reg.step1')
      navigate('/login')
    } catch(err){
      alert(err.message)
    }
  }
  return (
    <div className="auth-bg">
      <Progress step={2} />
      <div className="auth-card">
        <div className="auth-card-inner">
          <img src="/assets/logo.png" alt="Check2Health" className="auth-logo" />

          <div className="section-header">FILL UP PERSONAL INFORMATION</div>

          {/* Scrollable content aligned with Patient entity */}
          <form className="form-grid scrollable" onSubmit={submit}>
            <label className="form-label">Username
              <input name="username" type="text" className="input" required />
            </label>

            <label className="form-label">First Name
              <input name="firstName" type="text" className="input" required />
            </label>

            <label className="form-label">Last Name
              <input name="lastName" type="text" className="input" required />
            </label>

            <div className="row">
              <label className="form-label">Date of Birth
                <input name="dateOfBirth" type="date" className="input" />
              </label>
              <label className="form-label">Age
                <input name="age" type="number" className="input" min="0" max="120" />
              </label>
            </div>

            <label className="form-label">Street
              <input name="street" type="text" className="input" />
            </label>

            <label className="form-label">Region
              <input name="region" type="text" className="input" />
            </label>

            <label className="form-label">Province
              <input name="province" type="text" className="input" />
            </label>

            <label className="form-label">City / Barangay
              <input name="city" type="text" className="input" />
            </label>

            <div className="row">
              <fieldset className="form-label"><legend>Gender</legend>
                <label className="radio"><input type="radio" name="gender" value="Male" defaultChecked /> Male</label>
                <label className="radio"><input type="radio" name="gender" value="Female" /> Female</label>
              </fieldset>
              <label className="form-label">Phone Number
                <input name="phone" type="tel" className="input" placeholder="+63 9XX XXX XXXX" />
              </label>
            </div>

            <button className="btn btn-blue auth-primary" type="submit">SIGN UP</button>
          </form>

          <div className="auth-return">
            <Link to="/register">← Previous Step</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
