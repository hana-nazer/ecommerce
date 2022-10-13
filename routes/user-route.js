const express = require('express');
const app = require('../app');
var router = express.Router();
const userController = require('../controllers/user-controller')


//homepage
router.get('/',userController.getHome)

//login page
router.get('/login',userController.getLogin)

//login page post
router.post('/login',userController.postLogin)


module.exports = router;