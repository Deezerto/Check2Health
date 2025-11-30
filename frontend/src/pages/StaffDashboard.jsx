import DashboardNav from '../components/DashboardNav'
import PendingAppointmentModal from '../components/PendingAppointmentModal'
import ApproveConfirmationModal from '../components/ApproveConfirmationModal'
import RescheduleModal from '../components/RescheduleModal'
import DenyConfirmationModal from '../components/DenyConfirmationModal'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const pending = [
  { name: 'John Smith', doctor: 'Dr. Evelyn Reed', dt: 'Nov 17, 2025, 9:00 AM', reason: 'I have a fever, this was...' },
  { name: 'Maria Garcia', doctor: 'Dr. Teodoro Castillo', dt: 'Nov 17, 2025, 9:00 AM', reason: 'I have a fever, this was...' },
  { name: 'David Lee', doctor: 'Dr. Miguel Santos', dt: 'Nov 17, 2025, 9:00 AM', reason: 'I have a fever, this was...' },
  { name: 'Elvin Lagamo', doctor: 'Dr. Hugh Jackson', dt: 'Nov 17, 2025, 9:00 AM', reason: 'I have a fever, this was...' },
]

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [pendingModalOpen, setPendingModalOpen] = useState(false)
  const [approveConfirmationOpen, setApproveConfirmationOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [denyConfirmationOpen, setDenyConfirmationOpen] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('auth.user')
    if (!raw) { navigate('/login') }
  }, [navigate])

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

  return (
    <div className="dash-bg">
      <DashboardNav userName="German Velasco" active="Dashboard" items={["Dashboard", "My Appointments", "Schedules", "Analytics"]} role="STAFF" />

      <main className="container dash-main">
        <div className="role-badge">Logged in as Staff</div>
        <h1 className="dash-title">Welcome back, German!</h1>

        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-value">24</div>
            <div className="stat-label">Pending Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">11</div>
            <div className="stat-label">Confirmed Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">15</div>
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
                {pending.map((p, i) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card chart-card">
          <div className="chart-title">Bookings This Week</div>
          <div className="bar-chart">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
              <div key={d} className="bar">
                <div className="bar-fill" style={{ height: (10 + (i % 7) * 8) + '%' }}></div>
                <span className="bar-label">{d}</span>
              </div>
            ))}
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
        onConfirm={handleCloseAll}
      />

      <RescheduleModal
        appointment={selectedAppointment}
        open={rescheduleOpen}
        onClose={() => {
          setRescheduleOpen(false)
          setPendingModalOpen(true)
        }}
        onConfirm={handleCloseAll}
      />

      <DenyConfirmationModal
        open={denyConfirmationOpen}
        onClose={() => {
          setDenyConfirmationOpen(false)
          setPendingModalOpen(true)
        }}
        onConfirm={handleCloseAll}
      />
    </div>
  )
}
