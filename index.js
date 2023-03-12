require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('node:dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


const urls = [];
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  try {
    const host = new URL(url).hostname;
  } catch (error) {
    res.json({
      error: 'invalid url'
    });
  }

  const host = new URL(url).hostname;

  const options = {
    family: 4,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  };

  dns.lookup(host, options, (err, address, family) => {
    if (err) {
      res.json({
        error: 'invalid url'
      });
    }

    if (!urls.includes(url)) {
      urls.push(url);
    }

    res.json({
      original_url : url,
      short_url : urls.indexOf(url)
    });

  });

});


// Redirect the short URL to Original URL
app.get('/api/shorturl/:id', (req,res) => {
  const { id } = req.params;
  const originalUrl = urls[Number(id)];
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
