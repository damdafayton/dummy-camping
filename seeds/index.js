const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const https = require('https');
const { parse } = require('node-html-parser')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];
const price = Math.floor(Math.random() * 10 + 10)

const findImage = function (url) {
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                const root = parse(data);
                setTimeout(() => resolve(root.querySelector('a').rawAttributes.href), 1000)
                // console.log('without parse: \n', data)
                // console.log(JSON.parse(data).explanation);
            });

        }).on("error", (err) => {
            // console.log("Error: " + err.message);
            reject(err.message)
        });
    })
}

console.log('before func')
// findImage('https://source.unsplash.com/collection/483251').then(r => console.log(r))
console.log('after func')

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        console.log('before func2')
        const url = await findImage('https://source.unsplash.com/collection/483251')
        console.log(url)
        console.log('after func2')
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '6110ef5a1ea062f0d000084e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            image: {
                url: url,
                filename: i + 1
            },
            description: 'lorem ipsum tipsum morem lorem',
            price: price
        })
        await camp.save();
        console.log('saved item number ', i + 1)
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})