import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = ({ user }) => {
  const location = useLocation()
  const { isProvider, isSeeker } = useAuth()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3>Navigation</h3>
          <nav className="sidebar-nav">
            {isProvider && (
              <>
                <Link
                  to="/provider/dashboard"
                  className={isActive('/provider/dashboard') ? 'active' : ''}
                >
                  Dashboard
                </Link>
                <Link
                  to="/add-material"
                  className={isActive('/add-material') ? 'active' : ''}
                >
                  Add Material
                </Link>
              </>
            )}
            {isSeeker && (
              <>
                <Link
                  to="/seeker/dashboard"
                  className={isActive('/seeker/dashboard') ? 'active' : ''}
                >
                  Dashboard
                </Link>
              </>
            )}
            <Link
              to="/materials"
              className={isActive('/materials') ? 'active' : ''}
            >
              Browse Materials
            </Link>
            <Link
              to="/requests"
              className={isActive('/requests') ? 'active' : ''}
            >
              Requests
            </Link>
            <Link
              to="/analytics"
              className={isActive('/analytics') ? 'active' : ''}
            >
              Analytics
            </Link>
          </nav>
        </div>

        <div className="sidebar-section">
          <h3>Account</h3>
          <div className="sidebar-user-info">
            <p className="user-name">{user?.name || 'User'}</p>
            <p className="user-role">{user?.role || 'N/A'}</p>
            <p className="user-email">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

