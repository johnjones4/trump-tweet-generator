const async = require('async');
const parse = require('csv-parse');
const fs = require('fs');
const weighted = require('weighted')

const MaxBaseSize = 4;

var _biGrams = null;

exports.seed = function(done) {
  async.waterfall([
    function(next) {
      fs.createReadStream(__dirname+'/tweets.csv').pipe(parse({'columns': true},next));
    },
    function(tweets,next) {
      const words = {};
      tweets.forEach(function(tweet) {
        const baseTokens = getTweetTokens(tweet);
        generateBiGrams(baseTokens,words);
      });
      sortNextWorks(words);
      next(null,words);
    },
  ],function(err,biGrams) {
    if (err) {
      done(err);
    } else {
      _biGrams = biGrams
      done(null,biGrams);
    }
  });
}

exports.generate = function(base,biGrams,done) {
  if (!biGrams) {
    biGrams = _biGrams;
  }
  var tweet = base.toLowerCase();
  var lastWord = base.toLowerCase();
  if (biGrams[lastWord]) {
    const wordsUsed = {};
    while(tweet.length < 140) {
      if (biGrams[lastWord]) {
        // if (!wordsUsed[lastWord] && !Number.isInteger(wordsUsed[lastWord])) {
        //   wordsUsed[lastWord] = 0;
        // } else {
        //   wordsUsed[lastWord]++;
        // }
        // const index = (wordsUsed[lastWord] % biGrams[lastWord].length);
        // const index = Math.floor(Math.random() * biGrams[lastWord].length);
        const nextWord = weighted.select(biGrams[lastWord]);
        tweet += ' ' + nextWord;
        lastWord = nextWord;
      } else {
        break;
      }
    }
    done(null,tweet);
  } else {
    done(null,null);
  }
}

function getTweetTokens(tweet) {
  return tweet.text
    .toLowerCase()
    .split(' ')
    .map(function(uncleanToken) {
      return uncleanToken.trim().replace(/\s/g,'').replace(/\b[-.,()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, "").trim();
    })
    .filter(function(token) {
      return token.length > 0 && token.indexOf('http') != 0;
    });
}

function generateBiGrams(tokens,words) {
  for(var baseSize = 1; baseSize <= MaxBaseSize; baseSize++) {
    for(var curTokenIndex = 0; curTokenIndex < tokens.length; curTokenIndex++) {
      if (curTokenIndex + baseSize < tokens.length) {
        const token = tokens.slice(curTokenIndex,curTokenIndex+baseSize).join(' ');
        if (!words[token]) {
          words[token] = {};
        }
        if (curTokenIndex < tokens.length - 1) {
          const nextWord = tokens[curTokenIndex + 1];
          if (!words[token][nextWord]) {
            words[token][nextWord] = 1;
          } else {
            words[token][nextWord]++;
          }
        }
      }
    }
  }
}

function sortNextWorks(biGrams) {
  for(var biGram in biGrams) {
    // const nextArray = [];
    // for(var nextWord in biGrams[biGram]) {
    //   nextArray.push({
    //     'word': nextWord,
    //     'frequency': biGrams[biGram][nextWord]
    //   });
    // }
    // nextArray.sort(function(a,b) {
    //   return b.frequency - a.frequency;
    // });
    // biGrams[biGram] = nextArray;
    var total = 0;
    for(var nextWord in biGrams[biGram]) {
      total += biGrams[biGram][nextWord];
    }
    for(var nextWord in biGrams[biGram]) {
      biGrams[biGram][nextWord] = biGrams[biGram][nextWord] / total;
    }
  }
}
