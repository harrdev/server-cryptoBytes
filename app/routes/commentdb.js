const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const mongoose = require('mongoose')
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
const commentSchema = require('../models/comment')
const { ObjectId } = require('mongodb')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// POST (create) route to add a comment to a followed coin
router.post('/dashboard/comment/:coinName', requireToken, (req, res, next) => {
    // console.log('This is the commentDB Post route req.body object: ', req.body.e)
    // console.log('This is the savedCoin owner', req.body.user._id)
    // console.log('This is the matchedCoin we want to add a comment to: ', req.body.matchedCoin[0])
    // console.log('This is the corresponding coin req object: ', req.body.matchedCoin[0]._id)
    req.body.matchedCoin.owner = req.body.user._id
    // console.log('THi is EEEE:', typeof req.body.content)
    // console.log(`These should match: ${typeof req.body.matchedCoin.owner} and ${typeof req.body.user._id}`)
    Saved.findById(req.body.matchedCoin[0]._id)
    .then(coin => {
        coin.comments.push({ content: req.body.content })
        return coin.save()
    })
    .then(
        coin => {
            console.log('Second .then: ', coin)
            // after that we can return the place and send the status with some JSON
            res.status(201).json({ coin: coin.toObject() })
        }
    )
    .catch(next)
})

// DELETE Route for Saved Coins
router.delete('/dashboard/comment/:id', (req, res, next) => {
    console.log("Deleting comment from database")
    console.log("ID of comment", req.params.id)
    console.log("This is the matchedCoin id :", req.body.matchedCoin[0]._id)
    Saved.updateOne({
        "_id": ObjectId(req.body.matchedCoin[0]._id)
    },
    {
        "$pull": {
            "comments": {
                "_id": ObjectId(req.params.id)
            }
        }
    })
    .catch(err => {
        console.log('Failed to delete: ', err)
    })
})

module.exports = router

