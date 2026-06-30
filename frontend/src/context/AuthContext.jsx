import PropTypes from 'prop-types'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../services/api'

const AuthContext = createContext(null)

const loadUser = () => {
  const storedUser = localStorage.getItem('crmUser')
  return storedUser ? JSON.parse(storedUser) : null
}

const loadToken = () => localStorage.getItem('crmToken') || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [token, setToken] = useState(loadToken)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('crmToken', token)
      localStorage.setItem('crmUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('crmToken')
      localStorage.removeItem('crmUser')
    }
  }, [token, user])

  const login = ({ user: userData, token: jwtToken }) => {
    setAuthToken(jwtToken)
    setUser(userData)
    setToken(jwtToken)
  }

  const logout = () => {
    setAuthToken('')
    setUser(null)
    setToken('')
  }

  const value = useMemo(() => ({ user, token, login, logout }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node
}

export function useAuth() {
  return useContext(AuthContext)
}
