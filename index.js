const generator = require('./generator');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const http = require('http');

const app = express();
app.use(logger('combined'));
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(bodyParser.json({}));
app.use(express.static(__dirname + '/public'));

app.get('/generate',function(req,res,next) {
  generator.generate(req.query.base,null,function(err,tweet) {
    if (err) {
      next(err);
    } else {
      res.send({'tweet':tweet});
    }
  });
});

generator.seed(function(err,biGrams) {
  const httpServer = http.createServer(app);
  httpServer.listen(process.env.PORT || 8000,function() {
    console.log('Server running.');
  });
})
