const mongoose = require("mongoose");

const appointment = new mongoose.Schema({
    name: String,
    email: String,
    cpf: String,
    date: Date,
    time: String,
    description: String,
    finished: Boolean,
    notified: Boolean
});

module.exports = appointment;