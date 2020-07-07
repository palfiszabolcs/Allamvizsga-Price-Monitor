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
var header = document.getElementById('header');
var content = document.getElementById('content');

function show_URL(){
   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let url = tabs[0].url;
      // var content = document.getElementById('content');
      let p = document.createElement("p");
      p.setAttribute("class", "text-center");
      let text = document.createTextNode(url);
      p.appendChild(text);
      header.appendChild(p);
   });
}

function upload_URL(user = "TEST-user", url = "test-url", category = "test category"){
   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let url = tabs[0].url;
      // // var content = document.getElementById('content');
      // let p = document.createElement("p");
      // p.setAttribute("class", "text-center");
      // let text = document.createTextNode(url);
      // p.appendChild(text);
      // header.appendChild(p);

      var postsRef = database.ref('/test').child(user);
      postsRef.push().set({
         category: category,
         url : url
      });
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

function read_users_test(){
   // var userId = firebase.auth().currentUser.uid;
   database.ref('/test').on("value", function(item){
      // console.log(item.val()["TEST-user"]);
      let items = item.val();
      for(let id of Object.keys(items["TEST-user"])){
         let url = items["TEST-user"][id].url;
         let cat = items["TEST-user"][id].category;
         console.log("product url = " + url);
         console.log("product cat = " + cat);
      }
   },function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
   // let p = document.createElement("p");
   // let text = document.createTextNode(url);
   // p.appendChild(text);
   // content.appendChild(p);
}

// push_to_new('TEST-user', 'www.proba.url', 'sport');

// document.addEventListener("DOMContentLoaded", push_to_new('feri', get_URL(), 'sports'));
document.addEventListener("DOMContentLoaded", show_URL());
document.getElementById("upload_button").onclick = function(){
   upload_URL();
}
document.getElementById("download_button").onclick = function(){
   read_users_test();
}

