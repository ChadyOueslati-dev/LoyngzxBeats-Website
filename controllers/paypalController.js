const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { client } = require('../config/paypal');
const Order = require('../models/Order');
const Beat = require('../models/Beat');

// Create PayPal order
exports.createOrder = async (req, res) => {
  try {
    const { beatId } = req.body;
    const beat = await Beat.findById(beatId);
    if (!beat) return res.status(404).json({ error: 'Beat not found' });

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: beat.price.toFixed(2)
        },
        description: `Beat License: ${beat.title} by ${beat.producer}`
      }],
      application_context: {
        return_url: `${req.protocol}://${req.get('host')}/api/paypal/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/api/paypal/cancel`,
        brand_name: 'LoyngzxBeats',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW'
      }
    });

    const order = await client().execute(request);
    
    // Save pending order
    const newOrder = new Order({
      beatId: beat._id,
      beatTitle: beat.title,
      producer: beat.producer,
      amount: beat.price,
      paypalOrderId: order.result.id,
      status: 'pending',
      license: beat.license
    });
    await newOrder.save();

    res.json({ 
      id: order.result.id,
      orderId: newOrder._id
    });
  } catch (err) {
    console.error('PayPal create order error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Capture PayPal order
exports.captureOrder = async (req, res) => {
  try {
    const { orderID } = req.body;
    
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    
    const capture = await client().execute(request);
    const captureData = capture.result;
    
    // Update order in DB
    const payer = captureData.payer;
    const updatedOrder = await Order.findOneAndUpdate(
      { paypalOrderId: orderID },
      {
        status: 'completed',
        paypalPayerId: payer.payer_id,
        payerEmail: payer.email_address,
        payerName: `${payer.name.given_name} ${payer.name.surname}`,
        completedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      orderId: updatedOrder._id,
      transactionId: captureData.id,
      status: captureData.status
    });
  } catch (err) {
    console.error('PayPal capture error:', err);
    
    await Order.findOneAndUpdate(
      { paypalOrderId: req.body.orderID },
      { status: 'failed' }
    );
    
    res.status(500).json({ error: err.message });
  }
};
