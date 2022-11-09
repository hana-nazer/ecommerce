const { default: mongoose } = require('mongoose')
const Schema = mongoose.Schema
const orderSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        require: true
    },
    paymentMode: {
        type: String,
        require: true
    },
    address: {
        name:String,
        houseName:String,
        pincode: Number,
        phoneNumber: Number,
        city: String,
        state: String
    },
    paymentStatus: {
        type: String,
        default: 'pending'
    },
    order: [{
        productId:{
            type: mongoose.Types.ObjectId,
            ref: 'product',
            require: true
        },
        name:String,
       quantity:Number,
       price:Number
    }
       
    ],
    orderStatus: {
        type: String,
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        require: true
    },
    discountAmount: {
        type: Number,

    }


}, { timestamps: true })

module.exports = mongoose.model('order', orderSchema)