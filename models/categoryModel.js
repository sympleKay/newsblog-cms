/* 
    ==========================================================
         @ File desc: create a category schema for MongoDB
    ==========================================================
*/

//Dependencies
const mongoose = require('mongoose');

//Use Schema
const Schema = mongoose.Schema;

//Create a user schema
const categorySchema = new Schema ({
    title: {
        type: String,
        required: true
    }
}, {timestamps: true})

//model on userSchema
let Category = mongoose.model('Category', categorySchema);

//export model
module.exports = Category;