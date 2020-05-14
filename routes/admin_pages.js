let express = require('express');
let router = express.Router();
const {check, validationResult} = require('express-validator');
let auth = require('../config/auth');
let isAdmin = auth.isAdmin;
var Page = require('../models/page');
/*
 * Get pages index
 */
router.get('/', isAdmin, function (req, res) {
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });
});
//Re-order page
router.post('/reorder-pages', function (req, res) {
    var ids = req.body['id[]'];
    var count = 0;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;
        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err) return console.log(err);
                });
            });
        })(count);
    }
});

/*
 * Get add page
 */
router.get('/add-page', isAdmin, function (req, res) {
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
router.post('/add-page', isAdmin, [
    check('title', 'Title must have a value').not().isEmpty(),
    check('content', 'Content must have a value').not().isEmpty()
], (req, res, next) => {
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('admin/add_page', {
            errors: errors.array(),
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
                    sorting: 100
                });
                page.save(function (err) {
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

router.get('/edit-page/:id', isAdmin, function (req, res) {
    Page.findById(req.params.id, function (err, page) {
        if (err) return console.log(err);
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

router.post('/edit-page/:id', isAdmin, [
    check('title', 'Title must have a value').not().isEmpty(),
    check('content', 'Content must have a value').not().isEmpty()
], (req, res, next) => {
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('admin/edit_page', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({slug: slug, _id: {'$ne': id}}, function (err, page) {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, function (err, page) {
                    if (err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    page.save(function (err) {
                        console.log("Page saved");
                        if (err)
                            return console.log(err);
                        req.flash('success', 'Page edited');
                        res.redirect('/admin/pages/edit-page/' + id);
                        console.log('Redirected');
                    });
                });
            }
        });
    }
});

router.get('/delete-page/:id', isAdmin, function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (error) {
        if (error) return console.log(error);
        req.flash('success', 'Page deleted successfully');
        res.redirect('/admin/pages');
    });
});

module.exports = router;
