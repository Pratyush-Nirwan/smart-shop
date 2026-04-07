import crypto from 'crypto'
import Razorpay from 'razorpay'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

function calculateTotals(subtotal, discount, shippingMethod) {
  const shipping = subtotal - discount >= 80 ? 0 : subtotal > 0 ? 6.99 : 0
  return {
    subtotal,
    discount,
    shipping,
    total: Number((subtotal - discount + shipping).toFixed(2)),
  }
}

async function getCartData(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product')
  if (!cart || cart.items.length === 0) return null

  const items = cart.items.map((item) => ({
    productId: item.product._id.toString(),
    quantity: item.quantity,
    variant: item.variant || {},
  }))

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  return { items, subtotal }
}

async function clearCart(userId) {
  const cart = await Cart.findOne({ user: userId })
  if (!cart) return
  cart.items = []
  await cart.save()
}

function buildOrderInput(req) {
  const orderInput = req.body.orderInput || {}
  return {
    address: orderInput.address || {},
    shippingMethod: orderInput.shippingMethod || 'Standard',
    paymentMethod: orderInput.paymentMethod || 'Card',
    paymentDetails: orderInput.paymentDetails || {},
    totals: orderInput.totals || {},
    items: orderInput.items || [],
  }
}

export const createOrder = async (req, res) => {
  try {
    const orderInput = buildOrderInput(req)
    let items = orderInput.items
    let totals = orderInput.totals

    const cartData = await getCartData(req.user.id)
    if (cartData) {
      items = cartData.items
      totals = calculateTotals(cartData.subtotal, orderInput.totals?.discount ?? 0, orderInput.shippingMethod)
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or order items are missing.' })
    }

    const order = new Order({
      user: req.user.id,
      items,
      address: orderInput.address,
      shippingMethod: orderInput.shippingMethod,
      paymentMethod: orderInput.paymentMethod,
      totals,
      status: 'Processing',
    })

    await order.save()
    await clearCart(req.user.id)

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createRazorpayOrder = async (req, res) => {
  try {
    const orderInput = buildOrderInput(req)
    const cartData = await getCartData(req.user.id)

    if (!cartData) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    const totals = calculateTotals(cartData.subtotal, orderInput.totals?.discount ?? 0, orderInput.shippingMethod)
    const amountInPaise = Math.round(totals.total * 100)

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    })

    res.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
      totals,
      items: cartData.items,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature, orderInput } = req.body

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ message: 'Incomplete payment data' })
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (generatedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid Razorpay signature' })
    }

    const cartData = await getCartData(req.user.id)
    const orderDetails = buildOrderInput(req)
    let items = orderDetails.items
    let totals = orderDetails.totals

    if (cartData) {
      items = cartData.items
      totals = calculateTotals(cartData.subtotal, orderDetails.totals?.discount ?? 0, orderDetails.shippingMethod)
    }

    const order = new Order({
      user: req.user.id,
      items,
      address: orderDetails.address,
      shippingMethod: orderDetails.shippingMethod,
      paymentMethod: orderDetails.paymentMethod,
      totals,
      status: 'Paid',
    })

    await order.save()
    await clearCart(req.user.id)

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })
  res.json(orders)
}
