const express =  require('express');
var socket = require('socket.io-client')('wss://ws-feed.zebpay.com/marketdata');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;
// BodyParser middleware
// Load User model
const DataModel = require("./model/dataModel");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

  // DB Config
  const db = require("./config/keys").mongoURI;
  // Connect to MongoDB
  mongoose
    .connect(db,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

 socket.on('connect', ()=>{
    console.log('Socket Connected ----')
    });

    socket.on('history_singapore/BTC-INR', (data)=>{
    console.log("Received Data", data);

    //  Data save functionality
    DataModel.findOne({ transaction_id: data.transaction_id}).then(data => {
        if (data) {
          return res.status(400).json({ transaction_id: "This entry is already exists" });
        } else {

            // @ Dummy Field to save data in Mongo DB 
          const newData = new DataModel({
            transaction_id: data.transaction_id,
            openingPrice: data.opening_price,
            closingPrice: data.closingPrice,
            high: data.high,   
            low: data.low,
            volume: data.volume
          });
              newData
                .save()
                .then(data => res.json(data))
                .catch(err => console.log(err));
        }
      });
    });

    socket.on('disconnect', ()=>{
    console.log("Socket Disconnected----")
    });


app.listen(PORT, () => {
console.log(`Listening on port ${PORT}`);
});