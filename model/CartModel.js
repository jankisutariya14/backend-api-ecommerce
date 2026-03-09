const mongoose = require('mongoose');

const CartModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { timestamps: true })
module.exports = mongoose.model("cart", CartModel);