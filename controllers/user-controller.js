const { response } = require('../app')
const userModel = require('../model/user-model')
const bcrypt = require('bcrypt')
const productSchema = require('../model/product-model')
const categoryModel = require('../model/category-model')
const cartModel = require('../model/cart-model')
const otpGenerator = require('otp-generator')


require('dotenv').config()
process.env.ACCOUNT_SID
process.env.AUTH_TOKEN



module.exports = {
    //----------session ------//
    userSession: (req, res, next) => {
        if (req.session.userData) {
            next()
        }
        else {
            res.render('user/login')
        }
    },

    //-------userBlock checking----//
    userBlock: async (req, res, next) => {
        let userData = req.session.userData
        console.log(userData);
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
    getHome: (req, res) => {
        try {
            let userData = req.session.userData
            if (userData) {
                productSchema.find({ active: true }).then((product) => {
                    res.render('user/home', { userData, product })
                })
            } else {
                // console.log(userData);
                productSchema.find({ active: true }).then((product) => {
                    res.render('user/home', { product, userData: false })
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
    singleCategory: (req, res) => {
        try {
            res.render('user/singleCategory')

        }
        catch (error) {
            console.log(error);
        }
    },

    //----------ViewCart---------//
    viewCart: async (req, res) => {
        try {
            if(req.session.userData){
                let userData = req.session.userData
                let cartUserId = userData._id
                let cartItems = await cartModel.findOne({userId:cartUserId}).lean().populate('cartProducts.products').exec()
                if(cartItems){
                    if(cartItems.cartProducts.length != 0){
                        req.session.cartNum = cartItems.cartProducts.length
                        const products = cartItems.cartProducts
                        res.render('user/userCart',{products,cartItems,userData,"cartNum":req.session.cartNum})
                    }
                    else{
                        req.session.cartNum= 0
                        res.send('empty cart')
                    }
                }else{
                    req.session.cartNum=0
                    res.send('empty cart')
                }
            }
            else{
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
        }
    },

    // addToCart: async (req, res) => {
    //     try {
    //         userData = req.session.userData
    //         productId = req.params.id;
    //         cartUser = userData._id
    //         console.log(productId);
    //         // console.log(userData,productId,cartUser);
    //         let response = {
    //             duplicate: false
    //         }
    //         const cart = await cartModel.findOne({ userId: cartUser })
    //         console.log(cart);
    //         if (cart) {
    //             console.log("user have a cart");
    //             let cartProduct = await cartModel.findOne({ userId: cartUser, 'cartProducts.products': productId })
    //             console.log(cartProduct);
    //             if (cartProduct) {
    //                 console.log("already existing product");
    //                 cartModel.findByIdAndUpdate({ userId: cartUser, 'cartProducts.products': productId }, {
    //                     $inc: { 'cartProducts.quantity': 1 }
    //                 })
    //                 response.duplicate = true
    //                 res.redirect('/cart')
    //             } else {
    //                 let cartArray = { products: productId, quantity: 1 };
    //                 cartModel.findByIdAndUpdate({ userId: cartUser }, {
    //                     $push: { 'cartProducts.products': cartArray }
    //                 })
    //                 res.redirect('/cart')
    //             }
    //         } else {
    //             let cartBody = {
    //                 userId: cartUser,
    //                 cartProducts: [{
    //                     products: productId,
    //                     quantity: 1
    //                 }]
    //             }
    //             await cartModel.create(cartBody)
    //             res.redirect('/cart')
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // },

    addToCart: async (req, res) => {
        try {
            userData = req.session.userData
            console.log(userData);
            productId = req.params.id
            cartUser = userData._id
            console.log(cartUser);
            const cart = await cartModel.findOne({ userId:cartUser })
            // console.log("this user not have a cart",+ cart);
            if (cart) {
                console.log("user have a cart");
                productIndex = cart.cartProducts.findIndex(product => product.products == productId);
                if (productIndex > -1) {
                    console.log("product already existing");
                    let productItem = cart.cartProducts[productIndex]
                    console.log(productItem);
                    // cart.subtotal =parseInt(cart.subtotal - (productItem.price * productItem.quantity)) 
                    console.log("cart.subtotal",+cart.subtotal);
                    productItem.quantity++
                    cart.cartProducts[productIndex] = productItem
                    // cart.subtotal = parseInt(cart.subtotal + (productItem.products.price * productItem.quantity))
                    // console.log("the subtotal",+cart.subtotal);
                    cart.save()
                    res.redirect('/cart')
                }
                else {
                    console.log("this product is not added previously");
                    cart.cartProducts.push({
                        products:productId,
                        quantity:1,
                        // name,
                        // price
                    })
                    console.log(productId);
                    // cart.subtotal = cart.subtotal + (cart.price + 1)
                      cart.save()
                    res.redirect('/cart')
                }
            } else {
                console.log("user dont have a cart , lets create it");
                const newCart = new cartModel({
           
                    
                        userId: cartUser,
                        cartProducts: [{
                            products: productId,
                            quantity: 1,
                            // price:req.params.price,
                            // name:req.params.name
                        }],
                    },
                    // subtotal: 1 * price
                )
                newCart.save();
                res.redirect('/cart')
            }
        } catch (error) {
            console.log(error);
        }
    },


    //-------------quantity Increment from cartpage----------//
    quantityInc: async(req,res)=>{
        try{
            let userData=req.session.userData
            console.log("userData is");
            console.log(userData);
        str = req.params.id
        // console.log("str");
        // console.log(str);
        let array = str.split("t")
       let userId = req.session.userData._id
       console.log("user id is");
        console.log(userId);
        productId=array[0]
        // console.log("productId");
        // console.log(productId);
        quantity=array[1]
        // console.log("quantity");
        // console.log(quantity);
        
        // let productExist=await cartModel.aggregate([
        //     {$match:{userId:userId}},
        //     {$unwind:'$cartProducts'},
        //     {$match:{'cartProducts.products.productId':productId}}
        // ]);

        let productExist = await cartModel.findOne({userId:userId}).populate('cartProducts.products').exec()
        console.log(productExist);
        // console.log("product not Exist");

        cartModel.findOne({userId:userId},async(err,data)=>{
            if(data){
                // console.log("data are");
                // console.log(data);
                if(productExist!==0){
                    
                    await cartModel.updateOne({userId:userId,'cartProducts.products':productId},{'cartProducts.$.quantity':quantity})
                    console.log(quantity);
                    
                }
                res.json({status:true})
            }
        })
        }catch(error){
            console.log(error);
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

