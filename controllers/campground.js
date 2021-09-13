const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')

const mbGeocode = require('@mapbox/mapbox-sdk/services/geocoding')
const mbToken = process.env.MAPBOX_TOKEN
const geocoder = mbGeocode({ accessToken: mbToken })

module.exports.edit = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}

module.exports.update = async (req, res, next) => {
    try {// const campground = await Campground.findById(req.params.id)
        console.log(req.body)
        const campground = await Campground.findById(req.params.id)
        await campground.updateOne(req.body.campground)
        const newimage = req.files.map(f => ({ url: f.path, filename: f.filename }))
        campground.image.push(...newimage)
        await campground.save()
        if (req.body.deleteImages) {
            for (filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename, function (error, result) {
                    console.log(result, error)
                })
            }
            await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
        }
        console.log(campground)
        req.flash('success', 'Campground updated')
        res.redirect(`/campgrounds/${req.params.id}`)
    }
    catch (e) { next(e) }
}

module.exports.delete = async (req, res) => {
    // const campground = await Campground.findById(req.params.id)
    const campground = await Campground.findById(req.params.id)
    if (!campground.author.equals(req.user.id)) {
        req.flash('error', 'You do not have permission to do this')
        return res.redirect('/campgrounds')
    }
    await campground.deleteOne()
    // console.log(campground);
    req.flash('success', 'Campground deleted')
    res.redirect(`/campgrounds`)
}

module.exports.show = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: { path: 'author' }
        })
        .populate('author')
    // console.log(campground);
    if (!campground) {
        req.flash('error', "Campground doesn't exist")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.newForm = async (req, res, next) => {
    // console.log('req.files: ', req.files.map(f => ({ url: f.path, filename: f.filename })))
    // console.log(msg);
    // console.log(campgroundSchema.validate(req.body).error.details[0].message
    // if (error) {}
    console.log('start geodata..')
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // console.log(geoData.body.features[0].geometry)
    const campground = new Campground(req.body.campground)
    campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    campground.geometry = geoData.body.features[0].geometry
    await campground.save()
    console.log(campground)
    req.flash('success', 'Campground added')
    res.redirect(`campgrounds/${campground._id}`)
}

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    // console.log(messages.length)
    // if (!deleteSuccess.length) { messages = 0 }
    res.render('campgrounds/index', { campgrounds })
}