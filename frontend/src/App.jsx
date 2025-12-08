import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import RegisterStepOne from './pages/RegisterStepOne'
import RegisterStepTwo from './pages/RegisterStepTwo'
import PatientDashboard from './pages/PatientDashboard'
import StaffDashboard from './pages/StaffDashboard'
import StaffAppointments from './pages/StaffAppointments'
import StaffSchedules from './pages/StaffSchedules'
import StaffAnalytics from './pages/StaffAnalytics'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorSchedule from './pages/DoctorSchedule'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import AppointmentDetails from './pages/AppointmentDetails';
import ConsultationForm from './pages/ConsultationForm';
import ConsultationDetails from './pages/ConsultationDetails'; // Import the new component
import RegisterDoctor from './pages/RegisterDoctor';
import RegisterStaff from './pages/RegisterStaff';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './components/ProfileModal.css'
import './styles/profile-extra.css'

export default function App() {
  return (
    <Routes>
      {/* Home is the default landing page for unauthenticated users */}
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<RegisterStepOne />} />
      <Route path="/register/details" element={<RegisterStepTwo />} />
      <Route path="/dashboard/patient" element={<PatientDashboard />} />
      <Route path="/dashboard/patient/appointments" element={<MyAppointments />} />
      {/* Add new route for patient consultation details */}
      <Route path="/dashboard/patient/appointments/:id" element={<ConsultationDetails />} />
      
      {/* Staff and Admin Routes */}
      <Route path="/dashboard/staff" element={<StaffDashboard />} />
      <Route path="/dashboard/staff/appointments" element={<StaffAppointments />} />
      <Route path="/dashboard/staff/schedules" element={<StaffSchedules />} />
      <Route path="/dashboard/staff/analytics" element={<StaffAnalytics />} />
      
      {/* Admin Only Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/dashboard/staff/register-doctor" element={<RegisterDoctor />} />
        <Route path="/dashboard/staff/register-staff" element={<RegisterStaff />} />
      </Route>

      <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
      <Route path="/dashboard/doctor/schedule" element={<DoctorSchedule />} />
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/dashboard/doctor/appointment/:id" element={<AppointmentDetails />} />
      <Route path="/dashboard/doctor/consultation/:id" element={<ConsultationForm />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
