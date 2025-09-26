const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
import Handlebars from 'handlebars';
const Merchandise = require('../../../model/merchandise');

require("dotenv").config();

Handlebars.registerHelper('ifEquals', (arg1: any, arg2: any, options: any) => {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


const htmlTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'template', 'order.html'),
  'utf8'
);


const htmlCompiled = Handlebars.compile(htmlTemplate);

const sendOrderConfirmation = async (order: any, recipientEmail: string, metadata: any) => {
  try {
    const productIds = order.items.map((item: any) => item.productId);

    const productsFromDB = await Merchandise.find({ _id: { $in: productIds } });

    const productMap = new Map();
    productsFromDB.forEach((product: any) => {
      productMap.set(product._id.toString(), {
        name: product.name,
        imageUrl: product.imageUrl,
      });
    });

    const templateData = {
      customerName: `${metadata.firstName} ${metadata.lastName}`,
      orderNumber: order.orderId,
      orderDate: new Date(order.createdAt).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      paymentMethod: order.paymentMethod,
      deliveryType: order.shippingAddress.deliveryType?.trim() || '',
      collectionCenter: order.shippingAddress.collectionCenter || '',
      trackingNumber: order.trackingNumber,
      items: order.items.map((item: any) => {
        const productDetails = productMap.get(item.productId.toString());
        return {
          name: productDetails?.name || 'Unknown Item',
          imageUrl: productDetails?.imageUrl || '',
          quantity: item.quantity,
          price: item.price.toFixed(2),
          total: (item.quantity * item.price).toFixed(2),
          size: item.size,
        };
      }),
      subtotal: order.totalAmount.toFixed(2),
      total: order.totalAmount.toFixed(2),
      shippingName: `${metadata.firstName} ${metadata.lastName}`,
      shippingAddress: {
        street: order.shippingAddress.street || '',
        city: order.shippingAddress.city || '',
        zip: order.shippingAddress.postalCode || '',
        country: order.shippingAddress.country || 'Kenya'
      },
      billingName: `${metadata.firstName} ${metadata.lastName}`,
      billingAddress: {
        street: order.shippingAddress.street || '',
        city: order.shippingAddress.city || '',
        zip: order.shippingAddress.postalCode || '',
        country: order.shippingAddress.country || 'Kenya'
      },
      estimatedDelivery: order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toLocaleDateString('en-GB')
        : 'Within 3-5 business days',
    };

    const htmlContent = htmlCompiled(templateData);
    console.log(templateData)

    const mailOptions = {
      from: `"M-seal Team" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your M-seal order confirmed #${order.orderId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send order confirmation: ${error.message}`);
  }
};


module.exports = sendOrderConfirmation;