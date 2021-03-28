const config = {
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
// const uid = auth.currentUser.uid;

// const user = await chrome.storage.sync.get('firebase_uid', function (result) {
//     var uid = result.firebase_uid;
//     console.log("user: " + uid);
//     save_user_id(uid);
// });

// function login (){
    // let email = "palfi.szabolcs.8@gmail.com";
    // let password = "terminator";

    
//     firebase.auth().signInWithEmailAndPassword(email, password).then(creadential => {
//         console.log("auth successfull");
//         chrome.storage.sync.set({"firebase_uid": creadential.user.uid});
//     }).catch(function(error) {
//         switch(error.code){
//             case "auth/wrong-password":
//                 // Swal.fire({
//                 //     title: "Error!",
//                 //     text: "Wrong password!",
//                 //     icon: "error"
//                 // })
//                 console.log("auth/wrong-password");
//             break;
//             case "auth/user-not-found":
//                 // Swal.fire({
//                 //     title: "Error!",
//                 //     text: "User not found",
//                 //     icon: "error"
//                 // })
//                 console.log("auth/user-not-found");
//             break;
//         }
//         // var errorCode = error.code;
//         // var errorMessage = error.message;
//         // console.log("Error: " + errorCode + ", " + errorMessage);
//       });
// }

function get_uid(){
    chrome.storage.sync.get('firebase_uid', function (result) {
       var uid = result.firebase_uid;
       if(uid != null){
        chrome.browserAction.setPopup({popup: "popup.html"});
       }
       else{
           console.log("id null");
       }
    });
}

function update_popup(){
    chrome.browserAction.setPopup({popup: "popup.html"});
    chrome.runtime.reload();
}

function logout(){
    chrome.storage.sync.set({"firebase_uid": null});
    chrome.browserAction.setPopup({popup: "login.html"});
    chrome.runtime.reload();
    auth.signOut();
}

function load_data(){
    chrome.storage.sync.get('firebase_uid', function (result) {
        var uid = result.firebase_uid;
        sessionStorage.setItem("uid", uid);
        database.ref('/USERS/' + uid).on("value", function(item){
           let items = item.val();
        //    chrome.storage.sync.set({"products": items});
            // console.log(items)
            localStorage.setItem("products", JSON.stringify(items));
            // console.log(JSON.stringify(items))
        },function (errorObject) {
           console.log("The read failed: " + errorObject.code);
        });
        database.ref('/NEW/' + uid).on("value", function(item){
            let items = item.val();
         //    chrome.storage.sync.set({"products": items});
             // console.log(items)
             localStorage.setItem("pending_products", JSON.stringify(items));
             // console.log(JSON.stringify(items))
         },function (errorObject) {
            console.log("The read failed: " + errorObject.code);
         });
    });
}

function load_chart_data(prod_id){
    chrome.storage.sync.get('firebase_uid', function (result) {
        var uid = result.firebase_uid;
        database.ref('/USERS/' + uid + "/" + prod_id).on("value", function(item){
            let prod = item.val();
            // chrome.storage.sync.set({"chart": prod, "chart_prod_id": prod_id});
            localStorage.setItem("chart", JSON.stringify(prod));
            localStorage.setItem("chart_prod_id", prod_id);
           
        },function (errorObject) {
           console.log("The read failed: " + errorObject.code);
        });
    });
}

function delete_prod(prod_id){
    chrome.storage.sync.get('firebase_uid', function (result) {
        var uid = result.firebase_uid;
        database.ref('/USERS/' + uid + "/" + prod_id).remove();
    });
}

function login_google(){
    
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
      }).catch(function(error) {
        
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.msg){
            case "login":
                update_popup();
            break;

            case "logout":
                logout();
            break;

            case "id_null":
                console.log("id null");
            break;

            case "google":
                login_google();
                // console.log("google");
            break;

            case "load_chart_data":
               load_chart_data(request.id);
            break;

            case "delete":
                delete_prod(request.id);
            break;

            default:
            break;
        }
    }
);

// console.log("background");
get_uid();
load_data();
