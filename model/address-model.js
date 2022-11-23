const {default:mongoose}= require('mongoose')
const Schema = mongoose.Schema

const addressSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        require: true
    },
        name:String,
        houseName:String,
        pincode: Number,
        phoneNumber: Number,
        city: String,
        state: String
       })

module.exports = mongoose.model('address',addressSchema)