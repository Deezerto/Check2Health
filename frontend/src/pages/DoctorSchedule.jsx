import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import DashboardNav from '../components/DashboardNav'
import WheelTimePicker from '../components/WheelTimePicker'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function DoctorSchedule() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(DAYS.map(d => ({ dayOfWeek: d, active: false, startTime: '09:00', endTime: '17:00' })))

  // Initialize to the Monday of the current week
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const monday = new Date(d.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  const user = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('auth.user') || '{}') } catch { return {} }
  }, [])

  const formatDate = (date) => {
    // Use 'en-CA' to get YYYY-MM-DD format in local time
    return date.toLocaleDateString('en-CA')
  }

  const fetchSchedule = (weekStart) => {
    if (!user || user.role !== 'DOCTOR') return

    const dateStr = formatDate(weekStart)
    fetch(`/api/schedules/doctor/${user.doctorId}?date=${dateStr}`)
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        if (Array.isArray(list) && list.length) {
          const map = new Map(list.map(s => [s.dayOfWeek.toUpperCase(), s]))
          setRows(DAYS.map(d => {
            const s = map.get(d.toUpperCase())
            if (!s) return { dayOfWeek: d, active: false, startTime: '09:00', endTime: '17:00' }
            const fmt = (t) => t ? String(t).slice(0, 5) : '09:00'
            return { dayOfWeek: d, active: !!s.active, startTime: fmt(s.startTime), endTime: fmt(s.endTime) }
          }))
        } else {
          // Reset to default if no schedule found for this week
          setRows(DAYS.map(d => ({ dayOfWeek: d, active: false, startTime: '09:00', endTime: '17:00' })))
        }
      })
  }

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') { navigate('/login'); return }
    fetchSchedule(currentWeekStart)
  }, [navigate, user, currentWeekStart])

  const update = (idx, patch) => setRows(r => r.map((row, i) => i === idx ? { ...row, ...patch } : row))

  const save = async () => {
    const payload = rows.map(r => ({
      dayOfWeek: r.dayOfWeek.toUpperCase(),
      isActive: r.active,
      startTime: r.startTime,
      endTime: r.endTime
    }))

    const dateStr = formatDate(currentWeekStart)
    await fetch(`/api/schedules/doctor/${user.doctorId}?date=${dateStr}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    alert('Schedule saved for the week of ' + currentWeekStart.toLocaleDateString())
  }

  const changeWeek = (weeks) => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (weeks * 7))
    setCurrentWeekStart(newDate)
  }

  const copyLastWeek = () => {
    const lastWeek = new Date(currentWeekStart)
    lastWeek.setDate(lastWeek.getDate() - 7)

    // Fetch last week's schedule but don't save it yet, just populate the form
    const dateStr = formatDate(lastWeek)
    fetch(`/api/schedules/doctor/${user.doctorId}?date=${dateStr}`)
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        if (Array.isArray(list) && list.length) {
          const map = new Map(list.map(s => [s.dayOfWeek.toUpperCase(), s]))
          setRows(DAYS.map(d => {
            const s = map.get(d.toUpperCase())
            if (!s) return { dayOfWeek: d, active: false, startTime: '09:00', endTime: '17:00' }
            const fmt = (t) => t ? String(t).slice(0, 5) : '09:00'
            return { dayOfWeek: d, active: !!s.active, startTime: fmt(s.startTime), endTime: fmt(s.endTime) }
          }))
          alert("Copied schedule from previous week. Don't forget to save!")
        } else {
          alert("No schedule found for last week.")
        }
      })
  }

  const formatTime12Hour = (time24) => {
    if (!time24) return '--:-- --'
    const [h, m] = time24.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${period}`
  }

  const weekEnd = new Date(currentWeekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return (
    <div className="dash-bg">
      <DashboardNav active="My Schedule" items={["Dashboard", "My Schedule"]} role="DOCTOR" userName={`Dr. ${user.firstName || ''} ${user.lastName || ''}`} />

      <main className="container dash-main" style={{ display: 'flex', justifyContent: 'center' }}>

        <div className="card" style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          padding: '40px',
          width: '100%',
          maxWidth: '900px'
        }}>

          <div style={{ marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '10px',
              textAlign: 'left'
            }}>
              Manage Your Weekly Availability
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              marginBottom: '0'
            }}>
              Patients will only be able to book slots during the times you set here.
            </p>
          </div>

          {/* Week Scrubber Header */}
          <div style={{
            position: 'sticky',
            top: '0',
            backgroundColor: '#fff',
            zIndex: 10,
            paddingBottom: '20px',
            borderBottom: '1px solid #f1f5f9',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={() => changeWeek(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px' }}>
                  <ChevronLeft size={24} color="#1e293b" />
                </button>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                  {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button onClick={() => changeWeek(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px' }}>
                  <ChevronRight size={24} color="#1e293b" />
                </button>
              </div>
              <button
                onClick={copyLastWeek}
                style={{
                  color: '#1E90FF',
                  background: 'none',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Copy size={16} />
                Copy last week's schedule
              </button>
            </div>
            <div style={{
              marginTop: '10px',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontWeight: 'bold' }}>i</span>
              Viewing schedule for specific week. Changes do not affect other weeks.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '40px' }}>
            {rows.map((r, idx) => (
              <div key={r.dayOfWeek} style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 1fr',
                gap: '10px',
                alignItems: 'center',
                padding: '20px 0',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <label style={{ fontWeight: 800, display: 'flex', alignItems: 'center', color: '#000', cursor: 'pointer' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: r.active ? 'none' : '1px solid #cbd5e1',
                    backgroundColor: r.active ? '#1E90FF' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    transition: 'all 0.2s'
                  }}>
                    {r.active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                  <input
                    type="checkbox"
                    checked={r.active}
                    onChange={e => update(idx, { active: e.target.checked })}
                    style={{ display: 'none' }}
                  />
                  {r.dayOfWeek}
                </label>
                <div>
                  <label className="form-label" style={{ display: 'inline-grid', gridTemplateColumns: '110px 140px', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: r.active ? '#000' : '#94a3b8', fontWeight: '500' }}>Start Time :</span>
                    <div className="custom-time-wrapper" style={{ position: 'relative' }}>
                      {r.active ? (
                        <WheelTimePicker
                          value={r.startTime}
                          onChange={val => update(idx, { startTime: val })}
                          label="Start Time"
                        />
                      ) : (
                        <div style={{
                          padding: '10px 12px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: '#94a3b8',
                          fontSize: '14px',
                          fontWeight: '500',
                          width: '140px'
                        }}>
                          {formatTime12Hour(r.startTime)}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'inline-grid', gridTemplateColumns: '100px 140px', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: r.active ? '#000' : '#94a3b8', fontWeight: '500' }}>End Time :</span>
                    <div className="custom-time-wrapper" style={{ position: 'relative' }}>
                      {r.active ? (
                        <WheelTimePicker
                          value={r.endTime}
                          onChange={val => update(idx, { endTime: val })}
                          label="End Time"
                        />
                      ) : (
                        <div style={{
                          padding: '10px 12px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: '#94a3b8',
                          fontSize: '14px',
                          fontWeight: '500',
                          width: '140px'
                        }}>
                          {formatTime12Hour(r.endTime)}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div>
            <button
              onClick={save}
              style={{
                backgroundColor: '#1E90FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1E90FF'}
            >
              Save Schedule
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
