const mongoose = require('mongoose')

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  priceAtSale: { type: Number, required: true }
})

const saleSchema = new mongoose.Schema({
  rep: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  items: [saleItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital_wallet'],
    default: 'cash'
  },
  saleDate: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Sale', saleSchema)
