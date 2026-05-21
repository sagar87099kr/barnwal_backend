const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    company: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  totalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
