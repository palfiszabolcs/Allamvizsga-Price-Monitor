import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:sweetalert/sweetalert.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_auth/firebase_auth.dart';
// import './auth.dart';
import 'login.dart';
import 'home.dart';

// import 'package:receive_sharing_intent/receive_sharing_intent.dart';
// import 'package:share_options/share_options.dart';

FirebaseAuth _auth = FirebaseAuth.instance;
void main() async {


    WidgetsFlutterBinding.ensureInitialized();
    await Firebase.initializeApp();

    if (_auth.currentUser != null){
        runApp(MaterialApp(
            theme: ThemeData(

            ),
            // home: new LoginScreen()
            home: new HomeScreen()
        )
        );
    }else{
        runApp(MaterialApp(
            theme: ThemeData(

            ),
            home: new LoginScreen()
            // home: new HomeScreen()
          )
        );
    }


}


