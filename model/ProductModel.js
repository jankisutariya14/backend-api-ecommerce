const mongoose = require('mongoose');

const ProductModel = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    images:{              
        type:[String],      
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    color:{                
        type:String,
        required:true
    }
})
module.exports = mongoose.model("product",ProductModel);