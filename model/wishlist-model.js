const {default:mongoose}= require('mongoose')
const Schema = mongoose.Schema

const wishListSchema = new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        require:true
    },
    wishListProducts:[{
        products:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product'
        
        },
        name:String,
        price:Number
    }],
    
    
    
},{timestamps:true})

module.exports = mongoose.model('wishList',wishListSchema)