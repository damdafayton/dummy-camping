const express = require('express')
const router = express.Router()

const { validateCamp, isLoggedIn, isAuthor } = require('../middleware')
const catchAsync = require('../utils/catchAsync')
const campground = require('../controllers/campground')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage }) //dest: './public/uploads/'

router.get('/new', isLoggedIn, (req, res) => { res.render('campgrounds/new') })

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.edit))

router.route('/:id')
    .get(catchAsync(campground.show))
    .put(isLoggedIn, isAuthor, upload.array('image', 8), validateCamp, campground.update)
    .delete(isLoggedIn, isAuthor, campground.delete)

router.route('/')
    .post(isLoggedIn, upload.array('image', 8), validateCamp, catchAsync(campground.newForm))
    .get(campground.index)

module.exports = router