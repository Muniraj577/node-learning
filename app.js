let express = require('express');
let path = require('path');
let mongoose = require('mongoose');
let config = require('./config/database');
let bodyParser = require('body-parser');
let session = require('express-session');
let fileUpload = require('express-fileupload');
const {customValidators} = require('express-validator');
let passport = require('passport');

// Init app
let app = express();
//File upload middleware
app.use(fileUpload());
//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}));
//Passport config
require('./config/passport')(passport);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());
//Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
//Connect to db
mongoose.connect(config.database, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to MongoDB")
});

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Set global errors variables
app.locals.errors = null;

// let expressValidator = require('express-validator');
// app.use(expressValidator({
//     customValidators: {
//         isImage: function (value, filename) {
//             var extension = (path.extname(filename)).toLowerCase();
//             switch (extension) {
//                 case '.jpg':
//                     return '.jpg';
//                 case '.png':
//                     return '.png';
//                 case '.jpeg':
//                     return '.jpeg';
//                 case '':
//                     return '.jpg';
//                 default:
//                     return false;
//             }
//         }
//     }
// }));

app.get('*', function (req, res, next) {
   res.locals.user = req.user || null;
   next();
});

//Set Routes
let pages = require('./routes/pages.js');
let users = require('./routes/users.js');
let adminPages = require('./routes/admin_pages.js');
let adminCategories = require('./routes/admin_category.js');
let adminProducts = require('./routes/admin_products.js');
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/', pages);
app.use('/users', users);
//Start the server
let hostname = '127.0.0.1';
let port = 3000;
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});