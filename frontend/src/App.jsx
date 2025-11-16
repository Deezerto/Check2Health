import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

export default function App() {
  return (
    <Routes>
      {/* Home is the default landing page for unauthenticated users */}
      <Route index element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
