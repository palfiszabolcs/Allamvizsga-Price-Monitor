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
      if(!_auth.currentUser.emailVerified){
        return "You need to confirm your email address first!";
      }else{
        return null;
      }
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
    try{
      var result = await _auth.createUserWithEmailAndPassword(email: data.name, password: data.password);
      await _auth.currentUser.sendEmailVerification();
      return null;
    }catch(e){
      if(e.hashCode.toString() == "34618382"){
        return "You already registered with this email address!";
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
    var title = "";
    if(MediaQuery.of(context).size.width > MediaQuery.of(context).size.height){
    }else{
      title = "Price Monitor";
    }
    return FlutterLogin(
      title: title,
      theme: LoginTheme(
        primaryColor: colorPrimaryBlue,
      ),
      messages: LoginMessages(
        loginButton: "SIGN IN",
        signupButton: "SIGN UP",
        forgotPasswordButton: "Forgot my password",
        recoverPasswordButton: "SEND",
        recoverPasswordDescription: ""
      ),
      onLogin: _authUser,
      onSignup: _registerUser,
      onRecoverPassword: _recoverPassword,
      onSubmitAnimationCompleted: () {
        Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => HomeScreen()), (r) => false);
      },
    );
  }
}