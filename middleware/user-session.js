module.exports = (req, res, next) => {
    try {
        if (req.session.userData) {
            next()
        }
        else {
            res.render('user/login', { userData: false, loginMessage: req.flash('error') })
        }
    } catch (error) {
        console.log(error);
    }

}
