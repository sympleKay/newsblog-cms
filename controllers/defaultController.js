const bcrypt = require('bcryptjs');
const passport = require('passport');
const moment = require('moment');
const {truncate} = require('../utils/utility');
const Post = require('../models/postModel');
const Category = require('../models/categoryModel');
const Comment = require('../models/commentModel')
const User = require('../models/userModel');

module.exports = {
    index: async (req, res) => {
        try {
            const allPosts = await Post.find().populate('user').populate('category').sort({createdAt: -1}).skip(0).limit(5);
            const allCategories = await Category.find();
            const authUser = req.user;
            res.render ('default/index', {
                user:authUser, 
                posts: allPosts, 
                categories: allCategories,
                truncate: truncate, 
                moment: moment, 
                logMsg: req.flash('logout')
            });
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getPagination: async (req, res) => {
        try {
            const authUser = req.user;
            const page = parseInt(req.params.page);
            const skipLength = page * 5;
            const allPosts = await Post.find().populate('user').populate('category').sort({createdAt: -1}).skip(skipLength).limit(5);
            const allCategories = await Category.find();

            if (allPosts.length != 0) {
                res.render('default/newsPerPage', {
                    posts: allPosts,
                    user: authUser,
                    categories: allCategories,
                    truncate: truncate,
                    moment: moment,
                    currentPage: page,
                    logMsg: req.flash('logout')
                })
            } else {
                req.flash('logout', 'You have reached the end of post')
                res.redirect('/');
            }

        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    getLogin: (req, res, next) => {
        res.render('default/login', {message: req.flash('error'), failure: req.flash('failure')});
    },
    getLogout: (req, res) => {
        req.logout();
        req.flash('logout', 'You are now logged out!');
        res.redirect('/');
    },
    getRegister: (req, res) => {
        res.render('default/register');
    },
    getReadPost: async (req, res) => {
        try {
            const postId = req.params.id;
            const authUser = req.user;
            const post = await Post.findById(postId)
                .populate('user')
                .populate('category')
                .populate({
                    path: 'comments', 
                    populate: 
                    {
                        path: 'user',
                        select: 'username',
                        model: 'User'
                    }
            });
            const allCategories = await Category.find();
            res.render('default/post', {
                user: authUser,
                post:post,
                categories: allCategories,
                comments: post.comments,
                moment: moment,
                success: req.flash('success'),
                failure: req.flash('failure')
            })
        } catch (error) {
            console.error(error);
            req.flash('logout', 'No news found!!!');
            res.redirect('/');
        }
    },
    getCategory: async (req, res) => {
        try {
            const authUser = req.user;
            let categoryId = req.params.id;
            let allPosts = await Post.find().populate('category').populate('user');
            let allCategories = await Category.find()
            let categoryPost = allPosts.filter((post) => {
                if (categoryId == post.category.title) {
                    return true;
                }
            })
            if (categoryPost.length != 0) {
                res.render('default/newsCategory', {
                    user: authUser,
                    posts: categoryPost,
                    categories: allCategories,
                    truncate: truncate,
                    moment: moment
                });
            } else {
                req.flash('logout', 'There is no post under this category');
                res.redirect('/');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
            
        }
        
    },
    getUserPost: async (req, res) => {
        try {
            const authUser = req.user;
            const username = req.params.id;
            let checkUser = await User.findOne({username: username});
            const allPosts = await Post.find().populate('user').populate('category');
            const allCategories = await Category.find();
    
            let userpost = allPosts.filter((post) => {
                if (post.user.username == username) {
                    return true;
                }
            })
            
            if(!checkUser) {
                req.flash('logout', 'No record of user exist!');
                res.redirect('/');
            }
    
            if(checkUser.role == 'member') {
                req.flash('logout', 'This user is not authorized to create post.');
                res.redirect('/');
            }
    
            if (userpost.length != 0) {
                res.render('default/userPost', {
                    user: authUser,
                    posts: userpost,
                    truncate: truncate,
                    moment: moment,
                    categories: allCategories
                })
            } else {
                req.flash('logout', 'The user has not created any post.');
                res.redirect('/');
            }
        } catch (error) {
            console.error(error);
            res.render('error/500');
        }
    },
    postLogin: (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }) (req, res, next);
    },
    postRegister: async (req, res) => {
        //error messages
        let errors = [];

        //destructure body 
        const {email, username, password, password2} = req.body;

        //check if there no empty fields
        if (!email || !username || !password || !password2) {
            errors.push({message: 'All fields are required'});
        }
        
        // check password length to be atleast five characters long
        if (password.length <= 4) {
            errors.push({message: 'Password must be at least five letters'});
        }
        
        //check Password Match 
        if (password !== password2) {
            errors.push({message: 'Passwords do not match'});
        }

        //check if form validation passes
        if (errors.length !== 0) {
            res.render('default/register', {errors:errors, email:email, username:username});
        } else {
            let existingUser = await User.find( {$or: [{email:email}, {username:username}] });
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
                                req.flash('error', 'Registration successful, log in');
                                res.redirect('/login');
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
                    res.render('default/register', {regErr:regErr})
                }
            }
        }

    },
    postAddComment: async (req, res) => {
        try {
            if (req.user) {
                const postId = req.params.id;
                const userId = req.user.id;
                const comment = req.body.comment
                const newComment = new Comment ({
                    body: comment,
                    user: userId
                });
                
                let posts = await Post.findById(postId);
    
                posts.comments.push(newComment)
    
                await posts.save();
    
                await newComment.save();
                
                req.flash('success', 'Comment added')

                res.redirect('back');
            } else {
                req.flash('failure', 'Login to submit a comment');
                res.redirect('/login');
            }
        } catch (error) {
            res.render('error/500');
            console.error(error);
        }
    }
}