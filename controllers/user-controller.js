module.exports={
    getHome  :(req,res)=>{
        res.render('user/home')
    },
    getLogin : (req,res)=>{
        res.render('user/login')
    },
    postLogin : (req,res)=>{
        console.log("login success");
        res.redirect('/')
    }
    
}

