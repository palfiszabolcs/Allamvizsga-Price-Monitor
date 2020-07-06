const config = {
   apiKey: "AIzaSyDMye3XhwYr8682BFxiA-GmPvR8hmoAvy0",
   authDomain: "price-monitor-44858.firebaseapp.com",
   databaseURL: "https://price-monitor-44858.firebaseio.com/",
   storageBucket: "price-monitor-44858.appspot.com"
};

const config2 = {
   apiKey: "AIzaSyDMye3XhwYr8682BFxiA-GmPvR8hmoAvy0",
   authDomain: "price-monitor-44858.firebaseapp.com",
   databaseURL: "https://price-monitor-44858.firebaseio.com",
   projectId: "price-monitor-44858",
   storageBucket: "price-monitor-44858.appspot.com",
   messagingSenderId: "64162639666",
   appId: "1:64162639666:web:e52835cf7db1e501f5f12b",
   measurementId: "G-J2V35CT5HN"
};

firebase.initializeApp(config);
var database = firebase.database();

function get_URL(){
   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      var url = tabs[0].url;

      var content = document.getElementById('content');
      var p = document.createElement("p");
      var text = document.createTextNode(url);
      p.appendChild(text);
      content.appendChild(p);

      // console.log("url in getURL: " + url);
   });
}

function push_to_new(user = "TEST-user", url = "test-url", category = "test category") {
   var postsRef = database.ref('/test').child(user);
   postsRef.push().set({
      category: category,
      url : url
    });
}

// push_to_new('TEST-user', 'www.proba.url', 'sport');

// document.addEventListener("DOMContentLoaded", push_to_new('feri', get_URL(), 'sports'));
document.addEventListener("DOMContentLoaded", get_URL());
document.getElementById("upload_button").onclick = function(){
   push_to_new('TEST-user', 'www.proba.url', 'sport');
}

