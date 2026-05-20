const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);