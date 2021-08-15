const express = require('express')
const router = express.Router({ mergeParams: true })

const review = require('../controllers/review')

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const catchAsync = require('../utils/catchAsync')

router.post('/', isLoggedIn, validateReview, catchAsync(review.newForm))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.delete))

module.exports = router