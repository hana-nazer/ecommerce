const express = require('express')
var path = require('path')
const app = express()
const db = require('./config/connection')
const logger = require('morgan')
const session = require('express-session')
const cookieParser = require('cookie-parser');
var nocache = require('nocache')

//view engine setup
app.set('view engine', 'ejs');


const userRouter = require('./routes/user-route')
const adminRouter = require('./routes/admin-route')
const { urlencoded } = require('express')


app.use(logger('dev'))
app.use(express.json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser());
app.use(nocache());
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







