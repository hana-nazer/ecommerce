const { response } = require('../app')
const adminModel = require('../model/admin-model')
const userModel = require('../model/user-model')
const productSchema = require('../model/product-model')
const bcrypt = require('bcrypt')
const categoryModel = require('../model/category-model')
const bannerModel = require('../model/banner-model')
const orderModel = require('../model/order-model')
const couponModel = require('../model/coupon-model')
const { count } = require('../model/admin-model')
// const otpGenerator = require('otp-generator')
// let couponCode = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false });

let categoryError;
module.exports = {


    //---------admin home---------//
    getAdmin: async (req, res) => {
        try {
            let totalUsers = await userModel.estimatedDocumentCount();
            let totalOrders = await orderModel.estimatedDocumentCount();
            let totalProducts = await productSchema.estimatedDocumentCount();
            let orderIncome = await orderModel.find({ paymentStatus: "completed" })
            let cancelledOrder = await orderModel.find({ orderStatus: "Cancelled" }).count();
            let pendingOrder = await orderModel.find({ orderStatus: "pending" }).count();
            let deliveredOrder = await orderModel.find({ orderStatus: "Delivered" }).count();
            let date = new Date().toJSON().slice(0, 10)
            let sum = 0
            for (let i = 0; i < orderIncome.length; i++) {
                sum = sum + orderIncome[i].totalAmount
            }
            let incomeGenerated = await orderModel.aggregate([

                // First Stage
                {
                    $match: { "date": { $ne: null } }
                },
                // Second Stage
                {
                    $group: {
                        _id: "$date",
                        sales: { $sum: "$totalAmount" },
                    }
                },
                // Third Stage
                {
                    $sort: { _id: 1 }
                },
                {
                    $limit: 7
                }
            ])
            const newArr = incomeGenerated.map(elements)
            function elements(item) {
                return item.sales;
            }
            console.log(newArr);

            const newdate = incomeGenerated.map(dateOrder)
            function dateOrder(item) {
                return item._id;
            }

            res.render('admin/admin', { totalUsers, totalOrders, totalProducts, sum, date, cancelledOrder, pendingOrder, deliveredOrder, newArr, newdate })

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
                res.render('admin/admin-login', { admin, adminloginErr: req.session.adminloginErr })
                // adminloginErr = null
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
                            req.session.adminloginErr = "Invalid password"
                            res.redirect('/admin/admin-login')
                        }
                    })
                } else {
                    req.session.adminloginErr = "Invalid Email"
                    res.redirect('/admin/admin-login')
                }
            })
        }
        catch (err) {
            console.log(err);
        }

    },

    //-------report----------//
    report: async(req, res) => {
        try {
            let salesData = await orderModel.aggregate([

                // First Stage
                {
                    $match: { "date": { $ne: null } }
                },
                // {
                //    count:{$count:"$_id"} 
                // },
                // Second Stage
                {
                    $group: {
                        _id: "$date",
                        sales: { $sum: "$totalAmount" },
                        myCount: { $sum: 1 }
                    }
                },
                {
                     $project: { _id: 1, sales:1,myCount:1} 
                },
                // Third Stage
                {
                    $sort: { _id: 1 }
                },
                {
                    $limit: 7
                }
            ])
            console.log("hiii");
            // console.log(incomeGenerate);
            let incomeGenerated= salesData.reverse()
            res.render('admin/report',{incomeGenerated})
        } catch (error) {
            console.log(error);
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
            res.render('admin/add-product', { category, message: req.flash('error') })
        }
        catch (error) {
            console.log(error);
        }
    },



    //-------------post add product---------------//
    //-------------to get added products---------//
    product: (req, res) => {
        try {
            if (req.files.length == 0) {
                productId = req.params.id
                req.flash('error', 'insert an image')
                res.redirect('/admin/add-product')
            }
            else {
                console.log(req.files);
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
            res.render('admin/edit-product', { productId, category, message: req.flash('error') })

        }
        catch (error) {
            console.log(error);
        }
    },


    //-------------post edit--------//
    postEditProduct: async (req, res) => {
        try {
            if (req.files.length == 0) {
                productId = req.params.id
                req.flash('error', 'insert an image')
                res.redirect(`/admin/edit-product/${productId}`)

            } else {

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
            res.render('admin/addBanner', { bannerMessage: req.flash('error') })
        }
        catch (error) {
            console.log(error);
        }
    },
    //add banner post---//
    postAddBanner: async (req, res) => {
        try {
            if (req.files.length === 0) {
                req.flash("error", 'Insert banner image')
                res.redirect('/admin/addBanner')
            } else {

            }
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

            res.render('admin/editBanner', { bannerId, bannerMessage: req.flash('error') })
        }
        catch (error) {
            console.log(error);
        }
    },

    //----postEdit banner---//
    postEditBanner: async (req, res) => {
        try {
            if (req.files.length === 0) {
                req.flash("error", 'Insert banner image')
                res.redirect('/admin/editBanner')
            }
            const bannerId = req.params.id
            // console.log(req.files);
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
            orderModel.find().then((orderDetails) => {
                let orders = orderDetails.reverse()
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

    failedOrders: async (req, res) => {
        try {
            let orderId = req.params.id
            console.log("orderId is ertyuijhgfd");
            console.log(orderId);
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: "failed",
                    paymentStatus: "failed"


                }
            }).then(() => {
                res.redirect(`/admin/orderDetails/${orderId}`)
            })
        } catch (error) {
            console.log(error);
        }
    },








    //--------------coupon management---------//
    viewCoupons: async (req, res) => {
        try {
            couponModel.find().then((coupons) => {
                console.log(coupons);
                res.render('admin/viewCoupons', { coupons })
            })
        } catch (error) {
            console.log(error);
        }
    },

    AddCoupons: (req, res) => {
        try {
            res.render('admin/addCoupon')
        } catch (error) {
            console.log(error);
        }
    },

    postAddCoupon: (req, res) => {
        try {
            // console.log(req.body);
            // console.log(req.body.expDate);
            const coupon = new couponModel({
                couponName: req.body.couponName,
                couponCode: req.body.couponCode,
                MinimumAmount: req.body.minAmount,
                discountPercentage: req.body.disPercentage,
                maxLimit: req.body.maxLimit,
                expiryDate: req.body.expDate
            })
            coupon.save();
            res.redirect('/admin/coupon')
        } catch (error) {

        }
    },

    getEditCoupon: async (req, res) => {
        let editId = req.params.id
        let editCoupon = await couponModel.findOne({ _id: editId })
        res.render('admin/editCoupon', { editCoupon })
    },

    postEditCoupon: async (req, res) => {
        try {
            let couponId = req.params.id
            await couponModel.updateOne({ _id: couponId }, {
                couponName: req.body.couponName,
                couponCode: req.body.couponCode,
                MinimumAmount: req.body.minAmount,
                discountPercentage: req.body.disPercentage,
                maxLimit: req.body.maxLimit,
                expiryDate: req.body.expDate
            })
            res.redirect('/admin/coupon')
        } catch (error) {

        }
    },



    deleteCoupon: (req, res) => {
        let couponId = req.params.id
        couponModel.findByIdAndRemove({ _id: couponId }).then((data) => {
            res.redirect('/admin/coupon')
        })
    },

    //-----------------logout-------------------//
    adminLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin/admin-login')
    }
}