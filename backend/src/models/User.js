const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['client', 'employee', 'admin'], 
        default: 'client' 
    },
    phoneNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);