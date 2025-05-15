const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');


const transporter = nodemailer.createTransport({
  service: 'gmail',
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

const sendOrderConfirmation = async (order:any, recipientEmail:string) => {
  try {
    const templateData = {
      customerName: `${order.user.firstName}${order.user.lastName}`,
      orderNumber: order.orderId,
      orderDate: new Date(order.createdAt).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      paymentMethod: 'M-Pesa via Paystack',
      items: order.items.map((item:any) => ({
        name: item.productId.name,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        total: (item.quantity * item.price).toFixed(2),
      })),
      subtotal: order.totalAmount.toFixed(2),
      shipping: '0.00',
      tax: '0.00',
      total: order.totalAmount.toFixed(2),
      shippingName: order.shippingAddress.name,
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state || '',
        zip: order.shippingAddress.postalCode || '',
      },
      billingName: order.shippingAddress.name || order.userId.name,
      billingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state || '',
        zip: order.shippingAddress.postalCode || '',
      },
      estimatedDelivery: order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toLocaleDateString('en-GB')
        : null,
    };

    // Render templates
    const htmlContent = htmlCompiled(templateData);

    const mailOptions = {
      from: '"M-seal Team" <no-reply@yourdomain.com>',
      to: recipientEmail,
      subject: `Order Confirmation #${order.orderId}`,
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error:any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send order confirmation: ${error.message}`);
  }
};

module.exports = sendOrderConfirmation;