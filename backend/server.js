import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

dotenv.config()   // ✅ FIRST

connectDB()       // ✅ AFTER dotenv

const app = express()   // ✅ CREATE APP FIRST

app.use(cors())
app.use(express.json())
app.use('/api/products', productRoutes)

// Routes
app.use('/api/auth', authRoutes)

// Test route
app.get('/', (req, res) => {
  res.send('API is running...')
})

app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})