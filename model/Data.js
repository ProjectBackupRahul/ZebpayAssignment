const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DataSchema = new Schema({
  trans_id: {
    type: String,
    required: true
  },
  fill_qty: {
    type: Number,
    required: true
  },
  fill_price: {
    type: Number,
    required: true
  },
  fill_flags: {
    type: Number,
    required: true
  },
  inbound_order_filled: {
    type: Boolean,
    default: false
  },
  currencyPair: {
    type: String,
    required: true
  },
  lastModifiedDate: {
    type: Date,
    default: Date.now
  }
});

const Data = mongoose.model('Data', DataSchema);

module.exports = Data;