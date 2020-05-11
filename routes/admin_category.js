// import * as Page from "mongoose";

let express = require('express');
let router = express.Router();
const {check, validationResult} = require('express-validator');

var Category = require('../models/category');
/*
 * Get pages index
 */
router.get('/', function (req, res) {
    Category.find(function (err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
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
 * Get add category
 */
router.get('/add-category', function (req, res) {
    var title = "";
    res.render('admin/add_category', {
        title: title,
    });
});

/*
 * Post add category
 */
router.post('/add-category', [
    check('title', 'Title must have a value').not().isEmpty(),
], (req, res, next) => {
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('admin/add_category', {
            errors: errors.array(),
            title: title
        });
    } else {
        Category.findOne({slug: slug}, function (err, category) {
            if (category) {
                req.flash('danger', 'Category slug exists, choose another');
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                var category = new Category({
                    title: title,
                    slug: slug
                });
                category.save(function (err) {
                    if (err)
                        return console.log(err);
                    req.flash('success', 'Category added successfully');
                    res.redirect('/admin/categories');
                });

            }
        });
    }
});

router.get('/edit-category/:id', function (req, res) {
    Category.findById(req.params.id, function (err, category) {
        if (err) return console.log(err);
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });
});

router.post('/edit-category/:id', [
    check('title', 'Title must have a value').not().isEmpty(),
], (req, res, next) => {
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('admin/edit_category', {
            errors: errors.array(),
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id: {'$ne': id}}, function (err, category) {
            if (category) {
                req.flash('danger', 'Category title exists, choose another');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function (err, category) {
                    if (err) return console.log(err);
                    category.title = title;
                    category.slug = slug;
                    category.save(function (err) {
                        if (err)
                            return console.log(err);
                        req.flash('success', 'Category edited');
                        res.redirect('/admin/categories/edit-category/' + id);
                        console.log('Redirected');
                    });
                });
            }
        });
    }
});

router.get('/delete-category/:id', function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (error) {
        if (error) return console.log(error);
        req.flash('success', 'Category deleted successfully');
        res.redirect('/admin/categories');
    });
});

module.exports = router;
