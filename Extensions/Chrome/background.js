const firebaseConfig = {
    apiKey: "AIzaSyDMye3XhwYr8682BFxiA-GmPvR8hmoAvy0",
    authDomain: "price-monitor-44858.firebaseapp.com",
    databaseURL: "https://price-monitor-44858.firebaseio.com",
    projectId: "price-monitor-44858",
    storageBucket: "price-monitor-44858.appspot.com",
    messagingSenderId: "64162639666",
    appId: "1:64162639666:web:e52835cf7db1e501f5f12b",
    measurementId: "G-J2V35CT5HN"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// const user = await chrome.storage.sync.get('firebase_uid', function (result) {
//     var uid = result.firebase_uid;
//     console.log("user: " + uid);
//     save_user_id(uid);
// });

function login (){
    let email = "palfi.szabolcs.8@gmail.com";
    let password = "terminator";

    
    firebase.auth().signInWithEmailAndPassword(email, password).then(creadential => {
        console.log("auth successfull");
        chrome.storage.sync.set({"firebase_uid": creadential.user.uid});
    }).catch(function(error) {
        switch(error.code){
            case "auth/wrong-password":
                // Swal.fire({
                //     title: "Error!",
                //     text: "Wrong password!",
                //     icon: "error"
                // })
                console.log("auth/wrong-password");
            break;
            case "auth/user-not-found":
                // Swal.fire({
                //     title: "Error!",
                //     text: "User not found",
                //     icon: "error"
                // })
                console.log("auth/user-not-found");
            break;
        }
        // var errorCode = error.code;
        // var errorMessage = error.message;
        // console.log("Error: " + errorCode + ", " + errorMessage);
      });
}

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
}

function load_data(){
    chrome.storage.sync.get('firebase_uid', function (result) {
        var uid = result.firebase_uid;
        sessionStorage.setItem("uid", uid);
        database.ref('/USERS/' + uid).on("value", function(item){
           let items = item.val();
           chrome.storage.sync.set({"products": items});
    
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
            chrome.storage.sync.set({"chart": prod});
           
        },function (errorObject) {
           console.log("The read failed: " + errorObject.code);
        });
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

            default:
            break;
        }
    }
);

console.log("background");
get_uid();
load_data();
// login();
// chrome.storage.local.set({"firebase_uid": null});
// var valami = "valami";
// login_google();