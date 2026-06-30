const express = require('express')
const Product = require('../models/Product')
const auth = require('../middleware/auth')
const allowedRoles = require('../middleware/role')

const router = express.Router()

// Get all products - manager and representative only
router.get('/', auth, allowedRoles(['manager', 'representative']), async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message })
  }
})

// Create product - Manager only
router.post('/', auth, allowedRoles(['manager']), async (req, res) => {
  try {
    const { name, sku, price, description } = req.body
    if (!name || !sku || price === undefined) {
      return res.status(400).json({ message: 'Name, SKU, and price are required' })
    }
    const existing = await Product.findOne({ sku })
    if (existing) {
      return res.status(400).json({ message: 'SKU must be unique' })
    }
    const product = await Product.create({ name, sku, price, description })
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message })
  }
})

// Update product - Manager only
router.put('/:id', auth, allowedRoles(['manager']), async (req, res) => {
  try {
    const { name, sku, price, description } = req.body
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    if (sku && sku !== product.sku) {
      const existing = await Product.findOne({ sku })
      if (existing) return res.status(400).json({ message: 'SKU must be unique' })
    }

    product.name = name || product.name
    product.sku = sku || product.sku
    product.price = price !== undefined ? price : product.price
    product.description = description || product.description

    await product.save()
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message })
  }
})

// Delete product - Manager only
router.delete('/:id', auth, allowedRoles(['manager']), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message })
  }
})

module.exports = router
