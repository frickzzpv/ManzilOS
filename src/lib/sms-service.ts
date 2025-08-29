import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

let client: twilio.Twilio | null = null;

if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

interface SmsParams {
  to: string
  body: string
}

export async function sendSms(params: SmsParams) {
  if (!client || !fromNumber) {
    console.log('Twilio credentials not set. Skipping SMS sending.')
    console.log('SMS params:', params)
    return
  }

  try {
    await client.messages.create({
      body: params.body,
      from: fromNumber,
      to: params.to,
    })
    console.log('SMS sent successfully')
  } catch (error) {
    console.error('Error sending SMS:', error)
  }
}
