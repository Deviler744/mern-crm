const express = require('express')
const Sale = require('../models/Sale')
const Product = require('../models/Product')
const Territory = require('../models/Territory')
const User = require('../models/User')
const auth = require('../middleware/auth')
const allowedRoles = require('../middleware/role')

const router = express.Router()

// Log a new sale - representatives only
router.post('/', auth, allowedRoles(['representative']), async (req, res) => {
  try {
    const { customerName, address, items, paymentMethod } = req.body
    if (!customerName || !address || !items || !items.length) {
      return res.status(400).json({ message: 'Customer name, address, and items are required' })
    }

    // Resolve products and compute total
    let totalAmount = 0
    const resolvedItems = []
    
    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` })
      }
      
      const priceAtSale = product.price
      totalAmount += priceAtSale * item.quantity
      
      resolvedItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtSale
      })
    }

    const sale = await Sale.create({
      rep: req.user.id,
      customerName,
      address,
      items: resolvedItems,
      totalAmount,
      paymentMethod: paymentMethod || 'cash'
    })

    // Auto-update Territory house status to 'sold' if address matches
    // We do a search across all territories claimed by this rep
    const territory = await Territory.findOne({
      assignedRep: req.user.id,
      'houses.streetAddress': address
    })

    if (territory) {
      const house = territory.houses.find(h => h.streetAddress === address)
      if (house) {
        house.status = 'sold'
        house.lastVisit = new Date()
      }
      
      // Check if all houses are now visited
      const allVisited = territory.houses.every(h => h.status !== 'unvisited')
      if (allVisited) {
        territory.status = 'completed'
      }
      
      await territory.save()
    }

    res.status(201).json(sale)
  } catch (error) {
    res.status(500).json({ message: 'Failed to record sale', error: error.message })
  }
})

// Get all sales logs - managers and representatives only
router.get('/', auth, allowedRoles(['manager', 'representative']), async (req, res) => {
  try {
    let query = {}
    if (req.user.role === 'representative') {
      query.rep = req.user.id
    }
    
    const sales = await Sale.find(query)
      .populate('rep', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      
    res.json(sales)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sales logs', error: error.message })
  }
})

// Get leaderboard rankings - managers and representatives only
router.get('/leaderboard', auth, allowedRoles(['manager', 'representative']), async (req, res) => {
  try {
    // We aggregate all sales grouping by rep
    const salesStats = await Sale.aggregate([
      {
        $group: {
          _id: '$rep',
          totalRevenue: { $sum: '$totalAmount' },
          totalSalesCount: { $sum: 1 },
          totalQuantity: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ])

    // Load all representatives to ensure even reps with 0 sales show up
    const reps = await User.find({ role: 'representative' }).select('name email')
    
    // Merge stats with rep details
    const leaderboard = reps.map(rep => {
      const stats = salesStats.find(s => s._id.toString() === rep._id.toString())
      return {
        repId: rep._id,
        name: rep.name,
        email: rep.email,
        totalRevenue: stats ? stats.totalRevenue : 0,
        totalSalesCount: stats ? stats.totalSalesCount : 0,
        totalQuantity: stats ? stats.totalQuantity : 0
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue) // sort by revenue descending

    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ message: 'Failed to build leaderboard', error: error.message })
  }
})

module.exports = router
