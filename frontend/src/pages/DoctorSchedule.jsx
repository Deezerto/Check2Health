import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function DoctorSchedule() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(DAYS.map(d => ({ dayOfWeek: d, active: false, startTime: '09:00', endTime: '17:00' })))

  const user = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('auth.user') || '{}') } catch { return {} }
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') { navigate('/login'); return }
    fetch(`/api/schedules/doctor/${user.doctorId}`)
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
        }
      })
  }, [navigate, user])

  const update = (idx, patch) => setRows(r => r.map((row, i) => i === idx ? { ...row, ...patch } : row))

  const save = async () => {
    // Map back to uppercase for API if needed, or keep as is depending on backend. 
    // Assuming backend expects uppercase based on previous code.
    const payload = rows.map(r => ({
      dayOfWeek: r.dayOfWeek.toUpperCase(),
      isActive: r.active,
      startTime: r.startTime,
      endTime: r.endTime
    }))

    await fetch(`/api/schedules/doctor/${user.doctorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    alert('Schedule saved')
  }

  return (
    <div className="dash-bg" style={{ backgroundColor: '#E3F2FD', minHeight: '100vh' }}>
      <DashboardNav active="My Schedule" items={["Dashboard", "My Schedule"]} role="DOCTOR" userName={user.name} />

      <main className="container dash-main" style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>

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
              marginBottom: '20px',
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

          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '40px' }}>
            {rows.map((r, idx) => (
              <div key={r.dayOfWeek} style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 1fr',
                gap: '10px',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <label style={{ fontWeight: 800, display: 'flex', alignItems: 'center', color: '#000' }}>
                  <input
                    type="checkbox"
                    checked={r.active}
                    onChange={e => update(idx, { active: e.target.checked })}
                    style={{ marginRight: '8px', width: '20px', height: '20px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  {r.dayOfWeek}
                </label>
                <div>
                  <label className="form-label" style={{ display: 'inline-grid', gridTemplateColumns: '110px 140px', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6c757d' }}>Start Time :</span>
                    <div className="custom-time-wrapper">
                      <input
                        type="time"
                        className="input"
                        value={r.startTime}
                        onChange={e => update(idx, { startTime: e.target.value })}
                        disabled={!r.active}
                        onClick={(e) => r.active && e.target.showPicker && e.target.showPicker()}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fff',
                          color: '#000',
                          opacity: r.active ? 1 : 0.5,
                          cursor: r.active ? 'pointer' : 'default'
                        }}
                      />
                      <svg className="custom-time-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: r.active ? 1 : 0.5 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'inline-grid', gridTemplateColumns: '100px 140px', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6c757d' }}>End Time :</span>
                    <div className="custom-time-wrapper">
                      <input
                        type="time"
                        className="input"
                        value={r.endTime}
                        onChange={e => update(idx, { endTime: e.target.value })}
                        disabled={!r.active}
                        onClick={(e) => r.active && e.target.showPicker && e.target.showPicker()}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fff',
                          color: '#000',
                          opacity: r.active ? 1 : 0.5,
                          cursor: r.active ? 'pointer' : 'default'
                        }}
                      />
                      <svg className="custom-time-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: r.active ? 1 : 0.5 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
                backgroundColor: '#6495ED',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Save Schedule
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
