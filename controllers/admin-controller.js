const { response } = require('../app')
const adminModel = require('../model/admin-model')
const userModel = require('../model/user-model')
const productSchema = require('../model/product-model')
const bcrypt = require('bcrypt')
const categoryModel = require('../model/category-model')
const bannerModel = require('../model/banner-model')
const orderModel = require('../model/order-model')



let categoryError;
module.exports = {
    //-------------session middlware-----//
    sessionAdmin: (req, res, next) => {
        if (req.session.admin) {
            next()
        }
        else {
            res.redirect('/admin/admin-login')
        }
    },


    //---------admin home---------//
    getAdmin: (req, res) => {
        try {
            res.render('admin/admin')
        }
        catch (err) {
            console.log(err);
        }
    },


    //----------------------admin login(get)-----------/
    getAdminLogin: (req, res) => {
        try {
            if (req.session.admin) {
                res.redirect('/admin/')
            } else {
                let admin = req.session.admin
                res.render('admin/admin-login', { admin })
            }
        }
        catch (err) {
            console.log(err);
        }
    },


    // ----------------- admin signin--------------//
    postLogin: (req, res) => {
        try {
            adminModel.findOne({ email: req.body.email }).then((admin) => {
                if (admin) {
                    bcrypt.compare(req.body.password, admin.password).then((data) => {
                        if (data) {
                            req.session.admin = admin
                            res.redirect('/admin/')
                        }
                        else {
                            res.redirect('/admin/admin-login')
                        }
                    })
                } else {
                    res.redirect('/admin/admin-login')
                }
            })
        }
        catch (err) {
            console.log(err);
        }

    },

    // --------------------user list---------------//
    getUserList: (req, res) => {
        try {
            userModel.find().then((data) => {
                res.render('admin/user_manage', { data })
            })
        }
        catch (error) {
            console.log(error);
        }
    },

    //-----------product list----------------//
    getProductList: (req, res) => {
        try {
            productSchema.find({}, function (err, product) {
                if (err) {
                    res.send(err)
                }
                else {
                    res.render('admin/product', { product })
                }
            })
        }
        catch (error) {
            console.log(error);
        }
    },


    //--------------add-product--------------//
    addProduct: async (req, res) => {
        try {
            let category = await categoryModel.find()
            res.render('admin/add-product', { category })
        }
        catch (error) {
            console.log(error);
        }
    },



    //-------------post add product---------------//
    //-------------to get added products---------//
    product: (req, res) => {
        try {
            const imageName = [];
            for (file of req.files) {
                imageName.push(file.filename);
            }
            const { name, category, price, quantity, description } = req.body
            const product = new productSchema({
                image: imageName,
                name,
                category,
                price,
                quantity,
                description
            })
            product.save();
            res.redirect('/admin/product')
        }
        catch (error) {
            console.log(error);
        }
    },


    // ----------edit product---------//
    editProduct: async (req, res) => {
        try {
            let productId = await productSchema.findOne({ _id: req.params.id })
            let category = await categoryModel.find()
            res.render('admin/edit-product', { productId, category })
        }
        catch (error) {
            console.log(error);
        }
    },


    //-------------post edit--------//
    postEditProduct: async (req, res) => {
        try {
            const productId = req.params.id
            const files = req.files
            let image = []
            if (files) {
                for (i = 0; i < req.files.length; i++) {
                    image[i] = files[i].filename
                }
                req.body.image = image
                await productSchema.updateOne({ _id: productId }, {
                    name: req.body.name,
                    image: image,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    category: req.body.category,
                    description: req.body.description
                })
                console.log(req.body.name);
                res.redirect('/admin/product')
            }
        }
        catch (error) {
            console.log(error);
        }
    },


    //------delete product---------//
    deleteProduct: (req, res) => {
        try {
            let productId = req.params.id
            productSchema.findOne({ _id: productId }).then((data) => {
                if (data.active) {
                    productSchema.updateOne({ _id: productId },
                        { $set: { active: false } }).then(() => {
                            res.json({ status: true })
                        })
                }
                else {
                    productSchema.updateOne({ _id: productId },
                        { $set: { active: true } }).then(() => {
                            res.json({ status: false })
                        })
                }
            }).catch((err) => {
                console.log(err);
            })
        }
        catch (error) {
            console.log(error);
        }
    },


    //-----Add category------//
    addCategory: (req, res) => {
        try {
            const caseCategory = req.body.category.toUpperCase()
            categoryModel.find({ category: caseCategory }, (err, data) => {
                if (data.length === 0) {
                    const category = new categoryModel({
                        category: caseCategory
                    })
                    category.save()
                        .then(answer => {
                            res.redirect('/admin/category')
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }
                else {
                    categoryError = "This category already exists"
                    res.redirect('/admin/category')

                }
            })
        }
        catch (error) {
            console.log(error);
        }
    },


    //------------categoryList-------//
    getCategory: (req, res) => {
        try {
            categoryModel.find({}, function (err, answer) {
                if (answer) {
                    res.render('admin/category', { answer, "categoryError": categoryError })
                    categoryError = null
                }
                else {
                    res.send(err)
                }
            })
        }
        catch (error) {
            console.log(error);
        }
    },


    //-----------single category---//
    categoryList: async (req, res) => {
        try {
            if (req.params.category) {
                categoryChoosen = req.params.category
                console.log(categoryChoosen);
                let selectedProducts = await productSchema.find({ category: categoryChoosen })
                res.render('admin/categoryList', { selectedProducts, categoryChoosen })
            }
            else {
                res.redirect('/admin/category')
            }
        } catch (error) {
            console.log(error);

        }
    },


    //---------delete category------------//
    deleteCategory: async (req, res) => {
        try {
            const categoryId = req.params.id
            const categoryList = await categoryModel.findById(categoryId)
            const categoryProducts = await productSchema.find({ category: categoryList.category })
            if (categoryProducts.length == 0) {
                await categoryModel.findByIdAndRemove(categoryId).then(() => {
                    res.json({ status: true })
                })
                    .catch(err => console.log(err))
            } else {
                res.json({ status: false })
            }
        }
        catch (err) {
            console.log(err);
        }
    },



    //------------------blockUser------------//
    blockUser: async (req, res) => {
        try {
            let userId = req.params.id
            await userModel.updateOne({ _id: userId }, {
                $set: {
                    status: "false"
                }
            })
            res.redirect('/admin/user-option')
        }
        catch (error) {
            console.lo(error)
        }
    },

    //--------------unblock----------------//
    unBlock: async (req, res) => {
        try {
            let userId = req.params.id
            await userModel.updateOne({ _id: userId }, {
                $set: {
                    status: "true"
                }
            })
            res.redirect('/admin/user-option')
        }
        catch (error) {
            console.log(error);
        }
    },

    //---Banner page---//
    getBannerList: (req, res) => {
        try {
            bannerModel.find({}, function (err, banner) {
                if (err) {
                    res.send(err)
                }
                else {
                    res.render('admin/viewBanner', { banner })
                }
            })
        }
        catch (error) {
            console.log(error);
        }
    },

    //Add banner----//
    addBanner: async (req, res) => {
        try {
            res.render('admin/addBanner')
        }
        catch (error) {
            console.log(error);
        }
    },
    //add banner post---//
    postAddBanner: async (req, res) => {
        try {
            const imageName = [];
            for (file of req.files) {
                imageName.push(file.filename);
            }
            // const { bannertitle, bannerdescription } = req.body
            const banner = new bannerModel({
                image: imageName,
                title: req.body.bannertitle,
                description: req.body.bannerdescription
            })
            banner.save();
            res.redirect('/admin/banner')
        }
        catch (error) {
            console.log(error);
        }
    },


    //----edit banner---//
    editBanner: async (req, res) => {
        try {
            let bannerId = await bannerModel.findOne({ _id: req.params.id })

            res.render('admin/editBanner', { bannerId })
        }
        catch (error) {
            console.log(error);
        }
    },

    //----postEdit banner---//
    postEditBanner: async (req, res) => {
        try {
            const bannerId = req.params.id
            console.log(req.files);
            const images = [];
            for (file of req.files) {
                images.push(file.filename)
            }
            bannerModel.find({ id: bannerId }, async (err, data) => {
                if (data.length !== 0) {
                    await bannerModel.updateOne({ _id: bannerId }, {
                        $set: {
                            title: req.body.title,
                            description: req.body.description,
                            image: images
                        }
                    })
                }
            })




            //  if(files){
            //     for(i=0;i<req.files.length;i++){
            //         images[i]=files[i].filename
            //     }
            //  }


            //   req.body.image=images
            //   await bannerModel.updateOne({_id:bannerId},{
            //     title:req.body.title,
            //     description:req.body.description,
            //     image:images
            //   })
            //   console.log(req.body.title);
            res.redirect('/admin/banner')
        }
        catch (error) {
            console.log(error);
        }
    },


    bannerHideUnhide: (req, res) => {
        try {
            let bannerId = req.params.id
            bannerModel.findOne({ _id: bannerId }).then((data) => {
                if (data.show) {
                    bannerModel.updateOne({ _id: bannerId },
                        { $set: { show: false } }).then(() => {
                            res.json({ status: true })
                        })
                }
                else {
                    bannerModel.updateOne({ _id: bannerId },
                        { $set: { show: true } }).then(() => {
                            res.json({ status: false })
                        })
                }
            }).catch((err) => {
                console.log(err);
            })
        }
        catch (error) {
            console.log(error);
        }
    },


    //--------order Management----------//
    viewOrder: (req, res) => {
        try {
            orderModel.find().then((orders) => {
                res.render('admin/viewOrders', { orders })

            })
        } catch (error) {

        }
    },


    viewOrderDetails: async (req, res) => {
        try {
            orderId = req.params.id
            let order = await orderModel.findById({ _id: orderId }).populate('order.productId').exec()
            let products = order.order
            console.log(products);
            res.render('admin/orderDetails', { order, products })
        } catch (error) {

        }

    },

    approveOrders: async (req, res) => {
        try {
            let orderId = req.params.id
            console.log("orderId is ertyuijhgfd");
            console.log(orderId);
            await orderModel.updateOne({ _id: orderId }, {
                $set: { orderStatus: "Approved" }
            }).then(() => {
                res.redirect(`/admin/orderDetails/${orderId}`)
            })
        } catch (error) {
            console.log(error);
        }
    },

    dispatchedOrders: async (req, res) => {
        try {
            let orderId = req.params.id
            console.log("orderId is ertyuijhgfd");
            console.log(orderId);
            await orderModel.updateOne({ _id: orderId }, {
                $set: { orderStatus: "Dispatched" }
            }).then(() => {
                res.redirect(`/admin/orderDetails/${orderId}`)
            })
        } catch (error) {
            console.log(error);
        }
    },

    deliveredOrders: async (req, res) => {
        try {
            let orderId = req.params.id
            console.log("orderId is ertyuijhgfd");
            console.log(orderId);
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: "Delivered",
                    paymentStatus: "completed"
                }
            }).then(() => {
                res.redirect(`/admin/orderDetails/${orderId}`)
            })
        } catch (error) {
            console.log(error);
        }
    },

    cancelledOrders: async (req, res) => {
        try {
            let orderId = req.params.id
            console.log("orderId is ertyuijhgfd");
            console.log(orderId);
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: "Cancelled",
                    paymentStatus: "order is cancelled"
                }
            }).then(() => {
                res.redirect(`/admin/orderDetails/${orderId}`)
            })
        } catch (error) {
            console.log(error);
        }
    },

    viewPendingOrders: async (req, res) => {
        try {
            orderModel.find({ orderStatus: "pending" }).then((orders) => {
                res.render('admin/pendingOrders', { orders })
            })
        } catch (error) {

        }

    },

    viewApprovedOrders: (req, res) => {
        res.render('admin/approvedOrders')
    },

    viewDispatchedOrders: (req, res) => {
        res.render('admin/dispatchedOrders')
    },

    viewDeliveredOrders: (req, res) => {
        res.render('admin/deliveredOrders')
    },

    viewCancelledOrders: (req, res) => {
        res.render('admin/cancelledOrders')
    },

    //-----------------logout-------------------//
    adminLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin/admin-login')
    }
}