const { response } = require('../app')
const userModel = require('../model/user-model')
const bcrypt = require('bcrypt')
const productSchema = require('../model/product-model')
const categoryModel = require('../model/category-model')
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
        console.log("okkkk");
        try {
            let proId = req.params.id
            console.log(proId);
            productSchema.find({ _id: proId }, (err, results) => {
                product = results[0]
                if (!err) {
                    userData = req.session.userData
                    categoryChoosen = req.params.category
                    console.log(categoryChoosen);
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

