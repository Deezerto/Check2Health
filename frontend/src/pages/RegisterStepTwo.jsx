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
  const [displayDate, setDisplayDate] = useState('')
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
  const [gender, setGender] = useState('Male')
  const [otherGender, setOtherGender] = useState('')
  const [errors, setErrors] = useState({})

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

  const handleDateInput = (e) => {
    let val = e.target.value;
    // Allow only numbers and slashes
    if (/[^0-9/]/.test(val)) return;
    
    setDisplayDate(val);

    // Check format mm/dd/yyyy
    const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
        const [_, m, d, y] = match;
        const iso = `${y}-${m}-${d}`;
        setBirthDate(iso);
        setAge(calculateAge(iso));
    } else {
        setBirthDate('');
        setAge('');
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    if(!step1.email || !step1.password){
      alert('Please complete Step 1 first.');
      navigate('/register');
      return;
    }
    const form = e.currentTarget
    
    const newErrors = {}
    
    // Validation
    if (!form.username.value) newErrors.username = "Username is required"
    if (!form.firstName.value) newErrors.firstName = "First Name is required"
    if (!form.lastName.value) newErrors.lastName = "Last Name is required"
    
    if (!displayDate) {
        newErrors.dateOfBirth = "Date of Birth is required"
    } else if (!birthDate) {
        newErrors.dateOfBirth = "Invalid format (mm/dd/yyyy)"
    } else {
        const dob = new Date(birthDate)
        const today = new Date()
        if (dob > today) {
            newErrors.dateOfBirth = "Date cannot be in the future"
        }
    }

    if (!selectedRegion) newErrors.region = "Region is required"
    if (!selectedProvince) newErrors.province = "Province is required"
    if (!selectedMunicipality) newErrors.municipality = "Municipality is required"
    if (!selectedBarangay) newErrors.barangay = "Barangay is required"
    
    if (gender === 'Other' && !otherGender) {
        newErrors.gender = "Please specify gender"
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
    }

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
      gender: gender === 'Other' ? otherGender : gender,
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
      navigate('/login', { state: { message: "Account successfully created" } })
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
          <form className="form-grid scrollable" onSubmit={submit} noValidate>
            <label className="form-label">Username
              <input name="username" type="text" className="input" />
              {errors.username && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.username}</span>}
            </label>

            <label className="form-label">First Name
              <input name="firstName" type="text" className="input" />
              {errors.firstName && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.firstName}</span>}
            </label>

            <label className="form-label">Last Name
              <input name="lastName" type="text" className="input" />
              {errors.lastName && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.lastName}</span>}
            </label>

            <div className="row">
              <label className="form-label">Date of Birth
                <input 
                  name="dateOfBirth" 
                  type="text" 
                  className="input" 
                  placeholder="mm/dd/yyyy"
                  value={displayDate}
                  onChange={handleDateInput}
                  maxLength={10}
                />
                {errors.dateOfBirth && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.dateOfBirth}</span>}
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
              >
                <option value="">-- Select Region --</option>
                {regions.map(r => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
              {errors.region && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.region}</span>}
            </label>

            <label className="form-label">Province
              <select 
                className="input" 
                value={selectedProvince} 
                onChange={(e) => setSelectedProvince(e.target.value)}
                disabled={!selectedRegion || loading}
              >
                <option value="">-- Select Province --</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
              {errors.province && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.province}</span>}
            </label>

            <label className="form-label">Municipality
              <select 
                className="input" 
                value={selectedMunicipality} 
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                disabled={!selectedProvince || loading}
              >
                <option value="">-- Select Municipality --</option>
                {municipalities.map(m => (
                  <option key={m.code} value={m.code}>{m.name}</option>
                ))}
              </select>
              {errors.municipality && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.municipality}</span>}
            </label>

            <label className="form-label">Barangay
              <select 
                className="input" 
                value={selectedBarangay} 
                onChange={(e) => setSelectedBarangay(e.target.value)}
                disabled={!selectedMunicipality || loading}
              >
                <option value="">-- Select Barangay --</option>
                {barangays.map(b => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
              {errors.barangay && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.barangay}</span>}
            </label>

            <label className="form-label">Street
              <input name="street" type="text" className="input" placeholder="House/Unit/Block No., Street Name" />
            </label>

            <div className="row">
              <div className="form-label">Gender
                <div style={{display:'flex', gap:'15px', marginTop:'8px', alignItems:'center'}}>
                  <label className="radio" style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer'}}>
                    <input type="radio" name="gender" value="Male" checked={gender === 'Male'} onChange={(e)=>setGender(e.target.value)} /> Male
                  </label>
                  <label className="radio" style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer'}}>
                    <input type="radio" name="gender" value="Female" checked={gender === 'Female'} onChange={(e)=>setGender(e.target.value)} /> Female
                  </label>
                  <label className="radio" style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer'}}>
                    <input type="radio" name="gender" value="Other" checked={gender === 'Other'} onChange={(e)=>setGender(e.target.value)} /> Other
                  </label>
                </div>
                {gender === 'Other' && (
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Please specify gender" 
                    style={{marginTop:'8px'}}
                    value={otherGender}
                    onChange={(e) => setOtherGender(e.target.value)}
                  />
                )}
                {errors.gender && <span style={{color:'red', fontSize:'0.8rem'}}>{errors.gender}</span>}
              </div>
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
