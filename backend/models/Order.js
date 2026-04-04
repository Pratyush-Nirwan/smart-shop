import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
 {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: String,
        quantity: Number,
        variant: Object,
      },
    ],
    address: {
      fullName: String,
      phone: String,
      addressLine1: String,
      city: String,
      postalCode: String,
    },
    shippingMethod: String,
    paymentMethod: String,
    totals: {
      subtotal: Number,
      discount: Number,
      shipping: Number,
      total: Number,
    },
    status: {
      type: String,
      default: 'Processing',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)