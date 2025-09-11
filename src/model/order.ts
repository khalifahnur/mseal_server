import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchandise' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      customization: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  transactionReference: { type: String, require:true },
  shippingAddress: {
    street: String,
    city: String,
    country: String,
    postalCode: String,
    deliveryType: String,
    collectionCenter: String
  },
  orderId:{type:String,unique:true},
  trackingNumber: { type: String },
  
}, { timestamps: true });

orderSchema.index({ transactionReference: 1,orderId:1 });

module.exports = mongoose.model('Order', orderSchema);