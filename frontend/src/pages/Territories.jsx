import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Territories() {
  const { user } = useAuth()
  
  // Data States
  const [territories, setTerritories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTerritory, setActiveTerritory] = useState(null)
  const activeVisited = activeTerritory ? activeTerritory.houses.filter((h) => h.status !== 'unvisited').length : 0
  const activeTotal = activeTerritory?.houses.length || 0
  const activeCompletion = activeTotal > 0 ? Math.round((activeVisited / activeTotal) * 100) : 0
  
  // UI States
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [saleQuantity, setSaleQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newTerritoryName, setNewTerritoryName] = useState('')
  const [newTerritoryHouses, setNewTerritoryHouses] = useState('')
  const [creatingTerritory, setCreatingTerritory] = useState(false)
  const [managerHouseTerritoryId, setManagerHouseTerritoryId] = useState('')
  const [managerHouseAddresses, setManagerHouseAddresses] = useState('')
  const [repHouseAddresses, setRepHouseAddresses] = useState('')
  const [addingHouses, setAddingHouses] = useState(false)
  const [houseError, setHouseError] = useState('')
  const [houseSuccess, setHouseSuccess] = useState('')

  // Fetch all data
  const fetchData = async () => {
    try {
      const tRes = await api.get('/territories')
      setTerritories(tRes.data)
      
      const pRes = await api.get('/products')
      setProducts(pRes.data)
      
      // Auto-set the representative's active territory if they have one claimed
      if (user?.role === 'representative') {
        const active = tRes.data.find(t => t.assignedRep?._id === user.id && t.status === 'claimed')
        setActiveTerritory(active || null)
      }
    } catch (err) {
      console.error('Error fetching territory data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Claim territory
  const handleClaim = async (territoryId) => {
    try {
      const response = await api.put(`/territories/${territoryId}/claim`)
      setSuccess(`Claimed territory: ${response.data.name}!`)
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to claim territory')
    }
  }

  // Release/Unclaim territory
  const handleUnclaim = async (territoryId) => {
    try {
      await api.put(`/territories/${territoryId}/unclaim`)
      setSuccess('Territory released.')
      setActiveTerritory(null)
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to release territory')
    }
  }

  // Update house visit status directly (e.g. no_answer, not_interested)
  const handleHouseVisit = async (status) => {
    if (!selectedHouse || !activeTerritory) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await api.put(`/territories/${activeTerritory._id}/house`, {
        streetAddress: selectedHouse.streetAddress,
        status
      })
      setSuccess(`Updated ${selectedHouse.streetAddress} to: ${status.replace('_', ' ')}`)
      setSelectedHouse(null)
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update visit log')
    } finally {
      setSubmitting(false)
    }
  }

  // Log a sale for the selected house
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  const handleLogSale = async (e) => {
    e.preventDefault()
    if (!selectedHouse || !selectedProduct || !customerName) {
      setError('Please fill in all sales details.')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    setHouseError('')
    setHouseSuccess('')
    try {
      await api.post('/sales', {
        customerName,
        address: selectedHouse.streetAddress,
        items: [{ product: selectedProduct, quantity: saleQuantity }],
        paymentMethod
      })
      setSuccess(`Sale of ${formatCurrency(products.find(p => p._id === selectedProduct)?.price * saleQuantity)} logged successfully!`)
      
      // Reset form
      setCustomerName('')
      setSelectedProduct('')
      setSaleQuantity(1)
      setSelectedHouse(null)
      
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record sale')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddHouses = async (territoryId, addresses, isManager = false) => {
    if (!territoryId || !addresses.trim()) {
      setHouseError('Please enter at least one house address.')
      return
    }

    setAddingHouses(true)
    setError('')
    setSuccess('')
    setHouseError('')
    setHouseSuccess('')

    try {
      const houseAddresses = addresses
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      await api.put(`/territories/${territoryId}/houses`, { houseAddresses })
      setHouseSuccess('House addresses added successfully.')
      if (isManager) {
        setManagerHouseAddresses('')
      } else {
        setRepHouseAddresses('')
      }
      fetchData()
    } catch (err) {
      setHouseError(err?.response?.data?.message || 'Failed to add houses')
    } finally {
      setAddingHouses(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sold': return '#10b981' // Green
      case 'no_answer': return '#f59e0b' // Yellow
      case 'not_interested': return '#ef4444' // Red
      default: return '#cbd5e1' // Grey
    }
  }

  const handleCreateTerritory = async (e) => {
    e.preventDefault()
    if (!newTerritoryName || !newTerritoryHouses.trim()) {
      setError('Please provide a territory name and at least one house address.')
      return
    }

    setCreatingTerritory(true)
    setError('')
    setSuccess('')

    try {
      const houseAddresses = newTerritoryHouses
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      await api.post('/territories', { name: newTerritoryName.trim(), houseAddresses })
      setSuccess('Territory created successfully.')
      setNewTerritoryName('')
      setNewTerritoryHouses('')
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create territory')
    } finally {
      setCreatingTerritory(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Loading territory grid...</div>
  }

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Interactive Territory Map</p>
          <h1>Field Territories</h1>
          <p className="subtitle">Claim neighborhood blocks and update doorstep sales logs in real-time.</p>
        </div>
      </header>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* REPRESENTATIVE: Claim Screen or Active Territory grid */}
      {user?.role === 'representative' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          
          {/* If NO active territory claimed, show claim selector */}
          {!activeTerritory ? (
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>Available Neighborhood Blocks</h2>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {territories.filter(t => t.status === 'available').length === 0 ? (
                  <p style={{ color: '#64748b' }}>No territories available. Ask your manager to create or release one.</p>
                ) : (
                  territories.filter(t => t.status === 'available').map(t => (
                    <div 
                      key={t._id} 
                      style={{
                        padding: '24px',
                        background: '#fff',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#0f172a' }}>{t.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                          🏠 {t.houses.length} Homes in block
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleClaim(t._id)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#e0e7ff',
                          color: '#4f46e5',
                          fontWeight: 700
                        }}
                      >
                        Claim Territory
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '3fr 1fr' }}>
              
              {/* House Grid */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 4px' }}>{activeTerritory.name}</h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                      Claimed by You • {activeTerritory.houses.filter(h => h.status !== 'unvisited').length} / {activeTerritory.houses.length} Visited
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleUnclaim(activeTerritory._id)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#fee2e2',
                      color: '#ef4444',
                      fontWeight: 700
                    }}
                  >
                    Release Territory
                  </button>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '24px' }}>
                  <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '20px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Visited Homes</p>
                      <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{activeVisited}</p>
                      <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#475569' }}>{activeTotal} total</p>
                    </div>
                    <div style={{ padding: '20px', borderRadius: '20px', background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#4338ca' }}>Completion</p>
                      <p style={{ margin: '8px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#4338ca' }}>{activeCompletion}%</p>
                      <div style={{ marginTop: '12px', height: '10px', background: '#e0e7ff', borderRadius: '9999px' }}>
                        <div style={{ width: `${activeCompletion}%`, height: '100%', background: '#4338ca', borderRadius: '9999px' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
                  {activeTerritory.houses.map((house) => (
                    <button
                      key={house.streetAddress}
                      type="button"
                      onClick={() => setSelectedHouse(house)}
                      style={{
                        padding: '20px 12px',
                        borderRadius: '16px',
                        background: '#fff',
                        border: selectedHouse?.streetAddress === house.streetAddress ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: getStatusColor(house.status), 
                        margin: '0 auto 12px' 
                      }} />
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{house.streetAddress}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize', marginTop: '4px' }}>
                        {house.status.replace('_', ' ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* HOUSE CHECKOUT DRAWER / DETAILS PANEL */}
              <div>
                {selectedHouse ? (
                  <div className="card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#0f172a' }}>House: {selectedHouse.streetAddress}</h3>
                    <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748b' }}>
                      Current Status: <strong style={{ textTransform: 'capitalize' }}>{selectedHouse.status.replace('_', ' ')}</strong>
                    </p>

                    {/* Quick logs */}
                    <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
                      <button 
                        type="button" 
                        onClick={() => handleHouseVisit('not_interested')}
                        disabled={submitting}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#fee2e2',
                          color: '#ef4444',
                          fontWeight: 700,
                          textAlign: 'left'
                        }}
                      >
                        🔴 Not Interested
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleHouseVisit('no_answer')}
                        disabled={submitting}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#fef3c7',
                          color: '#d97706',
                          fontWeight: 700,
                          textAlign: 'left'
                        }}
                      >
                        🟡 No Answer
                      </button>
                    </div>

                    {/* Log sale Form */}
                    <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                      🟢 Log a Sale
                    </h4>
                    <form onSubmit={handleLogSale} className="user-form">
                      <div>
                        <label htmlFor="sale-customer">Customer Name</label>
                        <input
                          id="sale-customer"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="e.g. Mrs. Smith"
                          required
                          style={{ width: '100%', marginTop: '4px' }}
                        />
                      </div>
                      
                      <div style={{ marginTop: '10px' }}>
                        <label htmlFor="sale-product">Select Product</label>
                        <select
                          id="sale-product"
                          value={selectedProduct}
                          onChange={e => setSelectedProduct(e.target.value)}
                          required
                          style={{ width: '100%', marginTop: '4px' }}
                        >
                          <option value="">-- Choose Item --</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name} ({formatCurrency(p.price)})</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <label htmlFor="sale-qty">Quantity</label>
                        <input
                          id="sale-qty"
                          type="number"
                          min="1"
                          value={saleQuantity}
                          onChange={e => setSaleQuantity(parseInt(e.target.value) || 1)}
                          required
                          style={{ width: '100%', marginTop: '4px' }}
                        />
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <label htmlFor="sale-payment">Payment Method</label>
                        <select
                          id="sale-payment"
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value)}
                          style={{ width: '100%', marginTop: '4px' }}
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="digital_wallet">Digital Wallet</option>
                        </select>
                      </div>

                      <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: '16px' }}>
                        {submitting ? 'Recording...' : 'Submit Sale'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    Tap any house pin in the grid to log a visit outcome or checkout a sale.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTerritory && (
            <div className="card" style={{ padding: '32px', marginTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '16px' }}>Add Houses to {activeTerritory.name}</h2>
              <p style={{ margin: '0 0 16px', color: '#475569' }}>Enter one house address per line to add new stops to your active territory.</p>
              {houseError && <div className="form-error">{houseError}</div>}
              {houseSuccess && <div className="success-message">{houseSuccess}</div>}
              <textarea
                value={repHouseAddresses}
                onChange={(e) => setRepHouseAddresses(e.target.value)}
                placeholder="12 Oak Street\n16 Maple Avenue\n24 Birch Lane"
                rows={5}
                style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
              />
              <button
                type="button"
                onClick={() => handleAddHouses(activeTerritory._id, repHouseAddresses, false)}
                disabled={addingHouses}
                style={{ marginTop: '16px' }}
              >
                {addingHouses ? 'Adding Houses...' : 'Add Houses'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MANAGER & ADMIN: Territory Management */}
      {user?.role === 'manager' && (
        <>
          <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>Create New Territory</h2>
            <p style={{ margin: '0 0 20px', color: '#475569' }}>Create territory blocks for your field team, one house address per line.</p>
            <form onSubmit={handleCreateTerritory} className="user-form">
              <div>
                <label htmlFor="territory-name">Territory Name</label>
                <input
                  id="territory-name"
                  value={newTerritoryName}
                  onChange={(e) => setNewTerritoryName(e.target.value)}
                  placeholder="e.g. East Market Block"
                  required
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label htmlFor="territory-houses">House Addresses</label>
                <textarea
                  id="territory-houses"
                  value={newTerritoryHouses}
                  onChange={(e) => setNewTerritoryHouses(e.target.value)}
                  placeholder="12 Oak Street\n14 Pine Lane\n18 Cedar Avenue"
                  rows={6}
                  required
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>

              <button type="submit" disabled={creatingTerritory} style={{ marginTop: '20px' }}>
                {creatingTerritory ? 'Creating...' : 'Create Territory'}
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>Add Houses to a Territory</h2>
            <p style={{ margin: '0 0 16px', color: '#475569' }}>Select a territory and enter one house address per line to add it to the block.</p>
            {houseError && <div className="form-error">{houseError}</div>}
            {houseSuccess && <div className="success-message">{houseSuccess}</div>}
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label htmlFor="manager-territory-select">Territory</label>
                <select
                  id="manager-territory-select"
                  value={managerHouseTerritoryId}
                  onChange={(e) => setManagerHouseTerritoryId(e.target.value)}
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  <option value="">Select territory</option>
                  {territories.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="manager-house-addresses">House Addresses</label>
                <textarea
                  id="manager-house-addresses"
                  value={managerHouseAddresses}
                  onChange={(e) => setManagerHouseAddresses(e.target.value)}
                  placeholder="12 Oak Street\n16 Maple Avenue\n24 Birch Lane"
                  rows={5}
                  style={{ width: '100%', marginTop: '6px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddHouses(managerHouseTerritoryId, managerHouseAddresses, true)}
                disabled={addingHouses}
                style={{ width: 'fit-content' }}
              >
                {addingHouses ? 'Adding Houses...' : 'Add Houses'}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>Territories Assignment & Status Grid</h2>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Territory Name</th>
                  <th>Assigned Representative</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {territories.map(t => {
                  const visited = t.houses.filter(h => h.status !== 'unvisited').length
                  const total = t.houses.length
                  const pct = total > 0 ? Math.round((visited / total) * 100) : 0
                  
                  return (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 700 }}>{t.name}</td>
                      <td>{t.assignedRep ? t.assignedRep.name : <em style={{ color: '#94a3b8' }}>Unassigned</em>}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: t.status === 'completed' ? '#d1fae5' : t.status === 'claimed' ? '#dbeafe' : '#f1f5f9',
                          color: t.status === 'completed' ? '#065f46' : t.status === 'claimed' ? '#1d4ed8' : '#475569'
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#4f46e5' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                            {pct}% ({visited}/{total})
                          </span>
                        </div>
                      </td>
                      <td>
                        {t.status !== 'available' && (
                          <button 
                            type="button"
                            onClick={() => handleUnclaim(t._id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #fca5a5',
                              background: '#fff',
                              color: '#ef4444',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Unassign
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </section>
  )
}
