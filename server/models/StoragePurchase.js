const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storagePurchaseSchema = new Schema({
    storageId: String,
    goodId: String,
    startDate: Date,
    endDate: Date
});

let StoragePurchase = mongoose.model('StoragePurchase', storagePurchaseSchema);
module.exports = StoragePurchase;
