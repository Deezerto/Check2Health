import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav'

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']

export default function DoctorSchedule(){
  const navigate = useNavigate()
  const [rows, setRows] = useState(DAYS.map(d=>({dayOfWeek:d, active:false, startTime:'09:00', endTime:'17:00'})))
  const user = useMemo(()=>{
    try{return JSON.parse(sessionStorage.getItem('auth.user')||'{}')}catch{return {}}
  },[])

  useEffect(()=>{
    if(!user || user.role !== 'DOCTOR'){ navigate('/login'); return }
    fetch(`/api/schedules/doctor/${user.doctorId}`)
      .then(r=>r.ok?r.json():[])
      .then(list=>{
        if(Array.isArray(list) && list.length){
          const map = new Map(list.map(s=>[s.dayOfWeek.toUpperCase(), s]))
          setRows(DAYS.map(d=>{
            const s = map.get(d)
            if(!s) return {dayOfWeek:d, active:false, startTime:'09:00', endTime:'17:00'}
            const fmt = (t)=> t ? String(t).slice(0,5) : '09:00'
            return {dayOfWeek:d, active: !!s.active, startTime: fmt(s.startTime), endTime: fmt(s.endTime)}
          }))
        }
      })
  },[navigate,user])

  const update = (idx, patch) => setRows(r=> r.map((row,i)=> i===idx? {...row, ...patch} : row))

  const save = async () => {
    await fetch(`/api/schedules/doctor/${user.doctorId}`,{method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(rows)})
    alert('Schedule saved')
  }

  return (
    <div className="dash-bg">
      <DashboardNav active="My Schedule" items={["Dashboard","My Schedule"]}/>
      <main className="container dash-main">
        <h2 style={{margin:'10px 0 14px'}}>Manage Your Weekly Availability</h2>
        <p className="muted" style={{marginTop:0}}>Patients will only be able to book slots during the times you set here.</p>
        <div className="card" style={{padding:'1rem'}}>
          {rows.map((r,idx)=> (
            <div key={r.dayOfWeek} style={{display:'grid',gridTemplateColumns:'160px 1fr 1fr',gap:'10px',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <label style={{fontWeight:800}}>
                <input type="checkbox" checked={r.active} onChange={e=>update(idx,{active:e.target.checked})} style={{marginRight:'8px'}}/>
                {r.dayOfWeek.charAt(0) + r.dayOfWeek.slice(1).toLowerCase()}
              </label>
              <div>
                <label className="form-label" style={{display:'inline-grid',gridTemplateColumns:'110px 140px',gap:'8px',alignItems:'center'}}>
                  <span>Start Time :</span>
                  <input type="time" className="input" value={r.startTime} onChange={e=>update(idx,{startTime:e.target.value})}/>
                </label>
              </div>
              <div>
                <label className="form-label" style={{display:'inline-grid',gridTemplateColumns:'100px 140px',gap:'8px',alignItems:'center'}}>
                  <span>End Time :</span>
                  <input type="time" className="input" value={r.endTime} onChange={e=>update(idx,{endTime:e.target.value})}/>
                </label>
              </div>
            </div>
          ))}
          <div style={{paddingTop:'10px'}}>
            <button className="btn btn-blue" onClick={save}>Save Schedule</button>
          </div>
        </div>
      </main>
    </div>
  )
}
