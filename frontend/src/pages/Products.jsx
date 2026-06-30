import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState(0)
  const [description, setDescription] = useState('')
  const [editId, setEditId] = useState(null)
  
  // UI states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (editId) {
        // Update product
        await api.put(`/products/${editId}`, { name, sku, price: parseFloat(price) || 0, description })
        setSuccess('Product updated successfully!')
      } else {
        // Create product
        await api.post('/products', { name, sku, price: parseFloat(price) || 0, description })
        setSuccess('Product created successfully!')
      }
      
      // Reset form
      setName('')
      setSku('')
      setPrice(0)
      setDescription('')
      setEditId(null)
      
      fetchProducts()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product) => {
    setEditId(product._id)
    setName(product.name)
    setSku(product.sku)
    setPrice(product.price)
    setDescription(product.description || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${productId}`)
      setSuccess('Product deleted.')
      fetchProducts()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setName('')
    setSku('')
    setPrice(0)
    setDescription('')
  }

  if (loading) {
    return <div className="loading-state">Loading product inventory...</div>
  }

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Inventory Catalog</p>
          <h1>Product Catalog</h1>
          <p className="subtitle">Manage products, model numbers, and pricing catalogs for doorstep orders.</p>
        </div>
      </header>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: '3fr 2fr' }}>
        
        {/* Catalog List */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>Active Inventory</h2>
          {products.length === 0 ? (
            <p style={{ color: '#64748b' }}>No products available. Add some products in the manager panel.</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {products.map((product) => (
                <div 
                  key={product._id} 
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {product.sku}
                    </span>
                    <h3 style={{ margin: '4px 0 8px', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>{product.name}</h3>
                    <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b', minHeight: '40px' }}>
                      {product.description || 'No description provided.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                      {formatCurrency(product.price)}
                    </span>
                    
                    {user?.role === 'manager' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleEdit(product)}
                          style={{
                            padding: '6px 12px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDelete(product._id)}
                          style={{
                            padding: '6px 12px',
                            background: '#fee2e2',
                            color: '#ef4444',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin CRUD panel */}
        {user?.role === 'manager' && (
          <div className="card" style={{ padding: '32px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>
              {editId ? 'Modify Product Info' : 'Introduce New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="user-form">
              <div>
                <label htmlFor="product-name">Product Name</label>
                <input
                  id="product-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Premium Water Filter"
                  required
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label htmlFor="product-sku">Model SKU Code</label>
                <input
                  id="product-sku"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="e.g. WF-PREM-01"
                  required
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label htmlFor="product-price">Retail Price (₹)</label>
                <input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  required
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label htmlFor="product-desc">Description</label>
                <textarea
                  id="product-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of the item"
                  rows="3"
                  style={{ 
                    width: '100%', 
                    marginTop: '6px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    font: 'inherit'
                  }}
                />
              </div>

              <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: '20px' }}>
                {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Publish Product'}
              </button>

              {editId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  style={{ 
                    width: '100%', 
                    marginTop: '8px', 
                    background: 'none', 
                    border: 'none', 
                    color: '#64748b', 
                    textDecoration: 'underline',
                    boxShadow: 'none',
                    fontWeight: 600
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
