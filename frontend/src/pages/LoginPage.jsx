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
        <div className="login-decorations" aria-hidden="true">
          <span className="deco deco-top-loop" />
          <span className="deco deco-right-loop" />
          <span className="deco deco-left-sweep" />
          <span className="deco deco-bottom-loop" />
          <span className="deco deco-wave" />
          <span className="deco deco-circle-bl" />
        </div>

        <div className="login-panel">
          <div className="login-heading">
            <h1>Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            <div>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="username@gmail.com"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Password"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="login-forgot">
              <button type="button" onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="form-error" style={{ marginBottom: '0' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
