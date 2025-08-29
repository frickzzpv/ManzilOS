import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

interface EmailParams {
  to: string
  from: string
  subject: string
  text: string
  html: string
}

export async function sendEmail(params: EmailParams) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SENDGRID_API_KEY not set. Skipping email sending.')
    console.log('Email params:', params)
    return
  }

  try {
    await sgMail.send(params)
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
