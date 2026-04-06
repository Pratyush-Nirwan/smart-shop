import express from 'express'
import Product from '../models/Product.js'
import productsData from '/data/products.js'
import { protect } from '../middleware/authMiddleware.js'
import { admin } from '../middleware/adminMiddleware.js'
import Product from '../models/Product.js'

import {
  getProducts,
  getProductById,
  getFeaturedProducts,
} from '../controllers/productController.js'

const router = express.Router()

// 🌱 SEED DATA (must be before /:id route)
router.get('/seed', async (req, res) => {
  await Product.deleteMany()
  const created = await Product.insertMany(productsData)
  res.json(created)
})

// 🔥 GET ALL PRODUCTS
router.get('/', getProducts)

// 🔥 FEATURED PRODUCTS
router.get('/featured', getFeaturedProducts)

// 🔥 GET SINGLE PRODUCT
router.get('/:id', getProductById)

// ➕ ADD PRODUCT (ADMIN)
router.post('/', protect, admin, async (req, res) => {
  const product = new Product(req.body)
  const created = await product.save()
  res.json(created)
})

// ❌ DELETE PRODUCT (ADMIN)
router.delete('/:id', protect, admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
  res.json({ message: 'Product deleted' })
})

export default router