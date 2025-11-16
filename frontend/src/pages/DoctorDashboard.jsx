import DashboardNav from '../components/DashboardNav'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const todays = [
  { name:'John Smith', time:'9:00 AM', reason:'Annual Check-up' },
  { name:'Maria Garcia', time:'9:30 AM', reason:'Follow-up on cough' },
  { name:'David Bautista', time:'1:00 PM', reason:'Back Pain' },
  { name:'Faith Santos', time:'1:30 PM', reason:'LBM' },
]

export default function DoctorDashboard(){
  const navigate = useNavigate()
  useEffect(()=>{
    try{
      const raw = sessionStorage.getItem('auth.user')
      if(!raw){ navigate('/login'); return }
      const u = JSON.parse(raw)
      if(u.role && u.role !== 'DOCTOR'){
        navigate('/dashboard/patient')
      }
    }catch{ navigate('/login') }
  },[navigate])
  const date = new Date()
  const pretty = date.toLocaleDateString(undefined,{ year:'numeric', month:'long', day:'numeric' })
  return (
    <div className="dash-bg">
      <DashboardNav userName="Dr. Elvin Lagamo" active="Dashboard" items={["Dashboard","My Schedule"]}/>

      <main className="container dash-main">
        <div className="role-badge">Logged in as Doctor</div>
        <section className="card list-card">
          <div className="list-header">
            <h2>Today's Appointments</h2>
            <div className="muted">{pretty}</div>
          </div>
          <ul className="apt-list">
            {todays.map((a,i)=> (
              <li key={i} className="apt-item">
                <div className="apt-left">
                  <div className="apt-name">{a.name}</div>
                  <div className="apt-time">{a.time}</div>
                  <div className="apt-reason">Reason: {a.reason}</div>
                </div>
                <div>
                  <a className="btn btn-blue btn-sm" href="#">View Details</a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
