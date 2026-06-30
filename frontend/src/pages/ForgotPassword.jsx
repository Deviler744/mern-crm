import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/forgot-password', { email })
      setMessage(response.data.message)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 800, 
          color: '#0f172a',
          margin: '0 0 8px',
          textAlign: 'center'
        }}>
          Forgot Password
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
          Enter your email and we will send reset instructions.
        </p>

        <form onSubmit={handleSubmit} className="user-form">
          <div>
            <label htmlFor="forgot-email">Email Address</label>
            <input
              id="forgot-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="user@example.com"
              required
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          {error && <div className="form-error" style={{ marginTop: '16px', marginBottom: '0' }}>{error}</div>}
          {message && <div className="success-message" style={{ marginTop: '16px', marginBottom: '0' }}>{message}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
            {loading ? 'Submitting...' : 'Send reset link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/login')} 
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
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
