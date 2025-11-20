import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Progress({ step }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track success" />
      <div className={`progress-dot active`} style={{ left: '0px' }} />
      <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} style={{ right: '0px' }} />
    </div>
  )
}

function calculateAge(birthDate) {
  if (!birthDate) return ''
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : ''
}

export default function RegisterStepTwo() {
  const navigate = useNavigate()
  const step1 = (() => {
    try { return JSON.parse(sessionStorage.getItem('reg.step1') || '{}') } catch { return {} }
  })()
  
  const [birthDate, setBirthDate] = useState('')
  const [age, setAge] = useState('')
  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch regions on mount
  useEffect(() => {
    fetch('https://psgc.gitlab.io/api/regions/')
      .then(r => r.json())
      .then(data => setRegions(data))
      .catch(() => alert('Failed to load regions'))
  }, [])

  // Fetch provinces when region changes
  useEffect(() => {
    if (!selectedRegion) {
      setProvinces([])
      setMunicipalities([])
      setBarangays([])
      setSelectedProvince('')
      setSelectedMunicipality('')
      setSelectedBarangay('')
      return
    }
    setLoading(true)
    fetch(`https://psgc.gitlab.io/api/regions/${selectedRegion}/provinces/`)
      .then(r => r.json())
      .then(data => {
        setProvinces(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        alert('Failed to load provinces')
      })
  }, [selectedRegion])

  // Fetch municipalities when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setMunicipalities([])
      setBarangays([])
      setSelectedMunicipality('')
      setSelectedBarangay('')
      return
    }
    setLoading(true)
    fetch(`https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities-municipalities/`)
      .then(r => r.json())
      .then(data => {
        setMunicipalities(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        alert('Failed to load municipalities')
      })
  }, [selectedProvince])

  // Fetch barangays when municipality changes
  useEffect(() => {
    if (!selectedMunicipality) {
      setBarangays([])
      setSelectedBarangay('')
      return
    }
    setLoading(true)
    fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selectedMunicipality}/barangays/`)
      .then(r => r.json())
      .then(data => {
        setBarangays(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        alert('Failed to load barangays')
      })
  }, [selectedMunicipality])

  const handleBirthDateChange = (e) => {
    const date = e.target.value
    setBirthDate(date)
    setAge(calculateAge(date))
  }

  const submit = async (e) => {
    e.preventDefault()
    if(!step1.email || !step1.password){
      alert('Please complete Step 1 first.');
      navigate('/register');
      return;
    }
    const form = e.currentTarget
    
    // Get the selected names (not codes)
    const regionName = regions.find(r => r.code === selectedRegion)?.name || ''
    const provinceName = provinces.find(p => p.code === selectedProvince)?.name || ''
    const municipalityName = municipalities.find(m => m.code === selectedMunicipality)?.name || ''
    const barangayName = barangays.find(b => b.code === selectedBarangay)?.name || ''
    
    const payload = {
      email: step1.email,
      password: step1.password,
      username: form.username.value,
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      dateOfBirth: birthDate || null,
      age: age ? parseInt(age, 10) : null,
      street: form.street.value,
      barangay: barangayName,
      municipality: municipalityName,
      province: provinceName,
      region: regionName,
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

          <h1 className="auth-title" style={{fontWeight:800, fontSize:'2.2rem', marginTop:'10px', marginBottom:'18px'}}>Fill Up Personal Information</h1>

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
                <input 
                  name="dateOfBirth" 
                  type="date" 
                  className="input" 
                  value={birthDate}
                  onChange={handleBirthDateChange}
                />
              </label>
              <label className="form-label">Age
                <input 
                  name="age" 
                  type="number" 
                  className="input" 
                  value={age}
                  readOnly
                  placeholder="Auto-calculated"
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </label>
            </div>

            <label className="form-label">Region
              <select 
                className="input" 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                required
              >
                <option value="">-- Select Region --</option>
                {regions.map(r => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
            </label>

            <label className="form-label">Province
              <select 
                className="input" 
                value={selectedProvince} 
                onChange={(e) => setSelectedProvince(e.target.value)}
                disabled={!selectedRegion || loading}
                required
              >
                <option value="">-- Select Province --</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </label>

            <label className="form-label">Municipality
              <select 
                className="input" 
                value={selectedMunicipality} 
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                disabled={!selectedProvince || loading}
                required
              >
                <option value="">-- Select Municipality --</option>
                {municipalities.map(m => (
                  <option key={m.code} value={m.code}>{m.name}</option>
                ))}
              </select>
            </label>

            <label className="form-label">Barangay
              <select 
                className="input" 
                value={selectedBarangay} 
                onChange={(e) => setSelectedBarangay(e.target.value)}
                disabled={!selectedMunicipality || loading}
                required
              >
                <option value="">-- Select Barangay --</option>
                {barangays.map(b => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </label>

            <label className="form-label">Street
              <input name="street" type="text" className="input" placeholder="House/Unit/Block No., Street Name" />
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
