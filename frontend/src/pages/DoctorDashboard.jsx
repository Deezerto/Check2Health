import DashboardNav from '../components/DashboardNav'
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('auth.user')
      if (!raw) {
        navigate('/login')
        return
      }
      const u = JSON.parse(raw)
      setUser(u)
      if (u.role && u.role !== 'DOCTOR') {
        navigate('/dashboard/patient')
      }
    } catch {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (user) {
      fetch(`/api/reservations/doctor/${user.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json()
        })
        .then(data => {
          const today = new Date().toISOString().split('T')[0];
          const todaysAppointments = data.filter(appointment => {
            const appointmentDate = new Date(appointment.schedule.startTime).toISOString().split('T')[0];
            return appointment.status === 'CONFIRMED' && appointmentDate === today;
          });

          const formattedAppointments = todaysAppointments.map(appointment => ({
            id: appointment.reservationID,
            name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
            time: new Date(appointment.schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reason: appointment.purpose,
          }));
          setAppointments(formattedAppointments);
        })
        .catch(error => {
            console.error('Error fetching appointments:', error)
            setError('Failed to fetch appointments. Please try again later.')
        });
    }
  }, [user]);

  const date = new Date()
  const pretty = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="dash-bg">
      <DashboardNav userName={`Dr. ${user?.firstName || ''} ${user?.lastName || ''}`} active="Dashboard" items={["Dashboard", "My Schedule"]} />

      <main className="container dash-main">
        <div className="role-badge">Logged in as Doctor</div>
        <section className="card list-card">
          <div className="list-header">
            <h2>Today's Appointments</h2>
            <div className="muted">{pretty}</div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <ul className="apt-list">
            {appointments.length > 0 ? (
              appointments.map((a) => (
                <li key={a.id} className="apt-item">
                  <div className="apt-left">
                    <div className="apt-name">{a.name}</div>
                    <div className="apt-time">{a.time}</div>
                    <div className="apt-reason">Reason: {a.reason}</div>
                  </div>
                  <div>
                    <Link
                      className="btn btn-blue btn-sm"
                      to={`/dashboard/doctor/appointment/${a.id}`}
                    >
                      View Details
                    </Link>
                  </div>
                </li>
              ))
            ) : (
              <p>You have no appointments scheduled for today.</p>
            )}
          </ul>
        </section>

      </main>
    </div>
  )
}