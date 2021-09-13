require('dotenv').config()

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    cloud_folder: 'yelpcamp',
    // secure: true
});

console.log(cloudinary.config().cloud_folder)

cloudinary.uploader.destroy('sample', function (error, result) {
    console.log(result, error)
})