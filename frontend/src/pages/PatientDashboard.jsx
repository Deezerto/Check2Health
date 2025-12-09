import DashboardNav from '../components/DashboardNav'
import { useMemo, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function useUserName() {
  return useMemo(() => {
    try {
      const raw = sessionStorage.getItem('auth.user')
      if (!raw) return { full: 'User', first: 'User' }
      const u = JSON.parse(raw)
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || 'User'
      const first = (u.firstName || full || 'User').toString()
      return { full, first }
    } catch { return { full: 'User', first: 'User' } }
  }, [])
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { full, first } = useUserName()

  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [doctors, setDoctors] = useState([])
  const [allSchedules, setAllSchedules] = useState([])
  const [availabilitySlots, setAvailabilitySlots] = useState({ morning: [], afternoon: [], evening: [] })
  const [bookedSlots, setBookedSlots] = useState([]) // New state

  // Initial Data Fetch
  useEffect(() => {
    const raw = sessionStorage.getItem('auth.user')
    if (!raw) navigate('/login')

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
              lastName: s.doctor.lastName
            });
          }
        });
        setDoctors(uniqueDoctors);
        if (uniqueDoctors.length > 0) {
          setSelectedDoctor(uniqueDoctors[0].id);
        }
      })
      .catch(() => { })
  }, [navigate])

  // Fetch Booked Slots
  useEffect(() => {
    if (!selectedDoctor) {
      setBookedSlots([])
      return
    }

    fetch(`/api/reservations/doctor/${selectedDoctor}`)
      .then(res => res.json())
      .then(data => {
        // Store booked dates for this doctor
        // Filter out Cancelled/Denied
        const booked = data
          .filter(r => r.reservationStatus !== 'Cancelled' && r.reservationStatus !== 'Denied')
          .map(r => r.reservationDate) // Keep as is (ISO string usually)
        setBookedSlots(booked)
      })
      .catch(() => setBookedSlots([]))
  }, [selectedDoctor])

  // Calendar Helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay() // 0 = Sun

    // Adjust for Monday start if needed, but standard US calendar usually starts Sun.
    // Let's stick to standard Sunday start for simplicity unless specified otherwise.
    // User didn't specify start day, standard is Sunday.

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

    // Check if past date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

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

    // 2. Fallback to generic schedule
    const genericSchedule = allSchedules.find(s =>
      s.active &&
      s.doctor &&
      String(s.doctor.doctorId) === String(selectedDoctor) &&
      s.dayOfWeek.toUpperCase() === dayOfWeek &&
      !s.specificDate
    )

    return !!genericSchedule
  }

  // Generate Slots for Selected Date
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setAvailabilitySlots({ morning: [], afternoon: [], evening: [] })
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

    let current = new Date(selectedDate)
    current.setHours(startH, startM, 0, 0)

    const end = new Date(selectedDate)
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

      // Check filters
      // 1. Past
      const now = new Date()
      if (current < now) {
        current.setMinutes(current.getMinutes() + 30)
        continue
      }

      // 2. Booked
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      const day = String(current.getDate()).padStart(2, '0')
      const hh = String(current.getHours()).padStart(2, '0')
      const mm = String(current.getMinutes()).padStart(2, '0')
      const slotIso = `${year}-${month}-${day}T${hh}:${mm}:00`

      const isBooked = bookedSlots.some(bookedDate => bookedDate.startsWith(slotIso))

      if (!isBooked) {
        if (h < 12) morning.push(timeStr)
        else if (h < 17) afternoon.push(timeStr) // 12 PM to 4:59 PM
        else evening.push(timeStr) // 5 PM onwards
      }

      current.setMinutes(current.getMinutes() + 30)
    }

    setAvailabilitySlots({ morning, afternoon, evening })

  }, [selectedDoctor, selectedDate, allSchedules, bookedSlots])

  const calendarDays = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + offset)
    setCurrentDate(newDate)
  }

  return (
    <div className="dash-bg">
      <DashboardNav userName={full} active="Dashboard" items={["Dashboard", "My Appointments"]} />

      <main className="container dash-main" style={{ width: '88%', maxWidth: '1600px' }}>
        <h1 className="dash-title">Welcome back, {first}!</h1>

        <div className="grid patient-grid" style={{ position: 'relative', zIndex: 1, marginLeft: '60px' }}>
          <div className="card" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: '30px',
            minHeight: '500px',
            position: 'relative',
            zIndex: 20
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px' }}>

              {/* Left Column: Filter & Calendar */}
              <div style={{ borderRight: '1px solid #eee', paddingRight: '40px' }}>
                {/* Doctor Filter */}
                <div style={{ marginBottom: '30px', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Select Doctor</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="input"
                      style={{
                        width: '100%',
                        padding: '10px',
                        paddingRight: '30px',
                        borderRadius: '8px',
                        border: '1px solid rgb(226, 232, 240)',
                        appearance: 'none',
                        backgroundColor: 'rgb(255, 255, 255)',
                        fontSize: '16px',
                        color: 'rgb(0, 0, 0)',
                        cursor: 'pointer'
                      }}
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                      {doctors.map(d => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>&lt;</button>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{monthName}</span>
                    <button onClick={() => changeMonth(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>&gt;</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '10px' }}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{d}</div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '10px' }}>
                    {calendarDays.map((date, i) => {
                      if (!date) return <div key={i}></div>

                      const isSelected = isSameDate(date, selectedDate)
                      const isTodayDate = isSameDate(date, new Date())
                      const available = hasAvailability(date)

                      // Check if past for disabling
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPast = date < today;

                      return (
                        <div
                          key={i}
                          onClick={() => !isPast && setSelectedDate(date)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: isPast ? 'default' : 'pointer',
                            position: 'relative',
                            padding: '5px',
                            opacity: isPast ? 0.4 : 1
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            fontSize: '14px',
                            fontWeight: '500',
                            backgroundColor: isSelected ? '#5A9EF9' : (isTodayDate ? '#f1f5f9' : 'transparent'),
                            color: isSelected ? '#fff' : '#1e293b',
                            border: isTodayDate && !isSelected ? '1px solid #cbd5e1' : 'none'
                          }}>
                            {date.getDate()}
                          </div>
                          {available && (
                            <div style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: '#7ED957',
                              marginTop: '4px'
                            }}></div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Availability */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '440px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', flexShrink: 0 }}>
                  Availability for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>

                {availabilitySlots.morning.length === 0 && availabilitySlots.afternoon.length === 0 && availabilitySlots.evening.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#475569' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8', marginBottom: '10px' }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p>No availability on this date</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', overflowY: 'auto', paddingRight: '10px', flex: 1 }}>
                    {availabilitySlots.morning.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Morning</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                          {availabilitySlots.morning.map(time => (
                            <div key={time} style={{
                              padding: '8px 12px',
                              backgroundColor: 'rgba(37, 99, 235, 0.1)',
                              border: '1px solid #2563eb',
                              borderRadius: '20px',
                              color: '#1e3a8a',
                              fontSize: '14px',
                              fontWeight: '600',
                              textAlign: 'center',
                              cursor: 'default'
                            }}>
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {availabilitySlots.afternoon.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Afternoon</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                          {availabilitySlots.afternoon.map(time => (
                            <div key={time} style={{
                              padding: '8px 12px',
                              backgroundColor: 'rgba(37, 99, 235, 0.1)',
                              border: '1px solid #2563eb',
                              borderRadius: '20px',
                              color: '#1e3a8a',
                              fontSize: '14px',
                              fontWeight: '600',
                              textAlign: 'center',
                              cursor: 'default'
                            }}>
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {availabilitySlots.evening.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Evening</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                          {availabilitySlots.evening.map(time => (
                            <div key={time} style={{
                              padding: '8px 12px',
                              backgroundColor: 'rgba(37, 99, 235, 0.1)',
                              border: '1px solid #2563eb',
                              borderRadius: '20px',
                              color: '#1e3a8a',
                              fontSize: '14px',
                              fontWeight: '600',
                              textAlign: 'center',
                              cursor: 'default'
                            }}>
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="side-actions" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '-15px' }}>
            <button
              onClick={() => navigate('/book-appointment')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#5A9EF9',
                color: 'white',
                padding: '15px 50px 15px 50px',
                border: 'none',
                borderTopRightRadius: '9999px',
                borderBottomRightRadius: '9999px',
                marginLeft: '-40px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'transform 0.2s ease',
                textAlign: 'left',
                width: '100%',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <span>Book Appointment</span>
              <span style={{ opacity: 0.7, fontSize: '18px', marginLeft: '10px' }}>||</span>
            </button>

            <Link
              to="/dashboard/patient/appointments"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#7ED957',
                color: 'white',
                padding: '15px 50px 15px 50px',
                textDecoration: 'none',
                borderTopRightRadius: '9999px',
                borderBottomRightRadius: '9999px',
                marginLeft: '-40px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'transform 0.2s ease',
                width: '100%',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <span>Upcoming Appointment</span>
              <span style={{ opacity: 0.7, fontSize: '18px', marginLeft: '10px' }}>||</span>
            </Link>
          </aside>
        </div>
      </main>
    </div>
  )
}
