import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import RegisterStepOne from './pages/RegisterStepOne'
import RegisterStepTwo from './pages/RegisterStepTwo'
import PatientDashboard from './pages/PatientDashboard'
import StaffDashboard from './pages/StaffDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorSchedule from './pages/DoctorSchedule'

export default function App() {
  return (
    <Routes>
      {/* Home is the default landing page for unauthenticated users */}
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterStepOne />} />
      <Route path="/register/details" element={<RegisterStepTwo />} />
      <Route path="/dashboard/patient" element={<PatientDashboard />} />
      <Route path="/dashboard/staff" element={<StaffDashboard />} />
      <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
      <Route path="/dashboard/doctor/schedule" element={<DoctorSchedule />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
