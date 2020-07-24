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
// var bg = chrome.extension.getBackgroundPage();
// bg.login();

const login_form = document.querySelector("#login-form");
login_form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = login_form["inputEmail"].value;
    const password = login_form["inputPassword"].value;
    // let email = "palfi.szabolcs.8@gmail.com";
    // let password = "terminator";

    auth.signInWithEmailAndPassword(email, password).then(creadential => {
        if (auth.currentUser.emailVerified === true){
            Swal.fire({
                title: "Done!",
                text: "Login successfull",
                customClass: "swall_wide",
                icon: "success",
               timer: 2500
            }).then(function(){
                chrome.storage.sync.set({"firebase_uid": creadential.user.uid});
                chrome.runtime.sendMessage({
                    msg: "login"
                });
                // window.location.href = "popup.html";
            })
        }else{
            Swal.fire({
                title: "Verification!",
                text: "You need to confirm your email address first!",
                customClass: "swall_wide",
                icon: "info"
            }).then(function(){
                return
            })
        }
    }).catch(function(error) {
        switch(error.code){
            case "auth/wrong-password":
                Swal.fire({
                    title: "Error!",
                    text: "Wrong password!",
                    customClass: "swall_wide",
                    icon: "error"
                })
            break;
            case "auth/user-not-found":
                Swal.fire({
                    title: "Error!",
                    text: "User not found",
                    customClass: "swall_wide",
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

// document.getElementById("login-google").onclick = function(){
//     chrome.runtime.sendMessage({
//         msg: "google"
//     });
//     console.log("google")
// }

