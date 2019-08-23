const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storageSchema = new Schema({
    warehouseId: String,
    empty: Boolean,
    filledUntil: Date
});

let Storage = mongoose.model('Storage', storageSchema);
module.exports = Storage;
