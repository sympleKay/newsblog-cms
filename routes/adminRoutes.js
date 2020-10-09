//dependecies 
const express = require('express');
const bodyParser = require('body-parser');
const adminController = require('../controllers/adminController');
const {ensureAuth, ensureAdminGuest} = require('../utils/utility');

//init router
const router = express.Router();

//body parser middleware
const urlencoded = bodyParser.urlencoded( { extended: false } )

router.route('/dashboard').get(ensureAuth, adminController.getDashboard);

router.route('/login').get(ensureAdminGuest, adminController.getAdminLogin).post(urlencoded, adminController.postAdminLogin);

router.route('/add-category').get(ensureAuth, adminController.getAddCategory).post(ensureAuth, urlencoded, adminController.postAddCategory);

router.route('/all-category').get(ensureAuth, adminController.getAllCategory);

router.route('/add-user').get(ensureAuth, adminController.getAddUser).post(ensureAuth, urlencoded, adminController.postAddUser);

router.route('/edit/:id').get(ensureAuth, adminController.getEditUser).post(ensureAuth, urlencoded, adminController.postEditUser);

router.route('/all-user').get(ensureAuth, adminController.getAllUser);

router.route('/assign-role').get(ensureAuth, adminController.getAssignRole).post(ensureAuth, urlencoded, adminController.postAssignRole);

router.route('/new-post').get(ensureAuth, adminController.getNewPost).post(ensureAuth, urlencoded, adminController.postNewPost);

router.route('/all-post').get(ensureAuth, adminController.getAllPost);

router.route('/post/:id').get(ensureAuth, adminController.getSinglePost);

router.route('/edit-post/:id').get(ensureAuth, adminController.getEditPost).post(ensureAuth, urlencoded, adminController.postEditPost);

router.route('/edit-category').post(ensureAuth, urlencoded, adminController.postEditCategory);

router.route('/update-category').post(ensureAuth, urlencoded, adminController.postUpdateCategory);

router.route('/category/:id').get(ensureAuth, adminController.getCategoryPost);

router.route('/category-actions').get(ensureAuth, adminController.getCategoryAction);

router.route('/delete-comment/:id').post(ensureAuth, adminController.postDeleteComment);

router.route('/remove-admin').post(ensureAuth, urlencoded, adminController.postChangeAdmin);

router.route('/delete-category').post(ensureAuth, urlencoded, adminController.postDeleteCategory);

router.route('/delete/:id').post(ensureAuth, urlencoded, adminController.postDeleteUser);

router.route('/delete-post/:id').post(ensureAuth, urlencoded, adminController.postDeletePost);

module.exports = router;