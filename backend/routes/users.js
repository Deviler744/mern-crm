const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const auth = require('../middleware/auth')
const allowedRoles = require('../middleware/role')

const router = express.Router()

router.get('/', auth, allowedRoles(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message })
  }
})

router.post('/', auth, allowedRoles(['admin']), async (req, res) => {
  try {
    const { name, email, role, password } = req.body
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: 'Name, email, role, and password are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, role, password: hashed })
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message })
  }
})

router.delete('/:id', auth, allowedRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Administrators cannot remove their own account.' })
    }

    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'User not found' })

    res.json({ message: 'User removed successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove user', error: error.message })
  }
})

module.exports = router
