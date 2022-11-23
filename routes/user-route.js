const express = require('express');
const { TaskRouterGrant } = require('twilio/lib/jwt/AccessToken');
const app = require('../app');
const { adminCollection } = require('../config/collection');
const adminController = require('../controllers/admin-controller');
var router = express.Router();
const userController = require('../controllers/user-controller')
const userSession = require('../middleware/user-session')
const userBlock = require('../middleware/user-block');




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

//forgotPassword
// router.get('/forgotPassword',userController.forgotPassword)
// router.post('/forgotPassword',userController.postForgotPassword)
// router.get('/resetPassword',userController.resetPassword)
// router.post('/resetPassword',userController.postResetPassword)

//user_info
router.get('/user-info',userSession,userController.userInfo)

//address
router.get('/address',userSession,userController.getAddress)
router.post('/address',userSession,userController.postAddress)
router.get('/editAddress/:id',userController.editAddress)
router.post('/editAddress/:id',userController.postEditAddress)
router.get('/deleteAddress/:id',userController.deleteAddress)

//productview
router.get('/productView/:id/:category',userController.productView)

//single category
// router.get('/singleCategory',userController.singleCategory)

//add to cart
router.get('/addToCart/:id',userSession,userBlock,userController.addToCart)
//add to cart from wishlist
router.get('/addToCartWishlist/:id',userSession,userBlock,userController.addToCartWishlist)

//Viewcart
router.get('/cart',userSession,userBlock,userController.viewCart)

//quantityInc
router.post('/increment/:id',userSession,userBlock,userController.quantityInc)

//remove from cart
router.post('/remove/:id',userSession,userBlock,userController.removeCartItem)

//viewWishList
router.get('/viewWishList',userSession,userBlock,userController.viewWishList)

//addtoWishList
router.get('/wishList/:id',userSession,userBlock,userController.addToWishList)

//removewishListItem
router.get('/removeWishList/:id',userSession,userBlock,userController.removeWishListItem)

//gettoing total value from ajax
// router.get('/totalBill',userController.)

//get and post Checkout
router.route('/checkout')
.get (userSession,userBlock,userController.getCheckOut)
.post(userSession,userBlock,userController.postCheckOut)

router.post('/verify-payment',userSession,userBlock,userController.verifyPayment)
router.post('/applyCoupon',userSession,userBlock,userController.applyCoupon)
// router.get('/availableCoupons',userController.userSession,userController.availableCoupons)

//orderDetails
router.get('/orderTrack',userSession,userBlock,userController.orderDetails)
//orderSuccessPage
router.get('/orderSuccess/:orderId',userSession,userBlock,userController.orderSuccesPage)


//logout
router.get('/logout',userController.getLogout)




module.exports = router;