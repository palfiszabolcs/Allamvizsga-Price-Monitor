import 'package:flutter/material.dart';
import 'package:flutter_login/flutter_login.dart';
import 'package:price_monitor/main.dart';
import 'home.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:sweetalert/sweetalert.dart';


final FirebaseAuth _auth = FirebaseAuth.instance;

const _color_primary_blue = Color(0xff007bff);

class LoginScreen extends StatelessWidget {

  Duration get loginTime => Duration(milliseconds: 2250);

  Future<String> _authUser(LoginData data) async {
    var username = data.name;
    var password = data.password;
    try{
      var result = await _auth.signInWithEmailAndPassword(email: username, password: password);
      var uid = result.user.uid;

      print("UID = $uid");
    }catch(e){
      print("ERROR AUTH" + e.toString());
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
      var uid = result.user.uid;
      var sendEmail = await _auth.currentUser.sendEmailVerification();
      print("UID = $uid");
    }catch(e){
      print("ERROR AUTH" + e.toString());
      return null;
    }
  }

  Future<String> _recoverPassword(String email) async {
    try{
      var result = await _auth.sendPasswordResetEmail(email: email);
    }catch(e){
      print("ERROR AUTH" + e.toString());
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FlutterLogin(
      title: 'Price-Monitor',
      theme: LoginTheme(
        primaryColor: _color_primary_blue,
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
      onSignup: _registerUser, // TODO: register
      onRecoverPassword: _recoverPassword,
      onSubmitAnimationCompleted: () {
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (context) => HomeScreen(),
        ));
      },
    );
  }
}