import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const DEFAULT_PASSWORD = atob('UGFzc3dvcmQxMjMh')
const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'representative', label: 'Representative' }
]

export default function Users() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', role: 'representative', password: DEFAULT_PASSWORD })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load users')
    }
  }

  const handleDelete = async (id) => {
    setMessage('')
    setError('')

    try {
      await api.delete(`/users/${id}`)
      setMessage('User removed successfully')
      fetchUsers()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove user')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      await api.post('/users', form)
      setMessage('User created successfully')
      setForm({ name: '', email: '', role: 'representative', password: DEFAULT_PASSWORD })
      fetchUsers()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create user')
    }
  }

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Security Admin</p>
          <h1>User Management</h1>
          <p className="subtitle">This security admin console is for managing users, roles, and access rights across the field sales team.</p>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <div className="grid-cards">
        <article className="card">
          <h2>Users</h2>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem._id}>
                    <td>{userItem.name}</td>
                    <td>{userItem.email}</td>
                    <td>{userItem.role.replace('_', ' ')}</td>
                    <td>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(userItem._id)}
                        disabled={userItem._id === user?.id}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h2>Create user</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Full name"
              required
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              placeholder="user@example.com"
              required
            />

            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            <label htmlFor="password">Password</label>
            <input
              id="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              required
            />

            <button type="submit">Create user</button>
          </form>
        </article>
      </div>
    </section>
  )
}
