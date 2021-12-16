const mongoose = require('mongoose')

const Schema = mongoose.Schema
const commentSchema = new Schema(
    {
        content: String,
    },
    {
        timeStamps: true
    }
)

// export the commentSchema so we can use it as a subdocument in our saved Coins model
// NOTE: we don't need to create or export a model for a subdoc
module.exports = commentSchema