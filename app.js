const express = require('express')
var path = require('path')
const app = express()
const db = require('./config/connection')

app.listen(3000,()=>{
    console.log("server connected");
})

const userRouter= require('./routes/user-route')
app.use('/',userRouter)

//view engine setup
app.set('view engine','ejs');
//requiring public folder
app.use(express.static(path.join(__dirname, 'public')));




module.exports = app;