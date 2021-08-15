const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/relationDemo', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const productSchema = new Schema({
    name: String,
    price: Number,
    season: {
        type: String,
        enum: ['Spring', 'Summer', 'Fall', 'Winter']
    }
})

const Product = mongoose.model('Product', productSchema)
// Product.insertMany([
//     { name: 'armut', price: '10', season: 'Fall' },
//     { name: 'elma', price: '8', season: 'Fall' },
//     { name: 'kiraz', price: '12', season: 'Summer' }
// ])

const farmSchema = new Schema({
    name: String,
    city: String,
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
})

const Farm = mongoose.model('Farm', farmSchema)

// const makeFarm = async () => {
//     const farm = new Farm({ name: 'Full Belly', city: 'Guinda, CA' })
//     const melon = await Product.findOne({ name: 'armut' })
//     farm.products.push(melon)
//     await farm.save()
//     console.log(farm);
// }

// makeFarm()

// const addProduct = async () => {
//     const farm = await Farm.findOne({ name: 'Full Belly' })
//     const kiraz = await Product.findOne({ name: 'kiraz' })
//     farm.products.push(kiraz)
//     await farm.save()
//     console.log(farm)
// }

// addProduct()

Farm.findOne({ name: 'Full Belly' })
    .populate('products')
    .then(farm => console.log(farm))