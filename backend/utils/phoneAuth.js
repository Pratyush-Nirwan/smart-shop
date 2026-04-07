const PHONE_NUMBER_PATTERN = /^\+[1-9]\d{7,14}$/

function getTwilioConfig() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim(),
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim(),
    fromNumber: process.env.TWILIO_PHONE_NUMBER?.trim(),
  }
}

export function normalizePhoneNumber(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const digitsOnly = raw.replace(/[^\d+]/g, '')

  if (digitsOnly.startsWith('+')) {
    return `+${digitsOnly.slice(1).replace(/\D/g, '')}`
  }

  return `+${digitsOnly.replace(/\D/g, '')}`
}

export function isValidPhoneNumber(phone) {
  return PHONE_NUMBER_PATTERN.test(phone)
}

export function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function isTwilioConfigured() {
  const { accountSid, authToken, fromNumber } = getTwilioConfig()
  return Boolean(accountSid && authToken && fromNumber)
}

export async function sendPhoneOtp(phone, otp) {
  if (!isTwilioConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[auth] Development OTP for ${phone}: ${otp}`)
    }

    return {
      delivery: 'development',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    }
  }

  const { accountSid, authToken, fromNumber } = getTwilioConfig()
  const body = new URLSearchParams({
    To: phone,
    From: fromNumber,
    Body: `Your SmartShop verification code is ${otp}. It expires in 10 minutes.`,
  })

  const authorization = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Unable to send OTP SMS. ${errorText}`)
  }

  return { delivery: 'sms' }
}
