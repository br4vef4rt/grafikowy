import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const linkClass = (path: string) =>
    location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div>
          <div className="sidebar-brand">Grafikowy</div>
          <div className="sidebar-subtitle">Planowanie nieobecności i pracy zdalnej</div>
        </div>

        <div className="sidebar-links">
          <Link to="/" className={linkClass('/')}>Pulpit</Link>
          <Link to="/calendar" className={linkClass('/calendar')}>Kalendarz</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={linkClass('/admin')}>Administracja</Link>
          )}
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.full_name}</div>
          <div className="sidebar-user-email">{user?.email}</div>
          <button onClick={logout} className="secondary-button logout-button">
            Wyloguj
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
