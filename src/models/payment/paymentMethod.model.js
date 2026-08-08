/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    providerName: { 
        type: String, 
        required: true,
        enum: ['bKash', 'Nagad', 'Rocket', 'Upay', 'COD']
    },
    type: { 
        type: String, 
        enum: ['manual_mfs', 'cod', 'gateway'], 
        required: true 
    },
    accountNumbers: [{
        number: { type: String },
        accountType: { type: String, enum: ['Personal', 'Agent', 'Merchant'] }
    }],
    instructions: { 
        type: String, 
        required: true // e.g., "Please send money to this personal number and enter the TxID."
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    logoUrl: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);