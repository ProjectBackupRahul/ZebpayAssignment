const express =  require('express');
var socket = require('socket.io-client')('wss://ws-feed.zebpay.com/marketdata',);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride  =  require('method-override');

const app = express();
const PORT = process.env.PORT || 5000;

//@ Configuring os for network interfce .
var os = require('os');
var ifaces = os.networkInterfaces();
//@ Configuring os for network interfce

// BodyParser middleware
// Load User model
const Data = require("./model/Data");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

  // DB Config
  const dbURI = require("./config/keys").mongoURI;
  // Connect to MongoDB
  mongoose.connect(dbURI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
  var db = mongoose.connection;

  //@ Handling mongo Error 
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log("Mongo DB Connected ")
  });

    socket.on('connect', ()=>{
    console.log('Socket Connected ----');

    socket.emit('history_singapore/BTC-INR', (data)=>{
    console.log("Received Data",data);

        });
    });

    socket.on('disconnect', ()=>{
    console.log("Socket Disconnected----")
    });

    // @ Config View Engine 0
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// @ Body Parser middleware config 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// @ Method override middleware config 
app.use(methodOverride('_method'));

// @ Route : GET
// @ Access : Public
// @ Path :/
app.get('/', (req,res)=>{
   res.render('supplydata');
});

// @ Route : POST
// @ Access : Public
// @ Path :/data/search
app.post('/data/supply',async(req,res,next) => {
  var hour = req.body.hour;
  var latestPriceList = [];
  var latestFillQtyList = [];
  var transaction_id = "", openingPrice = 0, closingPrice = 0, highestPrice = 0, lowestPrice = 0, volume = 0, latestData ="";
  let d = new Date();
  d.setHours(d.getHours() - hour);
  console.log(`${hour} Hour back time`, d);
  var dataCollections = await db.collection('datas');
    dataCollections.find({"lastModifiedDate" : { $gt: new Date(d.getTime() - hour*60*60*1000)}
    }).toArray(function(err , docs){
    console.log(`Last ${hour} hour latest data count`,docs.length , + '&' + 'Data', docs);
     if(docs.length<1){
      res.render('details',{
        latestData : 'No data found in your time range:'
    });
     } else {

      for (let i=0; i<docs.length; i++) {
        latestPriceList.push(docs[i].fill_price);
        latestFillQtyList.push(docs[i].fill_qty);
      }
        console.log(`Latest Price List Data`, latestPriceList);
        console.log(`Latest Fill Qty List Data`, latestFillQtyList);

        highestPrice = Math.max(...latestPriceList);
        lowestPrice = Math.min(...latestPriceList);

        console.log(`Highest Price From Price List ${highestPrice}`);
        console.log(`Lowest Price From Price List ${lowestPrice}`);

       openingPrice= latestPriceList[0];
       closingPrice= latestPriceList[latestPriceList.length-1];

       console.log(`OpeningPice: ${openingPrice}`);
       console.log(`ClosingPice: ${closingPrice}`);

       latestFillQtyList.forEach(sums => {
       volume += sums;
       })
       console.log(`The Volume: ${volume}`);

       latestData = `Open Price: ${openingPrice}, Closing Price: ${closingPrice}, Highest Price: ${highestPrice}, Lowest Price: ${lowestPrice}, Volume: ${volume}`;

       res.render('details',{
        latestData : latestData
    });
     }

    });
});

// @ Route : GET
// @ Access : Public
// @ Path :/data/add

  app.get('/data/add', (req,res)=>{
    res.render('adddata');
  })
// @ Route : POST
// @ Access : Public 
// @ Path :/data/add

app.post('/data/add', (req,res,next)=>{
  let trans_id = req.body.trans_id;
  let fill_qty = req.body.fill_qty;
  let fill_price = req.body.fill_price;
  let fill_flags = req.body.fill_flags;
  let inbound_order_filled = req.body.inbound_order_filled;
  let currencyPair = req.body.currencyPair;
 // console.log('Received all Data', transaction_id, openingPrice, closingPrice, high, low, volume);
  Data.findOne({ trans_id: trans_id}).then(data => {
    if (data) {
      return res.status(400).json({ transaction_id: "This entry is already exists" });
    } else {
        // @ Dummy Field to save data in Mongo DB 
      const newData = new Data({
        trans_id: trans_id,
        fill_qty: fill_qty,
        fill_price: fill_price,
        fill_flags: fill_flags,
        inbound_order_filled: inbound_order_filled,
        currencyPair: currencyPair
      });
           newData
            .save()
            .then(data => res.json(data))
            res.redirect('/')
            .catch(err => console.log(err));
    }
  });
});

  app.listen(PORT, () => {
   devURL();
 });

  //  @ Function generate Dev URL
  const devURL=() => {
    Object.keys(ifaces).forEach( (ifname) =>{
      var alias = 0;
      ifaces[ifname].forEach( (iface) => {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          return;
        }
        if (alias >= 1) {
        } else {
          var url = 'http://'+iface.address+':'+PORT+'/'
          console.log(`Dev URL: `,url);
        }
        ++alias;
      });
    });
  }


