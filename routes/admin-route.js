const express = require('express');
const app = require('../app');
const router = express.Router();
const adminController = require('../controllers/admin-controller')
const upload = require('../multer/multer')
 


//homepage
router.get('/',adminController.sessionAdmin,adminController.getAdmin)

//admin login(get)
router.get('/admin-login',adminController.getAdminLogin)

//admin-sign in
router.post('/admin-login',adminController.postLogin)

//user list
router.get('/user-option',adminController.sessionAdmin,adminController.getUserList)

//products
router.get('/product',adminController.sessionAdmin,adminController.getProductList)


//add-products
// router.get('/add-product',adminController.addProduct)

//post add-product
// router.post('/add-product',adminController.product)

//route chaining (add product ,get and post writing together)
router.route('/add-product')
.get(adminController.sessionAdmin,adminController.addProduct)
.post(adminController.sessionAdmin,upload.array("productImage",2),adminController.product)

//Add category
router.post('/add-category',adminController.sessionAdmin,adminController.addCategory)

//delete category
router.post('/delete-category/:id',adminController.sessionAdmin,adminController.hideOrUnhideCategory)

//category
router.get('/category',adminController.sessionAdmin,adminController.getCategory)

//edit-product
router.get('/edit-product/:id',adminController.sessionAdmin,adminController.editProduct)

//post edit
router.post('/edit-product/:id',adminController.sessionAdmin,upload.array("productImage",2),adminController.postEditProduct)

//delete product
router.post('/delete-product/:id',adminController.sessionAdmin,adminController.deleteProduct)

//block user
router.get('/blockUser/:id',adminController.sessionAdmin,adminController.blockUser)

//unblock user
router.get('/unBlockUser/:id',adminController.sessionAdmin,adminController.unBlock)

//to get each category products
router.get('/categoryList/:category',adminController.sessionAdmin,adminController.categoryList)


//logout
router.get('/logout',adminController.adminLogout)





module.exports=router