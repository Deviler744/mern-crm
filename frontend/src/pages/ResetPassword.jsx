import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', { token, password })
      setMessage('Your password has been reset. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to reset password')
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
          Reset Password
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
          Enter a new secure password below.
        </p>

        <form onSubmit={handleSubmit} className="user-form">
          <div>
            <label htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="New password"
              required
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <label htmlFor="reset-confirm">Confirm Password</label>
            <input
              id="reset-confirm"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              placeholder="Confirm new password"
              required
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          {error && <div className="form-error" style={{ marginTop: '16px', marginBottom: '0' }}>{error}</div>}
          {message && <div className="success-message" style={{ marginTop: '16px', marginBottom: '0' }}>{message}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
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
