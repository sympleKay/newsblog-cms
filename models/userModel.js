/* 
    ==========================================================
         @ File desc: create a user schema for MongoDB
    ==========================================================
*/
//Dependencies
const mongoose = require('mongoose');

//Use Schema
const Schema = mongoose.Schema;

//Create a user schema
const userSchema = new Schema ({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'member'
    },
    image: {
        type: String,
        default: ''
    }
}, {timestamps: true})

//model on userSchema
let User = mongoose.model('User', userSchema);

//export model
module.exports = User;