import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import LoadingScreen from '@/components/shared/LoadingScreen'
import { useAuth } from '@/context/AuthContext'

function Layout() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bk-bg)' }}>
      <Navbar />
      <Outlet />
    </div>
  )
}

function AppRoutes() {
  const { isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div className="p-4">Dashboard</div>} />
        <Route path="/profile" element={<div className="p-4">Profile</div>} />
      </Route>
      <Route path="*" element={<div className="p-4">404</div>} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App