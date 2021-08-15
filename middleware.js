const baseJoi = require('joi')
const Campground = require('./models/campground')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError')
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const joi = baseJoi.extend(extension)

const campgroundValidator = joi.object({
    campground: joi.object({
        title: joi.string().required().escapeHTML(),
        price: joi.number().required().min(10),
        // image: joi.string().required(),
        location: joi.string().required().escapeHTML(),
        description: joi.string().required().escapeHTML()
    }).required(),
    deleteImages: joi.array()
})

const reviewValidator = joi.object({
    review: joi.object({
        rating: joi.number().required(),
        body: joi.string().required().escapeHTML()
    }).required()
})

module.exports.validateCamp = function (req, res, next) {
    const { error } = campgroundValidator.validate(req.body)
    if (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.log('error: ', error)
        }
        const msg = campgroundValidator.validate(req.body).error.details[0].message
        // next(msg)
        req.flash('error', msg)
        return res.redirect(req.headers.referer)
        // throw new ExpressError(msg, 400)
    }
    else { next() }
}

module.exports.validateReview = function (req, res, next) {
    const { error } = reviewValidator.validate(req.body)
    if (error) {
        console.log(error);
        const msg = reviewValidator.validate(req.body).error.details[0].message
        // next(msg)
        throw new ExpressError(msg, 400)
    }
    else { next() }
}

module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req.user..', req.user, req.headers)
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.headers.referer
        req.flash('error', 'Please sign-in first')
        return res.redirect('/login')
    }
    else next()
}

module.exports.isAuthor = async (req, res, next) => {
    // console.log('user: ', req.user)
    if (!req.user) {
        req.flash('error', 'Please log in first')
        // console.log('login error catch')
        return res.redirect(req.headers.referer)
    }
    const campground = await Campground.findById(req.params.id)
    if (!campground.author.equals(req.user.id)) {
        req.flash('error', 'You do not have permission to do this')
        return res.redirect(`/campgrounds/${req.params.id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    // console.log('user: ', req.user)
    const review = await Review.findById(req.params.reviewId)
    if (!review.author.equals(req.user.id)) {
        req.flash('error', 'You do not have permission to do this')
        return res.redirect(`/campgrounds/${req.params.id}`)
    }
    next()
}