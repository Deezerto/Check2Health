import DashboardNav from '../components/DashboardNav'
import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function weekInfo(){
  const now = new Date()
  const day = now.getDay() || 7 // 1..7 with Monday=1
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day-1))
  const days = []
  for(let i=0;i<7;i++){
    const dt = new Date(monday); dt.setDate(monday.getDate()+i)
    const label = dt.getDate()+" "+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]
    days.push({date:dt,label})
  }
  return days
}

function useUserName(){
  return useMemo(() => {
    try{
      const raw = sessionStorage.getItem('auth.user')
      if(!raw) return {full:'User', first:'User'}
      const u = JSON.parse(raw)
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || 'User'
      const first = (u.firstName || full || 'User').toString()
      return { full, first }
    }catch{ return {full:'User', first:'User'} }
  }, [])
}

export default function PatientDashboard(){
  const navigate = useNavigate()
  const { full, first } = useUserName()
  const [days,setDays] = useState(weekInfo())
  const [slots,setSlots] = useState([])
  useEffect(()=>{
    try{
      const raw = sessionStorage.getItem('auth.user')
      if(!raw){ navigate('/login') }
    }catch{ navigate('/login') }
  },[navigate])
  useEffect(()=>{
    fetch('/api/schedules')
      .then(r=>r.ok?r.json():[])
      .then(list=>{
        const m = {MONDAY:0,TUESDAY:1,WEDNESDAY:2,THURSDAY:3,FRIDAY:4,SATURDAY:5,SUNDAY:6}
        const pills=[]
        list.filter(s=>s.active).forEach(s=>{
          const idx = m[(s.dayOfWeek||'').toUpperCase()]
          if(idx===undefined) return
          const t = (s.startTime||'').slice(0,5)
          const [hh,mm] = t.split(':').map(n=>parseInt(n,10))
          const ampm = hh>=12? 'PM':'AM'
          const hour12 = ((hh+11)%12)+1
          const time = `${hour12}:${String(mm).padStart(2,'0')} ${ampm}`
          const doc = s.doctor ? `Dr. ${s.doctor.lastName||''}` : 'Doctor'
          pills.push({day:idx,time,doctor:doc})
        })
        setSlots(pills)
      })
  },[])
  return (
    <div className="dash-bg">
      <DashboardNav userName={full} active="Dashboard" items={["Dashboard","My Appointments"]}/>

      <main className="container dash-main">
        <div className="role-badge">Logged in as Patient</div>
        <h1 className="dash-title">Welcome back, {first}!</h1>

        <div className="grid patient-grid">
          <section className="card calendar-card">
            <h2 className="month-title">November 2025</h2>
            <div className="calendar">
              {days.map((d, i) => (
                <div key={d.label} className="cal-col">
                  <div className="cal-col-head">{d.label}</div>
                  <div className="cal-col-body">
                    {slots.filter(s=>s.day===i).length === 0 ? (
                      <div className="no-slots">No Slots</div>
                    ) : (
                      slots.filter(s=>s.day===i && s.time).map((s,idx)=>(
                        <div key={idx} className="pill">
                          <div className="pill-time">{s.time}</div>
                          <div className="pill-doc">{s.doctor}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="side-actions">
            <button className="btn btn-blue side-btn" onClick={() => navigate('/book-appointment')}>Book a New Appointment</button>
            <a className="btn btn-green side-btn" href="#">Upcoming Appointment</a>
          </aside>
        </div>
      </main>
    </div>
  )
}
