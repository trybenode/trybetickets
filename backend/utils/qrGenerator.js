/**
 * QR Code Generator Utility
 * Generates QR codes for ticket verification
 */

const QRCode = require("qrcode");

/**
 * Generate QR code as data URL (base64)
 * Perfect for embedding in emails or JSON responses
 * 
 * @param {string} data - The data to encode (qrToken)
 * @param {object} options - QR code options
 * @returns {Promise<string>} - Data URL string
 */
const generateQRDataURL = async (data, options = {}) => {
  try {
    const qrOptions = {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 300,
      ...options,
    };

    const dataURL = await QRCode.toDataURL(data, qrOptions);
    return dataURL;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

/**
 * Generate QR code as buffer (PNG)
 * Perfect for direct file downloads
 * 
 * @param {string} data - The data to encode (qrToken)
 * @param {object} options - QR code options
 * @returns {Promise<Buffer>} - PNG image buffer
 */
const generateQRBuffer = async (data, options = {}) => {
  try {
    const qrOptions = {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 300,
      ...options,
    };

    const buffer = await QRCode.toBuffer(data, qrOptions);
    return buffer;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

/**
 * Generate verification URL from qrToken
 * This is what gets encoded in the QR code
 * 
 * @param {string} qrToken - The ticket's unique QR token
 * @param {string} baseURL - Frontend base URL (optional)
 * @returns {string} - Full verification URL
 */
const generateVerificationURL = (qrToken, baseURL = null) => {
  const defaultBaseURL = process.env.FRONTEND_URL || "http://localhost:3000";
  const base = baseURL || defaultBaseURL;
  return `${base}/verify/${qrToken}`;
};

/**
 * Generate QR code for a ticket
 * Returns both data URL and verification URL
 * 
 * @param {object} ticket - Ticket document with qrToken
 * @param {object} options - Generation options
 * @returns {Promise<object>} - { qrCodeDataURL, verificationURL }
 */
const generateTicketQR = async (ticket, options = {}) => {
  try {
    if (!ticket.qrToken) {
      throw new Error("Ticket must have a qrToken");
    }

    // Generate verification URL
    const verificationURL = generateVerificationURL(
      ticket.qrToken,
      options.baseURL
    );

    // Generate QR code from URL
    const qrCodeDataURL = await generateQRDataURL(verificationURL, options);

    return {
      qrCodeDataURL,
      verificationURL,
      qrToken: ticket.qrToken,
    };
  } catch (error) {
    throw new Error(`Ticket QR generation failed: ${error.message}`);
  }
};

module.exports = {
  generateQRDataURL,
  generateQRBuffer,
  generateVerificationURL,
  generateTicketQR,
};
