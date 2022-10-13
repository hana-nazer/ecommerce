const mongoose= require('mongoose')

mongoose.connect('mongodb://localhost:27017/ecommerce');


mongoose.connection
.once("open",()=>console.log("connected"))
.on("error",error=>{console.log("error occured",error);});