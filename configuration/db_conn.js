//dependencies
const mongoose = require('mongoose');
const MONGOURI = 'mongodb://127.0.0.1:27017/news-blog';

//create connection
let openDBConnection = () => {
    mongoose.connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology:true, useFindAndModify:false } );

    //see if connection was successful or throw error
    let db = mongoose.connection;
    db.on('error', (err) => {
        console.error(err);
    })
    db.once('open', () => {
        console.log(`Connection to mongoDB successful....`)
    })
}

//export connection 
module.exports = openDBConnection;