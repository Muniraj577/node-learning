// import * as Page from "mongoose";

let express = require('express');
let router = express.Router();
let path = require('path');
let mkdirp = require('mkdirp');
let fs = require('fs-extra');
let resizeImg = require('resize-img');
const {check, validationResult} = require('express-validator');
var Product = require('../models/product');
var Category = require('../models/category');


function isImage(files) {
    if (files !== null){
        let extension = files.image.name.split('.').pop();
        switch (extension) {
            case '.jpg':
                return true;
            case '.png':
                return true;
            case '.jpeg':
                return true;
            default:
                return false;
        }
    } else return false;
}

/*
 * Get products index
 */
router.get('/', function (req, res) {
    var count;
    Product.count(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

/*
 * Get add product
 */
router.get('/add-product', function (req, res) {
    var title = "";
    var description = "";
    var price = "";
    Category.find(function (err, categories) {
        res.render('admin/add_product', {
            title: title,
            description: description,
            categories: categories,
            price: price,
        });
    });
});
/*
 * Post add product
 */
router.post('/add-product', [
    check('title', 'Title must have a value').not().isEmpty(),
    check('description', 'Description must have a value').not().isEmpty(),
    check('price', 'Price must have a value').isDecimal().not().isEmpty(),
], (req, res, next) => {
    if (req.files == null)
        req.files = "undefined";
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var description = req.body.description;
    var price = req.body.price;
    var category = req.body.category;
    var errors = validationResult(req);
    if (!isImage(imageFile))
        errors.errors.push({ value: '', msg: 'You must upload an image', param: 'image', location: 'body' })
    if (!errors.isEmpty()) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors.array(),
                title: title,
                description: description,
                categories: categories,
                price: price,
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        description: description,
                        categories: categories,
                        price: price,
                    });
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    description: description,
                    price: price2,
                    category: category,
                    image: imageFile
                });
                product.save(function (err) {
                    if (err)
                        return console.log(err);
                    mkdirp('public/product_images/' + product._id);
                    // mkdirp('public/product_images/' + product._id + '/gallery');
                    // mkdirp('public/product_images/' + product._id + '/gallery/thumbs');
                    if (imageFile !== "") {
                        var productImage = req.files.image;
                        console.log(productImage);
                        var path = 'public/product_images/' + product._id + '/' + imageFile;
                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }
                    req.flash('success', 'Product added successfully');
                    res.redirect('/admin/products');
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
