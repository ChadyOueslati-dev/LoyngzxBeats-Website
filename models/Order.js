const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  beatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat', required: true },
  beatTitle: { type: String, required: true },
  producer: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paypalOrderId: { type: String, required: true },
  paypalPayerId: { type: String },
  payerEmail: { type: String },
  payerName: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  license: { type: String, default: 'Basic' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);
