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

var html = document.querySelector("#extension");
var body = document.querySelector("body");
var header = document.getElementById('header');
var container = document.getElementById('container');

function get_site_address(url) {
   let patt = new RegExp("[a-zA-z]+\.ro+|[a-zA-z]+\.com+|[a-zA-z]+\.eu+");
   let res = patt.exec(url);
   return res;
 }

function show_URL(){
   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let url = tabs[0].url;
      let short_address = get_site_address(url);
         if (short_address == "emag.ro" || short_address == "flanco.ro"){
         let p = document.createElement("p");
         p.setAttribute("class", "text-center");
         let text = document.createTextNode(url);
         p.appendChild(text);
         header.appendChild(p);
      }
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

function push_to_new(url = "test-url") {
   chrome.storage.sync.get('firebase_uid', function (result) {
      let user = result.firebase_uid;
      let postsRef = database.ref("/NEW").child(user);
      postsRef.push().set({
         url : url
      }).then(function(){
            Swal.fire({
               title: "Done!",
               text: "Item will be added within 5 minutes",
               icon: "success"
            })
         });
  });
}

function fill_category(user_id, category){
   database.ref('/USERS/' + user_id).on("value", function(item){
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
         
         let a_url = document.createElement("a");
         a_url.setAttribute("href", url);
         div_cateogry.appendChild(a_url);
         
         let div_media_muted = document.createElement("div");
         div_media_muted.setAttribute("class", "media text-muted pt-3");
         a_url.appendChild(div_media_muted);
         
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
      
      container.appendChild(div_cateogry);
      
   },function (errorObject) {
      console.log("The read failed: " + errorObject.code);
   });
   
}

function fill_category2(){
   chrome.storage.sync.get('products', function (result) {
      var items = result.products;
      
      for(let id of Object.keys(items)){
         let checks = items[id].check
         let last = Object.keys(items[id].check)[Object.keys(items[id].check).length-1];
         let url = items[id].url;
         let category = items[id].category;
         let name = items[id].name;
         let currency = items[id].currency;
         let image = items[id].image;
         let price = checks[last].price;
         
         
         let row = document.createElement("div");
         row.setAttribute("class", "row");
         container.appendChild(row);

         let flex_div = document.createElement("div");
         flex_div.setAttribute("class", "col-md-4 d-flex");
         row.appendChild(flex_div);

         let img = document.createElement("img");
         img.setAttribute("class", "rounded float-left w-25 my-auto");
         img.setAttribute("src", image);
         flex_div.appendChild(img);

         let name_price_div = document.createElement("div");
         name_price_div.setAttribute("class", "card-block px-3 w-75 float-right");
         flex_div.appendChild(name_price_div);

         let a_url = document.createElement("a");
         a_url.setAttribute("href", url);
         a_url.setAttribute("target", "_blank");
         name_price_div.appendChild(a_url);

         let h5_name = document.createElement("h5");
         h5_name.setAttribute("class", "card-title crop-text-2 text-wrap");
         h5_name.textContent = name
         a_url.appendChild(h5_name);

         let div = document.createElement("div");
         name_price_div.appendChild(div);

         let p_price = document.createElement("p");
         p_price.setAttribute("class", "card-text w-70 float-left");
         p_price.setAttribute("id", "price");
         p_price.textContent = currency + " " + price;
         div.appendChild(p_price);

         let chart_button = document.createElement("button");
         chart_button.setAttribute("type", "button");
         chart_button.setAttribute("class", "btn btn-outline-primary w-30 float-right");
         chart_button.setAttribute("id", "chart_button");
         div.appendChild(chart_button);
         
         let icon = document.createElement("i");
         icon.setAttribute("class", "fa fa-bar-chart-o");
         chart_button.appendChild(icon);

         let button_text = document.createTextNode(" Chart");
         chart_button.appendChild(button_text);
         
         let divider = document.createElement("hr");
         container.appendChild(divider);

         let hidden_input = document.createElement("input");
         hidden_input.setAttribute("id", "prod_id");
         hidden_input.setAttribute("type", "hidden");
         hidden_input.setAttribute("value", id);
         div.appendChild(hidden_input);

         chart_button.onclick = function(){
            // let prod_id = document.getElementById("prod_id").value;
            // console.log("prod_id " + prod_id);
            
            chrome.runtime.sendMessage({
               msg: "load_chart_data",
               id: id
            });
            window.location.href = "chart.html";
         }

      }

   });

}

function init(){
   chrome.storage.sync.get(["firebase_uid"], function (res) {
      var uid = res.firebase_uid;
      console.log("user: ", uid);
   
      if(uid != null){
         fill_category2();
      }else{
         chrome.runtime.sendMessage({
            msg: "id_null"
         });
      }
   });
}

document.addEventListener("DOMContentLoaded", show_URL());

document.getElementById("logout_button").onclick = function(){
   chrome.runtime.sendMessage({
      msg: "logout"
   });
}
document.getElementById("info").onclick = function(){
   Swal.fire({
      title: "Description",
      html: "blablablablablablablablablablablablablablabla\
      blablablablablablablablablablab lablablablabla blablablablablablablablablablablablablablabla\
      blablablablablab lablablablablablablablablablablablablablablablablablabl ablablablablablabla\
      blablablablablablablablabl blablablablablabla blablablablablablab lablablablablablablablabla\
      blablab lablablablabl ablablablabla blablablabla bla blablablablablab lablab lablabla blabla blabla\
      \ <br> Supported stores: <a href='https://www.emag.ro' target='_blank'>emag.ro</a>",
      icon: "info"
   });
}
document.getElementById("close").onclick = function(){
   window.close();
}

document.getElementById("track_buton").onclick = function(){
   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      // console.log(tabs);
      let url = tabs[0].url;
      let short_address = get_site_address(url);
      // console.log(short_address[0])
      if(short_address[0] != "emag.ro" ){
         Swal.fire({
            title: "Sorry!",
            text: "Store not supported!",
            icon: "info"
         })
         return;
      }else{
         push_to_new(url);
      }
   });
}



// document.getElementById("chart_button").onclick = function(){
//    // chrome.storage.sync.set({"scroll": window.scrollY});
//    // sessionStorage.setItem("scroll", window.scrollY);

//    console.log("before scroll" ,  window.scrollY)

//    let prod_id = document.getElementById("prod_id").value;
//    chrome.runtime.sendMessage({
//       msg: "load_chart_data",
//       id: prod_id
//    });
//    // history.pushState("chart.html");
//    // window.location.href = "chart.html";

// }

init();