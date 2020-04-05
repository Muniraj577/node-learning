// import * as Page from "mongoose";

let express = require('express');
let router = express.Router();
const {check, validationResult} = require('express-validator');

var Page = require('../models/page');
/*
 * Get pages index
 */
router.get('/', function (req, res) {
    res.send('admin area')
});

/*
 * Get add page
 */
router.get('/add-page', function (req, res) {
    var title = "";
    var slug = "";
    var content = "";
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

/*
 * Post add page
 */
router.post('/add-page', [
    check('title', 'Title must have a value').not().isEmpty(),
    check('content', 'Content must have a value').not().isEmpty()
], (req, res, next) => {
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var errors = validationResult(req).array();
    if (errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({slug: slug}, function (err, page) {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 0
                });
                page.save(function (err) {
                    console.log("Page saved");
                    if (err)
                        return console.log(err);
                    req.flash('success', 'Page added');
                    res.redirect('/admin/pages');
                    console.log('Redirected');
                });

            }
        });
    }
});


module.exports = router;
