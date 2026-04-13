const { Event, Ticket } = require('../models');
const { verifyPayment } = require('../services/paystackService');
const crypto = require('crypto');

/**
 * @desc    Initialize payment for ticket purchase
 * @route   POST /api/payments/initialize
 * @access  Public
 */
const initializeTicketPayment = async (req, res) => {
  try {
    const { eventId, buyerName, buyerEmail, buyerPhone, userId, ticketTypeId, ticketQuantity } = req.body;

    // Validate required fields
    if (!eventId || !buyerName || !buyerEmail || !buyerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(buyerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if event is active
    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Event is ${event.status}. Cannot purchase tickets.`,
      });
    }

    // Check availability
    const quantity = Math.max(1, parseInt(ticketQuantity, 10) || 1);
    if (event.ticketsSold + quantity > event.totalTickets) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this event is sold out',
      });
    }

    let selectedTicketType = null;
    let unitPrice = event.ticketPrice;

    if (ticketTypeId && event.ticketTypes?.length) {
      selectedTicketType = event.ticketTypes.id(ticketTypeId);
      if (!selectedTicketType) {
        return res.status(400).json({
          success: false,
          message: 'Selected ticket type not found',
        });
      }

      if ((selectedTicketType.sold || 0) + quantity > (selectedTicketType.quantity || 0)) {
        return res.status(400).json({
          success: false,
          message: `Only ${(selectedTicketType.quantity || 0) - (selectedTicketType.sold || 0)} tickets left for ${selectedTicketType.name}`,
        });
      }

      unitPrice = selectedTicketType.price;
    }

    // Generate unique payment reference for Paystack inline checkout
    const reference = `TRB-${event._id.toString().slice(-8)}-${Date.now()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        reference,
        quantity,
        unitPrice,
        amount: unitPrice * quantity,
      },
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify payment and create ticket
 * @route   POST /api/payments/verify
 * @access  Public
 */
const verifyTicketPayment = async (req, res) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();
  let transactionCommitted = false;

  try {
    const { reference } = req.body;

    if (!reference) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required',
      });
    }

    // Verify payment with Paystack
    const paymentData = await verifyPayment(reference);

    // Extract metadata
    const customFields = paymentData?.metadata?.custom_fields || [];
    const metadata = customFields.reduce((acc, field) => {
      acc[field.variable_name] = field.value;
      return acc;
    }, {});

    const eventId = metadata.event_id;
    const buyerName = metadata.buyer_name;
    const buyerPhone = metadata.buyer_phone;
    const ticketType = metadata.ticket_type || 'General Admission';
    const ticketTypeId = metadata.ticket_type_id || null;
    const quantity = Math.max(1, parseInt(metadata.ticket_quantity, 10) || 1);
    const unitPrice = Number(metadata.ticket_unit_price || 0);
    const buyerEmail = paymentData.customer.email;

    // Find event
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check availability again
    if (event.ticketsSold + quantity > event.totalTickets) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Sorry, tickets sold out during payment',
      });
    }

    let selectedTicketType = null;
    if (ticketTypeId && event.ticketTypes?.length) {
      selectedTicketType = event.ticketTypes.id(ticketTypeId);
      if (!selectedTicketType) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Selected ticket type not found',
        });
      }

      if ((selectedTicketType.sold || 0) + quantity > (selectedTicketType.quantity || 0)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Only ${(selectedTicketType.quantity || 0) - (selectedTicketType.sold || 0)} tickets left for ${selectedTicketType.name}`,
        });
      }
    }

    const expectedAmount = (unitPrice || event.ticketPrice) * quantity;
    if (Number(paymentData.amount || 0) / 100 < expectedAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match expected ticket total',
      });
    }

    // Update tickets sold
    const eventUpdateQuery = {
      _id: eventId,
      ticketsSold: { $lte: event.totalTickets - quantity },
    };

    const eventUpdateDoc = {
      $inc: { ticketsSold: quantity },
    };

    if (selectedTicketType) {
      eventUpdateQuery['ticketTypes._id'] = selectedTicketType._id;
      eventUpdateQuery['ticketTypes.sold'] = { $lte: selectedTicketType.quantity - quantity };
      eventUpdateDoc.$inc['ticketTypes.$.sold'] = quantity;
    }

    const updatedEvent = await Event.findOneAndUpdate(eventUpdateQuery, eventUpdateDoc, {
      returnDocument: 'after',
      session,
    });

    if (!updatedEvent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Failed to reserve ticket',
      });
    }

    const ticketsToCreate = Array.from({ length: quantity }).map(() => ({
      eventId,
      userId: null,
      qrToken: crypto.randomBytes(16).toString('hex'),
      buyerName,
      buyerEmail,
      buyerPhone,
      ticketType,
      amountPaid: unitPrice || event.ticketPrice,
      status: 'valid',
      paymentReference: reference,
    }));

    const createdTickets = await Ticket.create(ticketsToCreate, { session });

    // Commit transaction
    await session.commitTransaction();
    transactionCommitted = true;
    session.endSession();

    // Populate event details
    const createdTicketIds = createdTickets.map((ticket) => ticket._id);
    const populatedTickets = await Ticket.find({ _id: { $in: createdTicketIds } }).populate('eventId');
    const primaryTicket = populatedTickets[0];

    // Prepare response payload with safe fallbacks for post-commit tasks
    const responseData = {
      ...primaryTicket.toObject(),
      quantity,
      tickets: populatedTickets.map((ticket) => ticket.toObject()),
      qrCode: null,
      verificationURL: null,
    };

    try {
      // Generate QR code
      const { generateTicketQR } = require('../utils/qrGenerator');
      const qrData = await generateTicketQR(primaryTicket);
      responseData.qrCode = qrData.qrCodeDataURL;
      responseData.verificationURL = qrData.verificationURL;

      // Send confirmation email (non-blocking)
      const { sendTicketEmail } = require('./emailService');
      sendTicketEmail(primaryTicket, primaryTicket.eventId, qrData.qrCodeDataURL)
        .then((result) => {
          if (result.success) {
            console.log(`✅ Ticket email sent to ${primaryTicket.buyerEmail}`);
          } else {
            console.warn(`⚠️  Failed to send ticket email: ${result.error}`);
          }
        })
        .catch((error) => {
          console.error(`❌ Error sending ticket email:`, error.message);
        });
    } catch (postCommitError) {
      console.error('Post-commit processing error:', postCommitError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and ticket created successfully',
      data: responseData,
    });
  } catch (error) {
    if (!transactionCommitted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.warn('Transaction abort skipped:', abortError.message);
      }
    }
    session.endSession();

    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

/**
 * @desc    Webhook handler for Paystack events
 * @route   POST /api/payments/webhook
 * @access  Public (Paystack)
 */
const handlePaystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    const event = req.body;

    // Handle successful payment
    if (event.event === 'charge.success') {
      console.log('✅ Payment successful:', event.data.reference);
      // Payment verification will be handled by the verify endpoint
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook error');
  }
};

module.exports = {
  initializeTicketPayment,
  verifyTicketPayment,
  handlePaystackWebhook,
};
