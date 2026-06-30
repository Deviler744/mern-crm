import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function SalesLedger() {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get('/sales')
        setSales(response.data)
      } catch (err) {
        console.error('Failed to load sales ledger', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSales()
  }, [])

  const getTotalSalesAmount = () => {
    return sales.reduce((sum, s) => sum + s.totalAmount, 0)
  }

  if (loading) {
    return <div className="loading-state">Loading transaction ledger...</div>
  }

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Financial Accounts</p>
          <h1>Sales Ledger</h1>
          <p className="subtitle">Historical ledger of all doorstep sales transactions recorded in the field.</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid-cards" style={{ marginBottom: '32px' }}>
        <article className="card">
          <h2>Total Transactions</h2>
          <p className="metric-value">{sales.length}</p>
        </article>
        <article className="card">
          <h2>Total Value Logged</h2>
          <p className="metric-value">{formatCurrency(getTotalSalesAmount())}</p>
        </article>
        <article className="card">
          <h2>Average Transaction Value</h2>
          <p className="metric-value">
            {formatCurrency(sales.length > 0 ? Math.round(getTotalSalesAmount() / sales.length) : 0)}
          </p>
        </article>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>Transactions Audit Trail</h2>
        {sales.length === 0 ? (
          <p style={{ color: '#64748b' }}>No transactions recorded yet.</p>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer Name</th>
                  <th>Delivery Address</th>
                  <th>Items Purchased</th>
                  <th>Payment Type</th>
                  {user?.role !== 'representative' && <th>Sales Rep</th>}
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(sale.saleDate).toLocaleDateString()} {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: 700 }}>{sale.customerName}</td>
                    <td>📍 {sale.address}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {sale.items?.map((item, idx) => (
                        <div key={item.product?._id || `${sale._id}-${idx}`}>
                          • {item.product?.name || 'Product'} (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: '#f1f5f9',
                        color: '#475569'
                      }}>
                        {sale.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    {user?.role !== 'representative' && (
                      <td style={{ fontWeight: 600 }}>{sale.rep?.name}</td>
                    )}
                    <td style={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                      {formatCurrency(sale.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
