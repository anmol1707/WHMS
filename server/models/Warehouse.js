const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const warehouseSchema = new Schema({
    name: String
});

let Warehouse = mongoose.model('Warehouse', warehouseSchema);
module.exports = Warehouse;
