/**
 * Email Service - Nodemailer Configuration
 * Handles all email sending functionality
 */

const nodemailer = require("nodemailer");

/**
 * Create email transporter
 * Supports Gmail, SendGrid, or custom SMTP
 */
const createTransporter = () => {
  // Check if email is enabled
  if (!process.env.EMAIL_ENABLED || process.env.EMAIL_ENABLED === "false") {
    console.warn("⚠️  Email service is disabled");
    return null;
  }

  try {
    // Gmail configuration (most common for development)
    if (process.env.EMAIL_SERVICE === "gmail") {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // Use App Password, not regular password
        },
      });
    }

    // SendGrid configuration
    if (process.env.EMAIL_SERVICE === "sendgrid") {
      return nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    // Custom SMTP configuration
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }

    console.warn("⚠️  No email configuration found");
    return null;
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error.message);
    return null;
  }
};

// Initialize transporter
let transporter = createTransporter();

/**
 * Send email helper function
 * @param {object} options - Email options (to, subject, html, text, attachments)
 * @returns {Promise<object>} - Send result
 */
const sendEmail = async (options) => {
  try {
    if (!transporter) {
      console.warn("⚠️  Email transporter not configured - skipping email send");
      return { success: false, message: "Email service disabled" };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"TrybeTickets" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${options.to}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send ticket confirmation email with QR code
 * @param {object} ticket - Ticket document
 * @param {object} event - Event document
 * @param {string} qrCodeDataURL - Base64 QR code data URL
 * @returns {Promise<object>} - Send result
 */
const sendTicketEmail = async (ticket, event, qrCodeDataURL) => {
  try {
    const { generateTicketEmailHTML, generateTicketEmailText } = require("../templates/ticketEmail");

    const emailHTML = generateTicketEmailHTML(ticket, event, qrCodeDataURL);
    const emailText = generateTicketEmailText(ticket, event);

    return await sendEmail({
      to: ticket.buyerEmail,
      subject: `Your Ticket for ${event.title} - TrybeTickets`,
      html: emailHTML,
      text: emailText,
    });
  } catch (error) {
    console.error("Failed to send ticket email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send ticket cancellation email
 * @param {object} ticket - Ticket document
 * @param {object} event - Event document
 * @returns {Promise<object>} - Send result
 */
const sendCancellationEmail = async (ticket, event) => {
  try {
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket Cancelled</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Ticket Cancelled</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border: 1px solid #dee2e6; border-radius: 0 0 8px 8px;">
          <p>Dear ${ticket.buyerName},</p>
          
          <p>Your ticket for <strong>${event.title}</strong> has been cancelled.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc3545;">Cancelled Ticket Details</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>If you have any questions, please contact the event organizer.</p>
          
          <p>Best regards,<br>TrybeTickets Team</p>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Your ticket for ${event.title} has been cancelled.

Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString()}
Ticket ID: ${ticket._id}

If you have any questions, please contact the event organizer.

Best regards,
TrybeTickets Team
    `;

    return await sendEmail({
      to: ticket.buyerEmail,
      subject: `Ticket Cancelled - ${event.title}`,
      html: emailHTML,
      text: emailText,
    });
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>} - Verification result
 */
const verifyEmailConfig = async () => {
  try {
    if (!transporter) {
      console.warn("⚠️  Email transporter not configured");
      return false;
    }

    await transporter.verify();
    console.log("✅ Email configuration verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email configuration verification failed:", error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendTicketEmail,
  sendCancellationEmail,
  verifyEmailConfig,
  createTransporter,
};
