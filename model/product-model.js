const  mongoose=require('mongoose')
const collection = require('../config/collection')
const Schema =mongoose.Schema

const productSchema =new Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
      type:Array,
      required:true
    }
})
module.exports = mongoose.model(collection.productCollection,productSchema)