import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'

function weekInfo(baseDate = new Date()) {
  const day = baseDate.getDay() || 7
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() - (day - 1))
  const days = []
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const label = `${dt.getDate()} ${dayNames[dt.getDay()]}`
    days.push({ date: dt, label, dayOfWeek: dayNames[dt.getDay()].toUpperCase() })
  }
  return days
}

export default function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [days, setDays] = useState(weekInfo())
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timePickerSlot, setTimePickerSlot] = useState(null)
  const [formData, setFormData] = useState({
    reasonForVisit: '',
    currentSymptoms: [],
    detailedDescription: '',
    medicalHistory: '',
    knownAllergies: '',
    currentMedications: ''
  })
  const [userName, setUserName] = useState('User')

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

  useEffect(() => {
    setDays(weekInfo(currentWeek))
  }, [currentWeek])

  useEffect(() => {
    if (step !== 1) return
    fetch('/api/schedules')
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        const m = { MONDAY: 0, TUESDAY: 1, WEDNESDAY: 2, THURSDAY: 3, FRIDAY: 4, SATURDAY: 5, SUNDAY: 6 }
        const pills = []
        list.filter(s => s.active).forEach(s => {
          const idx = m[(s.dayOfWeek || '').toUpperCase()]
          if (idx === undefined) return
          const t = (s.startTime || '').slice(0, 5)
          const [hh, mm] = t.split(':').map(n => parseInt(n, 10))
          const ampm = hh >= 12 ? 'PM' : 'AM'
          const hour12 = ((hh + 11) % 12) + 1
          const time = `${hour12}:${String(mm).padStart(2, '0')} ${ampm}`
          const doc = s.doctor ? `Dr. ${s.doctor.lastName || ''}` : 'Doctor'
          pills.push({
            day: idx,
            time,
            timeValue: t,
            doctor: doc,
            doctorId: s.doctor?.doctorId,
            doctorFullName: s.doctor ? `${s.doctor.firstName || ''} ${s.doctor.lastName || ''}`.trim() : 'Doctor',
            scheduleId: s.scheduleId
          })
        })
        setSlots(pills)
      })
  }, [step])

  const prevWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const handleSlotClick = (slot, dayIndex) => {
    setTimePickerSlot({ ...slot, dayIndex })
    setShowTimePicker(true)
  }

  const handleTimeConfirm = (time) => {
    if (!timePickerSlot) return
    const dayData = days[timePickerSlot.dayIndex]
    const [hours, minutes] = time.split(':')
    const appointmentDate = new Date(dayData.date)
    appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    
    setSelectedSlot({
      ...timePickerSlot,
      selectedTime: time,
      appointmentDate: appointmentDate.toISOString(),
      dateLabel: dayData.label
    })
    setShowTimePicker(false)
  }

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      currentSymptoms: prev.currentSymptoms.includes(symptom)
        ? prev.currentSymptoms.filter(s => s !== symptom)
        : [...prev.currentSymptoms, symptom]
    }))
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

  const monthYear = days[0]?.date 
    ? `${days[0].date.toLocaleString('default', { month: 'long' })} ${days[0].date.getFullYear()}`
    : ''

  return (
    <div className="dash-bg">
      <DashboardNav userName={userName} active="Dashboard" items={["Dashboard", "My Appointments"]} />
      
      <main className="container dash-main">
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
                <p>Please select your desired time slot</p>
              </div>

              <div className="booking-body">
                <div className="week-nav">
                  <button onClick={prevWeek} className="week-nav-btn">&lt; Previous Week</button>
                  <h3 className="month-title">{monthYear}</h3>
                  <button onClick={nextWeek} className="week-nav-btn">Next Week &gt;</button>
                </div>

                <div className="weekly-view">
                  <div className="calendar">
                    {days.map((d, i) => {
                      const daySlots = slots.filter(s => s.day === i)
                      return (
                        <div key={d.label} className="cal-col">
                          <div className="cal-col-head">{d.label}</div>
                          <div className="cal-col-body">
                            {daySlots.length === 0 ? (
                              <div className="no-slots">No Slots</div>
                            ) : (
                              daySlots.map((s, idx) => (
                                <button
                                  key={idx}
                                  className={`pill clickable ${selectedSlot?.scheduleId === s.scheduleId && selectedSlot?.selectedTime ? 'selected' : ''}`}
                                  onClick={() => handleSlotClick(s, i)}
                                >
                                  <div className="pill-time">{s.time}</div>
                                  <div className="pill-doc">{s.doctor}</div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="booking-actions">
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

          {/* Time Picker Modal */}
          {showTimePicker && (
            <div className="modal-overlay" onClick={() => setShowTimePicker(false)}>
              <div className="time-picker-modal" onClick={e => e.stopPropagation()}>
                <h3>Select Appointment Time</h3>
                <p>Doctor: {timePickerSlot?.doctor}</p>
                <p>Available from: {timePickerSlot?.time}</p>
                <input
                  type="time"
                  className="time-input"
                  defaultValue={timePickerSlot?.timeValue}
                  onChange={e => handleTimeConfirm(e.target.value)}
                />
                <div className="time-picker-actions">
                  <button className="btn btn-gray" onClick={() => setShowTimePicker(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
