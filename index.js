const generator = require('./generator');

generator.seed(function(err,biGrams) {
  generator.generate(process.argv[2],biGrams,function(err,tweet) {
    console.log(tweet);
  })
})
