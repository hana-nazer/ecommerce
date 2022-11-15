module.exports = (req, res, next) => {
    try {
        if (req.session.admin) {
            next()
        }
        else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        console.log(error);
    }
}
