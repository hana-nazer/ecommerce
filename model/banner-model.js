const  mongoose=require('mongoose')
const Schema =mongoose.Schema

const bannerSchema =new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
      type:Array,
      required:true
    },
    show:{
        type:Boolean,
        default:true
    }

})
module.exports = mongoose.model('banner',bannerSchema)