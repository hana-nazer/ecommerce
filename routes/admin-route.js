const express = require('express');
const app = require('../app');
const router = express.Router();
const adminController = require('../controllers/admin-controller')
const upload = require('../multer/multer')
const storeBanner = require('../multer/multer')




//homepage
router.get('/', adminController.sessionAdmin, adminController.getAdmin)

//admin login(get)
router.get('/admin-login', adminController.getAdminLogin)

//admin-sign in
router.post('/admin-login', adminController.postLogin)

//user list
router.get('/user-option', adminController.sessionAdmin, adminController.getUserList)

//products
router.get('/product', adminController.sessionAdmin, adminController.getProductList)

//add-products
// router.get('/add-product',adminController.addProduct)

//post add-product
// router.post('/add-product',adminController.product)

//route chaining (add product ,get and post writing together)
router.route('/add-product')
    .get(adminController.sessionAdmin, adminController.addProduct)
    .post(adminController.sessionAdmin, upload.array("productImage", 2), adminController.product)

//Add category
router.post('/add-category', adminController.sessionAdmin, adminController.addCategory)

//delete category
router.post('/delete-category/:id', adminController.sessionAdmin, adminController.deleteCategory)

router.get('/categoryList/:category', adminController.sessionAdmin, adminController.categoryList)


//category
router.get('/category', adminController.sessionAdmin, adminController.getCategory)

//edit-product
router.get('/edit-product/:id', adminController.sessionAdmin, adminController.editProduct)

//post edit
router.post('/edit-product/:id', adminController.sessionAdmin, upload.array("productImage", 2), adminController.postEditProduct)

//delete product
router.post('/delete-product/:id', adminController.sessionAdmin, adminController.deleteProduct)

//block user
router.get('/blockUser/:id', adminController.sessionAdmin, adminController.blockUser)

//unblock user
router.get('/unBlockUser/:id', adminController.sessionAdmin, adminController.unBlock)

//banner
router.get('/banner', adminController.sessionAdmin, adminController.getBannerList)

//addBanner
router.route('/addBanner')
    .get(adminController.sessionAdmin, adminController.addBanner)
    .post(adminController.sessionAdmin, storeBanner.array("bannerImage", 2), adminController.postAddBanner)

//editbanner
router.route('/editBanner/:id')
    .get(adminController.sessionAdmin, adminController.editBanner)
    .post(adminController.sessionAdmin, storeBanner.array("bannerImage", 2), adminController.postEditBanner)

//hideUnhideBanner
router.post('/hideUnhideBanner/:id', adminController.sessionAdmin, adminController.bannerHideUnhide)

//orderpage
router.get('/viewOrder', adminController.sessionAdmin, adminController.viewOrder)
//orderDetails
router.get('/orderDetails/:id', adminController.sessionAdmin, adminController.viewOrderDetails)
//pending orders
router.get('/pendingOrders', adminController.sessionAdmin, adminController.viewPendingOrders)
//Approved
router.get('/approvedOrders', adminController.sessionAdmin, adminController.viewApprovedOrders)
//dispatched
router.get('/dispatchedOrders', adminController.sessionAdmin, adminController.viewDispatchedOrders)
//delieverd
router.get('/deliveredOrders', adminController.sessionAdmin, adminController.viewDeliveredOrders)
//cancelled
router.get('/cancelledOrders', adminController.sessionAdmin, adminController.viewCancelledOrders)


//order status
router.get('/approveOrder/:id', adminController.sessionAdmin, adminController.approveOrders)
router.get('/dispatchedOrder/:id', adminController.sessionAdmin, adminController.dispatchedOrders)
router.get('/deliveredOrder/:id', adminController.sessionAdmin, adminController.deliveredOrders)
router.get('/cancelOrder/:id', adminController.sessionAdmin, adminController.cancelledOrders)

//to get each category products
// router.get('/categoryList/:category',adminController.sessionAdmin,adminController.categoryList)


//logout
router.get('/logout', adminController.adminLogout)





module.exports = router