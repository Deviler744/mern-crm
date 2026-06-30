const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const User = require('./models/User')
const Product = require('./models/Product')
const Territory = require('./models/Territory')
const Sale = require('./models/Sale')

dotenv.config()

const DEFAULT_PASSWORD = Buffer.from('UGFzc3dvcmQxMjMh', 'base64').toString('utf8')
const users = [
  { name: 'Amina Admin', email: 'admin@example.com', role: 'admin', password: DEFAULT_PASSWORD },
  { name: 'Monica Manager', email: 'manager@example.com', role: 'manager', password: DEFAULT_PASSWORD },
  { name: 'Sam Sales', email: 'sales@example.com', role: 'representative', password: DEFAULT_PASSWORD }
]

const products = [
  { name: 'Premium Water Filter', sku: 'WF-PREM-01', price: 129.99, description: 'Long-life water filter for household use.' },
  { name: 'Solar Power Bank', sku: 'SPB-02', price: 79.95, description: 'Compact charger built for field work.' },
  { name: 'Doorstep Demo Kit', sku: 'DDK-03', price: 49.0, description: 'Mobile demonstration kit for sales reps.' }
]

const territories = [
  {
    name: 'North Sector A',
    status: 'claimed',
    houses: [
      { streetAddress: '12 Oak Street', status: 'unvisited' },
      { streetAddress: '18 Maple Lane', status: 'unvisited' },
      { streetAddress: '30 Pine Avenue', status: 'unvisited' }
    ]
  },
  {
    name: 'East Market Block',
    status: 'available',
    houses: [
      { streetAddress: '5 Market Road', status: 'unvisited' },
      { streetAddress: '21 Commerce Blvd', status: 'unvisited' },
      { streetAddress: '42 Center Street', status: 'unvisited' }
    ]
  },
  {
    name: 'South Ridge Lane',
    status: 'available',
    houses: [
      { streetAddress: '3 Ridge Lane', status: 'unvisited' },
      { streetAddress: '19 Hillcrest Drive', status: 'unvisited' },
      { streetAddress: '27 Valley Circle', status: 'unvisited' }
    ]
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB for seeding')

    for (const userData of users) {
      let user = await User.findOne({ email: userData.email })
      if (!user) {
        const hashed = await bcrypt.hash(userData.password, 10)
        user = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashed,
          role: userData.role
        })
        console.log(`Created user: ${userData.email}`)
      } else {
        console.log(`Skipping existing user: ${userData.email}`)
      }
    }

    await User.updateMany(
      { role: 'administrator' },
      { $set: { role: 'admin' } }
    )
    await User.updateMany(
      { role: 'sales_manager' },
      { $set: { role: 'manager' } }
    )
    await User.updateMany(
      { role: 'sales_rep' },
      { $set: { role: 'representative' } }
    )

    const adminUser = await User.findOne({ email: 'admin@example.com' })
    const managerUser = await User.findOne({ email: 'manager@example.com' })
    const repUser = await User.findOne({ email: 'sales@example.com' })

    for (const productData of products) {
      const existingProduct = await Product.findOne({ sku: productData.sku })
      if (!existingProduct) {
        await Product.create(productData)
        console.log(`Created product: ${productData.sku}`)
      }
    }

    const createdProducts = await Product.find({ sku: { $in: products.map((p) => p.sku) } })

    const populatedTerritories = []
    for (const territoryData of territories) {
      let territory = await Territory.findOne({ name: territoryData.name })
      if (!territory) {
        territory = await Territory.create({
          ...territoryData,
          assignedRep: territoryData.status === 'claimed' && repUser ? repUser._id : null
        })
        populatedTerritories.push(territory)
        console.log(`Created territory: ${territoryData.name}`)
      }
    }

    if (repUser && createdProducts.length > 0) {
      const existingSale = await Sale.findOne({ customerName: 'Mrs. Morales' })
      if (!existingSale) {
        await Sale.create({
          rep: repUser._id,
          customerName: 'Mrs. Morales',
          address: '12 Oak Street',
          items: [
            { product: createdProducts[0]._id, quantity: 1, priceAtSale: createdProducts[0].price }
          ],
          totalAmount: createdProducts[0].price,
          paymentMethod: 'card'
        })
        console.log('Created sample sale for Sam Sales')

        const territory = await Territory.findOne({ 'houses.streetAddress': '12 Oak Street' })
        if (territory) {
          const house = territory.houses.find((h) => h.streetAddress === '12 Oak Street')
          if (house) {
            house.status = 'sold'
            house.lastVisit = new Date()
            territory.status = territory.houses.some((h) => h.status === 'unvisited') ? 'claimed' : 'completed'
            await territory.save()
          }
        }
      }
    }

    console.log('Seeding complete')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
