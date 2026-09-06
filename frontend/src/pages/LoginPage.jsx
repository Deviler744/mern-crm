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
    if (user) navigate('/')
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
      {/* Page background circles */}
      <div className="login-bg-circle login-bg-circle--tr" />
      <div className="login-bg-circle login-bg-circle--bl" />
      <div className="login-bg-circle login-bg-circle--br" />

      {/* Main dark card */}
      <div className="login-card">
        {/* 3D SVG blobs */}
        <svg className="login-blobs" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="blob1" cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#5fb8ff" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#2480d0" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0a52a0" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="blob2" cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#7dcfff" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#2b8be0" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0a4a90" stopOpacity="0.45" />
            </radialGradient>
            <radialGradient id="blob3" cx="40%" cy="28%" r="58%">
              <stop offset="0%" stopColor="#6ac4ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#1e76cc" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#083e80" stopOpacity="0.4" />
            </radialGradient>
            <filter id="blobBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>

          {/* Top-left large loop */}
          <path d="M -20 60 C 20 10, 100 0, 130 50 C 160 100, 110 150, 60 140 C 10 130, -10 110, -20 60 Z"
            fill="url(#blob1)" filter="url(#blobBlur)" />
          <path d="M 10 80 C 40 40, 100 35, 120 70 C 140 105, 105 135, 70 128 C 35 121, 5 110, 10 80 Z"
            fill="none" stroke="rgba(160,210,255,0.5)" strokeWidth="2" />

          {/* Top-left small blob */}
          <path d="M 80 130 C 95 115, 120 118, 125 135 C 130 152, 110 165, 95 158 C 80 151, 75 143, 80 130 Z"
            fill="url(#blob2)" filter="url(#blobBlur)" />

          {/* Bottom-left large arc */}
          <path d="M -30 280 C 0 240, 70 225, 110 260 C 150 295, 140 355, 90 370 C 40 385, -10 360, -30 320 Z"
            fill="url(#blob1)" filter="url(#blobBlur)" />

          {/* Bottom-left medium loop */}
          <path d="M 50 320 C 75 300, 110 305, 118 328 C 126 351, 105 372, 80 368 C 55 364, 38 345, 50 320 Z"
            fill="url(#blob3)" filter="url(#blobBlur)" />
          <path d="M 60 328 C 78 312, 105 318, 111 336 C 117 354, 100 368, 78 364 C 56 360, 48 342, 60 328 Z"
            fill="none" stroke="rgba(150,210,255,0.45)" strokeWidth="1.5" />

          {/* Top-right shape */}
          <path d="M 580 -10 C 630 20, 660 80, 630 120 C 600 160, 540 155, 510 120 C 480 85, 490 30, 530 10 Z"
            fill="url(#blob2)" filter="url(#blobBlur)" />

          {/* Bottom-right small blob */}
          <path d="M 640 300 C 665 278, 700 282, 710 308 C 720 334, 700 358, 672 355 C 644 352, 625 322, 640 300 Z"
            fill="url(#blob3)" filter="url(#blobBlur)" />

          {/* Highlight dots */}
          <circle cx="130" cy="42" r="10" fill="rgba(180,225,255,0.35)" />
          <circle cx="88" cy="148" r="7" fill="rgba(160,215,255,0.3)" />
          <circle cx="670" cy="285" r="8" fill="rgba(160,215,255,0.3)" />
        </svg>

        {/* Centered glass panel */}
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
              <div className="form-error" style={{ marginBottom: 0 }}>
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
