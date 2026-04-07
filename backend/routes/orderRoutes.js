import express from 'express'
import Order from '../models/Order.js'
import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
} from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js'
import { admin } from '../middleware/adminMiddleware.js'

const router = express.Router()

router.post('/razorpay/order', protect, createRazorpayOrder)
router.post('/razorpay/verify', protect, verifyRazorpayPayment)
router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)

// 👨‍💼 GET ALL ORDERS (ADMIN)
router.get('/', protect, admin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email')
  res.json(orders)
})

export default router