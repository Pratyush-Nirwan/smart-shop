import Order from '../models/Order.js'
import Cart from '../models/Cart.js'

// 📦 CREATE ORDER (CHECKOUT)
export const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }))

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      shippingAddress: req.body.shippingAddress,
    })

    await order.save()

    // 🧹 CLEAR CART AFTER ORDER
    cart.items = []
    await cart.save()

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// 📦 GET USER ORDERS
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })
  res.json(orders)
}