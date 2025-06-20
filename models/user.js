const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// Apply passport-local-mongoose plugin to the schema (not the model)
userSchema.plugin(passportLocalMongoose);

// Export the model
module.exports = mongoose.model("User", userSchema);
