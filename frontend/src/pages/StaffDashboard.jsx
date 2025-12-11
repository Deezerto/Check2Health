import DashboardNav from '../components/DashboardNav'
import PendingAppointmentModal from '../components/PendingAppointmentModal'
import ApproveConfirmationModal from '../components/ApproveConfirmationModal'
import RescheduleModal from '../components/RescheduleModal'
import DenyConfirmationModal from '../components/DenyConfirmationModal'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [pendingModalOpen, setPendingModalOpen] = useState(false)
  const [approveConfirmationOpen, setApproveConfirmationOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [denyConfirmationOpen, setDenyConfirmationOpen] = useState(false)

  const [pendingAppointments, setPendingAppointments] = useState([])
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, patients: 0 })
  const [staffName, setStaffName] = useState('')
  const [userRole, setUserRole] = useState(null)
  const [weeklyStats, setWeeklyStats] = useState([0, 0, 0, 0, 0, 0, 0])

  const { user, loading } = useAuth() // Use AuthContext instead of sessionStorage

  useEffect(() => {
    if (!loading) {
      if (user && (user.role === 'STAFF' || user.role === 'ADMIN')) {
        setStaffName(`${user.firstName} ${user.lastName}`)
        setUserRole(user.role)
      } else {
        navigate('/login')
      }
    }
  }, [user, loading, navigate])

  useEffect(() => {
    Promise.all([
      fetch('/api/reservations/status/PENDING').then(res => res.json()),
      fetch('/api/reservations/status/CONFIRMED').then(res => res.json()),
      fetch('/api/patients').then(res => res.json())
    ]).then(([pendingData, confirmedData, patientsData]) => {
      // Update Stats
      setStats({
        pending: pendingData.length,
        confirmed: confirmedData.length,
        patients: patientsData.length
      })

      // Update Table (Pending only)
      const formatted = pendingData.map(r => ({
        id: r.reservationID,
        name: `${r.patient.firstName} ${r.patient.lastName}`,
        doctor: `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`,
        dt: new Date(r.reservationDate).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
        }),
        reason: r.reasonForVisit,
        raw: r
      }))
      setPendingAppointments(formatted)

      // Update Chart (Pending + Confirmed)
      calculateWeeklyStats([...pendingData, ...confirmedData])

    }).catch(err => console.error('Failed to fetch dashboard data:', err))
  }, [])

  const calculateWeeklyStats = (reservations) => {
    const now = new Date()
    const currentDay = now.getDay() // 0=Sun, 1=Mon, ...
    const diffToMon = currentDay === 0 ? 6 : currentDay - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - diffToMon)
    monday.setHours(0, 0, 0, 0)

    const counts = [0, 0, 0, 0, 0, 0, 0]

    reservations.forEach(r => {
      const d = new Date(r.reservationDate)
      const diffTime = d.getTime() - monday.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays >= 0 && diffDays < 7) {
        counts[diffDays]++
      }
    })
    setWeeklyStats(counts)
  }

  const handleAction = (action) => {
    if (action === 'approve') {
      setPendingModalOpen(false)
      setApproveConfirmationOpen(true)
    } else if (action === 'reschedule') {
      setPendingModalOpen(false)
      setRescheduleOpen(true)
    } else if (action === 'deny') {
      setPendingModalOpen(false)
      setDenyConfirmationOpen(true)
    }
  }

  const handleCloseAll = () => {
    setPendingModalOpen(false)
    setApproveConfirmationOpen(false)
    setRescheduleOpen(false)
    setDenyConfirmationOpen(false)
    setSelectedAppointment(null)
  }

  const confirmApprove = () => {
    if (!selectedAppointment) return

    fetch(`/api/reservations/${selectedAppointment.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' })
    })
      .then(res => {
        if (res.ok) {
          setPendingAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id))
          setStats(prev => ({
            ...prev,
            pending: prev.pending - 1,
            confirmed: prev.confirmed + 1
          }))
          handleCloseAll()
        }
      })
      .catch(err => console.error('Failed to approve:', err))
  }

  const confirmDeny = () => {
    if (!selectedAppointment) return

    fetch(`/api/reservations/${selectedAppointment.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' })
    })
      .then(res => {
        if (res.ok) {
          setPendingAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id))
          setStats(prev => ({
            ...prev,
            pending: prev.pending - 1
          }))
          handleCloseAll()
        }
      })
      .catch(err => console.error('Failed to deny:', err))
  }

  const confirmReschedule = (doctorId, dateTime) => {
    if (!selectedAppointment) return

    // Fetch the doctor object first to ensure we have the correct data for the PUT request
    fetch(`/api/doctors/${doctorId}`)
      .then(res => res.json())
      .then(doctor => {
        const payload = {
          ...selectedAppointment.raw,
          reservationDate: dateTime,
          reservationStatus: 'RESCHEDULED',
          doctor: doctor
        }

        return fetch(`/api/reservations/${selectedAppointment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      })
      .then(res => {
        if (res && res.ok) {
          // Update UI: Remove from pending list as it is now RESCHEDULED
          setPendingAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id))
          setStats(prev => ({
            ...prev,
            pending: prev.pending - 1
          }))
          handleCloseAll()
          alert('Appointment successfully rescheduled.')
        } else {
          alert('Failed to reschedule appointment.')
        }
      })
      .catch(err => console.error('Failed to reschedule:', err))
  }

  // Calculate max for chart scaling
  const maxStat = Math.max(...weeklyStats, 10)

  return (
    <div className="dash-bg">
      <DashboardNav userName={staffName} active="Dashboard" items={["Dashboard", "Manage Appointments", "Schedules", "Analytics"]} role="STAFF" />

      <main className="container dash-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1rem' }}>
          <h1 className="dash-title" style={{ margin: 0 }}>Welcome back, {staffName.split(' ')[0]}!</h1>
          {userRole === 'ADMIN' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/dashboard/staff/register-doctor" className="btn btn-blue" style={{ textDecoration: 'none' }}>
                Register Doctor
              </Link>
              <Link to="/dashboard/staff/register-staff" className="btn btn-blue" style={{ textDecoration: 'none' }}>
                Register Staff
              </Link>
            </div>
          )}
        </div>

        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-label">Confirmed Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.patients}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>

        <section className="card table-card">
          <div className="table-title">Pending Approval Queue</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No pending appointments found.
                    </td>
                  </tr>
                ) : (
                  pendingAppointments.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.doctor}</td>
                      <td>{p.dt}</td>
                      <td className="dim">{p.reason}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedAppointment(p)
                            setPendingModalOpen(true)
                          }}
                          style={{
                            backgroundColor: 'rgb(37, 99, 235)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          &gt;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card chart-card">
          <div className="chart-title">Bookings This Week</div>
          <div className="bar-chart">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
              const count = weeklyStats[i]
              const height = (count / maxStat) * 100
              return (
                <div key={d} className="bar">
                  <div className="bar-fill" style={{ height: `${Math.max(height, 5)}%` }} title={`${count} bookings`}></div>
                  <span className="bar-label">{d}</span>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <PendingAppointmentModal
        appointment={selectedAppointment}
        open={pendingModalOpen}
        onClose={() => setPendingModalOpen(false)}
        onAction={handleAction}
      />

      <ApproveConfirmationModal
        appointment={selectedAppointment}
        open={approveConfirmationOpen}
        onClose={() => {
          setApproveConfirmationOpen(false)
          setPendingModalOpen(true)
        }}
        onConfirm={confirmApprove}
      />

      <RescheduleModal
        appointment={selectedAppointment}
        open={rescheduleOpen}
        onClose={() => {
          setRescheduleOpen(false)
          setPendingModalOpen(true)
        }}
        onConfirm={confirmReschedule}
      />

      <DenyConfirmationModal
        open={denyConfirmationOpen}
        onClose={() => {
          setDenyConfirmationOpen(false)
          setPendingModalOpen(true)
        }}
        onConfirm={confirmDeny}
      />
    </div>
  )
}
