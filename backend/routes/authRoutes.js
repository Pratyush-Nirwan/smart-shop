import express from 'express'
import {
  authenticateWithGoogle,
  loginUser,
  registerUser,
  requestPhoneOtp,
  verifyPhoneOtp,
} from '../controllers/authController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/phone/request-otp', requestPhoneOtp)
router.post('/phone/verify-otp', verifyPhoneOtp)
router.post('/google', authenticateWithGoogle)

export default router
