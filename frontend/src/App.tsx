import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { Spinner } from '@/components/ui'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import CrashReports from '@/pages/CrashReports'
import CrashReportDetail from '@/pages/CrashReportDetail'
import Victims from '@/pages/Victims'
import VictimDetail from '@/pages/VictimDetail'
import UsersPage from '@/pages/Users'
import type { ReactNode } from 'react'

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminOnly({ children }: { children: ReactNode }) {
  const { hasRole } = useAuth()
  if (!hasRole('Admin')) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <Protected>
                <Layout />
              </Protected>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<CrashReports />} />
            <Route path="/reports/:id" element={<CrashReportDetail />} />
            <Route path="/victims" element={<Victims />} />
            <Route path="/victims/:id" element={<VictimDetail />} />
            <Route
              path="/users"
              element={
                <AdminOnly>
                  <UsersPage />
                </AdminOnly>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
