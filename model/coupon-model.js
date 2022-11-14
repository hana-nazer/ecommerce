const mongoose = require('mongoose')
const schema = mongoose.Schema

const couponSchema = new schema({
couponName:{
    type:String,
    require:true
},
couponCode:{
    type:String,
    require:true
},
MinimumAmount:{
    type:String,
    require:true
},
discountPercentage:{
    type:Number,
    require:true
},
maxLimit:{
    type:Number,
    require:true
},
expiryDate:{
    type:String,
    require:true
}
})
module.exports=mongoose.model('coupon',couponSchema)