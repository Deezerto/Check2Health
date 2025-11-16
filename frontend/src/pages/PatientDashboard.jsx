import DashboardNav from '../components/DashboardNav'

const days = ['17 Mon','18 Tue','19 Wed','20 Thu','21 Fri','22 Sat','23 Sun']
const slots = [
  { day:0, time:'9:00 AM', doctor:'Dr. Lee' },
  { day:1, time:'9:00 AM', doctor:'Dr. Castillo' },
  { day:2, time:'9:00 AM', doctor:'Dr. Sy' },
  { day:2, time:'9:00 AM', doctor:'Dr. Smith' },
  { day:3, time:'9:00 AM', doctor:'Dr. Castillo' },
  { day:3, time:'9:00 AM', doctor:'Dr. Sy' },
  { day:4, time:'9:00 AM', doctor:'Dr. Lee' },
  { day:4, time:'9:00 AM', doctor:'Dr. Smith' },
  { day:5, time:'9:00 AM', doctor:'Dr. Lagamo' },
  { day:5, time:'9:00 AM', doctor:'Dr. Smith' },
  { day:6, time:'', doctor:'' },
]

export default function PatientDashboard(){
  return (
    <div className="dash-bg">
      <DashboardNav userName="Elvin Lagamo" active="Dashboard" items={["Dashboard","My Appointments"]}/>

      <main className="container dash-main">
        <h1 className="dash-title">Welcome back, Elvin!</h1>

        <div className="grid patient-grid">
          <section className="card calendar-card">
            <h2 className="month-title">November 2025</h2>
            <div className="calendar">
              {days.map((d, i) => (
                <div key={d} className="cal-col">
                  <div className="cal-col-head">{d}</div>
                  <div className="cal-col-body">
                    {slots.filter(s=>s.day===i && s.time).map((s,idx)=>(
                      <div key={idx} className="pill">
                        <div className="pill-time">{s.time}</div>
                        <div className="pill-doc">{s.doctor}</div>
                      </div>
                    ))}
                    {slots.filter(s=>s.day===i && !s.time).length>0 && (
                      <div className="no-slots">No Slots</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="side-actions">
            <a className="btn btn-blue side-btn" href="#">Book a New Appointment</a>
            <a className="btn btn-green side-btn" href="#">Upcoming Appointment</a>
          </aside>
        </div>
      </main>
    </div>
  )
}
