import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      login(response.data)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            background: 'linear-gradient(90deg, #4f46e5 0%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px'
          }}>
            Territory Sales Live
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Sign in to start logging field transactions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div>
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="rep1@example.com"
              required
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              required
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          {error && (
            <div className="form-error" style={{ marginTop: '16px', marginBottom: '0' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/forgot-password')} 
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  )
}
