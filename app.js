const express = require('express')
var path = require('path')
const app = express()
const db = require('./config/connection')
const logger = require('morgan')
const session = require('express-session')
const cookieParser = require('cookie-parser');
var nocache = require('nocache')
// const fileupload = require('express-fileupload')
const multer = require('multer')

//view engine setup
app.set('view engine', 'ejs');


const userRouter = require('./routes/user-route')
const adminRouter = require('./routes/admin-route')
const { urlencoded } = require('express')
// --------------multer----------------------//
const storage = multer.diskStorage({
    destination : function(req,file,callback){
        callback(null,'./public/productImages')
    },
    // --------name setting----//
    filename : function(req,file,cb){
        const unique = Date.now()+'.jpg'
        cb(null,unique)
    }
});

const upload = multer({storage:storage})
app.use(upload.array('productImage',2),function(req,res,next){
    next()
})


app.use(logger('dev'))
app.use(express.json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser());
app.use(nocache());
// app.use(fileupload());
// app.use(multer())
//requiring public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    saveUninitialized: true,
    resave: false,
    secret: "key",
    cookie: { maxAge: 600000 }
})
)

app.use('/', userRouter)
app.use('/admin',adminRouter)


app.listen(3000, () => {
    console.log("server connected");
})
module.exports = app;







