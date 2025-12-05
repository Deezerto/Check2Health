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
      fetch(`/api/reservations/doctor/${user.doctorId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json()
        })
        .then(data => {
          // Use local date for comparison to avoid timezone issues
          const today = new Date().toLocaleDateString('en-CA'); // Gets 'YYYY-MM-DD' in local time

          const todaysAppointments = data.filter(appointment => {
            // The backend sends `reservationDate` as a string like "2025-12-04T09:00:00"
            // We extract just the date part for comparison.
            const appointmentDate = appointment.reservationDate.split('T')[0];
            return appointment.reservationStatus === 'CONFIRMED' && appointmentDate === today;
          });

          const formattedAppointments = todaysAppointments.map(appointment => ({
            id: appointment.reservationID,
            name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
            // Use the correct 'reservationDate' field for time formatting
            time: new Date(appointment.reservationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reason: appointment.reasonForVisit, // Use 'reasonForVisit' from the entity
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