import Product from '../models/Product.js'

// 🔥 GET ALL PRODUCTS (filters + pagination)
export const getProducts = async (req, res) => {
  try {
    const {
      query = '',
      category,
      minPrice,
      maxPrice,
      minRating,
      page = 1,
      pageSize = 9,
    } = req.query

    const filter = {}

    if (query) {
      filter.name = { $regex: query, $options: 'i' }
    }

    if (category && category !== 'All') {
      filter.category = category
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) }
    }

    const skip = (Number(page) - 1) * Number(pageSize)

    const total = await Product.countDocuments(filter)

    const items = await Product.find(filter)
      .skip(skip)
      .limit(Number(pageSize))

    res.json({
      items,
      total,
      hasMore: skip + items.length < total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// 🔥 GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) return res.status(404).json({ message: 'Product not found' })

    res.json(product)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

// 🔥 FEATURED PRODUCTS
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8
    const products = await Product.find({ featured: true }).limit(limit)
    res.json(products)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}