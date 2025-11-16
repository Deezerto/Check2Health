import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import RegisterStepOne from './pages/RegisterStepOne'
import RegisterStepTwo from './pages/RegisterStepTwo'

export default function App() {
  return (
    <Routes>
      {/* Home is the default landing page for unauthenticated users */}
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterStepOne />} />
      <Route path="/register/details" element={<RegisterStepTwo />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
