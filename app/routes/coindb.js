const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const crypto = require('crypto')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')

// see above for explanation of "salting", 10 rounds is recommended
const bcryptSaltRounds = 10

// pull in error types and the logic to handle them and set status codes
const errors = require('../../lib/custom_errors')

const BadParamsError = errors.BadParamsError
const BadCredentialsError = errors.BadCredentialsError

const Saved = require('../models/savedCoin')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// POST (create) route to add a coin to our followed list
router.post('/dashboard', requireToken, (req, res, next) => {
    req.body.info.owner = req.user.id
    Saved.create({
        id: req.body.info.id,
        symbol: req.body.info.symbol,
        marketCapUsd: req.body.info.marketCapUsd,
        maxSupply: req.body.info.maxSupply,
        rank: req.body.info.rank,
        name: req.body.info.name,
        priceUsd: req.body.info.priceUsd,
        supply: req.body.info.supply,
        changePercent24Hr: req.body.info.changePercent24Hr,
        volumeUsd24Hr: req.body.info.volumeUsd24Hr,
        vwap24Hr: req.body.info.vwap24Hr,
        owner: req.body.info.owner
    })
    .then(addedCoin => {
        res.json({coinAdded: 'this coin was favorited', addedCoin})
    })
        .catch(next)
})

// INDEX

router.get('/dashboard', requireToken, (req, res, next) => {
    Saved.find()
        .then((coins) => {
            console.log("is this working?", coins)
            const userCoins = coins.filter(coin => coin.owner.toString() === req.user.id)
            console.log("user coins!", userCoins)
            // `examples` will be an array of Mongoose documents
            // we want to convert each one to a POJO, so we use `.map` to
            // apply `.toObject` to each one

            // map over user coins instead of coins
            return userCoins.map((coin) => coin.toObject())
        })
        // respond with status 200 and JSON of the examples
        .then((coins) => res.status(200).json({ coins: coins }))
        // if an error occurs, pass it to the handler
        .catch(next)
})

// DELETE Route for Saved Coins
router.delete('/dashboard/:id', (req, res, next) => {
    Saved.findOneAndDelete({
        _id: req.params.id
    })
    .then(deletedCoin => {
        res.json({message: 'coin was deleted', deletedCoin})
    })
    .catch(err => {
        console.log('Failed to delete: ', err)
    })
})

module.exports = router