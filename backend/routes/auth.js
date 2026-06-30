const express = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed, role })
    res.status(201).json({ id: user._id, email: user.email, role: user.role })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const matched = await bcrypt.compare(password, user.password)
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '12h'
    })

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No account found for that email' })

    const token = crypto.randomBytes(24).toString('hex')
    user.resetPasswordToken = token
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`
    console.log(`Password reset link for ${email}: ${resetUrl}`)

    res.json({ message: 'Password reset link generated. Check server logs or email in production.', resetUrl })
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate password reset link', error: error.message })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) return res.status(400).json({ message: 'Password reset token is invalid or has expired' })

    const hashed = await bcrypt.hash(password, 10)
    user.password = hashed
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password has been reset successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message })
  }
})

module.exports = router
