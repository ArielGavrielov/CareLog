const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const resetToken = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    token: {
        type: Number,
        min: 10000,
        max: 99999,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },
});

resetToken.plugin(mongooseFieldEncryption, {
    fields: ['token'],
    secret: process.env.SECRET,
    saltGenerator: (secret) => secret.slice(0, 16)
});

module.exports = mongoose.model("resetToken", resetToken);