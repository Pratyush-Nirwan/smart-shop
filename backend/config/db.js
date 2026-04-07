import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI?.trim()

    if (!mongoUri || mongoUri.includes('YOUR URI CONNECTION')) {
      throw new Error(
        'Invalid MONGO_URI in backend/.env. Replace the placeholder with your real MongoDB connection string.'
      )
    }

    await mongoose.connect(mongoUri)
    console.log('MongoDB connected')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

export default connectDB
