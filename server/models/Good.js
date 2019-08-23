const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const goodSchema = new Schema({
    name: String,
    costPerDay: Number
});

let Good = mongoose.model('Good', goodSchema);
module.exports = Good;
