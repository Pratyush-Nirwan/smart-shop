import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import PhoneOtp from '../models/PhoneOtp.js'
import { verifyGoogleCredential } from '../utils/googleAuth.js'
import {
  createOtpCode,
  isValidPhoneNumber,
  normalizePhoneNumber,
  sendPhoneOtp,
} from '../utils/phoneAuth.js'

const OTP_EXPIRY_MS = 10 * 60 * 1000
const MAX_OTP_ATTEMPTS = 5

function normalizeEmail(value) {
  const email = String(value ?? '').trim().toLowerCase()
  return email || ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getUserRole(user) {
  return user?.isAdmin ? 'admin' : 'customer'
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: getUserRole(user),
    createdAt: user.createdAt,
    profile: {
      phone: user.phone ?? '',
      addressLine1: '',
      city: '',
      postalCode: '',
    },
  }
}

function authResponse(user) {
  return {
    token: jwt.sign({ id: user._id, role: getUserRole(user) }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    }),
    user: serializeUser(user),
  }
}

async function findUserByLoginIdentifier({ email, phone }) {
  if (email) {
    return User.findOne({ email })
  }

  if (phone) {
    return User.findOne({ phone })
  }

  return null
}

function mergeAuthProviders(user, patch) {
  const currentProviders = user.authProviders?.toObject?.() ?? user.authProviders ?? {}
  user.authProviders = {
    email: Boolean(currentProviders.email),
    google: Boolean(currentProviders.google),
    phone: Boolean(currentProviders.phone),
    ...patch,
  }
}

export const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name ?? '').trim()
    const email = normalizeEmail(req.body.email)
    const phone = normalizePhoneNumber(req.body.phone)
    const password = String(req.body.password ?? '')

    if (!name) {
      return res.status(400).json({ message: 'Name is required.' })
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    if (phone && !isValidPhoneNumber(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number with country code.' })
    }

    const [existingEmailUser, existingPhoneUser] = await Promise.all([
      User.findOne({ email }),
      phone ? User.findOne({ phone }) : null,
    ])

    if (existingEmailUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' })
    }

    if (existingPhoneUser) {
      return res.status(400).json({ message: 'This phone number is already linked to another account.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      phone: phone || undefined,
      password: hashedPassword,
      authProviders: {
        email: true,
        google: false,
        phone: Boolean(phone),
      },
    })

    res.status(201).json(authResponse(user))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// 🔐 LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || req.body.identifier)
    const phone = normalizePhoneNumber(req.body.phone)
    const password = String(req.body.password ?? '')

    if (!password) {
      return res.status(400).json({ message: 'Password is required.' })
    }

    const user = await findUserByLoginIdentifier({ email, phone })

    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' })
    }

    res.json(authResponse(user))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const requestPhoneOtp = async (req, res) => {
  try {
    const phone = normalizePhoneNumber(req.body.phone)
    const mode = req.body.mode === 'login' ? 'login' : 'register'

    if (!phone || !isValidPhoneNumber(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number with country code.' })
    }

    if (mode === 'register') {
      const name = String(req.body.name ?? '').trim()
      if (!name) {
        return res.status(400).json({ message: 'Name is required to create a phone account.' })
      }
    }

    const existingUser = await User.findOne({ phone })

    if (mode === 'login' && !existingUser) {
      return res.status(404).json({ message: 'No account found for this phone number.' })
    }

    if (mode === 'register' && existingUser) {
      return res.status(400).json({ message: 'An account with this phone number already exists.' })
    }

    const otp = createOtpCode()
    const codeHash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS)

    await PhoneOtp.findOneAndUpdate(
      { phone, purpose: mode },
      {
        phone,
        purpose: mode,
        codeHash,
        attempts: 0,
        expiresAt,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )

    const deliveryState = await sendPhoneOtp(phone, otp)

    res.json({
      message: deliveryState.delivery === 'sms' ? 'OTP sent successfully.' : 'OTP generated for local development.',
      delivery: deliveryState.delivery,
      devOtp: deliveryState.devOtp,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const verifyPhoneOtp = async (req, res) => {
  try {
    const phone = normalizePhoneNumber(req.body.phone)
    const otp = String(req.body.otp ?? '').trim()
    const mode = req.body.mode === 'login' ? 'login' : 'register'
    const name = String(req.body.name ?? '').trim()

    if (!phone || !isValidPhoneNumber(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number with country code.' })
    }

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required.' })
    }

    if (mode === 'register' && !name) {
      return res.status(400).json({ message: 'Name is required to create a phone account.' })
    }

    const otpRecord = await PhoneOtp.findOne({ phone, purpose: mode })

    if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now()) {
      if (otpRecord) {
        await otpRecord.deleteOne()
      }

      return res.status(400).json({ message: 'OTP expired. Request a new code.' })
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.codeHash)

    if (!isMatch) {
      otpRecord.attempts += 1

      if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        await otpRecord.deleteOne()
      } else {
        await otpRecord.save()
      }

      return res.status(400).json({ message: 'Invalid OTP.' })
    }

    let user = await User.findOne({ phone })

    if (mode === 'login') {
      if (!user) {
        await otpRecord.deleteOne()
        return res.status(404).json({ message: 'No account found for this phone number.' })
      }
    } else {
      user = await User.create({
        name,
        phone,
        authProviders: {
          email: false,
          google: false,
          phone: true,
        },
      })
    }

    if (user && !user.authProviders?.phone) {
      user.phone = phone
      mergeAuthProviders(user, { phone: true })
      await user.save()
    }

    await otpRecord.deleteOne()

    res.json(authResponse(user))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const authenticateWithGoogle = async (req, res) => {
  try {
    const credential = String(req.body.credential ?? '').trim()

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required.' })
    }

    const googleUser = await verifyGoogleCredential(credential)
    const email = normalizeEmail(googleUser.email)
    const googleId = googleUser.sub

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    })

    if (!user) {
      user = await User.create({
        name: googleUser.name ?? email.split('@')[0],
        email,
        googleId,
        authProviders: {
          email: false,
          google: true,
          phone: false,
        },
      })
    } else {
      let changed = false

      if (!user.googleId) {
        user.googleId = googleId
        changed = true
      }

      if (!user.email) {
        user.email = email
        changed = true
      }

      if (!user.name && googleUser.name) {
        user.name = googleUser.name
        changed = true
      }

      if (!user.authProviders?.google) {
        mergeAuthProviders(user, { google: true })
        changed = true
      }

      if (changed) {
        await user.save()
      }
    }

    res.json(authResponse(user))
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
