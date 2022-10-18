const { response } = require('../app')
const adminModel = require('../model/admin-model')
const userModel = require('../model/user-model')
const productSchema = require('../model/product-model')
const bcrypt = require('bcrypt')
const adminCollection = require('../config/collection')

module.exports = {
    getAdmin: (req, res) => {
        // let Admin = req.session.admin
        if(req.session.admin){
            res.render('admin/admin')
      }else{
          let admin = req.session.admin
          console.log(admin);
          
      res.render('admin/admin-login',{Admin:true,admin})
      }
       
    },


    /* admin login */
    getAdminLogin:(req,res)=>{
        if(req.session.admin){
            res.redirect('/admin/')
      }else{
          let admin = req.session.admin
          console.log(admin);
          
      res.render('admin/admin-login',{Admin:true,admin})
      }
      
    },


    //  admin signin
    postLogin: (req,res)=>{
        adminModel.findOne({eamil:req.body.email}).then((admin)=>{
            console.log(admin);
            if(admin){
                bcrypt.compare(req.body.password,admin.password).then((data)=>{
                    if(data){
                        req.session.adminLoggedIn = true
                        req.session.admin = admin
                        console.log("Login success");
                        res.redirect('/admin/')
                    }
                    else{
                        console.log("failed!!!!!");
                        res.redirect('/admin/admin-login')
                    }
                })
            }else{
                console.log("login failed");
                res.redirect('/admin/admin-login')
            }
        })
    },

    // user list//
    getUserList:(req,res)=>{
        userModel.find().then((data)=>{
            console.log(data)
            res.render('admin/user_manage',{data})
        })
       
        
    },

    //product management
    getProductList:(req,res)=>{
        if(req.session.admin){
            // req.session.adminLoggedIn = true;
            productSchema.find({},function(err,product){
                console.log(product);

                if(err){
                    res.send(err)
                }
                else{
                    res.render('admin/product',{product})
                }
            })
        }
       
    },


    //add-product
    addProduct:(req,res)=>{
         res.render('admin/add-product')
    },


   
     //post add product
    //to get added products
    product:(req,res)=>{
        const imageName = [];
        for(file of req.files){
            imageName.push(file.filename);
        }
        const {img,name,category,price,quantity,description}=req.body
        const product = new productSchema({
            image : imageName,
            name,
            category,
            price,
            quantity,
            description
        })
           product.save();
           res.redirect('/admin/product')
    },


    //category
    getCategory:(req,res)=>{
        res.render('admin/category')
    },


    //blockUser
    blockUser:async(req,res)=>{
       console.log(req.params.id); 
       let userId = req.params.id
      await userModel.updateOne({_id:userId},{
        $set : {
            status:"false"
        }
      })
      res.redirect('/admin/user-option')
    },

    //unblock 
    unBlock:async(req,res)=>{
        console.log(req.params.id); 
        let userId = req.params.id
       await userModel.updateOne({_id:userId},{
         $set : {
             status:"true"
         }
       })
       res.redirect('/admin/user-option')
    },



    adminLogout:(req,res)=>{
        req.session.adminLoggedIn= false
        req.session.admin=null
        res.redirect('/admin/admin-login')
     }
}