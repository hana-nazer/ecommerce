const { response } = require('../app')

module.exports = {
    getAdmin: (req, res) => {
        res.render('admin/admin')
    }
}