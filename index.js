require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const url = require('url');

const Url = mongoose.model('Url', new mongoose.Schema({ url: String, short_url: Number })); // Asegúrate de tener este modelo definido


const client = mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
const urlparse = db.collection('urls');

//Midelware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl/', async (req, res) => {
  const urlToShorten = req.body.url;
  const hostname = new URL(urlToShorten).hostname;

  if (!hostname) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, async (err, address) => {
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    } else {
      const urlCount = await Url.countDocuments({});
      const urlDoc = {
        url: urlToShorten,
        short_url: urlCount
      }
      const result = await Url.create(urlDoc);
      console.log(result);
      return res.json({ original_url: url, short_url: urlCount });
    }
  });
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
