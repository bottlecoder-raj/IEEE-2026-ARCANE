import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">♻</div>
          <span>UpCycle Connect</span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/materials">Materials</Link>
              <Link to="/requests">Requests</Link>
              <Link to="/analytics">Analytics</Link>
              <div className="navbar-user">
                <span>{user?.name || 'User'}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

