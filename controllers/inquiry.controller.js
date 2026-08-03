const Inquiry = require('../models/Inquiry.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');
const { Resend } = require('resend');
const isCheckDisposableEmail = require('is-check-disposable-email'); // 1. Imported disposable email package

// Helper function to handle sending email via HTTP API
const sendAdminEmailNotification = async (name, email, phone, subject, message) => {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
    console.warn("Resend email configuration missing in .env. Notification skipped.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Website Contact Form <onboarding@resend.dev>', 
      to: process.env.ADMIN_EMAIL, 
      subject: `New Inquiry: ${subject || 'No Subject'} - From ${name}`,
      text: `You have received a new contact form submission.\n\n` +
            `Details:\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone || 'N/A'}\n\n` +
            `Message:\n${message}`,
      replyTo: email 
    });
    console.log("Admin notification email sent successfully via Resend API!");
  } catch (error) {
    console.error("Failed to send admin email notification via Resend:", error);
  }
};

// 3. Get all inquiries
const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  return res.json(inquiries);
});

// 4. Create Inquiry (with Fake Email Blocking + Captcha Verification + Resend Email)
const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message, captchaToken } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required');
  }

  // 🛡️ LAYER 1: Prevent Fake / Disposable Emails
  // This automatically runs a check against 120,000+ burner domains natively.
  if (isCheckDisposableEmail(email)) {
    throw new ApiError(400, 'Disposable or temporary email addresses are not allowed. Please use a valid email.');
  }

  if (!captchaToken) {
    throw new ApiError(400, 'Captcha verification token is missing');
  }

  // Verify reCAPTCHA token with Google
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    const response = await fetch(verifyUrl, { method: 'POST' });
    const captchaResult = await response.json();

    if (!captchaResult.success) {
      throw new ApiError(400, 'Captcha verification failed. Please try again.');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error processing captcha verification');
  }

  // Create record in MongoDB
  const inquiry = await Inquiry.create({ name, email, phone, subject, message });

  // Trigger Email notification asynchronously via API
  sendAdminEmailNotification(name, email, phone, subject, message);

  return success(res, { inquiry }, 'Inquiry submitted successfully', 201);
});

// 5. Update Status
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  return success(res, { inquiry }, 'Status updated');
});

// 6. Delete Inquiry
const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  return success(res, {}, 'Inquiry deleted');
});

module.exports = { getInquiries, createInquiry, updateInquiryStatus, deleteInquiry };