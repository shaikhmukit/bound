const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve assets folder
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Mail server is healthy and running.'
  });
});

// Contact API
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company, service, message } = req.body;

  if (!name || !email || !service || !message) {
    return res.status(400).json({
      error: 'Please fill in all required fields (Name, Email, Service, and Message).'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: process.env.CONTACT_RECEIVER,
      subject: `New B2B Growth Lead: ${company || name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>New Boundless Enquiry</h2>

          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone || 'Not provided'}</p>
          <p><b>Company:</b> ${company || 'Not provided'}</p>
          <p><b>Service:</b> ${service}</p>
          <p><b>Message:</b></p>

          <p>${message}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Your enquiry has been sent successfully.'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to send email.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});