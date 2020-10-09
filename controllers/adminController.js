const bcrypt = require('bcryptjs');
const passport = require('passport');
const moment = require('moment');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Post = require('../models/postModel'); 
const Comment = require('../models/commentModel');

//export
module.exports = {
    getDashboard: async (req, res) => {
        try {
            if (req.user.role == 'superAdmin' || req.user.role == 'admin') {
                let postByUser = await Post.find({user: req.user._id}).populate('user').populate('category');
                res.render('admin/admin-index', {posts: postByUser, username: req.user.username, moment: moment, success: req.flash('success'), failure: req.flash('failure')});
            } else {
                req.logout();
                req.flash('logout', 'Permission not granted, you are logged out!');
                res.redirect('/');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getAdminLogin: (req, res) => {
        res.render('admin/admin-login');
    },
    getAddCategory: (req, res) => {
        res.render('admin/add-category');
    },
    getAllCategory: async (req, res) => {
        try {
            let allCategory = await Category.find();
            res.render('admin/all-category', {categories: allCategory, success: req.flash('success'), failure: req.flash('failure')});
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getAddUser: async (req, res) => {
        try {
            res.render('admin/add-user');
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getAllUser: async (req, res) => {
        try {
            let allUsers = await User.find();
            res.render('admin/all-users', {users: allUsers, success: req.flash('success'), failure: req.flash('failure')});
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getEditUser: async (req, res) => {
        try {
            let msg = 'No record found';
            let empty = [{email: ' ', username: ' ' }];
            let usernameId = req.params.id;
            let editUser = await User.find({username: usernameId});
            if (editUser.length ==  1) {
                res.render('admin/edit-user', {user: editUser, failure: req.flash('failure')});
            } else {
                req.flash('failure', 'No record found');
                res.redirect('/admin/all-user');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getAssignRole: async (req, res) => {
        try {
            if (req.user.role == 'superAdmin') {
                let allUsers = await User.find({role: 'member'});
                let allAdmin = await User.find({role: 'admin'});
                res.render('admin/assign-admin', {users: allUsers, admins: allAdmin});
            } else {
                req.flash('failure', 'Access denied only super admin can do this');
                res.redirect('/admin/all-user');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getNewPost: async (req, res) => {
        try {
            let categories = await Category.find();
            res.render('admin/add-post', {categories:categories});
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getAllPost: async (req, res) => { 
        try {
            let allPosts = await Post.find().populate('user').populate('category');
            res.render('admin/all-post', {posts:allPosts, moment: moment, success: req.flash('success'), failure: req.flash('failure')});
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getSinglePost: async (req, res) => {
        try {
            let id = req.params.id;
            let allPosts = await Post.findOne({_id: id}).populate('user').populate('category').populate({path: 'comments', populate: {path: 'user', select: 'username', model: 'User'}});
            res.render('admin/view-post', {post: allPosts, moment: moment, comments: allPosts.comments, success: req.flash('success'), failure: req.flash('failure')});
            
        } catch (error) {
            console.error(error);
            res.render('error/500');  
        }
    },
    getEditPost: async (req, res) => {
        try {
            let id = req.params.id;
            let editPost = await Post.findOne({_id: id});
            if (typeof editPost == 'undefined') {
                req.flash('failure', 'No post found');
                res.redirect('/admin/all-post');
            } else if (req.user.role == 'superAdmin') {
                res.render('admin/edit-post', {post: editPost});
            } else if (req.user.role == 'admin' && req.user.id == editPost.user) {
                res.render('admin/edit-post', {post: editPost});
            } else {
                req.flash('failure', 'Sorry!!! You can only edit post you created');
                res.redirect('/admin/all-post');
            }
        } catch (error) {
            console.error(error);
            req.flash('failure', 'No post found');
            res.redirect('/admin/all-post'); 
        }
    },
    getCategoryPost: async (req, res) => {
        try {
            let categoryId = req.params.id;
            let allPosts = await Post.find().populate('category').populate('user');
            let categoryPost = allPosts.filter((post) => {
                if (categoryId == post.category.title) {
                    return true;
                }
            })
            if (categoryPost.length != 0) {
                res.render('admin/category-post', {posts: categoryPost});
            } else {
                req.flash('failure', 'There is no post under this category');
                res.redirect('/admin/all-category');
            }

        } catch (error) {
            console.error(error);
            res.render('error/500');  
        }
    },
    getCategoryAction: async (req, res) => {
        try {
            let allCategories = await Category.find();
            res.render('admin/edit-delete-category', {categories: allCategories, failure: req.flash('failure')});
        } catch (error) {
            console.error(error);
            res.render('error/500');  
        }
    },
    postAdminLogin: (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/admin/dashboard',
            failureRedirect: '/',
            failureFlash: true
        }) (req, res, next);
    },
    postAddCategory: async (req, res) => {
        try {
            let existingCategory = await Category.find({title: req.body.category});
            if (existingCategory.length == 0) {
                const newCategory = new Category;
                newCategory.title = req.body.category;
                newCategory.save((err) => {
                    if (err) {console.error(err)};
                    req.flash('success', 'Category added');
                    res.redirect('/admin/all-category')
                })
            } else {
                res.render('admin/add-category', {errMsg: 'Category already exist'});
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postAddUser: async (req, res) => {
        try {
            let errors = [];
            let {email, username, password, password2} = req.body;
            if (!email || !username || !password || !password2) {
                errors.push({msg: 'Please fill in all details'});
            }
            if (password.length < 4) {
                errors.push({msg: 'Password must be greater than five characters'});
            }
            if (password !== password2) {
                errors.push({msg: 'Passwords do not match'});
            }
            if (errors.length != 0) {
                res.render('admin/add-user', {errors:errors});
            } else {
                //usermodel.find( {$or: [{email:email}, {username:username}] });
                let existingUser = await User.find( {$or: [{email:email}, {username:username}]} );
                if (existingUser.length == 0) {
                    //Create a new model
                    const newUser = new User;
                    newUser.username = username;
                    newUser.email = email;
                    newUser.password = password;
                    //hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {throw err}
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) {throw err}
                            newUser.password = hash;
                            //save to DB
                            newUser.save((err) => {
                                if (err) {
                                    throw err;
                                } else {
                                    req.flash('success', 'New user created successfully');
                                    res.redirect('/admin/all-user');
                                }
                            })
                        })
                    })
                } else {
                    let regErr = [];
                    if (existingUser[0].username == username && existingUser[0].email == email) {
                        regErr.push({msg: 'Email and Username is already registered'});
                    } else if (existingUser[0].email == email) {
                        regErr.push({msg: 'Email is already registered'});
                    } else {
                        regErr.push({msg: 'Username is already registered'});
                    }
                    if (regErr.length > 0) {
                        res.render('admin/add-user', {regErr:regErr})
                    }
                }
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postEditUser: async (req, res) => {
        try {
            const usernameId = req.params.id;
            const {email, username} = req.body;
            let existingData = await User.find( {$or: [{email:email}, {username:username}]} );
            if (existingData.length == 0) {
                const updateDetails = {
                    email:email,
                    username:username
                }
                await User.findOneAndUpdate({username:usernameId}, updateDetails);
                req.flash('success', 'User\'s details updated!');
                res.redirect('/admin/all-user');
            } else {
                let updateErr = [];
                existingData.forEach((data) => {
                    const existingUsername = data.username;
                    const existingEmail = data.email;
                    if (username == existingUsername && email == existingEmail) {
                        updateErr.push({msg: 'Email and Username are registered'});
                    } else if (username == existingUsername) {
                        updateErr.push({msg: 'Username is registered'});
                    } else {
                        updateErr.push({msg: 'Email is registered'});
                    }
                })
                if (updateErr.length !== 0) {
                    req.flash('failure', updateErr);
                    res.redirect(`/admin/edit/${usernameId}`);
                }
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postAssignRole: async (req, res) => {
        try {
            const username = req.body.username;
            await User.findOneAndUpdate({username:username}, {role: 'admin'});
            console.log(username);
            req.flash('success', `${username} is now an admin`);
            res.redirect('/admin/all-user');
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postNewPost: async (req, res) => {
        try {
            const {title, category, postBody} = req.body;
            const newPost = {
                title: title,
                category: category,
                body: postBody,
                user: req.user.id
            }
            await Post.create(newPost);
            req.flash('success', 'Post Created');
            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postEditPost: async (req, res) => {
        try {
            const {title, category, postBody} = req.body;

            const updatePost = {
                title: title,
                body: postBody
            }

            await Post.findByIdAndUpdate(category, updatePost);
            req.flash('success', 'Post successfully edited');
            res.redirect('/admin/all-post');
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postEditCategory: async (req, res) => {
        try {
            const {editCategory} = req.body;
            let category = await Category.findOne({title: editCategory});
            res.render('admin/edit-category', {category: category});
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postUpdateCategory: async (req, res) => {
        try {
            let {category, id} = req.body;
            let existingCategory = await Category.findOne({title: category});
            if (existingCategory) {
                req.flash('failure', 'Category title already exists');
                res.redirect('/admin/all-category');
            } else {
                await Category.findOneAndUpdate({_id: id}, {title: category});
                req.flash('success', 'Category updated!');
                res.redirect('/admin/all-category');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postChangeAdmin: async (req, res) => {
        try {
            let {username} = req.body;
            if (typeof username == 'string') {
                await User.findOneAndUpdate({username: username}, {role: 'member'});
                req.flash('success', `${username} is no longer an admin`);
                res.redirect('/admin/all-user');
            } else {
                for (let i = 0; i < username.length; i++) {
                    await User.findOneAndUpdate({username: username[i]}, {role: 'member'});
                }
                req.flash('success', `${username} are no longer an admin`);
                res.redirect('/admin/all-user');
            }
        } catch {
            console.error(error);
            res.render('error/500');
        }
    },
    postDeleteUser: async (req, res) => {
        try {
            let username = req.params.id;
            if (req.user.role == 'superAdmin') {
                await User.deleteOne({username: username});
                req.flash('success', `${username} is deleted`);
                res.redirect('/admin/all-user');
            } else if (req.user.role == 'admin' ) {
                let deleteUser = await User.findOne({username: username});
                if (deleteUser.role == 'member') {
                    await User.deleteOne({username: username});
                    req.flash('success', `${username} is deleted`);
                    res.redirect('/admin/all-user');
                } else if (deleteUser.role == 'superAdmin'){
                    req.flash('failure', 'Permission denied, can\'t delete a super admin');
                    res.redirect('/admin/all-user');
                } else {
                    req.flash('failure', 'Sorry, you can\'t delete another admin.');
                    res.redirect('/admin/all-user');
                }
            } else {
                req.flash('failure', 'Permission denied');
                req.logout();
                res.redirect('/');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');  
        }
    },
    postDeletePost: async (req, res) => {
        try {
            const id = req.params.id;
            if (req.user.role == 'superAdmin') {
                await Post.findByIdAndDelete(id);
                req.flash('success', 'Post deleted!');
                res.redirect('/admin/all-post');
            } else if (req.user.role == 'admin') {
                const post = await Post.findById(id).populate('user');
                if (req.user.username == post.user.username) {
                    await Post.findByIdAndDelete(id);
                    req.flash('success', 'Post deleted!');
                    res.redirect('/admin/dashboard');
                } else {
                    req.flash('failure', 'Sorry, you can only delete post you created.');
                    res.redirect('/admin/all-post');
                }
            } else {
                req.flash('failure', 'Permission denied');
                req.logout();
                res.redirect('/');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');  
        }
    },
    postDeleteCategory: async (req, res) => {
        try {
            if (req.user.role == 'superAdmin') {
                const {deleteCategory} = req.body;
                await Post.deleteMany({category: deleteCategory});
                await Category.findByIdAndDelete(deleteCategory);
                req.flash('success', 'Category Deleted with all Post');
                res.redirect('/admin/all-category'); 
            } else if (req.user.role == 'admin') {
                req.flash('failure', 'Permission denied! You can\'t delete any category');
                res.redirect('back');
            } else {
                req.flash('failure', 'Permission denied!!!');
                req.logout();
                res.redirect('/');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');  
        }
    },
    postDeleteComment: async (req, res) => {
        try {
            const {id} = req.params;
            await Comment.findByIdAndDelete(id);
            req.flash('success', 'Comment deleted');
            res.redirect('back');
        } catch {
            console.error(error);
            res.render('error/500');  
        }
    }
}