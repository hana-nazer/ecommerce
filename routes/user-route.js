const express = require('express');
const { TaskRouterGrant } = require('twilio/lib/jwt/AccessToken');
const app = require('../app');
const adminController = require('../controllers/admin-controller');
var router = express.Router();
const userController = require('../controllers/user-controller')


//homepage
router.get('/',userController.getHome)


//otp
router.post('/otp',userController.postOtp)

//signup
router.get('/signup',userController.getSignup)

//signup post
router.post('/signup',userController.postSignup)

//login page
router.get('/login',userController.getLogin)

//login page post
router.post('/login',userController.postLogin)

//user_info
router.get('/userInfo',userController.userSession,userController.userBlock,userController.userInfo)

//productview
router.get('/productView/:id/:category',userController.productView)

//single category
router.get('/singleCategory',userController.singleCategory)

//add to cart
router.get('/addToCart/:id',userController.addToCart)
//Viewcart
router.get('/cart',userController.viewCart)

//quantityInc
router.post('/increment/:id',userController.quantityInc)

//logout
router.get('/logout',userController.getLogout)




module.exports = router;