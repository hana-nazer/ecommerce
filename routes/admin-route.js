const express = require('express');
const app = require('../app');
const router = express.Router();
const adminController = require('../controllers/admin-controller')
const upload = require('../multer/multer')
const storeBanner = require('../multer/multer-banner')
const sessionAdmin = require('../middleware/admin-session')




//homepage
router.get('/', sessionAdmin, adminController.getAdmin)

//sales report
router.get('/report', sessionAdmin, adminController.report)

//admin login(get)
router.get('/admin-login', adminController.getAdminLogin)

//admin-sign in
router.post('/admin-login', adminController.postLogin)

//user list
router.get('/user-option', sessionAdmin, adminController.getUserList)

//products
router.get('/product', sessionAdmin, adminController.getProductList)

//add-products
// router.get('/add-product',adminController.addProduct)

//post add-product
// router.post('/add-product',adminController.product)

//route chaining (add product ,get and post writing together)
router.route('/add-product')
    .get(sessionAdmin, adminController.addProduct)
    .post(sessionAdmin, upload.array("productImage", 2), adminController.product)

//Add category
router.post('/add-category', sessionAdmin, adminController.addCategory)

//delete category
router.post('/delete-category/:id', sessionAdmin, adminController.deleteCategory)

router.get('/categoryList/:category', sessionAdmin, adminController.categoryList)


//category
router.get('/category', sessionAdmin, adminController.getCategory)

//edit-product
router.get('/edit-product/:id', sessionAdmin, adminController.editProduct)

//post edit
router.post('/edit-product/:id', sessionAdmin, upload.array("productImage", 2), adminController.postEditProduct)

//delete product
router.post('/delete-product/:id', sessionAdmin, adminController.deleteProduct)

//block user
router.get('/blockUser/:id', sessionAdmin, adminController.blockUser)

//unblock user
router.get('/unBlockUser/:id', sessionAdmin, adminController.unBlock)

//banner
router.get('/banner', sessionAdmin, adminController.getBannerList)

//addBanner
router.route('/addBanner')
    .get(sessionAdmin, adminController.addBanner)
    .post(sessionAdmin, storeBanner.array("bannerImage", 2), adminController.postAddBanner)

//editbanner
router.route('/editBanner/:id')
    .get(sessionAdmin, adminController.editBanner)
    .post(sessionAdmin, storeBanner.array("bannerImage", 2), adminController.postEditBanner)

//hideUnhideBanner
router.post('/hideUnhideBanner/:id', sessionAdmin, adminController.bannerHideUnhide)

//orderpage
router.get('/viewOrder', sessionAdmin, adminController.viewOrder)
//orderDetails
router.get('/orderDetails/:id', sessionAdmin, adminController.viewOrderDetails)


//order status
router.get('/approveOrder/:id', sessionAdmin, adminController.approveOrders)
router.get('/dispatchedOrder/:id', sessionAdmin, adminController.dispatchedOrders)
router.get('/deliveredOrder/:id', sessionAdmin, adminController.deliveredOrders)
router.get('/cancelOrder/:id', sessionAdmin, adminController.cancelledOrders)
router.get('/failedOrder/:id', sessionAdmin, adminController.failedOrders)

//coupon
router.get('/coupon', sessionAdmin, adminController.viewCoupons)
router.get('/addCoupon', sessionAdmin, adminController.AddCoupons)
router.post('/addcoupon', sessionAdmin, adminController.postAddCoupon)
router.get('/deleteCoupon/:id', sessionAdmin, adminController.deleteCoupon)
router.get('/editCoupon/:id', sessionAdmin, adminController.getEditCoupon)
router.post('/editCoupon/:id', sessionAdmin, adminController.postEditCoupon)


//logout
router.get('/logout', adminController.adminLogout)





module.exports = router