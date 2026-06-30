import PropTypes from 'prop-types'
import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Territories from '../pages/Territories'
import SalesLedger from '../pages/SalesLedger'
import Leaderboard from '../pages/Leaderboard'
import Products from '../pages/Products'
import Users from '../pages/Users'
import LoginPage from '../pages/LoginPage'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import Sidebar from '../components/Sidebar'
import RoleGuard from '../components/RoleGuard'
import { useAuth } from '../context/AuthContext'

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-content">{children}</main>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node
}

export default function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route
        path="/"
        element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/users" replace />
            ) : (
              <Layout>
                <Dashboard />
              </Layout>
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      <Route
        path="/territories"
        element={
          user ? (
            <Layout>
              <RoleGuard allowedRoles={['manager', 'representative']}>
                <Territories />
              </RoleGuard>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/sales"
        element={
          user ? (
            <Layout>
              <RoleGuard allowedRoles={['manager', 'representative']}>
                <SalesLedger />
              </RoleGuard>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/leaderboard"
        element={
          user ? (
            <Layout>
              <RoleGuard allowedRoles={['manager', 'representative']}>
                <Leaderboard />
              </RoleGuard>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/products"
        element={
          user ? (
            <Layout>
              <RoleGuard allowedRoles={['manager', 'representative']}>
                <Products />
              </RoleGuard>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/users"
        element={
          user ? (
            <Layout>
              <RoleGuard allowedRoles={['admin']}>
                <Users />
              </RoleGuard>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  )
}
