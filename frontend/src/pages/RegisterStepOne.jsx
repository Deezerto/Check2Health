import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Progress({ step }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track" />
      <div className={`progress-dot ${step >= 1 ? 'active' : ''}`} style={{ left: '0px' }} />
      <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} style={{ right: '0px' }} />
    </div>
  )
}

export default function RegisterStepOne() {

  const navigate = useNavigate()
  const [show, setShow] = useState({pw:false, confirm:false})
  const [error, setError] = useState('')

  return (
    <div className="auth-bg">
      <Progress step={1} />
      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-return" style={{marginTop:0,textAlign:'left'}}>
            <Link to="/login">← Return to Log in</Link>
          </div>
          <img src="/assets/logo.png" alt="Check2Health" className="auth-logo" />

          <h1 className="auth-title" style={{fontWeight:800, fontSize:'2.2rem', marginTop:'10px', marginBottom:'18px'}}>Create an Account</h1>

          <form className="form-grid" style={{gap:'18px'}} onSubmit={(e) => {
            e.preventDefault();
            setError('');
            const form = e.currentTarget;
            const email = form.querySelector('input[name=email]').value;
            const password = form.querySelector('input[name=password]').value;
            const confirm = form.querySelector('input[name=confirm]').value;

            const newErrors = [];

            // Validation Rules
            if (password.length < 8) {
              newErrors.push("The password must be at least 8 characters");
            }
            if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
              newErrors.push("The password must have one capital letter and one small letter");
            }
            if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
               newErrors.push("The password can't be entirely numbers or letters");
            }

            if(password !== confirm){
              newErrors.push('Passwords do not match');
            }

            if (newErrors.length > 0) {
                setError(newErrors);
                return;
            }

            sessionStorage.setItem('reg.step1', JSON.stringify({ email, password }));
            navigate('/register/details');
          }}>
            <label className="form-label">Email Address
              <input name="email" type="email" className="input" required />
            </label>

            <label className="form-label">Password
              <div className="input-with-action">
                <input name="password" type={show.pw ? 'text' : 'password'} className="input" required />
                <button type="button" className="input-action" onClick={()=>setShow(s=>({...s,pw:!s.pw}))}>{show.pw ? 'Hide' : 'Show'}</button>
              </div>
            </label>

            <label className="form-label">Re-enter password
              <div className="input-with-action">
                <input name="confirm" type={show.confirm ? 'text' : 'password'} className="input" required />
                <button type="button" className="input-action" onClick={()=>setShow(s=>({...s,confirm:!s.confirm}))}>{show.confirm ? 'Hide' : 'Show'}</button>
              </div>
            </label>

            {error && (
              <div style={{color:'red', fontSize:'0.9rem', textAlign:'left', display:'flex', flexDirection:'column', gap:'6px'}}>
                {Array.isArray(error) ? error.map((e, i) => <div key={i}>{e}</div>) : error}
              </div>
            )}

            <button className="btn btn-blue auth-primary" type="submit" style={{marginTop:'20px',fontSize:'1.1rem'}}>NEXT</button>
          </form>

          <div className="auth-return" style={{marginTop:20,textAlign:'left'}}>
            <Link to="/">← Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
