const {default:mongoose}= require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    userName:{
        type : String,
        required:true
    },
    userEmail:{
        type : String,
        required:true
    },
    mobile:{
        type : String,
        required:true
    },
    password:{
        type : String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    coupon:{
        type:Array,
        default:undefined
    },
    address: [{
        name:String,
        houseName:String,
        pincode: Number,
        phoneNumber: Number,
        city: String,
        state: String
    }]
       
    
})

module.exports = mongoose.model('User',userSchema)