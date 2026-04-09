/**
 * Ticket Email Template
 * Professional HTML email template for ticket confirmations
 */

/**
 * Generate HTML email for ticket confirmation
 * @param {object} ticket - Ticket document
 * @param {object} event - Event document
 * @param {string} qrCodeDataURL - Base64 QR code data URL
 * @returns {string} - HTML email content
 */
const generateTicketEmailHTML = (ticket, event, qrCodeDataURL) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ticket - ${event.title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #2d3748;
    }
    .ticket-card {
      background: linear-gradient(to right, #f7fafc, #edf2f7);
      border-left: 4px solid #667eea;
      padding: 25px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .ticket-card h2 {
      margin: 0 0 20px 0;
      color: #667eea;
      font-size: 24px;
    }
    .ticket-detail {
      display: flex;
      margin: 12px 0;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .ticket-detail:last-child {
      border-bottom: none;
    }
    .ticket-detail strong {
      width: 140px;
      color: #4a5568;
      font-weight: 600;
    }
    .ticket-detail span {
      flex: 1;
      color: #2d3748;
    }
    .qr-section {
      text-align: center;
      padding: 30px;
      background-color: #ffffff;
      border: 2px dashed #cbd5e0;
      border-radius: 8px;
      margin: 30px 0;
    }
    .qr-section h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
      font-size: 20px;
    }
    .qr-section p {
      margin: 10px 0 20px 0;
      color: #718096;
      font-size: 14px;
    }
    .qr-code {
      display: inline-block;
      padding: 15px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .qr-code img {
      display: block;
      width: 250px;
      height: 250px;
      border-radius: 4px;
    }
    .important-note {
      background-color: #fef5e7;
      border-left: 4px solid #f39c12;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .important-note strong {
      color: #d68910;
      display: block;
      margin-bottom: 5px;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 5px 0;
      color: #718096;
      font-size: 14px;
    }
    .ticket-id {
      font-family: 'Courier New', monospace;
      background-color: #edf2f7;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .ticket-card {
        padding: 20px;
      }
      .ticket-detail {
        flex-direction: column;
      }
      .ticket-detail strong {
        width: 100%;
        margin-bottom: 5px;
      }
      .qr-code img {
        width: 200px;
        height: 200px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Ticket Confirmed!</h1>
      <p>Your ticket is ready</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <p class="greeting">Hi <strong>${ticket.buyerName}</strong>,</p>
      
      <p>Great news! Your ticket purchase was successful. You're all set for an amazing event!</p>

      <!-- Event Details Card -->
      <div class="ticket-card">
        <h2>${event.title}</h2>
        
        <div class="ticket-detail">
          <strong>📅 Date:</strong>
          <span>${formattedDate}</span>
        </div>
        
        <div class="ticket-detail">
          <strong>⏰ Time:</strong>
          <span>${formattedTime}</span>
        </div>
        
        <div class="ticket-detail">
          <strong>📍 Venue:</strong>
          <span>${event.venue}</span>
        </div>
        
        ${event.organizerName ? `
        <div class="ticket-detail">
          <strong>👤 Organizer:</strong>
          <span>${event.organizerName}</span>
        </div>
        ` : ''}
        
        <div class="ticket-detail">
          <strong>💳 Amount Paid:</strong>
          <span>$${ticket.amountPaid.toFixed(2)}</span>
        </div>
        
        <div class="ticket-detail">
          <strong>🎫 Ticket ID:</strong>
          <span class="ticket-id">${ticket._id}</span>
        </div>
        
        <div class="ticket-detail">
          <strong>✉️ Email:</strong>
          <span>${ticket.buyerEmail}</span>
        </div>
      </div>

      <!-- QR Code Section -->
      <div class="qr-section">
        <h3>📱 Your Entry QR Code</h3>
        <p>Present this QR code at the venue entrance</p>
        
        <div class="qr-code">
          <img src="${qrCodeDataURL}" alt="Ticket QR Code" />
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #a0aec0;">
          Save this email or screenshot the QR code
        </p>
      </div>

      <!-- Important Notes -->
      <div class="important-note">
        <strong>⚠️ Important Information:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Keep this email safe - you'll need it to enter the event</li>
          <li>Arrive early to avoid queues at the entrance</li>
          <li>Each QR code can only be scanned once</li>
          <li>Contact the organizer if you need to cancel or transfer your ticket</li>
        </ul>
      </div>

      <p>We're excited to see you at the event! If you have any questions, feel free to reach out to the event organizer.</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>TrybeTickets Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>TrybeTickets</strong></p>
      <p>Your trusted ticketing platform</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate plain text email for ticket confirmation
 * @param {object} ticket - Ticket document
 * @param {object} event - Event document
 * @returns {string} - Plain text email content
 */
const generateTicketEmailText = (ticket, event) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
TICKET CONFIRMED - ${event.title}

Hi ${ticket.buyerName},

Great news! Your ticket purchase was successful. You're all set for an amazing event!

EVENT DETAILS
=============
Event: ${event.title}
Date: ${formattedDate}
Time: ${formattedTime}
Venue: ${event.venue}
${event.organizerName ? `Organizer: ${event.organizerName}\n` : ''}
Amount Paid: $${ticket.amountPaid.toFixed(2)}
Ticket ID: ${ticket._id}
Email: ${ticket.buyerEmail}

YOUR QR CODE
============
Your QR code is attached to this email. Present it at the venue entrance.

IMPORTANT INFORMATION
=====================
- Keep this email safe - you'll need it to enter the event
- Arrive early to avoid queues at the entrance
- Each QR code can only be scanned once
- Contact the organizer if you need to cancel or transfer your ticket

We're excited to see you at the event!

Best regards,
TrybeTickets Team

---
This is an automated email. Please do not reply.
  `;
};

module.exports = {
  generateTicketEmailHTML,
  generateTicketEmailText,
};
