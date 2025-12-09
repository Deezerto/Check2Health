import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'
import AiConciergeWidget from '../components/AiConciergeWidget'

export default function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Auth State
  const [userName, setUserName] = useState('User')

  // Calendar & Booking State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [allSchedules, setAllSchedules] = useState([])
  const [availabilitySlots, setAvailabilitySlots] = useState({ morning: [], afternoon: [], evening: [] })
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Form Data State
  const [formData, setFormData] = useState({
    reasonForVisit: '',
    currentSymptoms: [],
    detailedDescription: '',
    medicalHistory: '',
    knownAllergies: '',
    currentMedications: ''
  })

  // Auth Check
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('auth.user')
      if (!raw) {
        navigate('/login')
        return
      }
      const u = JSON.parse(raw)
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || 'User'
      setUserName(name)
    } catch {
      navigate('/login')
    }
  }, [navigate])

  // Fetch Schedules & Doctors
  useEffect(() => {
    fetch('/api/schedules')
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        setAllSchedules(list)

        // Extract unique doctors
        const uniqueDoctors = [];
        const map = new Map();
        list.forEach(s => {
          if (s.doctor && !map.has(s.doctor.doctorId)) {
            map.set(s.doctor.doctorId, true);
            uniqueDoctors.push({
              id: s.doctor.doctorId,
              firstName: s.doctor.firstName,
              lastName: s.doctor.lastName,
              medicalRole: s.doctor.medicalRole
            });
          }
        });
        setDoctors(uniqueDoctors);
        setFilteredDoctors(uniqueDoctors);
        if (uniqueDoctors.length > 0) {
          setSelectedDoctor(uniqueDoctors[0].id);
        }
      })
      .catch(() => { })
  }, [])

  // Calendar Helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay() // 0 = Sun
    const res = []
    for (let i = 0; i < firstDay; i++) res.push(null)
    for (let i = 1; i <= days; i++) res.push(new Date(year, month, i))
    return res
  }

  const isSameDate = (d1, d2) => {
    return d1 && d2 &&
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
  }

  const hasAvailability = (date) => {
    if (!date || !selectedDoctor) return false
    const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toUpperCase()

    // 1. Try to find specific date schedule
    const specificSchedule = allSchedules.find(s =>
      s.active &&
      s.doctor &&
      String(s.doctor.doctorId) === String(selectedDoctor) &&
      s.specificDate === dateStr
    )

    if (specificSchedule) return true

    // 2. Fallback to generic schedule (only if no specific schedule exists for this date)
    // Note: If the system is fully migrated to weekly, generic might be deprecated, but keeping for safety.
    const genericSchedule = allSchedules.find(s =>
      s.active &&
      s.doctor &&
      String(s.doctor.doctorId) === String(selectedDoctor) &&
      s.dayOfWeek.toUpperCase() === dayOfWeek &&
      !s.specificDate
    )

    return !!genericSchedule
  }

  // Generate Slots
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setAvailabilitySlots({ morning: [], afternoon: [], evening: [] })
      setSelectedSlot(null) // Reset selection on date/doctor change
      return
    }

    const dateStr = selectedDate.toLocaleDateString('en-CA') // YYYY-MM-DD
    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase()

    // 1. Try specific date
    let schedule = allSchedules.find(s =>
      s.active &&
      s.doctor &&
      String(s.doctor.doctorId) === String(selectedDoctor) &&
      s.specificDate === dateStr
    )

    // 2. Fallback to generic
    if (!schedule) {
      schedule = allSchedules.find(s =>
        s.active &&
        s.doctor &&
        String(s.doctor.doctorId) === String(selectedDoctor) &&
        s.dayOfWeek.toUpperCase() === dayOfWeek &&
        !s.specificDate
      )
    }

    if (!schedule) {
      setAvailabilitySlots({ morning: [], afternoon: [], evening: [] })
      return
    }

    const startStr = (schedule.startTime || '').slice(0, 5)
    const endStr = (schedule.endTime || '').slice(0, 5)

    if (!startStr || !endStr) {
      setAvailabilitySlots({ morning: [], afternoon: [], evening: [] })
      return
    }

    const [startH, startM] = startStr.split(':').map(Number)
    const [endH, endM] = endStr.split(':').map(Number)

    let current = new Date()
    current.setHours(startH, startM, 0, 0)
    const end = new Date()
    end.setHours(endH, endM, 0, 0)

    const morning = []
    const afternoon = []
    const evening = []

    while (current <= end) {
      const h = current.getHours()
      const m = current.getMinutes()
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 || 12
      const timeStr = `${h12}:${String(m).padStart(2, '0')} ${ampm}`

      if (h < 12) morning.push(timeStr)
      else if (h < 17) afternoon.push(timeStr)
      else evening.push(timeStr)

      current.setMinutes(current.getMinutes() + 30)
    }

    setAvailabilitySlots({ morning, afternoon, evening })
  }, [selectedDoctor, selectedDate, allSchedules])

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + offset)
    setCurrentDate(newDate)
  }

  const handleSlotSelection = (time) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA') // YYYY-MM-DD
    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase()

    // 1. Try specific date
    let schedule = allSchedules.find(s =>
      s.active &&
      s.doctor &&
      String(s.doctor.doctorId) === String(selectedDoctor) &&
      s.specificDate === dateStr
    )

    // 2. Fallback to generic
    if (!schedule) {
      schedule = allSchedules.find(s =>
        s.active &&
        s.doctor &&
        String(s.doctor.doctorId) === String(selectedDoctor) &&
        s.dayOfWeek.toUpperCase() === dayOfWeek &&
        !s.specificDate
      )
    }

    const doctorObj = doctors.find(d => String(d.id) === String(selectedDoctor))
    const doctorFullName = doctorObj ? `Dr. ${doctorObj.firstName} ${doctorObj.lastName}` : 'Doctor'

    // Construct appointment date
    const [timePart, ampm] = time.split(' ')
    const [hoursStr, minutesStr] = timePart.split(':')
    let hours = parseInt(hoursStr, 10)
    if (ampm === 'PM' && hours < 12) hours += 12
    if (ampm === 'AM' && hours === 12) hours = 0

    const appointmentDate = new Date(selectedDate)
    appointmentDate.setHours(hours, parseInt(minutesStr, 10), 0, 0)

    // Fix: Send local time string instead of UTC
    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
    const day = String(appointmentDate.getDate()).padStart(2, '0');
    const hh = String(appointmentDate.getHours()).padStart(2, '0');
    const mm = String(appointmentDate.getMinutes()).padStart(2, '0');
    const localIsoDate = `${year}-${month}-${day}T${hh}:${mm}:00`;

    setSelectedSlot({
      time,
      selectedTime: time,
      doctor: doctorFullName,
      doctorId: selectedDoctor,
      doctorFullName,
      scheduleId: schedule?.scheduleId,
      appointmentDate: localIsoDate,
      dateLabel: selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    })
  }

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      currentSymptoms: prev.currentSymptoms.includes(symptom)
        ? prev.currentSymptoms.filter(s => s !== symptom)
        : [...prev.currentSymptoms, symptom]
    }))
  }

  const handleAiFilter = (role, symptom) => {
    // 1. Auto-fill the "Reason for Visit" (Bonus Feature)
    setFormData(prev => ({ ...prev, reasonForVisit: symptom }));

    // 2. Filter doctors based on the recommended role
    if (!role) return;

    // Normalize for comparison (assuming role is like "Cardiologist")
    const targetRole = role.toLowerCase();

    const matching = doctors.filter(d =>
      d.medicalRole && d.medicalRole.toLowerCase().includes(targetRole)
    );

    if (matching.length > 0) {
      setFilteredDoctors(matching);
      setSelectedDoctor(matching[0].id);
    } else {
      // Logic: If no exact match, stay on all doctors but maybe alert?
      // Or just filter to empty? Better to show all and alert.
      alert(`No doctors found for role: ${role}. Showing all available doctors.`);
      setFilteredDoctors(doctors);
    }
  }

  const goToStep2 = () => {
    if (!selectedSlot) {
      alert('Please select a time slot first')
      return
    }
    setStep(2)
  }

  const goToStep3 = () => {
    if (!formData.reasonForVisit.trim()) {
      alert('Please enter a reason for visit')
      return
    }
    if (formData.currentSymptoms.length === 0) {
      alert('Please select at least one current symptom')
      return
    }
    if (!formData.detailedDescription.trim()) {
      alert('Please provide a detailed description')
      return
    }
    setStep(3)
  }

  const confirmBooking = async () => {
    try {
      const raw = sessionStorage.getItem('auth.user')
      if (!raw) {
        alert('Please log in again')
        navigate('/login')
        return
      }
      const user = JSON.parse(raw)
      const patientId = user.patientID || user.patientId || user.id

      const preConsultationData = {
        currentSymptoms: formData.currentSymptoms,
        detailedDescription: formData.detailedDescription,
        medicalHistory: formData.medicalHistory,
        knownAllergies: formData.knownAllergies,
        currentMedications: formData.currentMedications
      }

      const payload = {
        patientId,
        doctorId: selectedSlot.doctorId,
        reservationDate: selectedSlot.appointmentDate,
        reasonForVisit: formData.reasonForVisit,
        preConsultationData: JSON.stringify(preConsultationData)
      }

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to create reservation')

      alert('Booking submitted! Your appointment is pending approval.')
      navigate('/dashboard/patient')
    } catch (err) {
      alert('Failed to create booking: ' + err.message)
    }
  }

  const calendarDays = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="dash-bg">
      <DashboardNav userName={userName} active="Dashboard" items={["Dashboard", "My Appointments"]} />

      <main className="container dash-main" style={{ width: '95%', maxWidth: '1600px' }}>
        <div className="booking-container">
          {/* Progress Bar */}
          <div className="booking-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="progress-label">Step 1: Select Slot</div>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="progress-label">Step 2: Screening</div>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <div className="progress-label">Step 3: Confirm</div>
            </div>
          </div>

          {/* Step 1: Select Slot */}
          {step === 1 && (
            <div className="booking-card">
              <div className="booking-header">
                <h2>Book an Appointment</h2>
                <p>Please select your doctor and desired time slot</p>
              </div>

              <div className="booking-body" style={{ padding: '0' }}>
                <div className="card" style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  padding: '20px',
                  minHeight: '400px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>

                    {/* Left Column: Filter & Calendar */}
                    <div style={{ borderRight: '1px solid #eee', paddingRight: '30px' }}>
                      {/* Doctor Filter */}
                      <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>Select Doctor</label>
                        <div style={{ position: 'relative' }}>
                          <select
                            className="input"
                            style={{
                              width: '100%',
                              padding: '8px',
                              paddingRight: '30px',
                              borderRadius: '8px',
                              border: '1px solid rgb(226, 232, 240)',
                              appearance: 'none',
                              backgroundColor: 'rgb(255, 255, 255)',
                              fontSize: '14px',
                              color: 'rgb(0, 0, 0)',
                              cursor: 'pointer'
                            }}
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                          >
                            {filteredDoctors.map(d => (
                              <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
                            ))}
                          </select>
                          <span style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            fontSize: '10px',
                            color: '#64748b'
                          }}>▼</span>
                        </div>
                      </div>

                      {/* Mini Calendar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>&lt;</button>
                          <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>{monthName}</span>
                          <button onClick={() => changeMonth(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>&gt;</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '5px' }}>
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{d}</div>
                          ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '5px' }}>
                          {calendarDays.map((date, i) => {
                            if (!date) return <div key={i}></div>

                            const isSelected = isSameDate(date, selectedDate)
                            const isTodayDate = isSameDate(date, new Date())
                            const available = hasAvailability(date)

                            return (
                              <div
                                key={i}
                                onClick={() => setSelectedDate(date)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  padding: '2px'
                                }}
                              >
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '50%',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  backgroundColor: isSelected ? '#5A9EF9' : (isTodayDate ? '#f1f5f9' : 'transparent'),
                                  color: isSelected ? '#fff' : '#1e293b',
                                  border: isTodayDate && !isSelected ? '1px solid #cbd5e1' : 'none'
                                }}>
                                  {date.getDate()}
                                </div>
                                {available && (
                                  <div style={{
                                    width: '3px',
                                    height: '3px',
                                    borderRadius: '50%',
                                    backgroundColor: '#7ED957',
                                    marginTop: '2px'
                                  }}></div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Availability */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '380px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px', flexShrink: 0 }}>
                        Availability for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h2>

                      {availabilitySlots.morning.length === 0 && availabilitySlots.afternoon.length === 0 && availabilitySlots.evening.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#475569' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8', marginBottom: '10px' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <p style={{ fontSize: '14px' }}>No availability on this date</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px', flex: 1 }}>
                          {['Morning', 'Afternoon', 'Evening'].map(period => {
                            const slots = availabilitySlots[period.toLowerCase()]
                            if (slots.length === 0) return null
                            return (
                              <div key={period}>
                                <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{period}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                                  {slots.map(time => {
                                    const isSelected = selectedSlot?.selectedTime === time && isSameDate(new Date(selectedSlot?.appointmentDate), selectedDate)
                                    return (
                                      <button
                                        key={time}
                                        onClick={() => handleSlotSelection(time)}
                                        style={{
                                          padding: '6px 10px',
                                          backgroundColor: isSelected ? '#5A9EF9' : '#FFFFFF',
                                          border: `1px solid ${isSelected ? '#5A9EF9' : '#e2e8f0'}`,
                                          borderRadius: '20px',
                                          color: isSelected ? '#FFFFFF' : '#475569',
                                          fontSize: '14px',
                                          fontWeight: '600',
                                          textAlign: 'center',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = '#eff6ff'
                                            e.currentTarget.style.borderColor = '#5A9EF9'
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = '#FFFFFF'
                                            e.currentTarget.style.borderColor = '#e2e8f0'
                                          }
                                        }}
                                      >
                                        {time}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="booking-actions" style={{ marginTop: '15px' }}>
                  <button className="btn btn-gray" onClick={() => navigate('/dashboard/patient')}>Back</button>
                  <button className="btn btn-blue" onClick={goToStep2} disabled={!selectedSlot}>
                    Next: Pre-Consultation Survey
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pre-Consultation Survey */}
          {step === 2 && (
            <div className="booking-card">
              <div className="booking-header">
                <h2>Pre-Consultation Survey</h2>
                <p>Please provide your information to help us prepare your visit</p>
              </div>

              <div className="booking-body survey-form">
                <label className="form-label">
                  Reason for Visit <span style={{ color: 'red' }}>*</span>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Annual Check-up, Sore throat"
                    value={formData.reasonForVisit}
                    onChange={e => setFormData({ ...formData, reasonForVisit: e.target.value })}
                  />
                </label>

                <div className="form-label">
                  Current Symptoms <span style={{ color: 'red' }}>*</span>
                  <div className="symptom-grid">
                    {['Fever', 'Cough', 'Headache', 'Dizziness', 'Muscle Ache', 'Back Pain', 'Shortness of Breath', 'Colds', 'Fatigue', 'Vomiting', 'Sore Throat', 'Stomach Ache', 'No Symptoms', 'Others'].map(symptom => (
                      <button
                        key={symptom}
                        type="button"
                        className={`symptom-btn ${formData.currentSymptoms.includes(symptom) ? 'selected' : ''}`}
                        onClick={() => handleSymptomToggle(symptom)}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="form-label">
                  Detailed Description <span style={{ color: 'red' }}>*</span>
                  <textarea
                    className="input"
                    rows="4"
                    placeholder="Please describe what you feel in detail"
                    value={formData.detailedDescription}
                    onChange={e => setFormData({ ...formData, detailedDescription: e.target.value })}
                  />
                </label>

                <label className="form-label">
                  Medical History <span style={{ color: 'red' }}>*</span>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="e.g., High Blood Pressure, Asthma"
                    value={formData.medicalHistory}
                    onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
                  />
                </label>

                <div className="form-row">
                  <label className="form-label">
                    Known Allergies <span style={{ color: 'red' }}>*</span>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Peanuts, Shellfish, Shrimp"
                      value={formData.knownAllergies}
                      onChange={e => setFormData({ ...formData, knownAllergies: e.target.value })}
                    />
                  </label>

                  <label className="form-label">
                    Current Medications <span style={{ color: 'red' }}>*</span>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Lisinopril 10mg, Tylenol"
                      value={formData.currentMedications}
                      onChange={e => setFormData({ ...formData, currentMedications: e.target.value })}
                    />
                  </label>
                </div>

                <div className="booking-actions">
                  <button className="btn btn-gray" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-blue" onClick={goToStep3}>Next: Review Booking</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="booking-card">
              <div className="booking-header">
                <h2>Confirm Your Appointment</h2>
                <p>Please check your appointment details</p>
              </div>

              <div className="booking-body confirm-view">
                <div className="confirm-grid">
                  <div className="confirm-row">
                    <div className="confirm-label">What</div>
                    <div className="confirm-value">{formData.reasonForVisit}</div>
                  </div>
                  <div className="confirm-row">
                    <div className="confirm-label">When</div>
                    <div className="confirm-value">
                      {selectedSlot?.dateLabel} at {selectedSlot?.selectedTime}
                    </div>
                  </div>
                  <div className="confirm-row">
                    <div className="confirm-label">Who</div>
                    <div className="confirm-value">{selectedSlot?.doctorFullName}</div>
                  </div>
                  <div className="confirm-row">
                    <div className="confirm-label">Where</div>
                    <div className="confirm-value">CITU Clinic</div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button className="btn btn-gray" onClick={() => setStep(2)}>Back</button>
                  <button className="btn btn-blue" onClick={confirmBooking}>Confirm Booking</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AiConciergeWidget onApplyFilter={handleAiFilter} />
    </div>
  )
}
