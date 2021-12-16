require('dotenv').config()
const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken

// import axios
const axios = require('axios')

const passport = require('passport')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()
var config = {
    method: 'GET',
    url: 'http://api.coincap.io/v2/assets',
    headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`
    } 
}
router.get('/', (req, res, next) => {
    axios(config)
        .then(function(response) {
            //console.log('Response data:\n', JSON.stringify(response.data))
            console.log(res.json(response.data))
        })
        .catch(function (error) {
            console.log(error);
        })
        
})

module.exports = router