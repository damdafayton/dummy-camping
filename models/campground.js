const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('upload', 'upload/w_200,h_200')
})

ImageSchema.virtual('thumbindex').get(function () {
    return this.url.replace('upload', 'upload/w_250,h_200')
})

const opts = { toJSON: { virtuals: true } }
const CampSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    image: [
        ImageSchema
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
}, opts)

CampSchema.virtual('properties.markUpText').get(function () {
    return `<strong><a href="/campgrounds/${this.id}">${this.title}</a></strong>\n<p>${this.location}</p> `
})

CampSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        })
    }
})

module.exports = mongoose.model('campground', CampSchema)