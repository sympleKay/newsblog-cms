/* 
    ==========================================================
         @ File desc: create a post schema for MongoDB
    ==========================================================
*/
//Dependencies
const mongoose = require('mongoose');

//Use Schema
const Schema = mongoose.Schema;

//Create a user schema
const userSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    body: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
}, {timestamps: true})

//model on postSchema
let Post = mongoose.model('Post', userSchema);

//export model
module.exports = Post;