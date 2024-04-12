require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const shortid = require('shortid');
const cors = require('cors');
const dns = require('dns');
const urlPaser = require('url');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

const UrlsSchema = new mongoose.Schema({
  original_url: String,
  short_url: { type: String, default: shortid.generate }
});

const Urls = mongoose.model('Urls', UrlsSchema);


// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


//Midelware validate 
function ValidateUrl(req, res, next) {
  let original_url
  try {
    new URL(req.body.url)
    original_url = urlPaser.parse(req.body.url).hostname
    next()
  } catch (err) {
    return res.status(400).json({ error: 'invalid URL' })
  }
  dns.lookup(original_url, (err) => {
    if (err) {
      return res.status(400).json({ error: 'invalid hostname' })
    } else {
      next()
    }
  })
}


app.post('/api/shorturl', ValidateUrl, async (req, res) => {
  let url = await Urls.findOne({ original_url: req.body.url })
  if (url) {
    res.json({ original_url: url.original_url, short_url: url.short_url })
  } else {
    url = new Urls({ original_url: req.body.url });
    await url.save()
    res.json({ original_url: url.original_url, short_url: url.short_url })
  }
})


app.get('/api/shorturl/:short_url', async (req, res) => {
  const url = await Url.findOne({ short_url: req.params.short_url });
  if (url) {
    res.redirect(url.original_url);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
