import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_login/flutter_login.dart';
import 'home.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../constants.dart';

final FirebaseAuth _auth = FirebaseAuth.instance;

class LoginScreen extends StatelessWidget {

  Duration get loginTime => Duration(milliseconds: 2250);

  Future<String> _authUser(LoginData data) async {
    try{
      var result = await _auth.signInWithEmailAndPassword(email: data.name, password: data.password);
      var uid = result.user.uid;
      if(!_auth.currentUser.emailVerified){
        return "You need to confirm your email address first!";
      }else{
        return null;
      }
      // print("UID = $uid");
    }catch(e){
      if(e.hashCode.toString() == "505284406"){
        return "User not found";
      }
      if(e.hashCode.toString() == "185768934"){
        return "Wrong password";
      }
      return null;
    }
  }

  Future<String> _registerUser(LoginData data) async {
    // var username = data.name;
    // var password = data.password;
    var username = "szabirey@gmail.com";
    var password = "terminator";
    try{
      var result = await _auth.createUserWithEmailAndPassword(email: username, password: password);
      // print("res " + result.toString());
      await _auth.currentUser.sendEmailVerification();
      return null;
    }catch(e){
      if(e.hashCode.toString() == "34618382"){
        return "Already Registered with this email address";
      }
      return null;
     }
  }

  Future<String> _recoverPassword(String email) async {
    try{
      var result = await _auth.sendPasswordResetEmail(email: email);
      return null;
    }catch(e){
      if(e.hashCode.toString() == "505284406"){
        return "User not found";
      }
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FlutterLogin(
      title: 'Price-Monitor',
      theme: LoginTheme(
        primaryColor: color_primary_blue,
      ),
      messages: LoginMessages(
        loginButton: "SIGN IN",
        signupButton: "SIGN UP",
        forgotPasswordButton: "Forgot my password",
        recoverPasswordButton: "SEND",
        recoverPasswordDescription: ""
      ),
      // logo: 'assets/images/ecorp-lightblue.png',
      onLogin: _authUser,
      onSignup: _registerUser,
      onRecoverPassword: _recoverPassword,
      onSubmitAnimationCompleted: () {
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (context) => HomeScreen(),
        ));
      },
    );
  }
}