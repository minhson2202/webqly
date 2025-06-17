const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Giải trí', 'Y tế', 'Khác']
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    receiptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Receipt'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
