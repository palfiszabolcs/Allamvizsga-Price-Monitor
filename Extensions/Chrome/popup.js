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
var test_config = {
   apiKey: "AIzaSyBzVh8iJa5OFoQWlySTYpyIsaiBvAtKGzY",
   authDomain: "price-monitor-test.firebaseapp.com",
   databaseURL: "https://price-monitor-test.firebaseio.com",
   projectId: "price-monitor-test",
   storageBucket: "price-monitor-test.appspot.com",
   messagingSenderId: "1011311146437",
   appId: "1:1011311146437:web:b7cac35ff3c0dd1b7c47ac",
   measurementId: "G-0FH22DHZW3"
};
firebase.initializeApp(config);
const auth = firebase.auth();
const database = firebase.database();
const addresses = ["emag.ro", "flanco.ro", "altex.ro", "quickmobile.ro"];
$(function(){ $(document).scrollreminder(); });
// $(function(){ $.positionTrack(); });
// $.positionTrack()


var html = document.querySelector("#extension");
var body = document.querySelector("body");
var header = document.getElementById('header');
var container = document.getElementById('container');

function get_site_address(url) {
   let patt = new RegExp("[a-zA-z]+\.ro+|[a-zA-z]+\.com+|[a-zA-z]+\.eu+");
   let res = patt.exec(url);
   return String(res);
}

async function get_products_url(){
   let urls = [];
   let res = localStorage.getItem("products")
   let products = JSON.parse(res)
   
   if(products != undefined){
      for(let id of Object.keys(products)){
         urls.push(String(products[id].url))
      }
   }else{
      return "empty"
   }
   
   // console.log(urls)
   return urls;
}

async function get_pending_products_url(){
   let urls = [];
   let res = localStorage.getItem("pending_products")
   let pending = JSON.parse(res)
   if(pending != undefined){
      for(let id of Object.keys(pending)){
         urls.push(String(pending[id].url))
      }
   }else{
      return "empty"
   }
   
   // console.log(urls)
   return urls;
}

function show_URL_track(){
   var urls = []
   var pending_urls = []
   get_products_url().then(function(res){
      urls = res
      get_pending_products_url().then(function (result){
         pending_urls = result
         
         chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            let url = tabs[0].url;
            let short_address = get_site_address(url);
            if (addresses.includes(short_address)){
               if(pending_urls.includes(url)){
                  let p = document.createElement("p");
                  p.setAttribute("class", "text-center");
                  let text = document.createTextNode("Product Will Be Added Soon");
                  p.appendChild(text);
                  header.appendChild(p);
               }else{
                  if(urls != "empty"){
                     if(urls.includes(url)){
                        let p = document.createElement("p");
                        p.setAttribute("class", "text-center");
                        let text = document.createTextNode("Product Already Tracked");
                        p.appendChild(text);
                        header.appendChild(p);
                     }else{
                        let track_button = document.createElement("button");
                        track_button.setAttribute("id", "track_buton");
                        track_button.setAttribute("type", "button");
                        track_button.setAttribute("class", "btn btn-primary mr-1");
                        track_button.textContent = "Track product on this page";
                        header.appendChild(track_button);
               
                        track_button.onclick  = function(){push_to_new(url);}
                     }
                  }else{
                     let track_button = document.createElement("button");
                        track_button.setAttribute("id", "track_buton");
                        track_button.setAttribute("type", "button");
                        track_button.setAttribute("class", "btn btn-primary mr-1");
                        track_button.textContent = "Track product on this page";
                        header.appendChild(track_button);
               
                        track_button.onclick  = function(){push_to_new(url);}
                  }
               }
            }
         })
      })


   })
   
   
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
               text: "Item will be added shortly",
               customClass: "swall_wide",
               icon: "success",
               showConfirmButton: false,
               timer: 2500
            })
         });
  });
}

function fill_category(){
   let prod = localStorage.getItem("products");
   let data = JSON.parse(prod);
   data = Array(data);
   data.forEach(items => {
      if(items === null){
         let empty_text = document.createElement("p");
         empty_text.setAttribute("class", "card-text text-center");
         empty_text.textContent = "No products yet";
         container.appendChild(empty_text);
      }else{
         for(let id of Object.keys(items)){
            let checks = items[id].check
            let last = Object.keys(items[id].check)[Object.keys(items[id].check).length-1];
            let second_last = Object.keys(items[id].check)[Object.keys(items[id].check).length-2];
            
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
   
            // let p_price = document.createElement("p");
            // p_price.setAttribute("class", "card-text w-70 float-left");
            // p_price.setAttribute("id", "price");
            
            var chart_button = document.createElement("button");
            chart_button.setAttribute("type", "button");
            chart_button.setAttribute("id", "chart_button");

            let icon = document.createElement("i");


            if(price != "error"){
               var button_price = currency + " " + price;
               if(second_last === undefined){
                  chart_button.setAttribute("class", "btn btn-primary btn-block w-30");
                  div.appendChild(chart_button);
                  
                  icon.setAttribute("class", "fa fa-arrow-right");
                  
               }else{
                  if(items[id].check[last].price < items[id].check[second_last].price){
                     
                     chart_button.setAttribute("class", "btn btn-success btn-block w-30");
                     div.appendChild(chart_button);
                     
                     icon.setAttribute("class", "fa fa-arrow-down");
   
                  }
                  if(items[id].check[last].price > items[id].check[second_last].price){
                     chart_button.setAttribute("class", "btn btn-danger btn-block w-30");
                     div.appendChild(chart_button);
                     
                     icon.setAttribute("class", "fa fa-arrow-up");
   
                  }
                  if( (items[id].check[last].price == items[id].check[second_last].price) || ((items[id].check[last].price != "error") && items[id].check[second_last].price == "error" )){
                     chart_button.setAttribute("class", "btn btn-primary btn-block w-30");
                     div.appendChild(chart_button);
                     
                     icon.setAttribute("class", "fa fa-arrow-right");
   
                  }
               }
               
            }else{
               var button_price = "UNAVAILABLE"
               chart_button.setAttribute("class", "btn btn-warning btn-block w-30");
               div.appendChild(chart_button);
                  
               icon.setAttribute("class", "fa fa-exclamation");
            }
            // div.appendChild(p_price);
            
            let button_text = document.createTextNode(button_price + "     ");
            chart_button.appendChild(button_text);
            
            chart_button.appendChild(icon);
            
   
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
      }
      
   });

   // chrome.storage.sync.get('products', function (result) {
      
      // var items = result.products;
      // console.log(items)


   // });

}

function init(){
   chrome.storage.sync.get(["firebase_uid"], function (res) {
      var uid = res.firebase_uid;
      // console.log("user: ", uid);
   
      if(uid != null){
         fill_category();
      }else{
         chrome.runtime.sendMessage({
            msg: "id_null"
         });
      }
   });
}

function logout(){
   chrome.runtime.sendMessage({
      msg: "logout"
   });
}

function delete_user(){
   database.ref('/USERS/' + auth.currentUser.uid).remove();
   auth.currentUser.delete().then(function(){
      Swal.fire({
         title: 'Your account has been deleted!',
         customClass: "swall_wide",
         icon: 'success'
      }).then(function(){
         logout();
      })
   }).catch(function(error) {
      console.log(error.code);
   });
}

// document.addEventListener("DOMContentLoaded", get_products_url());
document.addEventListener("DOMContentLoaded", show_URL_track());


document.getElementById("info").onclick = function(){
   Swal.fire({
      title: "Description",
      showCloseButton: true,
      showConfirmButton: false,
      scrollbarPadding: false,
      icon: "info",
      html: `You can use this extension to follow your desired product's price changes over time.<br>
      Once you are on one of the supported webshops, just press the “Track product on this page” button and your product will be added shortly to your list.<br>
      The arrow and color coding on each product’s price makes it easier to quickly see changes, compared to yesterday’s data.
      Clicking the button will show you a chart of price changes.
      \ <br> <b>Supported stores:</b> <br> <a href='https://www.emag.ro' target='_blank'>emag.ro</a> <br>
      <a href='https://www.flanco.ro' target='_blank'>flanco.ro</a> <br>
      <a href='https://www.quickmobile.ro' target='_blank'>quickmobile.ro</a> <br>
      `
   });
}

document.getElementById("user").onclick = function(){
   Swal.fire({
      title: auth.currentUser.email,
      customClass: "swall_title",
      icon: "info",
      showConfirmButton: false,
      showCloseButton : true,
      html: `<button id="delete_account" type="button" class="btn btn-secondary btn-block">Delete Account</button>
      <button id="logout" type="button" class="btn btn-danger btn-block">Sign Out</button>`,
      onOpen: (doc) => {
         // document.getElementById("reset").onclick = function(){
         //    Swal.fire({ 
         //       title: "Reset",
         //       text: "Reset email will be sent to this address: " + auth.currentUser.email,
         //       customClass: "swall_wide",
         //       icon: "warning",
         //       showCloseButton: true,
         //       showCancelButton: true,
         //       confirmButtonText: 'Send',
         //       cancelButtonText: 'Cancel'
         //    }).then((result) => {
         //          if (result.value) {
         //             auth.sendPasswordResetEmail(auth.currentUser.email).then(function(){
         //                Swal.fire({
         //                   title: "Done!",
         //                   text: "Password reset email sent!",
         //                   customClass: "swall_wide",
         //                   icon: "success"
         //               }).then(function(){
         //                   logout();
         //               })
         //             })
         //          } else if (result.dismiss === Swal.DismissReason.cancel) {
                     
         //          }
         //    })
         // }
         document.getElementById("delete_account").onclick = function(){
            Swal.fire({
               title: 'Delete Account',
               text: "Are you sure?",
               customClass: "swall_wide",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Delete'
             }).then((result) => {
               if (result.value) {
                 delete_user();
               }
             })
         }
         document.getElementById("logout").onclick = function(){
            Swal.fire({
               title: 'Log Out',
               text: "Do you want to log out?",
               customClass: "swall_wide",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Log Out'
             }).then((result) => {
               if (result.value) {
                 Swal.fire({
                    title: 'Logged Out',
                    icon: 'success',
                    timer: 2500
                 }).then(function(){
                    logout();
                 })
               }
             })
         }
      }
   })

}

document.getElementById("close").onclick = function(){
   window.close();
}


init();
