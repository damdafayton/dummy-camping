const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.newForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    await campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash('success', 'Review created')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.delete = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    await campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash('success', 'Review created')
    res.redirect(`/campgrounds/${campground._id}`)
}