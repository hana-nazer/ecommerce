const { response } = require('../app')
const userModel = require('../model/user-model')
const bcrypt = require('bcrypt')
const productSchema = require('../model/product-model')
const categoryModel = require('../model/category-model')
const wishListModel = require('../model/wishList-model')
const orderModel = require('../model/order-model')
const cartModel = require('../model/cart-model')
const bannerModel = require('../model/banner-model')
const couponModel = require('../model/coupon-model')
const otpGenerator = require('otp-generator')
const { SinkPage } = require('twilio/lib/rest/events/v1/sink')
const { default: mongoose } = require('mongoose')
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: 'rzp_test_BUnir6WHXKvN1B', key_secret: '7fAojnkk4JyB4waSOHtXlOUC' })


require('dotenv').config()
process.env.ACCOUNT_SID
process.env.AUTH_TOKEN

let loginErr;
let couponErr;


module.exports = {
    //----------session ------//
    userSession: (req, res, next) => {
        if (req.session.userData) {
            //  userData = req.session.userData
            next()
        }
        else {
            res.render('user/login', { userData: false, loginErr: req.session.loginErr })
        }
    },

    //-------userBlock checking----//
    userBlock: async (req, res, next) => {
        let userData = req.session.userData
        // console.log(userData);
        let user = await userModel.findOne({ _id: userData._id })
        if (user.status === "true") {
            next()
        }
        else {
            req.session.userData = null
            res.redirect('/login')
        }
    },

    //---------home page--------------//
    getHome: async (req, res) => {
        try {
            let userData = req.session.userData

            let banner = await bannerModel.find({ show: true })
            if (userData) {
                const pageNum = req.query.page
                const perPage = 3
                let docCount;
                productSchema.find({ active: true }).countDocuments().then((documents) => {
                    docCount = documents
                    return productSchema.find({ active: true })
                        .skip((pageNum - 1) * perPage).limit(perPage)
                })
                    .then((product) => {
                        res.render('user/home', {
                            product,
                            userData,
                            currentPage: pageNum,
                            totalDocuments: docCount,
                            pages: Math.ceil(docCount / perPage),
                            banner
                        })
                    })

            } else {
                // console.log(userData);
                const pageNum = req.query.page
                const perPage = 3
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
                            banner
                        })
                    })
            }
        }
        catch (error) {
            console.log(error);
        }
    },


    //---------otp-----//
    postOtp: async (req, res) => {
        try {
            userData = req.session.userdata;
            generateOtp = req.session.userdata.otp
            if (generateOtp == req.body.otp) {
                const newUser = new userModel
                    ({
                        userName: userData.name,
                        userEmail: userData.email,
                        mobile: userData.mobile,
                        password: await bcrypt.hash(userData.password, 10),
                        status: true
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
        } catch (error) {
            console.log(error);
        }
    },



    // -------------------------------------signup--------------------------------------------------//

    getSignup: (req, res) => {
        try {
            let userData = req.session.userData
            res.render('user/signup', { userData })
        } catch (error) {
            console.log(error);
        }
    },



    postSignup: (req, res, next) => {
        try {
            if (req.body.password == req.body.cpassword) {
                userModel.findOne({ userEmail: req.body.email }, async (err, data) => {
                    if (data == null) {
                        let otpGen = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
                        console.log(otpGen)
                        req.session.userdata = req.body
                        req.session.userdata.otp = otpGen
                        // client.messages
                        // .create({
                        //     body:otpGen,
                        //     messagingServiceSid:'MGe8106f7aa8e4205aa36c7c96c38437f7',
                        //     to:'+919895957696'
                        // })
                        // .then(message=>console.log(message.sid))
                        // .done();
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
        }
    },




    //  ------------------------------------------Login--------------------------------------------------//

    getLogin: (req, res) => {
        try {
            if (req.session.userData) {
                res.redirect('/')
            } else {
                let userData = req.session.userData
                res.render('user/login', { userData, loginErr: req.session.loginErr })
                req.session.loginErr = false
            }
        } catch (error) {
            console.log(error);
        }
    },


    postLogin: async (req, res) => {
        try {
            let user = await userModel.findOne({ userEmail: req.body.email })
            if (user) {
                if (user.status === "true") {
                    bcrypt.compare(req.body.password, user.password).then((data) => {
                        if (data) {
                            req.session.userData = user
                            req.session.loggedIn = true
                            res.redirect('/')

                        }
                        else {
                            req.session.loginErr = "Invalid password"
                            console.log("login failed");
                            res.redirect('/login')
                        }
                    })
                } else {
                    req.session.loginErr = "you are blocked by the Admin"
                    res.redirect('/login')
                }

            } else {
                req.session.loginErr = "Invalid Email "
                console.log("login failed");
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
        }
    },



    //  ----------------------user info ----------------------//
    userInfo: (req, res) => {
        try {
            userData = req.session.userData
            res.render('user/userInfo', { userData })
        } catch (error) {
            console.log(error);
        }
    },


    //---------SIngle Product View------------//
    productView: (req, res) => {
        // console.log("okkkk");
        try {
            let proId = req.params.id
            // console.log(proId);
            productSchema.find({ _id: proId }, (err, results) => {
                product = results[0]
                if (!err) {
                    userData = req.session.userData
                    categoryChoosen = req.params.category
                    // console.log(categoryChoosen);
                    productSchema.find({ category: categoryChoosen }).then((relatedProducts) => {
                        res.render('user/single-product', { userData, product, relatedProducts })
                    })
                }
                else {
                    res.send(err)
                }
            })
        } catch (error) {
            console.log(error);
        }
    },



    //-----single Category-----------//
    // singleCategory: (req, res) => {
    //     try {
    //         res.render('user/singleCategory')

    //     }
    //     catch (error) {
    //         console.log(error);
    //     }
    // },

    //----------ViewCart---------//
    viewCart: async (req, res) => {
        try {
            if (req.session.userData) {
                let userData = req.session.userData
                // console.log(userData);
                let cartUserId = userData._id
                // console.log(cartUserId);
                let cartItems = await cartModel.findOne({ userId: cartUserId }).lean().populate('cartProducts.productId').exec()
                if (cartItems) {

                    if (cartItems.cartProducts.length != 0) {
                        total = cartItems.total
                        // console.log("total amount");
                        // console.log(total);
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
        }
    },



    addToCart: async (req, res) => {
        try {
            if (req.session.userData) {
                userData = req.session.userData
                console.log(userData);
                proId = req.params.id
                let quantity = 1
                // cartUser = userData._id
                const findProduct = await productSchema.findById(proId)
                // console.log(findProduct);
                let price = findProduct.price
                let stock = findProduct.quantity
                let name = findProduct.name
                if (stock >= quantity) {
                    findProduct.quantity -= quantity
                    cartUser = userData._id
                    console.log("cartUser");
                    console.log(cartUser);
                    let cart = await cartModel.findOne({ userId: cartUser })
                    console.log("carttt");
                    console.log(cart);
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
        }
    },

    addToCartWishlist: async (req, res) => {
        try {
            if (req.session.userData) {
                userData = req.session.userData
                proId = req.params.id

                let quantity = 1
                // cartUser = userData._id
                const findProduct = await productSchema.findById(proId)
                let price = findProduct.price
                let stock = findProduct.quantity
                let name = findProduct.name
                if (stock >= quantity) {
                    findProduct.quantity -= quantity
                    cartUser = userData._id
                    let cart = await cartModel.findOne({ cartUser })
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
        }
    },


    //-------------quantity Increment from cartpage----------//
    quantityInc: async (req, res) => {

        try {
            str = req.params.id
            let array = str.split("t")
            // console.log(array);
            let userId = req.session.userData._id
            // console.log(array);
            productId = array[0]
            quantity = array[1]
            // console.log(quantity);
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
            // console.log();
            
            // console.log("start-----" + cart2.total);
            const total = cart2.cartProducts.reduce((acc, curr) => {
                // console.log(`Total : ${acc}`)
                // console.log(`Item : ${curr.price}`)
                // console.log(`Quantity : ${curr.quantity}`)

                const qty = curr.quantity

                val = acc + qty * (curr.price);
                // console.log("mid-----" + val)
                return val
            }, 0)
            cart2.total = total;
            // console.log("end--------" + cart2.total);

            cart2.save()
            res.json({ status: true })
        } catch (error) {
            console.log(error);
        }

    },


    //------remove item from cart-----//
    removeCartItem: async (req, res) => {
        try {
            proId = req.params.id
            // console.log("removing id");
            // console.log(proId);
            userId = req.session.userData._id
            let cart = await cartModel.findOne({ userId })
            // console.log(cart);
            let itemIndex = cart.cartProducts.findIndex(p => p.productId == proId)
            // console.log(itemIndex);
            cart.cartProducts.splice(itemIndex, 1)
            cart.total = cart.cartProducts.reduce((acc, curr) => {
                return acc + curr.quantity * curr.price
            }, 0)
            // console.log("total");
            // console.log( cart.total);
            await cart.save()
            res.json({ status: true })
        } catch (error) {
        }
    },


    //--------View wishList-----------//
    viewWishList: async (req, res) => {
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
        }
    },



    //---------addToWishList Wishlist---------//
    addToWishList: async (req, res) => {
        try {
            if (req.session.userData) {
                userData = req.session.userData
                productId = req.params.id
                wishListUser = userData._id
                const wishList = await wishListModel.findOne({ userId: wishListUser })
                if (wishList) {
                    // console.log("user have a cart");
                    let productIndex = wishList.wishListProducts.findIndex(product => product.products == productId);
                    if (productIndex > -1) {
                        wishList.wishListProducts.splice(productIndex, 1)
                        // let productItem = wishList.wishListProducts[productIndex]
                        // wishList.wishListProducts[productIndex] = productItem
                        wishList.save()
                        // res.json({status:true})
                        res.redirect('/viewWishList')
                    }
                    else {
                        // console.log("this product is not added previously");
                        wishList.wishListProducts.push({
                            products: productId,
                            // quantity: 1,
                        })
                        // console.log(productId);
                        wishList.save()
                        // res.json({status:true})
                        res.redirect('/viewWishList')
                    }
                } else {
                    // console.log("user dont have a cart , lets create it");
                    const newwishList = new wishListModel({
                        userId: wishListUser,
                        wishListProducts: [{
                            products: productId,
                            // quantity: 1,
                        }],
                    },
                    )
                    newwishList.save();
                    // res.json({status:true})
                    res.redirect('/viewWishList')
                }
            } else {
                res.redirect('/login')
                // console.log("adichu poiii")
            }

        } catch (error) {
            console.log(error);
        }
        // res.json({status:true})

    },
    //-----remove wishList Item--//
    removeWishListItem: async (req, res) => {
        try {
            proId = req.params.id
            // console.log(proId);
            userId = req.session.userData._id
            let removeItem = await wishListModel.findOne({ userId: userId }).populate('wishListProducts.products').exec()
            // console.log("item is");
            //    console.log(removeItem);
            wishListModel.findOne({ userId: userId }, async (err, data) => {
                if (data) {
                    // console.log(data)
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
                    // res.redirect('/viewWishList')
                }
            })
        } catch (error) {
            // console.log(error);
        }
    },

    //-----checkout---//

    getCheckOut: async (req, res) => {
        try {
            let userData = req.session.userData
            let cart = await cartModel.findOne({ userId: userData._id }).populate('cartProducts.productId').exec()
            // console.log("cartProducts");
            // console.log(cart.cartProducts[0].productId);
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
            res.render('user/userCheckOut', { userData, cartArray, cart, showCoupon })
            req.session.couponErr = null
        } catch (error) {
            console.log(error);
        }
    },

    postCheckOut: async (req, res) => {
        try {
            let userData = req.session.userData
            let userId = userData._id
            let date = new Date().toJSON().slice(0, 10)
            const products = await cartModel.findOne({ userId: userId }).populate('cartProducts.productId').exec()
            // console.log(products.cartProducts.length);
            if (req.session.coupon) {
                couponObj = req.session.coupon
                let dis = couponObj.discount
                let couponId = couponObj.couponId
                // console.log(couponId);
                // console.log("hiiiiiiiiiiiiiiiiiiiiiii");
                // console.log(dis.discount);
                total = products.total
                orderTotal = (total - ((total * dis) / 100))
                // console.log("hiiii");
                // console.log(orderTotal);
                discountAmount = total - orderTotal
                // console.log(discountAmount);

                let couponFind = await couponModel.findOne({ _id: couponId })
                // console.log("asdfg");
                // console.log(coupon);
                let coupon = couponFind._id
                // console.log(coupon);

                let userInfo = await userModel.findOne({ _id: userId })
                userInfo.coupon.push({ coupon: coupon })
                // console.log("hello");
                // console.log(userInfo);
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
                const newOrder = new orderModel
                    ({
                        userId: userData._id,
                        paymentMode: req.body.paymentMethod,
                        address: {
                            //add name and other details
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
                const newOrder = new orderModel
                    ({
                        userId: userData._id,
                        paymentMode: req.body.paymentMethod,
                        address: {
                            //add name and other details
                            name: req.body.name,
                            houseName: req.body.address,
                            pincode: req.body.zip,
                            phoneNumber: req.body.phone,
                            city: req.body.town_city,
                            state: req.body.state,
                        },
                        date: date,
                        // paymentStatus: "completed",
                        order: orderArray,
                        totalAmount: orderTotal,
                        discountAmount: discountAmount

                    })
                newOrder.save()


                req.session.orderId = newOrder._id
                // console.log("hiii");
                // console.log(req.session.orderId);
                var options = {
                    amount: orderTotal * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + req.session.orderId
                };
                instance.orders.create(options, function (err, order) {
                    console.log(order);
                    res.json(order)
                });


                // res.json({ status: true })
            }

            // console.log(orderArray);

        } catch (error) {
            console.log(error);
        }
    },
    // -----------------------------------------------------//

    verifyPayment: async (req, res) => {
        let userData = req.session.userData
        userId = userData._id
        //     console.log("verifyPAyment");
        //    console.log(req.body);
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
            await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "completed" })
            await cartModel.findOneAndDelete({ userId: userId })
            res.json({ status:true,orderId})
        } else {
            // console.log("payment failed");
            res.json({ status: 'false'})
        }
    },



    applyCoupon: async (req, res) => {
        let couponCode = req.body
        //  console.log("coupon");
        //  console.log(coupon);
        let userData = req.session.userData
        let userId = userData._id
        //  console.log(coupon);
        let user = await cartModel.findOne({ userId: userId })
        let totalAmount = user.total
        // console.log("hiii");
        // console.log(user);
        // console.log("total");
        // console.log(totalAmount);
        couponModel.find({ couponCode: couponCode.couponCode }).then((coupons) => {
            if (coupons) {
                // console.log("hello");
                userModel.findOne({ _id: userId }).then((data) => {
                    if (data) {
                        // console.log("hyy id");
                        // console.log( coupons[0]._id);
                        // console.log("user is here");coupon
                        let itemIndex = data.coupon.findIndex(p => p.coupon === coupons[0]._id)
                        console.log("hiiii");
                        console.log(itemIndex);
                        console.log(data.coupon);
                        if (itemIndex == -1) {
                            // data.coupon.push({coupon:couponCode.couponCode})
                            // data.save()
                            // console.log("user is not used coupon");
                            let date = new Date().toJSON().slice(0, 10)
                            if (date < coupons[0].expiryDate) {
                                // console.log("coupon is not expired");
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
                                    console.log("coupon limit is exceeded");
                                    req.session.couponErr = "Coupon limit is exceeded"
                                    let couponErr = req.session.couponErr

                                    res.json({ couponErr })

                                }
                            } else {
                                console.log("coupon is expired");
                                req.session.couponErr = "This Coupon is expired"
                                let couponErr = req.session.couponErr

                                res.json({ couponErr })

                            }
                        } else {
                            console.log("this coupon is already used");
                            req.session.couponErr = "you have already used this coupon"
                            let couponErr = req.session.couponErr

                            res.json({ couponErr })

                        }
                    } else {
                        console.log("cannot find the user");
                    }
                })
            } else {
                console.log("invalid Coupon");
            }
        })
    },


    //  availableCoupons:(req,res)=>{
    //     res.render('user/availableCoupons')
    // },

    //---------order Succes----------//
    orderSuccesPage: async (req, res) => {
        let orderId = req.params.orderId
        console.log("orderId")
        console.log(orderId)

        let userData = req.session.userData
        let orderSuccess = await orderModel.find({ _id: orderId }).populate('order.productId').exec()
        console.log("sdfghj");
        console.log(orderSuccess);
        res.render('user/orderSuccess', { userData, orderSuccess })
    },

    //--------order Details----------//
    orderDetails: async (req, res) => {
        let userData = req.session.userData
        let user = await orderModel.find({ userId: userData._id }).populate('order.productId').exec()
        // let product = user[0].order[0].productId
        res.render('user/userOrderDetail', { userData, user })
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

