const User = require('../models/user')

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const newUser = new User({ email, username })
        const registered = await User.register(newUser, password)
        console.log(registered)
        req.login(registered, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to Yelp Camp')
            res.redirect('/campgrounds')
        })
    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
    // res.send(req.body)
}

module.exports.login = (req, res) => {
    console.log(req.headers.referer)
    if (!req.session.returnTo) { req.session.returnTo = req.headers.referer }
    res.render('login')
}

module.exports.auth = (req, res) => {
    req.flash('success', 'Welcome back')
    const redirectUrl = req.session.returnTo || '/'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout()
    req.flash('success', 'Logged out. Goodbye..')
    res.redirect(req.headers.referer)
}