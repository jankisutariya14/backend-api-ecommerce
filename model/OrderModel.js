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
    status:{
        type:String,
        default:"pending"
    }
},{timestamps:true})
module.exports = mongoose.model("order",OrderModel);