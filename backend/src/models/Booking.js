const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kto wykonuje usługę
    
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    
    status: {
        type: String,
        enum: ['temporary_lock', 'confirmed', 'cancelled', 'completed'],
        default: 'temporary_lock'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'blik', 'on_site'],
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    expiresAt: { type: Date }
}, { timestamps: true });

BookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Booking', BookingSchema);