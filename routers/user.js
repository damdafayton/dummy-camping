const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const p = require('passport')

const user = require('../controllers/user')

router.route('/register')
    .get((req, res) => { res.render('register') })
    .post(catchAsync(user.register))

router.route('/login')
    .get(user.login)
    .post(p.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.auth)

router.get('/logout', user.logout)

module.exports = router