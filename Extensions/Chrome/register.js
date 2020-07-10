// const { default: Swal } = require("sweetalert2");

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

const register_form = document.querySelector("#register-form");
register_form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = register_form["inputEmail"].value;
    const password = register_form["inputPassword"].value;
    const confirmpassword = register_form["inputConfirmPassword"].value;
    // let email = "palfi.szabolcs.8@gmail.com"
    // let password = "terminator";
    // let confirmpassword = "terminator";
    

    if(password != confirmpassword){
        Swal.fire({
            title: "Error!",
            text: "Passwords do not match",
            icon: "error"
        })
        return;
    }

    auth.createUserWithEmailAndPassword(email, password).then(credential => {
        Swal.fire({
            title: "Done!",
            text: "Registered successfully",
            icon: "success"
        }).then(function(){
            window.location.href = "login.html";
        })
        
    }).catch(function(error){
        if(error.code == "auth/email-already-in-use"){
            // alert("Already registered with this user!");
            Swal.fire({
                title: "Error!",
                text: "Already registered with this user!",
                icon: "error"
            })
            return;
        }
    });
})