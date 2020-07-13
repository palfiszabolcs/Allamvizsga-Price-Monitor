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
// var bg = chrome.extension.getBackgroundPage();
// bg.login();

const login_form = document.querySelector("#login-form");
login_form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = login_form["inputEmail"].value;
    const password = login_form["inputPassword"].value;
    // let email = "palfi.szabolcs.8@gmail.com";
    // let password = "terminator";

    firebase.auth().signInWithEmailAndPassword(email, password).then(creadential => {
        Swal.fire({
            title: "Done!",
            text: "Login successfull",
            icon: "success"
        }).then(function(){
            chrome.storage.local.set({"firebase_uid": creadential.user.uid});
            chrome.runtime.sendMessage({
                msg: "login"
            });
            window.location.href = "popup.html";
        })
    }).catch(function(error) {
        switch(error.code){
            case "auth/wrong-password":
                Swal.fire({
                    title: "Error!",
                    text: "Wrong password!",
                    icon: "error"
                })
            break;
            case "auth/user-not-found":
                Swal.fire({
                    title: "Error!",
                    text: "User not found",
                    icon: "error"
                })
            break;
            default:
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log("Error: " + errorCode + ", " + errorMessage);
            break;
        }
      });
})

document.getElementById("login-google").onclick = function(){
    chrome.runtime.sendMessage({
        msg: "google"
    });
    console.log("google")
}

// document.getElementById("login-google").onclick = function(){
//     var provider = new firebase.auth.GoogleAuthProvider();
//     firebase.auth().signInWithPopup(provider).then(function(result) {
//         // This gives you a Google Access Token. You can use it to access the Google API.
//         var token = result.credential.accessToken;
//         // The signed-in user info.
//         var user = result.user;
//         // ...
//       }).catch(function(error) {
        
//         var errorCode = error.code;
//         var errorMessage = error.message;
//         // The email of the user's account used.
//         var email = error.email;
//         // The firebase.auth.AuthCredential type that was used.
//         var credential = error.credential;
//         // ...
//       });
// }