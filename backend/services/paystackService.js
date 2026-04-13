/**
 * Paystack Payment Service
 * Handles payment initialization and verification
 */

const https = require('https');

/**
 * Initialize a payment transaction
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} - Paystack response
 */
const initializePayment = async (data) => {
  const params = JSON.stringify({
    email: data.email,
    amount: data.amount * 100, // Paystack expects amount in kobo (smallest currency unit)
    reference: data.reference,
    callback_url: data.callback_url,
    metadata: {
      custom_fields: [
        {
          display_name: 'Buyer Name',
          variable_name: 'buyer_name',
          value: data.buyerName,
        },
        {
          display_name: 'Buyer Phone',
          variable_name: 'buyer_phone',
          value: data.buyerPhone,
        },
        {
          display_name: 'Event ID',
          variable_name: 'event_id',
          value: data.eventId,
        },
      ],
    },
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(params),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status) {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Payment initialization failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from Paystack'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(params);
    req.end();
  });
};

/**
 * Verify a payment transaction
 * @param {String} reference - Payment reference
 * @returns {Promise<Object>} - Verification response
 */
const verifyPayment = async (reference) => {
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status && response.data.status === 'success') {
            resolve(response.data);
          } else {
            reject(new Error(response.message || 'Payment verification failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from Paystack'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

module.exports = {
  initializePayment,
  verifyPayment,
};
