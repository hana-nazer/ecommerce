const userModel = require('../model/user-model')
module.exports = async (req, res, next) => {
    try {
        let userData = req.session.userData
        let user = await userModel.findOne({ _id: userData._id })
        if (user.status === "true") {
            next()
        }
        else {
            req.session.userData = null
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
    }
}