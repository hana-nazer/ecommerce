const { response } = require('../app')
const userModel = require('../model/user-model')
const bcrypt = require('bcrypt')


module.exports = {
    getHome: (req, res) => {
        let user =req.session.usr
        console.log(user)
        res.render('user/home',{user})
    },

    // -------------------------------------signup--------------------------------------------------//

    getSignup: (req, res) => {
        res.render('user/login')
    },

    postSignup: (req, res, next) => {
        console.log("signup action")
        console.log(req.body);

        userModel.find({ userEmail: req.body.email }, async (err, data) => {
            console.log(data);
            if (data.length == 0) {
                const userName = req.body.name
                const userEmail = req.body.email
                const mobile = req.body.mobile
                const password = await bcrypt.hash(req.body.password, 10)
                const user = new userModel({
                    userName: userName,
                    userEmail: userEmail,
                    mobile: mobile,
                    password: password
                })
                console.log(user)
                user.save()
                    .then(result => {
                        console.log(result);
                        req.session.userloggedIn = true
                        req.session.usr=user
                        res.redirect('/')
                    })
                    .catch(err => {
                        console.log(err)
                        res.redirect('/login')
                    })
            }
            else {
                res.redirect('/login')
            }
        })
    },
    //  ------------------------------------------Login--------------------------------------------------//

    getLogin: (req, res) => {

        if(req.session.usr){
              res.redirect('/')
        }else{
            let user = req.session.usr
            // console.log(user);
            
        res.render('user/login',{user})
        }
       
       
    },
    
    postLogin: async (req, res) => {
        let user = await userModel.findOne({ userEmail: req.body.email })
        // console.log(user)
        if (user) {
            bcrypt.compare(req.body.password, user.password).then((data) => {
                 if (data) {
                    req.session.userloggedIn = true
                    req.session.usr = user
                   res.redirect('/')
                   }
                    else{
                    console.log("login failed");
                    res.redirect('/login')
                }
            })
        }
        else{
            console.log("login failed");
            res.redirect('/login')
        }
     },

    //  ----------------------user info ----------------------//
    userInfo:(req,res)=>{
        let user =req.session.usr
        console.log(user);
            res.render('user/userInfo',{user})
    },

    //  --------------------logout----------------------------//
    getLogout:(req,res)=>{
        req.session.usr=null
        req.session.userloggedIn= false
            res.redirect('/')
    }
}

