const express = require('express')
const Territory = require('../models/Territory')
const auth = require('../middleware/auth')
const allowedRoles = require('../middleware/role')

const router = express.Router()

// Get all territories - manager and representative only
router.get('/', auth, allowedRoles(['manager', 'representative']), async (req, res) => {
  try {
    const territories = await Territory.find().populate('assignedRep', 'name email')
    res.json(territories)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch territories', error: error.message })
  }
})

// Create a new territory - managers only
router.post('/', auth, allowedRoles(['manager']), async (req, res) => {
  try {
    const { name, houseAddresses } = req.body

    if (!name || !houseAddresses || !Array.isArray(houseAddresses) || houseAddresses.length === 0) {
      return res.status(400).json({ message: 'Territory name and at least one house address are required' })
    }

    const normalizedAddresses = houseAddresses
      .map((address) => address.trim())
      .filter(Boolean)
    const uniqueAddresses = [...new Set(normalizedAddresses.map((address) => address.toLowerCase()))]

    if (uniqueAddresses.length !== normalizedAddresses.length) {
      return res.status(400).json({ message: 'House addresses must be unique within a territory' })
    }

    const existingTerritory = await Territory.findOne({ name: new RegExp(`^${name}$`, 'i') })
    if (existingTerritory) {
      return res.status(400).json({ message: 'Territory name already exists' })
    }

    const houses = uniqueAddresses.map((streetAddress) => ({ streetAddress }))
    const territory = await Territory.create({ name, houses })

    res.status(201).json(territory)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create territory', error: error.message })
  }
})

// Claim a territory - representatives only
router.put('/:id/claim', auth, allowedRoles(['representative']), async (req, res) => {
  try {
    const territory = await Territory.findById(req.params.id)
    if (!territory) return res.status(404).json({ message: 'Territory not found' })
    
    if (territory.assignedRep) {
      return res.status(400).json({ message: 'Territory is already claimed' })
    }

    territory.assignedRep = req.user.id
    territory.status = 'claimed'
    await territory.save()

    const populated = await territory.populate('assignedRep', 'name email')
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: 'Failed to claim territory', error: error.message })
  }
})

// Unclaim/release a territory - manager only
router.put('/:id/unclaim', auth, allowedRoles(['manager']), async (req, res) => {
  try {
    const territory = await Territory.findById(req.params.id)
    if (!territory) return res.status(404).json({ message: 'Territory not found' })

    territory.assignedRep = null
    territory.status = 'available'
    await territory.save()
    res.json(territory)
  } catch (error) {
    res.status(500).json({ message: 'Failed to unclaim territory', error: error.message })
  }
})

// Update specific house status in a territory (no_answer, not_interested, etc.)
router.put('/:id/house', auth, allowedRoles(['representative']), async (req, res) => {
  try {
    const { streetAddress, status } = req.body
    if (!streetAddress || !status) {
      return res.status(400).json({ message: 'Street address and status are required' })
    }

    const territory = await Territory.findById(req.params.id)
    if (!territory) return res.status(404).json({ message: 'Territory not found' })

    // Check if the current user is the assigned representative
    if (territory.assignedRep && territory.assignedRep.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not assigned to this territory' })
    }

    const house = territory.houses.find(h => h.streetAddress === streetAddress)
    if (!house) return res.status(404).json({ message: 'House address not found in this territory' })

    house.status = status
    house.lastVisit = new Date()

    // Check if all houses in territory are visited (i.e. none are 'unvisited')
    const allVisited = territory.houses.every(h => h.status !== 'unvisited')
    if (allVisited) {
      territory.status = 'completed'
    }

    await territory.save()
    res.json(territory)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update house status', error: error.message })
  }
})

// Add houses to a territory
router.put('/:id/houses', auth, allowedRoles(['manager', 'representative']), async (req, res) => {
  try {
    const { houseAddresses } = req.body
    if (!houseAddresses || !Array.isArray(houseAddresses) || houseAddresses.length === 0) {
      return res.status(400).json({ message: 'House addresses are required' })
    }

    const territory = await Territory.findById(req.params.id)
    if (!territory) return res.status(404).json({ message: 'Territory not found' })

    if (req.user.role === 'representative' && territory.assignedRep?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not assigned to this territory' })
    }

    const existingAddresses = new Set(territory.houses.map((house) => house.streetAddress.toLowerCase()))
    const normalizedAddresses = houseAddresses
      .map((address) => address.trim())
      .filter(Boolean)
    const uniqueAddresses = Array.from(
      normalizedAddresses.reduce((map, address) => {
        const lowerCased = address.toLowerCase()
        if (!map.has(lowerCased)) map.set(lowerCased, address)
        return map
      }, new Map())
      .values()
    )

    if (uniqueAddresses.length !== normalizedAddresses.length) {
      return res.status(400).json({ message: 'House addresses must be unique within the request' })
    }

    const newHouses = uniqueAddresses
      .filter((address) => !existingAddresses.has(address.toLowerCase()))
      .map((streetAddress) => ({ streetAddress }))

    if (newHouses.length === 0) {
      return res.status(400).json({ message: 'No new house addresses to add' })
    }

    territory.houses.push(...newHouses)
    if (territory.status === 'completed') {
      territory.status = 'claimed'
    }

    await territory.save()
    const populated = await territory.populate('assignedRep', 'name email')
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: 'Failed to add houses to territory', error: error.message })
  }
})

module.exports = router
