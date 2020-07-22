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

const register_form = document.querySelector("#reset-form");
register_form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = register_form["inputEmail"].value;

    auth.sendPasswordResetEmail(email).then(function() {
        Swal.fire({
            title: "Done!",
            text: "Password reset email sent!",
            icon: "success",
            timer: 2500
        }).then(function(){
            window.location.href = "login.html";
        })
    }).catch(function(error) {
        if(error.code == "auth/user-not-found"){
            Swal.fire({
                title: "Error!",
                text: "User not found",
                icon: "error"
            })
        }
    });
    
    
})