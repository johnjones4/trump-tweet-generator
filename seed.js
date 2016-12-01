const async = require('async');
const parse = require('csv-parse');
const fs = require('fs');

const MaxBaseSize = 4;

module.exports = function(done) {
  async.waterfall([
    function(next) {
      fs.createReadStream('./tweets.csv').pipe(parse({'columns': true},next));
    },
    function(tweets,next) {
      const words = {};
      tweets.forEach(function(tweet) {
        const baseTokens = getTweetTokens(tweet);
        generateBiGrams(baseTokens,words);
      });
      next(null,words);
    },
    function(biGrams,next) {
      for(var biGram in biGrams) {
        const nextArray = [];
        for(var nextWord in biGrams[biGram]) {
          nextArray.push({
            'word': nextWord,
            'frequency': biGrams[biGram][nextWord]
          });
        }
        nextArray.sort(function(a,b) {
          return b.frequency - a.frequency;
        });
        biGrams[biGram] = nextArray;
      }
      next(null,biGrams);
    }
  ],done);
}

function getTweetTokens(tweet) {
  return tweet.text
    .toLowerCase()
    .split(' ')
    .map(function(uncleanToken) {
      return uncleanToken.trim().replace(/\b[-.,()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, "").trim();
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
