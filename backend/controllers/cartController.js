import Cart from '../models/Cart.js'

// 🔥 GET USER CART
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product')
  res.json(cart || { items: [] })
}

// 🔥 ADD TO CART
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body

  let cart = await Cart.findOne({ user: req.user.id })

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] })
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  )

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.items.push({ product: productId, quantity })
  }

  await cart.save()
  res.json(cart)
}

// 🔥 REMOVE ITEM
export const removeFromCart = async (req, res) => {
  const { productId } = req.body

  const cart = await Cart.findOne({ user: req.user.id })

  if (!cart) return res.json({ items: [] })

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  )

  await cart.save()
  res.json(cart)
}