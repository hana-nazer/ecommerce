const { response } = require('../app')
const userModel = require('../model/user-model')
const bcrypt = require('bcrypt')
const productSchema = require('../model/product-model')
const categoryModel = require('../model/category-model')
const wishListModel = require('../model/wishlist-model')
const orderModel = require('../model/order-model')
const addressModel = require('../model/address-model')
const cartModel = require('../model/cart-model')
const bannerModel = require('../model/banner-model')
const couponModel = require('../model/coupon-model')
const otpGenerator = require('otp-generator')
const { SinkPage } = require('twilio/lib/rest/events/v1/sink')
const { default: mongoose } = require('mongoose')
const Razorpay = require('razorpay');
const { accessSync } = require('fs')
const { log } = require('console')
// const { jwt } = require('twilio')
require('dotenv').config()
var instance = new Razorpay({ key_id: process.env.keyId, key_secret: process.env.keySecret })
const JWT_SECRET = 'secret'




process.env.ACCOUNT_SID
process.env.AUTH_TOKEN
process.env.VERIFY_SID

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


let loginErr;
let couponErr;


module.exports = {
    //---------home page--------------//
    getHome: async (req, res, next) => {
        try {
            let userData = req.session.userData
            let banner = await bannerModel.find({ show: true })
            if (userData) {
                let wishListItems = await wishListModel.findOne({ userId: userData._id }).lean().populate('wishListProducts.products').exec()
                const pageNum = req.query.page
                const perPage = 4
                let docCount;
                productSchema.find({ active: true }).countDocuments().then((documents) => {
                    docCount = documents
                    return productSchema.find({ active: true })
                        .skip((pageNum - 1) * perPage).limit(perPage)
                }).then((product) => {
                    res.render('user/home', {
                        product,
                        userData,
                        currentPage: pageNum,
                        totalDocuments: docCount,
                        pages: Math.ceil(docCount / perPage),
                        banner,
                        wishListItems
                    })
                })
            } else {
                let wishListItems = null
                const pageNum = req.query.page
                const perPage = 4
                let docCount;
                productSchema.find({ active: true }).countDocuments().then((documents) => {
                    docCount = documents
                    return productSchema.find({ active: true })
                        .skip((pageNum - 1) * perPage).limit(perPage)
                })
                    .then((product) => {
                        res.render('user/home', {
                            product,
                            userData: false,
                            currentPage: pageNum,
                            totalDocuments: docCount,
                            pages: Math.ceil(docCount / perPage),
                            banner,
                            wishListItems
                        })
                    })
            }
        }
        catch (error) {
            console.log(error);
            next(error)
        }
    },


    //---------otp-----//
    postOtp: async (req, res, next) => {
        try {
            userData = req.session.userdata;
            // generateOtp = req.session.userdata.otp
            let password = await bcrypt.hash(userData.password, 10)
            client.verify.v2.services(process.env.VERIFY_SID)
                .verificationChecks
                .create({ to: '+91' + userData.mobile, code: req.body.otp })
                .then(verification_check => {
                    if (verification_check.status == 'approved') {

                        const newUser = new userModel
                            ({
                                userName: userData.name,
                                userEmail: userData.email,
                                mobile: userData.mobile,
                                password: password,
                                status: true,
                                coupon: []
                            })
                        newUser.save()
                            .then(result => {
                                req.session.userData = result
                                res.redirect('/')
                            })
                            .catch(err => {
                                console.log("error is" + err);
                                res.redirect('/login')
                            })
                    }
                    else {
                        req.session.otpErr = true
                        res.render('user/otp', { otpErr: req.session.otpErr })
                        req.session.otpErr = false
                    }
                });

        } catch (error) {
            console.log(error);
            next(error)
        }
    },



    // -------------------------------------signup--------------------------------------------------//

    getSignup: (req, res, next) => {
        try {
            let userData = req.session.userData
            res.render('user/signup', { userData })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },



    postSignup: (req, res, next) => {
        try {
            if (req.body.password == req.body.cpassword) {
                userModel.findOne({ userEmail: req.body.email }, async (err, data) => {
                    if (data == null) {
                        client.verify.v2.services(process.env.VERIFY_SID)
                            .verifications
                            .create({ to: '+91' + req.body.mobile, channel: 'sms' })
                            .then(verification => console.log(verification.status));
                        console.log(req.body.mobile)
                        req.session.userdata = req.body
                        res.render('user/otp', { otpErr: req.session.otp })
                        req.session.otp = false
                    }
                    else {
                        req.session.signupErr = true
                        res.redirect('/login')
                    }
                })
            }
            else {
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },




    //---------------------------Login----------------------------//

    getLogin: (req, res, next) => {
        try {
            if (req.session.userData) {
                res.redirect('/')
            } else {
                let userData = req.session.userData
                res.render('user/login', { userData, loginMessage: req.flash('error') })
                req.session.loginErr = false
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },


    postLogin: async (req, res, next) => {
        try {
            let user = await userModel.findOne({ userEmail: req.body.email })
            if (user) {
                if (user.status === "true") {
                    bcrypt.compare(req.body.password, user.password).then((data) => {
                        if (data) {
                            req.session.userData = user
                            req.session.loggedIn = true
                            // console.log("hii");
                            // console.log(req.session);
                            res.redirect('/')

                        }
                        else {
                            req.flash('error', 'invalid password')
                            // console.log("login failed");
                            res.redirect('/login')
                        }
                    })
                } else {
                    req.flash('error', 'you are blocked by the Admin')
                    res.redirect('/login')
                }

            } else {
                req.flash('error', 'Invalid email')
                // console.log("login failed");
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    //---------forgot password------//
    // forgotPassword: (req, res, next) => {
    //     try {
    //         let userData = req.session.userData

    //         res.render('user/forgotPassword', { userData })
    //     } catch (error) {
    //         console.log(error);
    //         next(error)
    //     }
    // },

    // postForgotPassword: async (req, res, next) => {
    //     try {
    //         let userData = req.session.userData
    //         const email = req.body.email
    //         // console.log(email);
    //         let user = await userModel.findOne({ userEmail: email })
    //         if (user) {
                // console.log("hii");
                // console.log(user);
    //             const secret = JWT_SECRET + user.password
    //             const payload = {
    //                 email: user.userEmail,
    //                 id: user._id
    //             }
    //             // const token = jwt.sign(payload,secret,{expiresIn :'15m'})
    //             const token = jwt.sign(payload, secret, { expireInMinutes: 15 })
    //             const link = `http://localhost:3000/resetPassword/${user._id}/${token}`
    //             // console.log(link);
    //         } else {
    //             // console.log("user not found");
    //         }
    //         res.send('password reset link has been sent to your email')
    //         // res.render('user/forgotPassword',{userData})
    //     } catch (error) {
    //         console.log(error);
    //         next(error)
    //     }
    // },

    // resetPassword: (req, res, next) => {

    // },

    // postResetPassword: (req, res, next) => {

    // },

    //  ----------------------user info ----------------------//
    userInfo: async (req, res) => {
        try {
            let userId = req.session.userData._id
            let user = await userModel.findOne({ _id: userId })
            userData = req.session.userData
            let address = await addressModel.find({userId:userId})
            if (address) {
                res.render('user/userInfo', { userData,address})
            } else {
                let address= null
                res.render('user/userInfo', { userData,address})

            }
        } catch (error) {
            console.log(error);
            // next(error)
        }
    },

    // address
    getAddress: (req, res) => {
        try {
            let userData = req.session.userData
            res.render('user/address',{userData})
        } catch (error) {

        }
    },

    postAddress: async (req, res) => {
        try {
            userId=req.session.userData._id
            const { name, address, zip, phone, city, state } = req.body
            const newAddress = new addressModel
                ({ 
                    userId:userId,
                    name: name,
                    houseName: address,
                    pincode: zip,
                    phoneNumber: phone,
                    city: city,
                    state: state,
                })
            newAddress.save()
                .then(() => {
                      res.redirect('/userInfo')
                })

            // console.log(req.body);
            // const {name,address,zip,phone,city,state} =req.body
            // let userId = req.session.userData._id
            // let user = await userModel.findOne({ _id: userId })
            // user.address.push({
            //     name: name,
            //     houseName: address,
            //     pincode: zip,
            //     phoneNumber: phone,
            //     city: city,
            //     state: state,
            // })
            // user.save()
            // let user2 = await userModel.findOne({ _id: userId })
            // req.session.userData=user2
            // res.redirect('/userInfo')


        } catch (error) {

        }
    },

    editAddress: async (req,res)=>{
        try {
            let addressId = req.params.id
            
      let userData = req.session.userData
      let address = await addressModel.findOne({_id:addressId})
            res.render('user/editAddress',{userData,address})
        } catch (error) {
             console.log(error);
        }
    },

    postEditAddress: async(req,res)=>{
       try{
        let addressId = req.params.id
        console.log("hii");
        console.log(addressId);
        const{name,phone,houseName,state,city,zip}=req.body
        await addressModel.updateOne({ _id: addressId }, {
            name: name,
            phoneNumber:phone,
              houseName:houseName,
              state:state,
              city:city,
              pincode:zip
        })
        res.redirect('/userInfo')
       }catch(error){

       }
    },

    deleteAddress: (req, res,next) => {
        try{
            let addressId = req.params.id
            addressModel.findByIdAndRemove({ _id:addressId}).then((data) => {
                res.redirect('/userInfo')
            })
        }catch(error){
            next(error)
        }
      
    },

    //---------SIngle Product View------------//
    productView: (req, res, next) => {
        try {
            let proId = req.params.id
            // let categoryChoosen=req.params.category
            // productSchema.find({category:categoryChoosen})


            productSchema.find({ _id: proId }, (err, results) => {
                if (!err) {
                    product = results[0]

                    userData = req.session.userData
                    categoryChoosen = req.params.category
                    productSchema.find({ category: categoryChoosen }).limit(4).then((relatedProducts) => {
                        res.render('user/single-product', { userData, product, relatedProducts })
                    })
                }
                else {
                    res.render('error/error500', { status: '500' })
                }
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },


    //----------ViewCart---------//
    viewCart: async (req, res, next) => {
        try {
            if (req.session.userData) {
                let userData = req.session.userData
                let cartUserId = userData._id
                let cartItems = await cartModel.findOne({ userId: cartUserId }).lean().populate('cartProducts.productId').exec()
                if (cartItems) {

                    if (cartItems.cartProducts.length != 0) {
                        total = cartItems.total
                        req.session.cartNum = cartItems.cartProducts.length
                        const products = cartItems.cartProducts
                        res.render('user/userCart', { products, cartItems, userData, "cartNum": req.session.cartNum })
                    }
                    else {
                        req.session.cartNum = 0
                        let userData = req.session.userData

                        res.render('user/emptyCart', { userData })
                    }
                } else {
                    req.session.cartNum = 0
                    let userData = req.session.userData

                    res.render('user/emptyCart', { userData })
                }
            }
            else {
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },



    addToCart: async (req, res, next) => {
        try {
            if (req.session.userData) {
                userData = req.session.userData
                console.log(userData);
                proId = req.params.id
                let quantity = 1
                const findProduct = await productSchema.findById(proId)
                let price = findProduct.price
                let stock = findProduct.quantity
                let name = findProduct.name
                if (stock >= quantity) {
                    findProduct.quantity -= quantity
                    cartUser = userData._id
                    let cart = await cartModel.findOne({ userId: cartUser })
                    if (cart) {
                        let itemIndex = cart.cartProducts.findIndex(p => p.productId == proId)
                        if (itemIndex > -1) {
                            let productItem = cart.cartProducts[itemIndex]
                            productItem.quantity = productItem.quantity + 1
                        } else {
                            cart.cartProducts.push({
                                productId: proId,
                                quantity,
                                name,
                                price,

                            })
                        }
                        cart.total = cart.cartProducts.reduce((acc, curr) => {
                            return acc + curr.quantity * curr.price
                        }, 0)
                        await cart.save()
                    }
                    else {
                        const total = quantity * price
                        const newCart = new cartModel({
                            userId: cartUser,
                            cartProducts: [{ productId: proId, quantity, name, price }],
                            total: total
                        })
                        await newCart.save()
                    }
                    res.json({ status: true })
                }
                else {
                    res.send("out of stock")
                }
            }
            else {
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    addToCartWishlist: async (req, res, next) => {
        try {
            if (req.session.userData) {
                userData = req.session.userData
                proId = req.params.id
                let quantity = 1
                const findProduct = await productSchema.findById(proId)
                console.log("jiiii");
                console.log(findProduct);
                let price = findProduct.price
                let stock = findProduct.quantity
                let name = findProduct.name
                if (stock >= quantity) {
                    findProduct.quantity -= quantity
                    cartUser = userData._id
                    let cart = await cartModel.findOne({ userId: cartUser })
                    if (cart) {
                        console.log(cart);
                        let itemIndex = cart.cartProducts.findIndex(p => p.productId == proId)
                        if (itemIndex > -1) {
                            let productItem = cart.cartProducts[itemIndex]
                            productItem.quantity = productItem.quantity + 1
                        } else {
                            cart.cartProducts.push({
                                productId: proId,
                                quantity,
                                name,
                                price,
                            })
                        }
                        cart.total = cart.cartProducts.reduce((acc, curr) => {
                            return acc + curr.quantity * curr.price
                        }, 0)
                        await cart.save()
                    }
                    else {
                        console.log("else");
                        const total = quantity * price
                        const newCart = new cartModel({
                            userId: cartUser,
                            cartProducts: [{ productId: proId, quantity, name, price }],
                            total: total
                        })
                        await newCart.save()
                    }

                    const dive = await wishListModel.findOne({ userId: userData._id }).populate('wishListProducts.products').exec()
                    await dive.wishListProducts.pull({ products: proId });
                    await dive.save();

                    res.json({ status: true })
                }
                else {
                    res.send("out of stock")
                }
            }
            else {
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },


    //-------------quantity Increment from cartpage----------//
    quantityInc: async (req, res, next) => {

        try {
            str = req.params.id
            let array = str.split("t")
            let userId = req.session.userData._id
            productId = array[0]
            quantity = array[1]
            let productExist = await cartModel.findOne({ userId: userId }).populate('cartProducts.productId').exec()
            let cart = await cartModel.findOne({ userId: userId })
            if (cart) {
                if (productExist !== 0) {
                    await cartModel.findOneAndUpdate({ userId: userId, 'cartProducts.productId': productId },
                        {
                            'cartProducts.$.quantity': quantity,
                        }, { new: true }
                    )

                }
                cart.save()
                res.json({ status: true })
            }
            let cart2 = await cartModel.findOne({ userId: userId })
            const total = cart2.cartProducts.reduce((acc, curr) => {
                const qty = curr.quantity
                val = acc + qty * (curr.price);
                return val
            }, 0)
            cart2.total = total;
            cart2.save()
            res.json({ status: true })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },


    //------remove item from cart-----//
    removeCartItem: async (req, res, next) => {
        try {
            proId = req.params.id
            userId = req.session.userData._id
            let cart = await cartModel.findOne({ userId })
            let itemIndex = cart.cartProducts.findIndex(p => p.productId == proId)
            cart.cartProducts.splice(itemIndex, 1)
            cart.total = cart.cartProducts.reduce((acc, curr) => {
                return acc + curr.quantity * curr.price
            }, 0)
            await cart.save()
            res.json({ status: true })
        } catch (error) {
            next(error)
        }
    },


    //--------View wishList-----------//
    viewWishList: async (req, res, next) => {
        try {
            if (req.session.userData) {
                let userData = req.session.userData
                let wishListUserId = userData._id
                let wishListItems = await wishListModel.findOne({ userId: wishListUserId }).lean().populate('wishListProducts.products').exec()
                if (wishListItems) {
                    if (wishListItems.wishListProducts.length != 0) {
                        req.session.wishListNum = wishListItems.wishListProducts.length
                        const products = wishListItems.wishListProducts
                        res.render('user/userWishList', { products, wishListItems, userData, "wishListNum": req.session.wishListNum })
                    }
                    else {
                        req.session.wishListNum = 0
                        let userData = req.session.userData

                        res.render('user/emptyWishlist', { userData })
                    }
                } else {
                    req.session.wishListNum = 0
                    let userData = req.session.userData

                    res.render('user/emptyWishlist', { userData })
                }
            }
            else {
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },



    //---------addToWishList Wishlist---------//
    addToWishList: async (req, res, next) => {
        try {
            if (req.session.userData) {
                userData = req.session.userData
                productId = req.params.id
                wishListUser = userData._id
                const wishList = await wishListModel.findOne({ userId: wishListUser })
                console.log(wishList);
                if (wishList) {
                    let productIndex = wishList.wishListProducts.findIndex(product => product.products == productId);
                    if (productIndex > -1) {


                        wishList.wishListProducts.splice(productIndex, 1)
                        wishList.save()
                        res.redirect('/viewWishList')
                    }
                    else {
                        wishList.wishListProducts.push({
                            products: productId,
                        })
                        wishList.save()
                        res.redirect('/viewWishList')
                    }
                } else {
                    const newwishList = new wishListModel({
                        userId: wishListUser,
                        wishListProducts: [{
                            products: productId,
                        }],
                    },
                    )
                    newwishList.save();
                    res.redirect('/viewWishList')
                }
            } else {
                res.redirect('/login')
            }

        } catch (error) {
            console.log(error);
            next(error)
        }

    },


    //-----remove wishList Item--//
    removeWishListItem: async (req, res, next) => {
        try {
            proId = req.params.id
            userId = req.session.userData._id
            let removeItem = await wishListModel.findOne({ userId: userId }).populate('wishListProducts.products').exec()
            wishListModel.findOne({ userId: userId }, async (err, data) => {
                if (data) {
                    if (removeItem.length != 0) {
                        await wishListModel.updateOne({ userId: userId }, {
                            $pull: {
                                wishListProducts: {
                                    products: proId
                                }
                            }
                        })
                    }
                    res.json({ status: true })
                }
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    //-----checkout---//
    getCheckOut: async (req, res, next) => {
        try {
            let userData = req.session.userData
            let cart = await cartModel.findOne({ userId: userData._id }).populate('cartProducts.productId').exec()

            let cartArray = []
            for (let i = 0; i < cart.cartProducts.length; i++) {
                let cartProducts = {}
                cartProducts.productId = cart.cartProducts[i].productId._id
                cartProducts.name = cart.cartProducts[i].name
                cartProducts.quantity = cart.cartProducts[i].quantity
                cartProducts.price = cart.cartProducts[i].price
                cartArray.push(cartProducts)
            }
            let showCoupon = await couponModel.find()
            let address = await addressModel.find({ userId: userData._id })
             console.log(address);
            if (address) {
                console.log("address");
                console.log(userData._id);
                res.render('user/userCheckOut', { userData, cartArray, cart, showCoupon, address })
                req.session.couponErr = null
            } else {
                console.log("hyyy");
                let address = null
                res.render('user/userCheckOut', { userData, cartArray, cart, showCoupon,address})
                req.session.couponErr = null
            }

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    postCheckOut: async (req, res, next) => {
        try {
            let userData = req.session.userData
            let userId = userData._id
            let date = new Date().toJSON().slice(0, 10)
            const products = await cartModel.findOne({ userId: userId }).populate('cartProducts.productId').exec()
            if (req.session.coupon) {
                couponObj = req.session.coupon
                let dis = couponObj.discount
                let couponId = couponObj.couponId
                total = products.total
                orderTotal = parseInt(total - ((total * dis) / 100))
                discountAmount = total - orderTotal
                let couponFind = await couponModel.findOne({ _id: couponId })
                let coupon = couponFind._id
                let userInfo = await userModel.findOne({ _id: userId })
                userInfo.coupon.push({ coupon: coupon })
                userInfo.save()
                req.session.coupon = null
            } else {
                req.session.coupon = null
                discountAmount = 0
                orderTotal = products.total
            }
            let orderArray = []
            for (let i = 0; i < products.cartProducts.length; i++) {
                let orderProducts = {}
                orderProducts.productId = products.cartProducts[i].productId._id
                orderProducts.name = products.cartProducts[i].name
                orderProducts.quantity = products.cartProducts[i].quantity
                orderProducts.price = products.cartProducts[i].price
                orderArray.push(orderProducts)
            }
            console.log(req.body.name);
            if (req.body.paymentMethod === "cod") {
                console.log("cod");
                const newOrder = new orderModel
                    ({
                        userId: userData._id,
                        paymentMode: req.body.paymentMethod,
                        address: {
                            name: req.body.name,
                            houseName: req.body.address,
                            pincode: req.body.zip,
                            phoneNumber: req.body.phone,
                            city: req.body.town_city,
                            state: req.body.state,
                        },
                        date: date,
                        order: orderArray,
                        totalAmount: orderTotal,
                        discountAmount: discountAmount

                    })
                newOrder.save()
                let orderId = newOrder._id
                await cartModel.findOneAndDelete({ userId: userId })
                res.json({ codSuccess: true, orderId })

            } else {
                console.log("netbanking");
                const newOrder = new orderModel
                    ({
                        userId: userData._id,
                        paymentMode: req.body.paymentMethod,
                        address: {
                            name: req.body.name,
                            houseName: req.body.address,
                            pincode: req.body.zip,
                            phoneNumber: req.body.phone,
                            city: req.body.town_city,
                            state: req.body.state,
                        },
                        date: date,
                        order: orderArray,
                        totalAmount: orderTotal,
                        discountAmount: discountAmount,
                        paymentStatus: "failed",
                        orderStatus: "failed"

                    })
                newOrder.save()


                req.session.orderId = newOrder._id
                var options = {
                    amount: orderTotal * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + req.session.orderId
                };
                instance.orders.create(options, function (err, order) {
                    console.log("hii");
                    console.log(order);
                    res.json(order)
                });
            }
        } catch (error) {
            console.log(error);
            next(error)


        }
    },
    // -----------------------------------------------------//

    verifyPayment: async (req, res, next) => {
        try {
            let userData = req.session.userData
            userId = userData._id
            let details = req.body
            console.log("details");
            console.log(details);
            let order = req.body.order
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', '7fAojnkk4JyB4waSOHtXlOUC')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                orderId = req.session.orderId
                console.log("hii orderId");
                console.log(orderId);
                await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "completed", orderStatus: "pending" })
                await cartModel.findOneAndDelete({ userId: userId })
                res.json({ status: true, orderId })
            } else {
                console.log("payment failed");
                await orderModel.findByIdAndUpdate(orderId, { orderStatus: "failed" })
                res.json({ status: 'false' })
            }
        } catch (error) {
            next(error)
        }

    },



    applyCoupon: async (req, res, next) => {
        try {
            let couponCode = req.body
            console.log(couponCode);
            let userData = req.session.userData
            let userId = userData._id
            let user = await cartModel.findOne({ userId: userId })
            let totalAmount = user.total
            couponModel.find({ couponCode: couponCode.couponCode }).then((coupons) => {
                console.log("hiii");
                console.log(coupons);
                if (coupons.length != 0) {
                    userModel.findOne({ _id: userId }).then((data) => {
                        if (data) {
                            let itemIndex = data.coupon.filter(p => {
                                return p.coupon.toString() === coupons[0]._id.toString()
                            })
                            if (itemIndex.length == 0) {
                                let date = new Date().toJSON().slice(0, 10)
                                if (date < coupons[0].expiryDate) {
                                    if (totalAmount < coupons[0].maxLimit) {
                                        // console.log("Coupon is apllicable to this amount");
                                        if (Number(coupons[0].MinimumAmount) < Number(totalAmount)) {
                                            // console.log("minimum amount is okay");
                                            let couponObj = {
                                                discount: coupons[0].discountPercentage,
                                                couponId: coupons[0]._id
                                            }
                                            req.session.coupon = couponObj
                                            // console.log(req.session.coupon);
                                            res.json({ couponObj })

                                        } else {
                                            // console.log("this coupon is not applicable to this amount");
                                            req.session.couponErr = "Doesn't applicable to this amount"
                                            console.log("the error is");
                                            console.log(req.session.couponErr);
                                            let couponErr = req.session.couponErr
                                            res.json({ couponErr })
                                        }
                                    } else {
                                        req.session.couponErr = "Coupon limit is exceeded"
                                        let couponErr = req.session.couponErr
                                        res.json({ couponErr })
                                    }
                                } else {
                                    req.session.couponErr = "This Coupon is expired"
                                    let couponErr = req.session.couponErr
                                    res.json({ couponErr })
                                }
                            } else {
                                req.session.couponErr = "you have already used this coupon"
                                let couponErr = req.session.couponErr
                                res.json({ couponErr })
                            }
                        } else {
                            console.log("cannot find the user");
                            req.session.couponErr = "Cannot find the user"
                            let couponErr = req.session.couponErr
                            res.json({ couponErr })
                        }
                    })
                } else {
                    console.log("invalid Coupon");
                    req.session.couponErr = "Invalid coupon"
                    let couponErr = req.session.couponErr
                    res.json({ couponErr })
                }
            })
        } catch (error) {
            next(error)
        }

    },




    //---------order Succes----------//
    orderSuccesPage: async (req, res, next) => {
        try {
            let orderId = req.params.orderId
            let userData = req.session.userData
            let orderSuccess = await orderModel.find({ _id: orderId }).populate('order.productId').exec()
            res.render('user/orderSuccess', { userData, orderSuccess })
        } catch (error) {
            next(error)
        }

    },

    //--------order Details----------//
    orderDetails: async (req, res, next) => {
        try {
            let userData = req.session.userData
            let users = await orderModel.find({ userId: userData._id }).populate('order.productId').exec()
            let user = users.reverse()
            res.render('user/userOrderDetail', { userData, user })
        } catch (error) {
            next(error)
        }

    },


    //  --------------------logout----------------------------//
    getLogout: (req, res) => {
        try {
            req.session.userData = null
            req.session.loginErr = false
            res.redirect('/')
        } catch (error) {
            console.log(error);
        }
    }


}

