//dependecies 
const express = require('express');
const bodyParser = require('body-parser');
const defaultController = require('../controllers/defaultController');

//nit router
const router = express.Router();

//body parser middleware
const urlencoded = bodyParser.urlencoded( { extended: false } )

//index route
router.route('/').get(defaultController.index);

//get more news
router.route('/older/:page').get(defaultController.getPagination);

// read news post route
router.route('/post/:id').get(defaultController.getReadPost);

//categories route
router.route('/category/:id').get(defaultController.getCategory);

//each user's news post
router.route('/user/:id').get(defaultController.getUserPost);

//login route
router.route('/login').get(defaultController.getLogin).post(urlencoded, defaultController.postLogin);

//logout route
router.route('/logout').get(defaultController.getLogout);

//register route
router.route('/register').get(defaultController.getRegister).post(urlencoded, defaultController.postRegister);

//post comment route
router.route('/add-comment/:id').post(urlencoded, defaultController.postAddComment);


//export router
module.exports = router;