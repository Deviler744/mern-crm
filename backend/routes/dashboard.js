const express = require('express')
const Sale = require('../models/Sale')
const Territory = require('../models/Territory')
const User = require('../models/User')
const auth = require('../middleware/auth')
const allowedRoles = require('../middleware/role')

const router = express.Router()

const buildLeaderboard = async () => {
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

  const reps = await User.find({ role: 'representative' }).select('name email')

  return reps
    .map((rep) => {
      const stats = salesStats.find((s) => s._id.toString() === rep._id.toString())
      return {
        repId: rep._id,
        name: rep.name,
        email: rep.email,
        totalRevenue: stats ? stats.totalRevenue : 0,
        totalSalesCount: stats ? stats.totalSalesCount : 0,
        totalQuantity: stats ? stats.totalQuantity : 0
      }
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
}

router.get('/', auth, allowedRoles(['manager', 'representative']), async (req, res) => {
  const { role, id, name } = req.user

  try {
    if (role === 'representative') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const salesToday = await Sale.find({
        rep: id,
        saleDate: { $gte: today }
      }).populate('items.product', 'name')

      const revenueToday = salesToday.reduce((sum, sale) => sum + sale.totalAmount, 0)

      const activeTerritory = await Territory.findOne({ assignedRep: id })
      const housesVisitedToday = activeTerritory
        ? activeTerritory.houses.filter((h) => h.lastVisit && h.lastVisit >= today).length
        : 0
      const totalHousesVisited = activeTerritory
        ? activeTerritory.houses.filter((h) => h.status !== 'unvisited').length
        : 0
      const territoriesVisited = activeTerritory && totalHousesVisited > 0 ? 1 : 0
      const completionPercent = activeTerritory && activeTerritory.houses.length > 0
        ? Math.round((totalHousesVisited / activeTerritory.houses.length) * 100)
        : 0

      const liveSalesFeed = salesToday.map((sale) => ({
        id: sale._id,
        rep: name,
        customerName: sale.customerName,
        address: sale.address,
        amount: sale.totalAmount,
        items: sale.items.map((item) => ({
          product: item.product?.name || 'Product',
          quantity: item.quantity
        })),
        createdAt: sale.saleDate
      }))

      const leaderboard = await buildLeaderboard()
      const rank = leaderboard.findIndex((entry) => entry.repId.toString() === id.toString()) + 1

      return res.json({
        message: `Welcome back, ${name}`,
        role,
        summary: {
          housesVisitedToday,
          territoriesVisited,
          totalHousesVisited,
          todayRevenue: revenueToday,
          territoryCompletion: completionPercent,
          activeRank: rank || null,
          activeTerritory: activeTerritory ? {
            id: activeTerritory._id,
            name: activeTerritory.name,
            status: activeTerritory.status,
            visited: totalHousesVisited,
            total: activeTerritory.houses.length
          } : null,
          liveSalesFeed
        }
      })
    }

    if (role === 'manager') {
      const liveSales = await Sale.find()
        .sort({ saleDate: -1 })
        .limit(10)
        .populate('rep', 'name')
        .populate('items.product', 'name')

      const teamRevenue = liveSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      const coverage = await Territory.find().populate('assignedRep', 'name email')
      const availableTerritories = coverage.filter((territory) => territory.status === 'available').length
      const completedTerritories = coverage.filter((territory) => territory.status === 'completed').length

      return res.json({
        message: `Welcome back, ${name}`,
        role,
        summary: {
          liveSalesFeed: liveSales.map((sale) => ({
            id: sale._id,
            rep: sale.rep?.name || 'Unknown',
            amount: sale.totalAmount,
            customerName: sale.customerName,
            address: sale.address,
            items: sale.items.map((item) => ({
              product: item.product?.name || 'Product',
              quantity: item.quantity
            })),
            createdAt: sale.saleDate
          })),
          teamRevenue,
          availableTerritories,
          completedTerritories,
          territoryCoverage: coverage.map((territory) => ({
            id: territory._id,
            name: territory.name,
            status: territory.status,
            assignedRep: territory.assignedRep ? territory.assignedRep.name : null,
            progress: territory.houses.length
              ? Math.round((territory.houses.filter((h) => h.status !== 'unvisited').length / territory.houses.length) * 100)
              : 0
          }))
        }
      })
    }

    if (role === 'admin') {
      const totalSales = await Sale.countDocuments()
      const totalRevenue = await Sale.aggregate([
        { $group: { _id: null, amount: { $sum: '$totalAmount' } } }
      ])
      const territories = await Territory.find().populate('assignedRep', 'name')
      const reps = await User.countDocuments({ role: 'representative' })

      return res.json({
        message: `Welcome back, ${name}`,
        role,
        summary: {
          totalSales,
          totalRevenue: totalRevenue[0]?.amount || 0,
          territoriesManaged: territories.length,
          activeReps: reps,
          territoryOverview: territories.map((territory) => ({
            id: territory._id,
            name: territory.name,
            status: territory.status,
            assignedRep: territory.assignedRep ? territory.assignedRep.name : null
          }))
        }
      })
    }

    res.status(403).json({ message: 'Unauthorized dashboard role' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard details', error: error.message })
  }
})

router.get('/leaderboard', auth, allowedRoles(['admin', 'manager', 'representative']), async (req, res) => {
  try {
    const leaderboard = await buildLeaderboard()
    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ message: 'Failed to build leaderboard', error: error.message })
  }
})

module.exports = router
