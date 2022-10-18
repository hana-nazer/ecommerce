const express = require('express');
const app = require('../app');
var router = express.Router();
const userController = require('../controllers/user-controller')


//homepage
router.get('/',userController.getHome)

//signup
router.get('/signup',userController.getSignup)

//signup post
router.post('/signup',userController.postSignup)

//login page
router.get('/login',userController.getLogin)

//login page post
router.post('/login',userController.postLogin)

//user_info
router.get('/userInfo',userController.userInfo)

//logout
router.get('/logout',userController.getLogout)




module.exports = router;