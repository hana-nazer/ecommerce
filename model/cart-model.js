const {default:mongoose}= require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        require:true
    },
    cartProducts:[{
        productId:{
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
    total:{
        type:Number,
        default:0
        
    }
    
    
},{timestamps:true})

module.exports = mongoose.model('Cart',cartSchema)