const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());

// Parse incoming request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Mail server is healthy and running.' });
});

// API Contact Route
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company, service, message } = req.body;

  // Form Validation
  if (!name || !email || !service || !message) {
    return res.status(400).json({ 
      error: 'Please fill in all required fields (Name, Email, Service, and Message).' 
    });
  }

  try {
    // Nodemailer transport settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Design email template
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`, 
      replyTo: email,
      to: process.env.CONTACT_RECEIVER || 'mukitshaikh2@gmail.com',
      subject: `New B2B Growth Lead: ${company || name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dce4db; border-radius: 12px; background-color: #fffefa;">
          <h2 style="color: #173b31; border-bottom: 2px solid #b4e600; padding-bottom: 8px;">New Boundless enquiry</h2>
          <p>You have received a new contact submission from your B2B growth landing page.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; font-weight: bold; width: 30%; color: #2e6452;">Full Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; color: #10231f;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; font-weight: bold; color: #2e6452;">Email Address</td>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; color: #10231f;"><a href="mailto:${email}" style="color: #2e6452; text-decoration: none; font-weight: bold;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; font-weight: bold; color: #2e6452;">Phone Number</td>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; color: #10231f;">${phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; font-weight: bold; color: #2e6452;">Company Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; color: #10231f;">${company || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; font-weight: bold; color: #2e6452;">Requested Service</td>
              <td style="padding: 10px; border-bottom: 1px solid #dce4db; color: #10231f; font-weight: bold;">${service}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #2e6452; vertical-align: top;">Message Details</td>
              <td style="padding: 10px; color: #10231f; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px; font-size: 0.8rem; color: #61726b; text-align: center; border-top: 1px solid #dce4db; padding-top: 12px;">
            Enquiry routed via Boundless B2B Growth Lead Server.
          </div>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Enquiry email sent successfully: %s', info.messageId);

    return res.status(200).json({ success: true, message: 'Your enquiry has been sent successfully.' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return res.status(500).json({ error: 'Failed to deliver the email. Please check server SMTP configuration.' });
  }
});

app.listen(PORT, () => {
  console.log(`Boundless B2B Growth Server running on http://localhost:${PORT}`);
});
