const multer = require('multer')

const bannerStorage = multer.diskStorage({
    destination : function(req,file,callback){
        callback(null,'./public/bannerImages')
    },
    // --------name setting----//
    filename : function(req,file,cb){
        const unique = Date.now()+'.jpg'
        cb(null,unique)
    }
});
module.exports=storeBanner=multer({storage:bannerStorage})
