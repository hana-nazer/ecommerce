const express = require('express');
const app = require('../app');
var router = express.Router();
const adminController = require('../controllers/admin-controller')



//homepage
router.get('/',adminController.getAdmin)

module.exports=router