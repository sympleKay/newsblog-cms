// @ file descriptions: this is the entry file
// Dependencies
const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const MongoDBStore = require('connect-mongodb-session')(session);
const DBConn = require('./configuration/db_conn');
const defaultRoutes = require('./routes/defaultRoutes');
const adminRoutes = require('./routes/adminRoutes');



//Port number
let PORT = process.env.PORT || 5000;

//Init DB connection
DBConn();

//Init express
const app = express();

//Use static public folder
app.use(express.static(path.join(__dirname, 'public')));

//MongoDB store
let store = new MongoDBStore ({
    uri: 'mongodb://127.0.0.1:27017/news-blog',
    collection: 'mySessions'
})
store.on('error', (error) => {console.error(error)});

//Express session middleware
app.use(session({
    secret: 'my secret',
    resave: true,
    saveUninitialized: true
}))

//Require passport authentication
require('./configuration/passport_auth');

//Init passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Set view engine and view folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Connect flash
app.use(flash());

//Default Routes
app.use('/', defaultRoutes);
app.use('/admin', adminRoutes);

//Handle 404 Error
app.use((req, res, next) => {
    res.status(404).render('error/400');
});

//Init server on port
app.listen(PORT, ()  => {
    console.log(`Server running on port: ${PORT}`);
})