import { Link, useNavigate } from 'react-router-dom'

function Progress({ step }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track" />
      <div className={`progress-dot ${step >= 1 ? 'active' : ''}`} style={{ left: '14px' }} />
      <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} style={{ right: '14px' }} />
    </div>
  )
}

export default function RegisterStepOne() {
  const navigate = useNavigate()

  return (
    <div className="auth-bg">
      <Progress step={1} />
      <div className="auth-card">
        <div className="auth-card-inner">
          <img src="/assets/logo.png" alt="Check2Health" className="auth-logo" />

          <div className="section-header">CREATE AN ACCOUNT</div>

          <form className="form-grid" onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const email = form.querySelector('input[name=email]').value;
            const password = form.querySelector('input[name=password]').value;
            const confirm = form.querySelector('input[name=confirm]').value;
            if(password !== confirm){
              alert('Passwords do not match');
              return;
            }
            sessionStorage.setItem('reg.step1', JSON.stringify({ email, password }));
            navigate('/register/details');
          }}>
            <label className="form-label">Email Address
              <input name="email" type="email" className="input" required />
            </label>

            <label className="form-label">Password
              <input name="password" type="password" className="input" required />
            </label>

            <label className="form-label">Re-enter password
              <input name="confirm" type="password" className="input" required />
            </label>

            <button className="btn btn-blue auth-primary" type="submit">NEXT</button>
          </form>

          <div className="auth-return">
            <Link to="/login">← Return to Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
