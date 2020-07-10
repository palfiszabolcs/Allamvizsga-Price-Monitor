var config = {
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
   const auth = firebase.auth();
   const database = firebase.database();

var header = document.getElementById('header');
var content = document.getElementById('content');
var user_id = "Conor McGregor";
var user_id2 = "Arun Baker";

function show_URL(){
   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let url = tabs[0].url;
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
      var postsRef = database.ref('/test').child(user);
      postsRef.push().set({
         category: category,
         url : url
      });
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
   database.ref('/USERS/' + user_id).on("value", function(item){
      // console.log(item.val()["TEST-user"]);
      let items = item.val();
      // console.log(items);
      for(let id of Object.keys(items)){
         let checks = items[id].check
         let last = Object.keys(items[id].check)[Object.keys(items[id].check).length-1];
         let url = items[id].url;
         let category = items[id].category;
         let name = items[id].name;
         let currency = items[id].currency;
         let price = checks[last].price;
         
         console.log("product name = " + name);
         console.log("product price = " + currency + " " + price);
      }
      
   },function (errorObject) {
      console.log("The read failed: " + errorObject.code);
   });
}


function fill_category(category){
   database.ref('/USERS/' + user_id2).on("value", function(item){
      let items = item.val();
      
      let div_cateogry = document.createElement("div");
      div_cateogry.setAttribute("class", "my-3 p-3 bg-white rounded shadow-sm");
      let h6 = document.createElement("h6");
      h6.setAttribute("class", "border-bottom border-gray pb-2 mb-0");
      h6.textContent = category;
      div_cateogry.appendChild(h6);
      
      for(let id of Object.keys(items)){
         let checks = items[id].check
         let last = Object.keys(items[id].check)[Object.keys(items[id].check).length-1];
         let url = items[id].url;
         let category = items[id].category;
         let name = items[id].name;
         let currency = items[id].currency;
         let price = checks[last].price;
         
         let div_media_muted = document.createElement("div");
         div_media_muted.setAttribute("class", "media text-muted pt-3");
         div_cateogry.appendChild(div_media_muted);
         
         let div_media_body = document.createElement("div");
         div_media_body.setAttribute("class", "media-body pb-3 mb-0 small lh-125 border-bottom border-gray");
         div_media_muted.appendChild(div_media_body);
         
         let div_media_holder = document.createElement("div");
         div_media_holder.setAttribute("class", "d-flex justify-content-between align-items-center w-100");
         div_media_body.appendChild(div_media_holder);
         
         let strong_name = document.createElement("strong");
         strong_name.setAttribute("class", "text-gray-dark");
         strong_name.textContent = name;
         div_media_holder.appendChild(strong_name);
         
         let strong_price = document.createElement("strong");
         strong_price.setAttribute("class", "text-gray-dark");
         strong_price.textContent = currency + " " + price;
         div_media_holder.appendChild(strong_price);
         
      }

      content.appendChild(div_cateogry);
      
   },function (errorObject) {
      console.log("The read failed: " + errorObject.code);
   });

}

// fill_category("minden kategoria");
// read_users_test();

// document.addEventListener("DOMContentLoaded", push_to_new('feri', get_URL(), 'sports'));
document.addEventListener("DOMContentLoaded", fill_category("minden"));
document.addEventListener("DOMContentLoaded", show_URL());
document.getElementById("upload_button").onclick = function(){
   upload_URL();
}
document.getElementById("download_button").onclick = function(){
   read_users_test();
}