function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function placeOrder({ orderInput }) {
  await wait(850)
  return {
    orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'placed',
    placedAt: new Date().toISOString(),
    ...orderInput,
  }
}

