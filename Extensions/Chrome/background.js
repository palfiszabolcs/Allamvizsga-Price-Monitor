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

// function login_google(){
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

function login (){
    console.log('google');
}

// var valami = "valami";
// login_google();