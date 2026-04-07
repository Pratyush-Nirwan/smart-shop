import mongoose from 'mongoose'

const phoneOtpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ['login', 'register'],
    },
    codeHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

phoneOtpSchema.index({ phone: 1, purpose: 1 }, { unique: true })
phoneOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('PhoneOtp', phoneOtpSchema)
