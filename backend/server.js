const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()

const authRoutes = require('./routes/auth')
const dashboardRoutes = require('./routes/dashboard')
const usersRoutes = require('./routes/users')
const productsRoutes = require('./routes/products')
const territoriesRoutes = require('./routes/territories')
const salesRoutes = require('./routes/sales')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/territories', territoriesRoutes)
app.use('/api/sales', salesRoutes)

if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../frontend/dist')
  app.use(express.static(clientBuildPath))

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' })
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Territory Sales Live backend is running' })
  })
}

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected')
    app.listen(port, () => console.log(`Server listening on port ${port}`))
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  })
