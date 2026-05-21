const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
