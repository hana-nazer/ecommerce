const {default:mongoose}= require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        require:true
    },
    cartProducts:[{
        products:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product'
        
        },
        quantity:{
            type:Number,
            require:true
        },
        name:String,
        price:Number
    }],
    subtotal:{
        type:Number,
        require:true
    }
    
    
},{timestamps:true})

module.exports = mongoose.model('Cart',cartSchema)