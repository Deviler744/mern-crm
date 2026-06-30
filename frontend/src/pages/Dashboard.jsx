import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [widgets, setWidgets] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard')
        const data = response.data || {}
        const summary = data.summary || {}

        const responseWidgets = data.widgets || []
        const mappedWidgets = [
          summary.housesVisitedToday != null && {
            title: 'Houses Visited Today',
            value: `${summary.housesVisitedToday}`
          },
          summary.territoriesVisited != null && {
            title: 'Territories Visited',
            value: `${summary.territoriesVisited}`
          },
          summary.territoryCompletion != null && {
            title: 'Territory Completion',
            value: `${summary.territoryCompletion}%`
          },
          summary.todayRevenue != null && {
            title: 'Today Revenue',
            value: formatCurrency(summary.todayRevenue)
          },
          summary.activeRank != null && {
            title: 'Active Rank',
            value: `${summary.activeRank}`
          },
          summary.teamRevenue != null && {
            title: 'Team Revenue',
            value: formatCurrency(summary.teamRevenue)
          },
          summary.availableTerritories != null && {
            title: 'Available Territories',
            value: `${summary.availableTerritories}`
          },
          summary.completedTerritories != null && {
            title: 'Completed Territories',
            value: `${summary.completedTerritories}`
          },
          summary.totalSales != null && {
            title: 'Total Sales',
            value: `${summary.totalSales}`
          },
          summary.totalRevenue != null && {
            title: 'Total Revenue',
            value: formatCurrency(summary.totalRevenue)
          },
          summary.territoriesManaged != null && {
            title: 'Territories Managed',
            value: `${summary.territoriesManaged}`
          },
          summary.activeReps != null && {
            title: 'Active Reps',
            value: `${summary.activeReps}`
          }
        ].filter(Boolean)

        const fallbackWidgets = Object.entries(summary)
          .filter(([key, value]) => value !== null && typeof value !== 'object')
          .map(([key, value]) => ({
            title: key
              .replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (match) => match.toUpperCase()),
            value: String(value)
          }))

        setWidgets(responseWidgets.length ? responseWidgets : (mappedWidgets.length ? mappedWidgets : fallbackWidgets))
        setRecentActivity(
          Array.isArray(data.recentActivity)
            ? data.recentActivity
            : Array.isArray(data.summary?.liveSalesFeed)
            ? data.summary.liveSalesFeed
            : []
        )
        setMessage(data.message || `Welcome back, ${user?.name}`)
      } catch (err) {
        const status = err?.response?.status
        if (status === 401) {
          logout()
          navigate('/login')
          return
        }
        console.error('Failed to load dashboard metrics', err)
        setMessage(err?.response?.data?.message || 'Unable to load dashboard metrics')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [logout, navigate, user?.name])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  return (
    <section className="page-section">
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <p className="eyebrow">Real-Time Operations</p>
          <h1>{user?.name}</h1>
          <p className="subtitle" style={{ textTransform: 'capitalize' }}>
            {message || `Role: ${user?.role === 'admin' ? 'Security Admin' : user?.role === 'manager' ? 'Manager' : 'Representative'}`}
          </p>
        </div>
        {user?.role === 'representative' && (
          <button 
            type="button" 
            onClick={() => navigate('/territories')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
            }}
          >
            My Territory Map
          </button>
        )}
      </header>

      {loading ? (
        <div className="loading-state">Loading dashboard analytics...</div>
      ) : (
        <>
          {/* Dashboard Widgets */}
          <div className="grid-cards" style={{ marginBottom: '40px' }}>
            {widgets.map((widget, index) => (
              <article className="card" key={index}>
                <h2>{widget.title}</h2>
                <p className="metric-value">{widget.value}</p>
              </article>
            ))}
          </div>

          {/* Recent Activity Ticker / List */}
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Live Sales Stream</span>
              <span style={{ 
                fontSize: '0.75rem', 
                background: '#e0e7ff', 
                color: '#4f46e5', 
                padding: '4px 8px', 
                borderRadius: '9999px',
                fontWeight: 700
              }}>
                Real-Time Updates
              </span>
            </h2>

            {recentActivity.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No sales logged yet today. Visit territories to log sales!</p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {recentActivity.map((activity) => (
                  <div 
                    key={activity._id} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#0f172a' }}>
                        {activity.customerName}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                        📍 {activity.address} • {Array.isArray(activity.items) ? activity.items.map(i => `${i.product} (x${i.quantity})`).join(', ') : activity.items || 'Sale details unavailable'}
                      </p>
                    </div>

                                    <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                            +{formatCurrency(activity.amount ?? activity.totalAmount ?? 0)}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                            👤 {activity.rep?.name || 'Representative'} • {activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'}
                          </p>
                        </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
