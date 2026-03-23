const mongoose = require('mongoose');

const OrderModel = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"product"
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ],
    totalAmount:{
        type:Number,
        required:true
    },
    shippingDetails: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String
    },
    paymentMethod: {
        type: String,
        default: "COD"
    },
    status:{
        type:String,
        default:"pending"
    }
},{timestamps:true})
module.exports = mongoose.model("order",OrderModel);