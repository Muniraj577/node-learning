let express = require('express');
let router = express.Router();
let auth = require('../config/auth');
let isUser = auth.isUser;
let Page = require('../models/page');
router.get('/', function (req, res) {
    Page.findOne({slug: 'home'}, function (err, page) {
        if (err) console.log(err);
        res.render('index', {
            title: page.title,
            content: page.content
        });
    });
});
router.get('/:slug', function (req, res) {
    var slug = req.params.slug;
    Page.findOne({slug: slug}, function (err, page) {
        if (err) console.log(err);
        res.render('index', {
            title: page.title,
            content: page.content
        });
    });
});

//Exports
module.exports = router;