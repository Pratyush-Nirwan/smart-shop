import { api } from './http.js'

export async function createRazorpayOrder({ orderInput, token }) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await api.post('/orders/razorpay/order', { orderInput }, { headers })
  return response.data
}

export async function verifyRazorpayPayment({ paymentId, orderId, signature, orderInput, token }) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await api.post(
    '/orders/razorpay/verify',
    { paymentId, orderId, signature, orderInput },
    { headers }
  )
  return response.data
}

