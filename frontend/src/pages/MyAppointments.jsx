import DashboardNav from '../components/DashboardNav'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function useUserName() {
  return useMemo(() => {
    try {
      const raw = sessionStorage.getItem('auth.user')
      if (!raw) return { full: 'User', first: 'User' }
      const u = JSON.parse(raw)
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || 'User'
      const first = (u.firstName || full || 'User').toString()
      return { full, first }
    } catch {
      return { full: 'User', first: 'User' }
    }
  }, [])
}

function formatDateTime(isoString) {
  try {
    const date = new Date(isoString)
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December']
    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const minutesStr = minutes.toString().padStart(2, '0')
    return `${month} ${day}, ${year} at ${hours}:${minutesStr} ${ampm}`
  } catch {
    return 'Invalid Date'
  }
}

function getStatusBadgeClass(status) {
  const normalized = (status || '').toUpperCase()
  if (normalized === 'CONFIRMED') return 'badge-confirmed'
  if (normalized === 'PENDING') return 'badge-pending'
  if (normalized === 'CANCELLED') return 'badge-cancelled'
  return 'badge-pending'
}

function getStatusLabel(status) {
  const normalized = (status || '').toUpperCase()
  if (normalized === 'CONFIRMED') return 'Confirmed'
  if (normalized === 'PENDING') return 'Pending'
  if (normalized === 'CANCELLED') return 'Cancelled'
  return status
}

export default function MyAppointments() {
  const navigate = useNavigate()
  const { full } = useUserName()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('auth.user')
      if (!raw) {
        navigate('/login')
        return
      }
      const user = JSON.parse(raw)
      const patientId = user.patientID || user.patientId || user.id

      fetch(`/api/reservations/patient/${patientId}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => {
          setAppointments(data)
          setLoading(false)
        })
        .catch(() => {
          setAppointments([])
          setLoading(false)
        })
    } catch {
      navigate('/login')
    }
  }, [navigate])

  const upcoming = appointments.filter(a => {
    try {
      const date = new Date(a.reservationDate)
      return date >= new Date()
    } catch {
      return false
    }
  })

  const past = appointments.filter(a => {
    try {
      const date = new Date(a.reservationDate)
      return date < new Date()
    } catch {
      return false
    }
  })

  const displayList = activeTab === 'upcoming' ? upcoming : past

  return (
    <div className="dash-bg">
      <DashboardNav userName={full} active="My Appointments" items={["Dashboard", "My Appointments"]} />

      <main className="container dash-main">
        <div className="appointments-container">
          <div className="appointments-card">
            <h2 className="appointments-header">My Appointments</h2>
            
            <div className="appointments-tabs">
              <button
                className={`appointments-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`appointments-tab ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past
              </button>
            </div>

            <div className="appointments-list">
              {loading ? (
                <div className="appointments-empty">Loading...</div>
              ) : displayList.length === 0 ? (
                <div className="appointments-empty">
                  No {activeTab} appointments
                </div>
              ) : (
                displayList.map((appt) => (
                  <div key={appt.reservationID} className="appointment-item">
                    <div className="appointment-info">
                      <div className="appointment-doctor">
                        Dr. {appt.doctor?.firstName || ''} {appt.doctor?.lastName || ''}
                      </div>
                      <div className="appointment-date">
                        {formatDateTime(appt.reservationDate)}
                      </div>
                    </div>
                    <span className={`appointment-badge ${getStatusBadgeClass(appt.reservationStatus)}`}>
                      {getStatusLabel(appt.reservationStatus)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button className="btn btn-green appointments-back" onClick={() => navigate('/dashboard/patient')}>
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
