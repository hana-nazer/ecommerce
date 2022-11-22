const mongoose= require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.mongoose);


mongoose.connection
.once("open",()=>console.log("connected"))
.on("error",error=>{console.log("error occured",error);});