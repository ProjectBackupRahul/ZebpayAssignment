const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DataSchema = new Schema({
  transaction_id: {
    type: String,
    required: true
  },
  openingPrice: {
    type: Number,
    required: true
  },
  closingPrice: {
    type: Number,
    required: true
  },
  high: {
    type: Number,
    required: true
  },
  low: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Data = mongoose.model('Data', DataSchema);

module.exports = Data;