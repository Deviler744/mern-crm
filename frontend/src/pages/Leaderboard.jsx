import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/sales/leaderboard')
        setLeaderboard(response.data)
      } catch (err) {
        console.error('Failed to load leaderboard', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  if (loading) {
    return <div className="loading-state">Calculating active rankings...</div>
  }

  // Get podium users (Top 3)
  const podium = leaderboard.slice(0, 3)
  const remainder = leaderboard.slice(3)

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Representative Standings</p>
          <h1>Live Leaderboard</h1>
          <p className="subtitle">Real-time team standings. Watch the rankings slide as deals close on the street.</p>
        </div>
      </header>

      {/* Podium Visualization */}
      {podium.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '24px',
          margin: '40px auto',
          maxWidth: '800px',
          padding: '0 20px'
        }}>
          {/* 2nd Place */}
          {podium[1] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#e2e8f0', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                fontSize: '1.5rem',
                fontWeight: 800,
                border: '4px solid #cbd5e1',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>🥈</div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{podium[1].name}</h3>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 800 }}>{formatCurrency(podium[1].totalRevenue)}</p>
              </div>
              <div style={{ 
                width: '100%', 
                height: '100px', 
                background: 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)', 
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 800,
                marginTop: '16px'
              }}>2nd</div>
            </div>
          )}

          {/* 1st Place */}
          {podium[0] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.2 }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: '#fef3c7', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                fontSize: '2rem',
                fontWeight: 800,
                border: '4px solid #fbbf24',
                boxShadow: '0 15px 25px -5px rgba(251, 191, 36, 0.3)'
              }}>👑</div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>{podium[0].name}</h3>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>{formatCurrency(podium[0].totalRevenue)}</p>
              </div>
              <div style={{ 
                width: '100%', 
                height: '140px', 
                background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)', 
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 800,
                marginTop: '16px',
                boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.2)'
              }}>1st</div>
            </div>
          )}

          {/* 3rd Place */}
          {podium[2] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#ffedd5', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                fontSize: '1.5rem',
                fontWeight: 800,
                border: '4px solid #fed7aa',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>🥉</div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{podium[2].name}</h3>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 800 }}>{formatCurrency(podium[2].totalRevenue)}</p>
              </div>
              <div style={{ 
                width: '100%', 
                height: '80px', 
                background: 'linear-gradient(180deg, #fed7aa 0%, #f97316 100%)', 
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 800,
                marginTop: '16px'
              }}>3rd</div>
            </div>
          )}
        </div>
      )}

      {/* Main Ranking Table */}
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>Global Representative Standings</h2>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Representative Name</th>
                <th>Email Address</th>
                <th>Total Invoiced Deals</th>
                <th>Total Items Sold</th>
                <th>Total Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, index) => (
                <tr key={item.repId} style={{ background: index < 3 ? '#faf5ff' : 'transparent' }}>
                  <td style={{ fontWeight: 800, fontSize: '1.1rem', color: index === 0 ? '#d97706' : index === 1 ? '#475569' : index === 2 ? '#c2410c' : '#94a3b8' }}>
                    #{index + 1}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {item.name} {index === 0 && '👑'}
                  </td>
                  <td style={{ color: '#64748b' }}>{item.email}</td>
                  <td>{item.totalSalesCount} deals</td>
                  <td>{item.totalQuantity} items</td>
                  <td style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
