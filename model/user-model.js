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
        unique:true
    }
})

module.exports = mongoose.model('User',userSchema)