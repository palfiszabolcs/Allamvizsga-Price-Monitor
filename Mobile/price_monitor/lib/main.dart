import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'Screens/login.dart';
import 'Screens/home.dart';


// import 'package:share_options/share_options.dart';

FirebaseAuth _auth = FirebaseAuth.instance;
void main() async {
    WidgetsFlutterBinding.ensureInitialized();
    await Firebase.initializeApp();

    if (_auth.currentUser != null){
        runApp(MaterialApp(
            theme: ThemeData(),
            // home: new LoginScreen()
            home: new HomeScreen()
        )
        );
    }else{
        runApp(MaterialApp(
            theme: ThemeData(),
            home: new LoginScreen()
            // home: new HomeScreen()
          )
        );
    }
}


