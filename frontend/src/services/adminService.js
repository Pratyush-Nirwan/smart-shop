import axios from 'axios'

const API = 'http://localhost:5000/api'

function getToken() {
  return JSON.parse(localStorage.getItem('smartshop_auth_v1'))?.token
}

// 📦 GET ALL PRODUCTS
export async function getAllProducts() {
  const res = await axios.get(`${API}/products`)
  return res.data
}

// ➕ ADD PRODUCT
export async function addProduct(product) {
  const res = await axios.post(`${API}/products`, product, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  return res.data
}

// ❌ DELETE PRODUCT
export async function deleteProduct(id) {
  const res = await axios.delete(`${API}/products/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  return res.data
}

// 📦 GET ALL ORDERS
export async function getAllOrders() {
  const res = await axios.get(`${API}/orders`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  return res.data
}