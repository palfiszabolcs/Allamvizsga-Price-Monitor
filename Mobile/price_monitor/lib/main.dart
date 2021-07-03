import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'Screens/login.dart';
import 'Screens/home.dart';


FirebaseAuth _auth = FirebaseAuth.instance;
void main() async {
    WidgetsFlutterBinding.ensureInitialized();
    await Firebase.initializeApp();

    if (_auth.currentUser != null){
        runApp(MaterialApp(
            home: new HomeScreen()
            )
        );

    }else{
        runApp(MaterialApp(
            home: new LoginScreen()
          )
        );
    }
}




