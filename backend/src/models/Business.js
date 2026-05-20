const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);