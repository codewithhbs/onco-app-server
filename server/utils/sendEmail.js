require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_EMAIL_HOST,
      port: Number(process.env.SMTP_EMAIL_PORT),
      secure: true, // Use true for port 465
      auth: {
        user: process.env.SMTP_EMAIL_ADDRESS,
        pass: process.env.SMTP_EMAIL_PASSWORD,
      },
    });

    // Mail options
    const mailOptions = {
      from: `Onco Health Mart <${process.env.SMTP_EMAIL_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
      attachments: options.attachments || [],
    };

    // Send mail
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to', options.to);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
