/* 
    ==========================================================
         @ File desc: create a comment schema for MongoDB
    ==========================================================
*/
//Dependencies
const mongoose = require('mongoose');

//Use Schema
const Schema = mongoose.Schema;

//Create a user schema
const commentSchema = new Schema ({
    body: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

//model on commentSchema
let Comment = mongoose.model('Comment', commentSchema);

//export model
module.exports = Comment;