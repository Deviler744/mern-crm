import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuItems = [
  { label: 'Dashboard', path: '/' , roles: ['manager', 'representative'] },
  { label: 'Territories', path: '/territories', roles: ['manager', 'representative'] },
  { label: 'Sales Ledger', path: '/sales', roles: ['manager', 'representative'] },
  { label: 'Live Leaderboard', path: '/leaderboard', roles: ['manager', 'representative'] },
  { label: 'Products', path: '/products', roles: ['manager', 'representative'] },
  { label: 'Security', path: '/users', roles: ['admin'] }
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const items = menuItems.filter((item) => item.roles.includes(user?.role))
  const displayName = user?.role === 'admin' ? 'Admin' : user?.name

  return (
    <aside className="sidebar">
      <div className="brand">Territory Sales</div>
      <nav>
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">{displayName}</div>
        <button type="button" onClick={logout}>Sign Out</button>
      </div>
    </aside>
  )
}
