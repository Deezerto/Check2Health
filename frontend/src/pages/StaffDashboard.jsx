import DashboardNav from '../components/DashboardNav'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const pending = [
  { name: 'John Smith', doctor: 'Dr. Evelyn Reed', dt: 'Nov 17, 2025, 9:00 AM', reason: 'I have a fever, this was...' },
  { name: 'Maria Garcia', doctor: 'Dr. Teodoro Castillo', dt: 'Nov 17, 2025, 9:00 AM', reason: 'I have a fever, this was...' },
  { name: 'David Lee', doctor: 'Dr. Miguel Santos', dt: 'Nov 17, 2025, 9:00 AM', reason: 'I have a fever, this was...' },
  { name: 'Elvin Lagamo', doctor: 'Dr. Hugh Jackson', dt: 'Nov 17, 2025, 9:00 AM', reason: 'I have a fever, this was...' },
]

export default function StaffDashboard() {
  const navigate = useNavigate()
  useEffect(() => {
    const raw = sessionStorage.getItem('auth.user')
    if (!raw) { navigate('/login') }
  }, [navigate])
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.doctor}</td>
                    <td>{p.dt}</td>
                    <td className="dim">{p.reason}</td>
                    <td><a className="btn btn-blue btn-xs" href="#">View</a></td>
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
    </div>
  )
}
