import DashboardNav from '../components/DashboardNav'
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role && user.role !== 'DOCTOR') {
      navigate('/dashboard/patient')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user && user.doctorId) {
      api.get(`/reservations/doctor/${user.doctorId}`)
        .then(response => response.data)
        .then(data => {
          // Use local date for comparison to avoid timezone issues
          const today = new Date()
          const todayStr = today.toLocaleDateString('en-CA')

          // Calculate Tomorrow
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          const tomorrowStr = tomorrow.toLocaleDateString('en-CA')

          // Calculate End of Week (Sunday)
          const endOfWeek = new Date(today)
          const distanceToSunday = (7 - today.getDay()) % 7
          endOfWeek.setDate(today.getDate() + distanceToSunday)
          const endOfWeekStr = endOfWeek.toLocaleDateString('en-CA')

          const todaysAppointments = data.filter(appointment => {
            const appointmentDate = appointment.reservationDate.split('T')[0];
            return appointment.reservationStatus === 'CONFIRMED' && appointmentDate === todayStr;
          });

          const upcomingAppointments = data.filter(appointment => {
            const appointmentDate = appointment.reservationDate.split('T')[0];
            return appointment.reservationStatus === 'CONFIRMED' &&
              appointmentDate >= tomorrowStr &&
              appointmentDate <= endOfWeekStr;
          });

          const formatApt = (list) => list.map(appointment => ({
            id: appointment.reservationID,
            name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
            time: new Date(appointment.reservationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(appointment.reservationDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            reason: appointment.reasonForVisit,
          }));

          setAppointments(formatApt(todaysAppointments));
          setUpcoming(formatApt(upcomingAppointments));
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

        <section className="card list-card" style={{ marginTop: '2rem' }}>
          <div className="list-header">
            <h2>Upcoming This Week</h2>
          </div>
          <ul className="apt-list">
            {upcoming.length > 0 ? (
              upcoming.map((a) => (
                <li key={a.id} className="apt-item">
                  <div className="apt-left">
                    <div className="apt-name">{a.name}</div>
                    <div className="apt-time">{a.date} at {a.time}</div>
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
              <p>No upcoming appointments for the rest of the week.</p>
            )}
          </ul>
        </section>
      </main>
    </div>
  )
}