/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

// Single item in the cart
const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    // Auto-generated Unique Order ID (e.g., ORD-20260808-1234)
    orderNumber: { type: String, required: true, unique: true, index: true },
    
    // Customer Reference
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    // Ordered Products
    items: [orderItemSchema],
    
    // Pricing Breakdown
    subTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Delivery Address
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zone: { type: String }
    },

    // 💳 Payment Engine Integration
    paymentInfo: {
        method: { 
            type: String, 
            enum: ['bKash', 'Nagad', 'Rocket', 'Upay', 'COD'], 
            required: true 
        },
        transactionId: { 
            type: String, 
            default: null, // Required if manual MFS, null if COD
            index: true 
        },
        amountPaid: { 
            type: Number, 
            default: 0 
        },
        paymentStatus: { 
            type: String, 
            enum: ['pending', 'verified', 'failed', 'refunded', 'cod_unpaid'], 
            default: 'pending',
            index: true
        },
        verifiedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', // Admin ID who verified the TxID
            default: null 
        },
        verifiedAt: { 
            type: Date, 
            default: null 
        }
    },

    // 📦 Fulfillment & Logistics Lifecycle
    orderStatus: {
        type: String,
        enum: [
            'pending_payment', 
            'processing', 
            'ordered_from_supplier', 
            'supplier_out_of_stock',
            'received_at_warehouse', 
            'shipped_to_customer', 
            'delivered', 
            'cancelled', 
            'payment_failed'
        ],
        default: 'pending_payment',
        index: true
    },

    // Order Tracking History for Support Team & Customer
    timeline: [{
        status: { type: String },
        note: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now }
    }]

}, { timestamps: true });

// Auto-generate Order Number before saving to Database
orderSchema.pre('validate', function(next) {
    if (!this.orderNumber) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        this.orderNumber = `ORD-${dateStr}-${randomCode}`; // Example: ORD-20260808-4592
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);