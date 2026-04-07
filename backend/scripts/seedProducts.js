import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import products from '../Data/products.js'

dotenv.config()

async function seedProducts() {
  const mongoUri = process.env.MONGO_URI?.trim()

  if (!mongoUri) {
    throw new Error('Missing MONGO_URI in backend/.env')
  }

  await mongoose.connect(mongoUri)

  const result = await Product.insertMany(products, { ordered: true })
  console.log(`Inserted ${result.length} products.`)
}

async function resetAndSeedProducts() {
  const mongoUri = process.env.MONGO_URI?.trim()

  if (!mongoUri) {
    throw new Error('Missing MONGO_URI in backend/.env')
  }

  await mongoose.connect(mongoUri)
  await Product.deleteMany({})
  const result = await Product.insertMany(products, { ordered: true })
  console.log(`Reset and inserted ${result.length} products.`)
}

const mode = process.argv[2] ?? 'reset'

const runner = mode === 'append' ? seedProducts : resetAndSeedProducts

runner()
  .catch((error) => {
    console.error(error.message || error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
  })
