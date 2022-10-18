const express = require('express');
const app = require('../app');
var router = express.Router();
const adminController = require('../controllers/admin-controller')



//homepage
router.get('/',adminController.getAdmin)

//admin login
router.get('/admin-login',adminController.getAdminLogin)

//admin-sign in
router.post('/admin-login',adminController.postLogin)

//user list
router.get('/user-option',adminController.getUserList)

//products
router.get('/product',adminController.getProductList)


//add-products
router.get('/add-product',adminController.addProduct)

//post add-product
router.post('/add-product',adminController.product)

//category
router.get('/category',adminController.getCategory)

//logout
router.get('/logout',adminController.adminLogout)

//block user
router.get('/blockUser/:id',adminController.blockUser)

//unblock user
router.get('/unBlockUser/:id',adminController.unBlock)




module.exports=router