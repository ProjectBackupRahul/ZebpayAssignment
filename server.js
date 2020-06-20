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
  var dataList = []
  var latestData = ""
  var transaction_id = "", openingPrice = 0, closingPrice = 0, high = 0, low = 0, volume = 0, data ="";
  let d = new Date();
  d.setHours(d.getHours() - hour);

  console.log(`${hour} Hour back time`, d);
  var dataCollections = await db.collection('datas');
  dataCollections.find({}).toArray((err, result) => {
     if (err){
      res.status(400).json({ transaction_id: "Not found" })
     }else {
      result.forEach(datas =>{ 
        dataList.push(datas);
  })
       for(let i=0; i<dataList.length; i++){
          transaction_id = dataList[i].transaction_id;
          openingPrice = dataList[i].openingPrice;
          closingPrice = dataList[i].closingPrice;
          high = dataList[i].high;
          low = dataList[i].low;
          volume = dataList[i].volume;
          date = dataList[i].date;
          latestData = `Transaction Id: ${transaction_id},  Opening Price:  ${openingPrice}, Closing Price: ${closingPrice}, High: $ data {high},  Low: ${low},  Volume: ${volume}`;
         // Supplied Hour get data functionality not been implemented Yet
       }

     }
     res.render('details',{
      latestData : latestData
  });
  })
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
  let transaction_id = req.body.transaction_id;
  let openingPrice = req.body.openingPrice;
  let closingPrice = req.body.closingPrice;
  let high = req.body.high;
  let low = req.body.low;
  let volume = req.body.volume;
 // console.log('Received all Data', transaction_id, openingPrice, closingPrice, high, low, volume);
  Data.findOne({ transaction_id: transaction_id}).then(data => {
    if (data) {
      return res.status(400).json({ transaction_id: "This entry is already exists" });
    } else {
        // @ Dummy Field to save data in Mongo DB 
      const newData = new Data({
        transaction_id: transaction_id,
        openingPrice: openingPrice,
        closingPrice: closingPrice,
        high: high,
        low: low,
        volume: volume
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
   console.log(`Listening on port ${PORT}`);
 });

