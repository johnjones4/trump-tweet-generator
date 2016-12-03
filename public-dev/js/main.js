(function() {
  var inputField = document.querySelector('#tweet-base');
  var outputArea = document.querySelector('#output-area');
  var tweetOutputArea = outputArea.querySelector('.tweet-text');
  var refreshButton = document.querySelector('#refresh-button');
  var tweetButton = document.querySelector('#tweet-button');
  var facebookButton = document.querySelector('#facebook-button');

  var lastInput = null;
  var lastTweet = null;

  inputField.addEventListener('keyup',function() {
    var input = inputField.value.trim();
    if (input.length > 0) {
      if (input != lastInput) {
        generateTweet(inputField.value.trim());
      }
      lastInput = input;
      outputArea.classList.add('active');
    } else {
      outputArea.classList.remove('active');
    }
  });

  tweetButton.addEventListener('click',function() {
    var tweet = ('trumptweetgenerator.com: ' + lastTweet).substring(0,140);
    var url = 'https://twitter.com/home?status=' + encodeURIComponent(tweet);
    openShare(url,700,260);
    ga('send', 'event', 'share', 'tweet', lastTweet);

  });

  facebookButton.addEventListener('click',function() {
    var url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('https://trumptweetgenerator.com') + '&quote=' + lastTweet;
    openShare(url,700,260);
    ga('send', 'event', 'share', 'facebook', lastTweet);
  });

  refreshButton.addEventListener('click',function() {
    generateTweet(lastInput);
    ga('send', 'event', 'refresh', 'refresh', lastTweet);
  });

  function openShare(url,width,height) {
    var top = (screen.height - height) / 3;
    var left = (screen.width - width) / 2;
    window.open(url,'Share','location=0,menubar=0,resizable=1,scrollbars=0,status=1,titlebar=1,toolbar=0,width='+width+',height='+height+',top='+top+',left='+left);
  }

  function generateTweet(base) {
    ga('send', 'event', 'generate', 'input', base);
    outputArea.classList.add('loading');
    var url = '/generate?base=' + encodeURIComponent(base);
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200 && xhr.response && xhr.response.tweet && xhr.response.tweet.trim().length > 0) {
        lastTweet = xhr.response.tweet.trim();
        tweetOutputArea.innerHTML = lastTweet;
        outputArea.classList.remove('loading');
        ga('send', 'event', 'generate', 'output', lastTweet);
      }
    }
    xhr.open('get', url, true);
    xhr.send();
  }
})();
