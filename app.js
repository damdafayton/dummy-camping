if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
// console.log(process.env)

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')

const flash = require('connect-flash')
const override = require('method-override')
const morgan = require('morgan')
const ejsMate = require('ejs-mate')
const joi = require('joi')

const campgrounds = require('./routers/campground')
const review = require('./routers/review')
const user = require('./routers/user')

const p = require('passport')
const pLocal = require('passport-local')
const User = require('./models/user')

const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

const dbUrl= process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
// const dbUrl= process.env.DB_URL

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('mongoose connected');
});

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(override('_method'))
app.use(morgan('tiny'))
app.use(mongoSanitize())
// app.use(helmet({ contentSecurityPolicy:false }))
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/rstdt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || 'squirrelsecret'

app.use(cookieParser('mysecret'))
const store = MongoStore.create({
    name: 'sgir',
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {secret}
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionStore={ 
    // secure:true,
    store,
    name:'sesiion',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, expires: Date.now() + 3600000 * 24, maxAge: 3600000 * 24 }
}

app.use(session(sessionStore))

app.use(p.initialize())
app.use(p.session())
p.use(new pLocal(User.authenticate()))
p.serializeUser(User.serializeUser())
p.deserializeUser(User.deserializeUser())

app.use(flash())
app.use((req, res, next) => {
    console.log(req.query)
    res.locals.currentUser = req.user
    res.locals.successMsg = req.flash('success')
    res.locals.errorMsg = req.flash('error')
    // console.log('returnTo: ', req.session.returnTo)
    next()
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/review', review)
app.use('/', user)
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)

app.get('/setname', (req, res) => {
    if (req.session.count) { req.session.count++ } else {
        req.session.count = 1
    }
    console.log(req.cookies);
    res.cookie('name', 'jellyboom', { signed: true })
    res.send(`You have viewed this page ${req.session.count} time(s) dear ${req.signedCookies.name}`)
})

app.get('/', function (req, res) {
    const { name = 'guest' } = req.signedCookies
    res.render('home')
    // throw Error(`Hey there, ${name}`) // Express will catch this on its own.
})

app.use((req, res) => {
    console.log('404 Page not found');
    res.status(404).send('PAGE NOT FOUND!')
})

app.use((err, req, res, next) => {
    const { statusCode = 404, message = 'Something went wrong' } = err
    const lastPage = req.headers.referer
    console.log(err)
    req.flash('error', 'Bad request')
    res.redirect('/campgrounds')
    // res.status(statusCode).render('error', { message })
    // next()
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening on ${port}`, Date.now());
})