"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    userInfo: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            productId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Merchandise' },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            customization: {
                type: mongoose_1.default.Schema.Types.Mixed,
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
    transactionReference: { type: String, require: true },
    shippingAddress: {
        street: String,
        city: String,
        country: String,
        postalCode: String,
        deliveryType: String,
        collectionCenter: String
    },
    orderId: { type: String, unique: true },
    trackingNumber: { type: String },
}, { timestamps: true });
orderSchema.index({ transactionReference: 1, orderId: 1 });
module.exports = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=order.js.map