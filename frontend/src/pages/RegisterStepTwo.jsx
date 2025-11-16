import { Link } from 'react-router-dom'

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
  return (
    <div className="auth-bg">
      <Progress step={2} />
      <div className="auth-card">
        <div className="auth-card-inner">
          <img src="/assets/logo.png" alt="Check2Health" className="auth-logo" />

          <div className="section-header">FILL UP PERSONAL INFORMATION</div>

          {/* Scrollable content aligned with Patient entity */}
          <form className="form-grid scrollable" onSubmit={(e) => e.preventDefault()}>
            <label className="form-label">Username
              <input type="text" className="input" required />
            </label>

            <label className="form-label">First Name
              <input type="text" className="input" required />
            </label>

            <label className="form-label">Last Name
              <input type="text" className="input" required />
            </label>

            <div className="row">
              <label className="form-label">Date of Birth
                <input type="date" className="input" />
              </label>
              <label className="form-label">Age
                <input type="number" className="input" min="0" max="120" />
              </label>
            </div>

            <label className="form-label">Street
              <input type="text" className="input" />
            </label>

            <label className="form-label">Region
              <input type="text" className="input" />
            </label>

            <label className="form-label">Province
              <input type="text" className="input" />
            </label>

            <label className="form-label">City / Barangay
              <input type="text" className="input" />
            </label>

            <div className="row">
              <fieldset className="form-label"><legend>Gender</legend>
                <label className="radio"><input type="radio" name="gender" value="Male" /> Male</label>
                <label className="radio"><input type="radio" name="gender" value="Female" /> Female</label>
              </fieldset>
              <label className="form-label">Phone Number
                <input type="tel" className="input" placeholder="+63 9XX XXX XXXX" />
              </label>
            </div>

            <button className="btn btn-blue auth-primary" type="submit">SIGN UP</button>
          </form>

          <div className="auth-return">
            <Link to="/">← Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
