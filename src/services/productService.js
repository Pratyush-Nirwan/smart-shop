const BASE_URL = 'http://localhost:5000/api/products'

// 🔥 GET PRODUCTS (with filters + pagination)
export async function listProducts({
  query = '',
  category = 'All',
  minPrice = null,
  maxPrice = null,
  minRating = null,
  page = 1,
  pageSize = 9,
} = {}) {
  try {
    const params = new URLSearchParams()

    if (query) params.append('query', query)
    if (category !== 'All') params.append('category', category)
    if (minPrice != null && minPrice !== '') params.append('minPrice', minPrice)
    if (maxPrice != null && maxPrice !== '') params.append('maxPrice', maxPrice)
    if (minRating != null && minRating !== 0) params.append('minRating', minRating)

    params.append('page', page)
    params.append('pageSize', pageSize)

    const res = await fetch(`${BASE_URL}?${params.toString()}`)
    const data = await res.json()

    return data
  } catch (error) {
    console.error('Fetch products error:', error)
    return {
      items: [],
      total: 0,
      hasMore: false,
    }
  }
}

// 🔥 GET SINGLE PRODUCT
export async function getProductById(id) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`)
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Fetch product error:', error)
    throw error
  }
}

// 🔥 GET FEATURED PRODUCTS
export async function getFeaturedProducts(limit = 8) {
  try {
    const res = await fetch(`${BASE_URL}/featured?limit=${limit}`)
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Fetch featured products error:', error)
    return []
  }
}

// 🔥 TEMP CATEGORY LIST (until backend)
export function getAllCategories() {
  return ['All', 'Electronics', 'Clothing', 'Books', 'Home']
}